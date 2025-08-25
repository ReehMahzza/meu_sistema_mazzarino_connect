from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsColaboradorUser(BasePermission):
    """
    Allows access only to 'colaborador' users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'FUNCIONARIO')

class IsClienteUser(BasePermission):
    """
    Allows access only to 'cliente' users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CLIENTE')

class IsAdminOrColaboradorUser(BasePermission):
    """
    Allows access only to admin or 'colaborador' users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.role == 'FUNCIONARIO'))
