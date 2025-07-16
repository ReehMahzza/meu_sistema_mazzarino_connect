# Em backend/core/views.py

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics # ADICIONADO: generics
from .serializers import UserRegistrationSerializer, CaseSerializer, DocumentSerializer # ADICIONADO: os novos serializers
from .models import Case, Document # ADICIONADO: os novos modelos

CustomUser = get_user_model()

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Usuário registrado com sucesso!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            "message": f"Bem-vindo ao Dashboard, {user.first_name}!",
            "user": { "id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name, }
        }, status=status.HTTP_200_OK)


# ADICIONAR AQUI: Novas views para Casos e Documentos
class CaseListCreateView(generics.ListCreateAPIView):
    """
    View para listar os casos do usuário logado ou criar um novo caso.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Retorna apenas os casos criados pelo usuário logado.
        return Case.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        # Associa o usuário logado automaticamente ao criar um novo caso.
        serializer.save(created_by=self.request.user)

class DocumentListCreateView(generics.ListCreateAPIView):
    """
    View para listar documentos de um caso específico ou fazer upload de um novo.
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra os documentos pelo ID do caso passado na URL.
        case_id = self.kwargs['case_id']
        # Garante que o usuário só pode listar documentos de casos que ele criou.
        return Document.objects.filter(case_id=case_id, case__created_by=self.request.user)

    def perform_create(self, serializer):
        # Gera a URL fictícia e associa o usuário e o caso.
        case_id = self.kwargs['case_id']
        # Garante que o caso pertence ao usuário logado antes de associar o documento.
        case = Case.objects.get(id=case_id, created_by=self.request.user)
        file_name = serializer.validated_data.get('file_name')
        # Gerando um URL fictício para simular o armazenamento
        # Use um nome de arquivo seguro (sem caracteres especiais)
        safe_file_name = file_name.replace(" ", "_").replace("/", "_") # Exemplo simples de sanitização
        fake_url = f"https://docs.mazzarino.com/fake-storage/{case.id}/{self.request.user.id}/{safe_file_name}.{serializer.validated_data.get('file_type')}" # Melhorado para incluir tipo e user_id

        serializer.save(
            uploaded_by=self.request.user,
            case=case,
            file_url=fake_url
        )

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para ver, atualizar ou deletar um documento específico.
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk' # Garante que o campo de busca seja 'pk' (chave primária)

    def get_queryset(self):
        # Garante que o usuário só possa acessar seus próprios documentos.
        return Document.objects.filter(uploaded_by=self.request.user)