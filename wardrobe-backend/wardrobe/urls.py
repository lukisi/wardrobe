from django.urls import path
from .views import LoginView, InventarioListView, InventarioCreateView

app_name = 'wardrobe'  # opzionale ma utile

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('inventario/', InventarioListView.as_view(), name='inventario-list'),
    path('inventario/create/', InventarioCreateView.as_view(), name='inventario-create'),
]
