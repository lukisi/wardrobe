from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Inventario
from .serializers import InventarioSerializer, InventarioCreateSerializer
from django.db import transaction


class LoginView(APIView):
    """
    POST /api/login/
    Riceve {"username": "...", "password": "..."} → restituisce access token (10 min)
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {"detail": "username e password obbligatori"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Credenziali non valide"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
        })


class InventarioListView(APIView):
    """
    GET /api/inventario/
    Lista tutti gli articoli (solo autenticati)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = Inventario.objects.all()
        serializer = InventarioSerializer(items, many=True)
        return Response(serializer.data)


class InventarioCreateView(generics.CreateAPIView):
    queryset = Inventario.objects.all()
    serializer_class = InventarioCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            # Genera codice univoco automatico (esempio semplice: max attuale +1)
            last_item = Inventario.objects.order_by('-codice').first()
            if last_item:
                last_code = int(last_item.codice)
                new_code = f"{last_code + 1:05d}"
            else:
                new_code = "00001"

            new_item = Inventario.objects.create(
                codice=new_code,
                descrizione=serializer.validated_data['descrizione'],
            )

        return Response(InventarioSerializer(new_item).data, status=status.HTTP_201_CREATED)
