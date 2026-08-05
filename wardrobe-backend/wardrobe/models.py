from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum


class Inventario(models.Model):
    class Categoria(models.TextChoices):
        PRESEPE_VIVENTE = 'presepe_vivente', 'Presepe Vivente'
        PROFETI = 'profeti', 'Profeti'
        SANTI = 'santi', 'Santi'
        APOSTOLI = 'apostoli', 'Apostoli'

    TAGLIE_AMMESSE = ('S', 'M', 'L', 'XL')
    IMMAGINE_CONTENT_TYPES = ('image/jpeg', 'image/png', 'image/webp')
    IMMAGINE_MAX_BYTES = 2 * 1024 * 1024

    codice = models.CharField(
        max_length=5,
        unique=True,
        help_text='Codice articolo (esattamente 5 caratteri)',
    )
    nome = models.CharField(
        max_length=120,
        help_text='Nome del costume',
    )
    descrizione = models.TextField(
        blank=True,
        default='',
        help_text='Descrizione dettagliata del costume',
    )
    categoria = models.CharField(
        max_length=32,
        choices=Categoria.choices,
        db_index=True,
        help_text='Categoria del costume',
    )
    immagine = models.BinaryField(
        null=True,
        blank=True,
        editable=False,
        help_text='Blob binario dell’immagine del costume',
    )
    immagine_content_type = models.CharField(
        max_length=64,
        blank=True,
        default='',
        help_text='MIME type dell’immagine (es. image/jpeg)',
    )
    ultimo_utilizzo = models.DateField(
        null=True,
        blank=True,
        help_text="Data dell'ultimo utilizzo",
    )

    class Meta:
        verbose_name = 'Costume'
        verbose_name_plural = 'Costumi'
        ordering = ['codice']
        indexes = [
            models.Index(fields=['nome']),
        ]

    def __str__(self):
        return f'{self.codice} - {self.nome}'

    @property
    def disponibile(self) -> bool:
        annotated = getattr(self, '_stock_totale', None)
        if annotated is not None:
            return annotated > 0
        total = self.stock_taglie.aggregate(s=Sum('quantita'))['s']
        return bool(total and total > 0)

    def clean(self):
        if len(self.codice) != 5:
            raise ValidationError({'codice': 'Il codice deve essere esattamente di 5 caratteri'})


class InventarioTaglia(models.Model):
    costume = models.ForeignKey(
        Inventario,
        on_delete=models.CASCADE,
        related_name='stock_taglie',
    )
    taglia = models.CharField(
        max_length=4,
        choices=[(t, t) for t in Inventario.TAGLIE_AMMESSE],
    )
    quantita = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = 'Stock taglia'
        verbose_name_plural = 'Stock per taglia'
        ordering = ['taglia']
        constraints = [
            models.UniqueConstraint(
                fields=['costume', 'taglia'],
                name='uniq_inventario_taglia',
            ),
        ]

    def __str__(self):
        return f'{self.costume.codice} {self.taglia}×{self.quantita}'

    def clean(self):
        if self.taglia not in Inventario.TAGLIE_AMMESSE:
            raise ValidationError({
                'taglia': f'Taglia non ammessa. Usa {", ".join(Inventario.TAGLIE_AMMESSE)}',
            })
