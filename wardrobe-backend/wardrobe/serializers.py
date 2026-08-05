from django.db import transaction
from rest_framework import serializers

from .models import Inventario, InventarioTaglia, Prenotazione


class TagliaStockSerializer(serializers.Serializer):
    taglia = serializers.ChoiceField(choices=[(t, t) for t in Inventario.TAGLIE_AMMESSE])
    quantita = serializers.IntegerField(min_value=1)


class CostumeSerializer(serializers.ModelSerializer):
    disponibile = serializers.SerializerMethodField()
    has_immagine = serializers.SerializerMethodField()
    taglie_stock = TagliaStockSerializer(source='stock_taglie', many=True, read_only=True)

    class Meta:
        model = Inventario
        fields = [
            'id',
            'codice',
            'nome',
            'descrizione',
            'categoria',
            'has_immagine',
            'taglie_stock',
            'disponibile',
            'ultimo_utilizzo',
        ]
        read_only_fields = ['id', 'codice', 'disponibile', 'has_immagine', 'taglie_stock']

    def get_has_immagine(self, obj) -> bool:
        annotated = getattr(obj, '_has_immagine', None)
        if annotated is not None:
            return bool(annotated)
        return obj.immagine is not None

    def get_disponibile(self, obj) -> bool:
        return obj.disponibile


class CostumeWriteSerializer(serializers.ModelSerializer):
    taglie_stock = TagliaStockSerializer(many=True, required=False)

    class Meta:
        model = Inventario
        fields = [
            'nome',
            'descrizione',
            'categoria',
            'taglie_stock',
            'ultimo_utilizzo',
        ]

    def validate_categoria(self, value):
        valid = {choice.value for choice in Inventario.Categoria}
        if value not in valid:
            raise serializers.ValidationError(
                f'Categoria non valida. Usa una di: {", ".join(sorted(valid))}'
            )
        return value

    def validate_taglie_stock(self, value):
        if value is None:
            return []
        seen = set()
        cleaned = []
        for row in value:
            taglia = row['taglia']
            if taglia in seen:
                raise serializers.ValidationError(f'Taglia duplicata: {taglia}')
            seen.add(taglia)
            cleaned.append(row)
        return cleaned

    @staticmethod
    def _sync_stock(costume: Inventario, stock_rows: list[dict]) -> None:
        costume.stock_taglie.all().delete()
        InventarioTaglia.objects.bulk_create([
            InventarioTaglia(
                costume=costume,
                taglia=row['taglia'],
                quantita=row['quantita'],
            )
            for row in stock_rows
            if row['quantita'] > 0
        ])

    def create(self, validated_data):
        stock = validated_data.pop('taglie_stock', [])
        with transaction.atomic():
            item = Inventario.objects.create(**validated_data)
            self._sync_stock(item, stock)
        return item

    def update(self, instance, validated_data):
        stock = validated_data.pop('taglie_stock', serializers.empty)
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            if stock is not serializers.empty:
                self._sync_stock(instance, stock)
        return instance


# Alias retrocompatibili con i nomi usati in Fase 1
InventarioSerializer = CostumeSerializer
InventarioCreateSerializer = CostumeWriteSerializer


class PrenotazioneSerializer(serializers.ModelSerializer):
    costume_codice = serializers.CharField(source='costume.codice', read_only=True)
    costume_nome = serializers.CharField(source='costume.nome', read_only=True)
    creata_da_username = serializers.CharField(source='creata_da.username', read_only=True)

    class Meta:
        model = Prenotazione
        fields = [
            'id',
            'costume',
            'costume_codice',
            'costume_nome',
            'taglia',
            'data_inizio',
            'data_fine',
            'stato',
            'note',
            'creata_da',
            'creata_da_username',
            'creata_il',
        ]
        read_only_fields = [
            'id',
            'stato',
            'creata_da',
            'creata_da_username',
            'creata_il',
            'costume_codice',
            'costume_nome',
        ]


class PrenotazioneCreateSerializer(serializers.Serializer):
    costume = serializers.PrimaryKeyRelatedField(queryset=Inventario.objects.all())
    taglia = serializers.ChoiceField(choices=[(t, t) for t in Inventario.TAGLIE_AMMESSE])
    data_inizio = serializers.DateField()
    data_fine = serializers.DateField()
    note = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if attrs['data_inizio'] > attrs['data_fine']:
            raise serializers.ValidationError({'data_fine': 'La data fine deve essere ≥ data inizio'})
        return attrs
