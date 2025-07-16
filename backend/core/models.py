# backend/core/models.py
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