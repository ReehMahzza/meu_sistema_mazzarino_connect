# backend/core/forms.py

from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import CustomUser

class CustomUserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput)

    class Meta:
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'role')

    def clean_password2(self):
        cd = self.cleaned_data
        if cd['password'] != cd['password2']:
            raise forms.ValidationError('Passwords don\'t match.')
        return cd['password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save() # O save do modelo vai gerar o username
        return user

class CustomUserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(required=False)

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')