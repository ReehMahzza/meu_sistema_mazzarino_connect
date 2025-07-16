# Em backend/mazzarino_connect/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import ( # ADICIONADO: Importações JWT
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Rotas da nossa API principal
    path('api/', include('core.urls')),
    # Rotas de autenticação JWT (ADICIONADO)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]