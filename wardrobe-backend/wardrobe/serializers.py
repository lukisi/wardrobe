from rest_framework import serializers
from .models import Inventario


class InventarioSerializer(serializers.ModelSerializer):
    disponibile = serializers.BooleanField(read_only=True)

    class Meta:
        model = Inventario
        fields = [
            'id',
            'codice',
            'nome',
            'descrizione',
            'categoria',
            'immagine_url',
            'taglie',
            'quantita',
            'disponibile',
            'ultimo_utilizzo',
        ]
        read_only_fields = ['id', 'codice', 'disponibile']


class InventarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = [
            'nome',
            'descrizione',
            'categoria',
            'immagine_url',
            'taglie',
            'quantita',
            'ultimo_utilizzo',
        ]

    def validate_taglie(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Le taglie devono essere una lista')
        invalid = [t for t in value if t not in Inventario.TAGLIE_AMMESSE]
        if invalid:
            raise serializers.ValidationError(
                f'Taglie non ammesse: {", ".join(str(t) for t in invalid)}'
            )
        return value
