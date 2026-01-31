from rest_framework import serializers
from .models import Inventario

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = ['id', 'codice', 'descrizione', 'quantita']
        read_only_fields = ['id', 'codice']  # codice generato dal backend


class InventarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = ['descrizione']  # solo questo campo lo passa il client
