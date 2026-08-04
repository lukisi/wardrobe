from rest_framework import serializers
from .models import Inventario


class CostumeSerializer(serializers.ModelSerializer):
    disponibile = serializers.BooleanField(read_only=True)
    has_immagine = serializers.SerializerMethodField()

    class Meta:
        model = Inventario
        fields = [
            'id',
            'codice',
            'nome',
            'descrizione',
            'categoria',
            'has_immagine',
            'taglie',
            'quantita',
            'disponibile',
            'ultimo_utilizzo',
        ]
        read_only_fields = ['id', 'codice', 'disponibile', 'has_immagine']

    def get_has_immagine(self, obj) -> bool:
        annotated = getattr(obj, '_has_immagine', None)
        if annotated is not None:
            return bool(annotated)
        return obj.immagine is not None


class CostumeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = [
            'nome',
            'descrizione',
            'categoria',
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

    def validate_categoria(self, value):
        valid = {choice.value for choice in Inventario.Categoria}
        if value not in valid:
            raise serializers.ValidationError(
                f'Categoria non valida. Usa una di: {", ".join(sorted(valid))}'
            )
        return value


# Alias retrocompatibili con i nomi usati in Fase 1
InventarioSerializer = CostumeSerializer
InventarioCreateSerializer = CostumeWriteSerializer
