from django.urls import path

from .views import (
    LoginView,
    CostumiListCreateView,
    CostumiDetailView,
    CostumiMetaView,
    InventarioListView,
    InventarioCreateView,
)

app_name = 'wardrobe'

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),

    # Fase 2 — API costumi
    path('costumi/', CostumiListCreateView.as_view(), name='costumi-list-create'),
    path('costumi/meta/', CostumiMetaView.as_view(), name='costumi-meta'),
    path('costumi/<int:pk>/', CostumiDetailView.as_view(), name='costumi-detail'),

    # Alias legacy Fase 1
    path('inventario/', InventarioListView.as_view(), name='inventario-list'),
    path('inventario/create/', InventarioCreateView.as_view(), name='inventario-create'),
]
