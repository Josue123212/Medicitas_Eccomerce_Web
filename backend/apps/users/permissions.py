"""
Permisos personalizados para la aplicación de usuarios.
"""

from rest_framework import permissions


class IsSecretary(permissions.BasePermission):
    """
    Permiso personalizado para verificar que el usuario sea una secretaria.
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario tiene permisos de secretaria.
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'is_secretary') and
            request.user.is_secretary()
        )
    
    def has_object_permission(self, request, view, obj):
        """
        Verificar permisos a nivel de objeto.
        """
        # Verificar que el usuario sea secretaria
        if not self.has_permission(request, view):
            return False
        
        # Si el objeto tiene un campo 'user', verificar que sea el usuario actual
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Si el objeto es el usuario mismo
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        
        return True


class IsDoctor(permissions.BasePermission):
    """
    Permiso personalizado para verificar que el usuario sea un doctor.
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario tiene permisos de doctor.
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'is_doctor') and
            request.user.is_doctor()
        )
    
    def has_object_permission(self, request, view, obj):
        """
        Verificar permisos a nivel de objeto.
        """
        # Verificar que el usuario sea doctor
        if not self.has_permission(request, view):
            return False
        
        # Si el objeto tiene un campo 'user', verificar que sea el usuario actual
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Si el objeto es el usuario mismo
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        
        return True


class IsPatient(permissions.BasePermission):
    """
    Permiso personalizado para verificar que el usuario sea un paciente.
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario tiene permisos de paciente.
        """
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'is_patient') and
            request.user.is_patient()
        )
    
    def has_object_permission(self, request, view, obj):
        """
        Verificar permisos a nivel de objeto.
        """
        # Verificar que el usuario sea paciente
        if not self.has_permission(request, view):
            return False
        
        # Si el objeto tiene un campo 'user', verificar que sea el usuario actual
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Si el objeto es el usuario mismo
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        
        return True


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los propietarios editar sus objetos.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Permisos de lectura para cualquier request,
        pero permisos de escritura solo para el propietario del objeto.
        """
        # Permisos de lectura para cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Permisos de escritura solo para el propietario del objeto
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return obj == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los administradores editar.
    """
    
    def has_permission(self, request, view):
        """
        Verificar permisos generales.
        """
        # Permisos de lectura para usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Permisos de escritura solo para administradores
        return request.user.is_authenticated and request.user.is_staff