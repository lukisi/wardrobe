from django.contrib.auth import authenticate
from django.db import connection, transaction
from django.db.models import BooleanField, Case, Count, Q, Value, When
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Inventario
from .pagination import CostumePagination
from .serializers import CostumeSerializer, CostumeWriteSerializer


def generate_next_codice() -> str:
    last_item = Inventario.objects.order_by('-codice').first()
    if last_item:
        return f'{int(last_item.codice) + 1:05d}'
    return '00001'


def costumi_base_queryset():
    """Lista/detail senza caricare il blob; annota presenza immagine."""
    return Inventario.objects.defer('immagine').annotate(
        _has_immagine=Case(
            When(immagine__isnull=True, then=Value(False)),
            default=Value(True),
            output_field=BooleanField(),
        )
    )


def filter_costumi_queryset(queryset, query_params):
    q = (query_params.get('q') or '').strip()
    if q:
        queryset = queryset.filter(
            Q(nome__icontains=q) | Q(descrizione__icontains=q)
        )

    categoria = (query_params.get('categoria') or '').strip()
    if categoria:
        queryset = queryset.filter(categoria=categoria)

    disponibile = query_params.get('disponibile')
    if disponibile is not None and str(disponibile).strip() != '':
        value = str(disponibile).strip().lower()
        if value in ('1', 'true', 'yes', 'si', 'sì'):
            queryset = queryset.filter(quantita__gt=0)
        elif value in ('0', 'false', 'no'):
            queryset = queryset.filter(quantita=0)

    taglia = (query_params.get('taglia') or '').strip().upper()
    if taglia:
        # Postgres supports JSON contains; SQLite stores JSON as text.
        if connection.vendor == 'postgresql':
            queryset = queryset.filter(taglie__contains=[taglia])
        else:
            queryset = queryset.filter(taglie__icontains=f'"{taglia}"')

    return queryset


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
                {'detail': 'username e password obbligatori'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {'detail': 'Credenziali non valide'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
        })


class CostumiListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/costumi/?q=&categoria=&disponibile=&taglia=&page=&page_size=
    POST /api/costumi/
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CostumePagination

    def get_queryset(self):
        return filter_costumi_queryset(
            costumi_base_queryset(),
            self.request.query_params,
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CostumeWriteSerializer
        return CostumeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            item = Inventario.objects.create(
                codice=generate_next_codice(),
                **serializer.validated_data,
            )

        return Response(
            CostumeSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )


class CostumiDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/costumi/<id>/
    """
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return costumi_base_queryset()

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return CostumeWriteSerializer
        return CostumeSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        instance = costumi_base_queryset().get(pk=instance.pk)
        return Response(CostumeSerializer(instance).data)


class CostumiMetaView(APIView):
    """
    GET /api/costumi/meta/
    Facet leggeri per filtri e badge.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Inventario.objects.all()
        totale = qs.count()
        disponibili = qs.filter(quantita__gt=0).count()

        counts = {
            row['categoria']: row['count']
            for row in qs.values('categoria').annotate(count=Count('id'))
        }

        categorie = [
            {
                'categoria': choice.value,
                'label': choice.label,
                'count': counts.get(choice.value, 0),
            }
            for choice in Inventario.Categoria
        ]

        return Response({
            'totale': totale,
            'disponibili': disponibili,
            'categorie': categorie,
        })


class CostumeImageView(APIView):
    """
    GET/PUT/DELETE /api/costumi/<id>/immagine/
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        item = get_object_or_404(
            Inventario.objects.only('id', 'immagine', 'immagine_content_type'),
            pk=pk,
        )
        if item.immagine is None:
            return Response({'detail': 'Immagine non presente'}, status=status.HTTP_404_NOT_FOUND)

        content_type = item.immagine_content_type or 'application/octet-stream'
        return HttpResponse(bytes(item.immagine), content_type=content_type)

    def put(self, request, pk):
        item = get_object_or_404(Inventario, pk=pk)
        uploaded = request.FILES.get('file')
        if uploaded is None:
            return Response(
                {'detail': 'Campo file obbligatorio (multipart)'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = (uploaded.content_type or '').lower()
        if content_type not in Inventario.IMMAGINE_CONTENT_TYPES:
            return Response(
                {
                    'detail': (
                        'Tipo file non ammesso. Usa: '
                        + ', '.join(Inventario.IMMAGINE_CONTENT_TYPES)
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = uploaded.read()
        if len(data) == 0:
            return Response(
                {'detail': 'Il file è vuoto'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(data) > Inventario.IMMAGINE_MAX_BYTES:
            return Response(
                {'detail': f'Dimensione massima {Inventario.IMMAGINE_MAX_BYTES} byte'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.immagine = data
        item.immagine_content_type = content_type
        item.save(update_fields=['immagine', 'immagine_content_type'])

        return Response(
            CostumeSerializer(costumi_base_queryset().get(pk=item.pk)).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        item = get_object_or_404(Inventario, pk=pk)
        item.immagine = None
        item.immagine_content_type = ''
        item.save(update_fields=['immagine', 'immagine_content_type'])
        return Response(status=status.HTTP_204_NO_CONTENT)


# Alias Fase 1 (deprecati): stessi serializer/comportamento ristretto
class InventarioListView(APIView):
    """GET /api/inventario/ → lista non paginata (alias legacy)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = costumi_base_queryset()
        return Response(CostumeSerializer(items, many=True).data)


class InventarioCreateView(generics.CreateAPIView):
    """POST /api/inventario/create/ → alias legacy di POST /api/costumi/."""
    queryset = Inventario.objects.all()
    serializer_class = CostumeWriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            item = Inventario.objects.create(
                codice=generate_next_codice(),
                **serializer.validated_data,
            )

        return Response(
            CostumeSerializer(item).data,
            status=status.HTTP_201_CREATED,
        )
