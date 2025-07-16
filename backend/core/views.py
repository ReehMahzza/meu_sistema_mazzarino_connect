# Em backend/core/views.py
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions # ADICIONADO: permissions
# REMOVIDO: authenticate, LoginView (serão substituídos pelo JWT)
from .serializers import UserRegistrationSerializer

CustomUser = get_user_model()

class RegisterView(APIView):
    """
    View para registrar um novo usuário. (Esta view permanece a mesma)
    """
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Usuário registrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# NOVA VIEW DE DASHBOARD
class DashboardView(APIView):
    """
    View para o dashboard, acessível apenas por usuários autenticados.
    """
    permission_classes = [permissions.IsAuthenticated] # A mágica acontece aqui

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            "message": f"Bem-vindo ao Dashboard, {user.first_name}!",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        }, status=status.HTTP_200_OK)