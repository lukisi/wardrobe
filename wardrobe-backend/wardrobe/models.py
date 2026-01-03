from django.db import models
from django.core.exceptions import ValidationError

class Inventario(models.Model):
    codice = models.CharField(
        max_length=5,
        unique=True,
        null=False,
        blank=False,
        help_text="Codice articolo (esattamente 5 caratteri)"
    )
    descrizione = models.CharField(
        max_length=30,
        null=False,
        blank=False,
        help_text="Descrizione breve dell'articolo"
    )
    quantita = models.PositiveIntegerField(
        null=False,
        blank=False,
        default=0,
        help_text="Quantità disponibile in magazzino"
    )

    class Meta:
        verbose_name = "Articolo"
        verbose_name_plural = "Articoli di Inventario"
        ordering = ['codice']

    def __str__(self):
        return f"{self.codice} - {self.descrizione}"

    def clean(self):
        """Validazione personalizzata"""
        if len(self.codice) != 5:
            raise ValidationError({
                'codice': "Il codice deve essere esattamente di 5 caratteri"
            })