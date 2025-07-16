# Em backend/core/urls.py
from django.urls import path
# REMOVIDO: LoginView
from .views import RegisterView, DashboardView # ADICIONADO: DashboardView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'), # Rota protegida
]