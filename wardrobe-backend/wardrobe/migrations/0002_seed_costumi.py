from datetime import date

from django.db import migrations


SEED_COSTUMI = [
    {
        'codice': '00001',
        'nome': 'Tunica di Maria Vergine',
        'categoria': 'presepe_vivente',
        'descrizione': (
            'Veste azzurra in velluto con bordi dorati e lungo velo bianco. '
            'Perfetta per la Madonna nel presepe vivente. Include cintura in corda.'
        ),
        'immagine_url': 'https://picsum.photos/id/1011/600/800',
        'taglie': ['S', 'M', 'L'],
        'quantita': 2,
        'ultimo_utilizzo': date(2025, 12, 8),
    },
    {
        'codice': '00002',
        'nome': 'Mantello di San Giuseppe',
        'categoria': 'presepe_vivente',
        'descrizione': (
            'Mantello marrone scuro in lana con cappuccio. '
            'Include bastone da pastore in legno.'
        ),
        'immagine_url': 'https://picsum.photos/id/201/600/800',
        'taglie': ['M', 'L', 'XL'],
        'quantita': 1,
        'ultimo_utilizzo': date(2026, 1, 6),
    },
    {
        'codice': '00003',
        'nome': 'Abito del Profeta Mosè',
        'categoria': 'profeti',
        'descrizione': (
            'Tunica bianca con mantello rosso e bastone (incluso). '
            "Ideale per rappresentazione dell'Esodo."
        ),
        'immagine_url': 'https://picsum.photos/id/251/600/800',
        'taglie': ['L', 'XL'],
        'quantita': 0,
        'ultimo_utilizzo': date(2025, 11, 15),
    },
    {
        'codice': '00004',
        'nome': 'Veste di Re Davide',
        'categoria': 'profeti',
        'descrizione': (
            'Tunica porpora con bordi oro e piccola arpa di legno. '
            'Perfetta per salmi e scene del Vecchio Testamento.'
        ),
        'immagine_url': 'https://picsum.photos/id/312/600/800',
        'taglie': ['S', 'M'],
        'quantita': 1,
        'ultimo_utilizzo': date(2025, 12, 20),
    },
    {
        'codice': '00005',
        'nome': "Costume di San Francesco d'Assisi",
        'categoria': 'santi',
        'descrizione': (
            'Tonaca marrone francescana con cordone e sandali. '
            'Include croce di legno.'
        ),
        'immagine_url': 'https://picsum.photos/id/367/600/800',
        'taglie': ['S', 'M', 'L'],
        'quantita': 2,
        'ultimo_utilizzo': date(2025, 10, 4),
    },
    {
        'codice': '00006',
        'nome': 'Tunica di San Pietro',
        'categoria': 'apostoli',
        'descrizione': (
            'Veste bianca e mantello giallo ocra. '
            'Ideale per la Passione o Pentecoste.'
        ),
        'immagine_url': 'https://picsum.photos/id/433/600/800',
        'taglie': ['M', 'L'],
        'quantita': 1,
        'ultimo_utilizzo': date(2025, 3, 9),
    },
    {
        'codice': '00007',
        'nome': 'Abito della Profetessa Anna',
        'categoria': 'profeti',
        'descrizione': (
            'Veste grigia con scialle blu. '
            'Per scene del Tempio e presentazione di Gesù.'
        ),
        'immagine_url': 'https://picsum.photos/id/669/600/800',
        'taglie': ['S', 'M'],
        'quantita': 1,
        'ultimo_utilizzo': date(2026, 2, 2),
    },
    {
        'codice': '00008',
        'nome': 'Costume di Santa Chiara',
        'categoria': 'santi',
        'descrizione': (
            'Tunica bianca con velo e cordone. '
            'Perfetta per rappresentazioni francescane.'
        ),
        'immagine_url': 'https://picsum.photos/id/870/600/800',
        'taglie': ['S', 'M'],
        'quantita': 0,
        'ultimo_utilizzo': date(2025, 8, 11),
    },
    {
        'codice': '00009',
        'nome': 'Mantello del Profeta Elia',
        'categoria': 'profeti',
        'descrizione': (
            'Mantello in pelle di cammello con cintura in cuoio. '
            'Include bastone.'
        ),
        'immagine_url': 'https://picsum.photos/id/1015/600/800',
        'taglie': ['L', 'XL'],
        'quantita': 1,
        'ultimo_utilizzo': date(2025, 7, 17),
    },
    {
        'codice': '00010',
        'nome': "Veste dell'Angelo Annunciante",
        'categoria': 'presepe_vivente',
        'descrizione': (
            'Tunica bianca splendente con ali dorate removibili e aureola.'
        ),
        'immagine_url': 'https://picsum.photos/id/106/600/800',
        'taglie': ['S', 'M', 'L'],
        'quantita': 3,
        'ultimo_utilizzo': date(2025, 12, 25),
    },
]


def seed_costumi(apps, schema_editor):
    Inventario = apps.get_model('wardrobe', 'Inventario')
    Inventario.objects.all().delete()
    Inventario.objects.bulk_create([
        Inventario(**item) for item in SEED_COSTUMI
    ])


def unseed_costumi(apps, schema_editor):
    Inventario = apps.get_model('wardrobe', 'Inventario')
    Inventario.objects.filter(
        codice__in=[item['codice'] for item in SEED_COSTUMI]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('wardrobe', '0001_initial_costumi'),
    ]

    operations = [
        migrations.RunPython(seed_costumi, unseed_costumi),
    ]
