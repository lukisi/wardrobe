from django.core.exceptions import ValidationError
from django.db import models


class Inventario(models.Model):
    class Categoria(models.TextChoices):
        PRESEPE_VIVENTE = 'presepe_vivente', 'Presepe Vivente'
        PROFETI = 'profeti', 'Profeti'
        SANTI = 'santi', 'Santi'
        APOSTOLI = 'apostoli', 'Apostoli'

    TAGLIE_AMMESSE = ('S', 'M', 'L', 'XL')

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
    immagine_url = models.URLField(
        blank=True,
        default='',
        help_text='URL immagine del costume',
    )
    taglie = models.JSONField(
        default=list,
        blank=True,
        help_text='Taglie disponibili, es. ["S", "M", "L"]',
    )
    quantita = models.PositiveIntegerField(
        default=0,
        help_text='Quantità disponibile in magazzino',
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
        return self.quantita > 0

    def clean(self):
        if len(self.codice) != 5:
            raise ValidationError({'codice': 'Il codice deve essere esattamente di 5 caratteri'})

        if not isinstance(self.taglie, list):
            raise ValidationError({'taglie': 'Le taglie devono essere una lista'})

        invalid = [t for t in self.taglie if t not in self.TAGLIE_AMMESSE]
        if invalid:
            raise ValidationError({
                'taglie': f'Taglie non ammesse: {", ".join(invalid)}. Usa {", ".join(self.TAGLIE_AMMESSE)}',
            })
