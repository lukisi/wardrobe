from django.urls import path
from .views import LoginView, InventarioListView

app_name = 'wardrobe'  # opzionale ma utile

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('inventario/', InventarioListView.as_view(), name='inventario-list'),
]