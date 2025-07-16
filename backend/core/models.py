# backend/core/models.py
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # O AbstractUser já tem: username, first_name, last_name, email, password, etc.
    # Vamos apenas adicionar nossos campos e ajustar o email.

    email = models.EmailField(unique=True) # Tornamos o email único e obrigatório
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True, verbose_name="CPF")
    telefone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone")
    setor_ou_equipe = models.CharField(max_length=100, null=True, blank=True, verbose_name="Setor/Equipe")

    # Dizemos ao Django que o campo de login agora será o 'email'.
    USERNAME_FIELD = 'email'

    # Campos necessários ao criar um superusuário pela linha de comando.
    # 'username' e 'first_name', 'last_name' são mantidos para compatibilidade com o AbstractUser.
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email
    # backend/core/models.py

# ... (CustomUser existente)

# ADICIONAR AQUI: Novos modelos
class Case(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título do Caso")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, # Usa o modelo de usuário configurado
        on_delete=models.CASCADE,
        related_name='cases',
        verbose_name="Criado por"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents', verbose_name="Caso")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, # Usa o modelo de usuário configurado
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Enviado por"
    )
    file_name = models.CharField(max_length=255, verbose_name="Nome do Arquivo")
    file_type = models.CharField(max_length=50, verbose_name="Tipo do Arquivo")
    file_url = models.URLField(max_length=1024, verbose_name="URL do Arquivo") # Para links de OneDrive/Google Drive
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Data de Upload")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição do Documento")

    def __str__(self):
        return f"{self.file_name} (Caso: {self.case.title})"