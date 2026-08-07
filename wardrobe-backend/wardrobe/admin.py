from django import forms
from django.contrib import admin
from django.utils.html import format_html

from .models import Inventario, InventarioTaglia, Prenotazione


class InventarioTagliaInline(admin.TabularInline):
    model = InventarioTaglia
    extra = 1
    min_num = 0


class InventarioAdminForm(forms.ModelForm):
    immagine_upload = forms.FileField(
        required=False,
        label='Carica immagine',
        help_text='JPEG, PNG o WebP, max 2 MB. Lascia vuoto per non modificare.',
    )

    class Meta:
        model = Inventario
        fields = (
            'codice',
            'nome',
            'descrizione',
            'categoria',
        )

    def save(self, commit=True):
        instance = super().save(commit=False)
        uploaded = self.cleaned_data.get('immagine_upload')
        if uploaded:
            content_type = (uploaded.content_type or '').lower()
            data = uploaded.read()
            if content_type not in Inventario.IMMAGINE_CONTENT_TYPES:
                raise forms.ValidationError(
                    f'Tipo non ammesso: {content_type}',
                )
            if len(data) > Inventario.IMMAGINE_MAX_BYTES:
                raise forms.ValidationError('Immagine troppo grande (max 2 MB)')
            instance.immagine = data
            instance.immagine_content_type = content_type
        if commit:
            instance.save()
        return instance


@admin.register(Inventario)
class InventarioAdmin(admin.ModelAdmin):
    form = InventarioAdminForm
    inlines = [InventarioTagliaInline]
    list_display = (
        'codice',
        'nome',
        'categoria',
        'stock_display',
        'disponibile_display',
        'has_immagine_display',
    )
    list_filter = ('categoria',)
    search_fields = ('codice', 'nome', 'descrizione')
    ordering = ('codice',)
    readonly_fields = ('anteprima_immagine',)
    fieldsets = (
        ('Identità', {
            'fields': ('codice', 'nome', 'descrizione'),
        }),
        ('Classificazione', {
            'fields': ('categoria',),
        }),
        ('Media', {
            'fields': ('anteprima_immagine', 'immagine_upload'),
        }),
    )

    @admin.display(description='Stock')
    def stock_display(self, obj: Inventario) -> str:
        rows = list(obj.stock_taglie.all())
        if not rows:
            return '—'
        return ' · '.join(f'{r.taglia}×{r.quantita}' for r in rows)

    @admin.display(boolean=True, description='Disponibile')
    def disponibile_display(self, obj: Inventario) -> bool:
        return obj.disponibile

    @admin.display(boolean=True, description='Immagine')
    def has_immagine_display(self, obj: Inventario) -> bool:
        return obj.immagine is not None

    @admin.display(description='Anteprima')
    def anteprima_immagine(self, obj: Inventario):
        if not obj.pk or obj.immagine is None:
            return '—'
        import base64
        b64 = base64.b64encode(bytes(obj.immagine)).decode('ascii')
        mime = obj.immagine_content_type or 'image/jpeg'
        return format_html(
            '<img src="data:{};base64,{}" style="max-height:160px;max-width:240px;" />',
            mime,
            b64,
        )


@admin.register(Prenotazione)
class PrenotazioneAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'costume',
        'taglia',
        'data_inizio',
        'data_fine',
        'stato',
        'creata_da',
        'creata_il',
    )
    list_filter = ('stato', 'taglia', 'data_inizio')
    search_fields = ('costume__codice', 'costume__nome', 'note', 'creata_da__username')
    ordering = ('-data_inizio', '-id')
    autocomplete_fields = ('costume', 'creata_da')
    readonly_fields = ('creata_il',)
