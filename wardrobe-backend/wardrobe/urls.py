from django.urls import path

from .views import (
    LoginView,
    CostumiListCreateView,
    CostumiDetailView,
    CostumiMetaView,
    CostumeImageView,
    CostumeDisponibilitaView,
    InventarioListView,
    InventarioCreateView,
    PrenotazioniListCreateView,
    PrenotazioneDetailView,
    PrenotazioneAnnullaView,
)

app_name = 'wardrobe'

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),

    path('costumi/', CostumiListCreateView.as_view(), name='costumi-list-create'),
    path('costumi/meta/', CostumiMetaView.as_view(), name='costumi-meta'),
    path('costumi/<int:pk>/immagine/', CostumeImageView.as_view(), name='costumi-immagine'),
    path('costumi/<int:pk>/disponibilita/', CostumeDisponibilitaView.as_view(), name='costumi-disponibilita'),
    path('costumi/<int:pk>/', CostumiDetailView.as_view(), name='costumi-detail'),

    path('prenotazioni/', PrenotazioniListCreateView.as_view(), name='prenotazioni-list-create'),
    path('prenotazioni/<int:pk>/', PrenotazioneDetailView.as_view(), name='prenotazioni-detail'),
    path('prenotazioni/<int:pk>/annulla/', PrenotazioneAnnullaView.as_view(), name='prenotazioni-annulla'),

    path('inventario/', InventarioListView.as_view(), name='inventario-list'),
    path('inventario/create/', InventarioCreateView.as_view(), name='inventario-create'),
]
