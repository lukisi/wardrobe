from datetime import date

from django.core.exceptions import ValidationError
from django.db.models import Count, Exists, F, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce

from .models import Inventario, InventarioTaglia, Prenotazione


def exists_taglia_libera_nel_periodo(
    data_inizio: date,
    data_fine: date,
    taglia: str | None = None,
):
    """Exists: il costume ha almeno una taglia con stock > prenotazioni attive sovrapposte."""
    impegnate_sq = (
        Prenotazione.objects.filter(
            costume_id=OuterRef('costume_id'),
            taglia=OuterRef('taglia'),
            stato=Prenotazione.Stato.ATTIVA,
            data_inizio__lte=data_fine,
            data_fine__gte=data_inizio,
        )
        .order_by()
        .values('costume_id')
        .annotate(c=Count('id'))
        .values('c')
    )
    free = InventarioTaglia.objects.annotate(
        impegnate=Coalesce(
            Subquery(impegnate_sq[:1], output_field=IntegerField()),
            Value(0),
        ),
    ).filter(
        costume_id=OuterRef('pk'),
        quantita__gt=F('impegnate'),
    )
    if taglia:
        free = free.filter(taglia=taglia)
    return Exists(free)


def overlapping_attive_qs(costume_id: int, taglia: str, data_inizio: date, data_fine: date):
    """Prenotazioni attive che si sovrappongono all'intervallo [data_inizio, data_fine]."""
    return Prenotazione.objects.filter(
        costume_id=costume_id,
        taglia=taglia,
        stato=Prenotazione.Stato.ATTIVA,
        data_inizio__lte=data_fine,
        data_fine__gte=data_inizio,
    )


def stock_qty_for(costume_id: int, taglia: str) -> int:
    row = InventarioTaglia.objects.filter(costume_id=costume_id, taglia=taglia).first()
    if row is None:
        return 0
    return int(row.quantita)


def impegnate_nel_range(costume_id: int, taglia: str, data_inizio: date, data_fine: date) -> int:
    return overlapping_attive_qs(costume_id, taglia, data_inizio, data_fine).count()


def disponibilita_costume(costume: Inventario, data_inizio: date, data_fine: date) -> list[dict]:
    """Per ogni taglia con stock: stock, impegnate, disponibili nel range."""
    result = []
    for row in costume.stock_taglie.all().order_by('taglia'):
        if row.quantita <= 0:
            continue
        impegnate = impegnate_nel_range(costume.id, row.taglia, data_inizio, data_fine)
        result.append({
            'taglia': row.taglia,
            'stock': row.quantita,
            'impegnate': impegnate,
            'disponibili': max(row.quantita - impegnate, 0),
        })
    return result


def assert_can_prenotare(costume_id: int, taglia: str, data_inizio: date, data_fine: date) -> None:
    """Solleva ValidationError se non c'è disponibilità."""
    if taglia not in Inventario.TAGLIE_AMMESSE:
        raise ValidationError({'taglia': 'Taglia non ammessa'})
    if data_inizio > data_fine:
        raise ValidationError({'data_fine': 'La data fine deve essere ≥ data inizio'})

    stock = stock_qty_for(costume_id, taglia)
    if stock <= 0:
        raise ValidationError({
            'taglia': 'Nessuno stock per questa taglia (assente o quantità 0)',
        })

    impegnate = impegnate_nel_range(costume_id, taglia, data_inizio, data_fine)
    if impegnate >= stock:
        raise ValidationError({
            'non_field_errors': [
                f'Nessuna disponibilità per taglia {taglia} nel periodo '
                f'({impegnate}/{stock} impegnate).',
            ],
        })
