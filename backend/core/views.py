# backend/core/views.py
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegistrationSerializer

CustomUser = get_user_model()

class RegisterView(APIView):
    """
    View para registrar um novo usuário.
    """
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Por enquanto, apenas retornamos uma mensagem de sucesso.
            # No futuro, podemos logar o usuário automaticamente e retornar um token.
            return Response({"message": "Usuário registrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    View para autenticar um usuário e, no futuro, retornar um token.
    """
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Por favor, forneça email e senha.'}, status=status.HTTP_400_BAD_REQUEST)

        # Usamos o 'authenticate' do Django, que verifica a senha hasheada.
        # Como o CustomUser usa email como USERNAME_FIELD, autenticamos com email.
        user = authenticate(request, username=email, password=password)

        if user is not None:
            # Autenticação bem-sucedida
            # No futuro, aqui nós geraríamos e retornaríamos um token JWT.
            return Response({
                'message': 'Login bem-sucedido!',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name, # Adicionado last_name
                }
            }, status=status.HTTP_200_OK)
        else:
            # Credenciais inválidas
            return Response({'error': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)