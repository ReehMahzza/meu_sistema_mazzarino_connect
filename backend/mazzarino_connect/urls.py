# Em backend/mazzarino_connect/urls.py (VERSÃO FINAL E CORRIGIDA)

from django.contrib import admin
from django.urls import path, include
from core.views import MyTokenObtainPairView # ADICIONADO
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    
    # ROTAS JWT - CERTIFIQUE-SE DE QUE EXISTEM:
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), # MODIFICADO
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]