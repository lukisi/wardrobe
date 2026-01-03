from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Inventario
from .serializers import InventarioSerializer


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