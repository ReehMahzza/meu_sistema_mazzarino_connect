# backend/core/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password2', 'cpf', 'telefone', 'setor_ou_equipe') # Adicionado 'setor_ou_equipe'
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True}, # Mantenha username obrigatório por enquanto para AbstractUser
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # O AbstractUser requer username, mesmo que usemos email para login.
        # Certifique-se de que username é passado ou gerado, ou remova-o de REQUIRED_FIELDS no CustomUser
        user = CustomUser.objects.create_user(**validated_data)
        return user