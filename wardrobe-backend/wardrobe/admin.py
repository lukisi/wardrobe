from django.contrib import admin
from .models import Inventario


@admin.register(Inventario)
class InventarioAdmin(admin.ModelAdmin):
    list_display = (
        'codice',
        'nome',
        'categoria',
        'quantita',
        'disponibile_display',
        'ultimo_utilizzo',
    )
    list_filter = ('categoria',)
    search_fields = ('codice', 'nome', 'descrizione')
    ordering = ('codice',)
    fieldsets = (
        ('Identità', {
            'fields': ('codice', 'nome', 'descrizione'),
        }),
        ('Classificazione', {
            'fields': ('categoria', 'taglie'),
        }),
        ('Magazzino', {
            'fields': ('quantita', 'ultimo_utilizzo'),
        }),
        ('Media', {
            'fields': ('immagine_url',),
        }),
    )

    @admin.display(boolean=True, description='Disponibile')
    def disponibile_display(self, obj: Inventario) -> bool:
        return obj.disponibile
