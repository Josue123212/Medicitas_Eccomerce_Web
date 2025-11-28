from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'superadmin']:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        return False


class IsAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'superadmin']
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'superadmin']


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'superadmin'
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role == 'superadmin'


class IsPatientOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'superadmin']:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsDoctorOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'superadmin']:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsAppointmentParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'superadmin']:
            return True
        if hasattr(obj, 'patient') and hasattr(obj.patient, 'user') and obj.patient.user == request.user:
            return True
        if hasattr(obj, 'doctor') and hasattr(obj.doctor, 'user') and obj.doctor.user == request.user:
            return True
        return False


class IsReadOnlyOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['admin', 'superadmin']


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'doctor'
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role == 'doctor'


class IsSecretary(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'secretary'
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role == 'secretary'


class IsDoctorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'admin', 'superadmin']
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'admin', 'superadmin']


class IsSecretaryOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['secretary', 'admin', 'superadmin']
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role in ['secretary', 'admin', 'superadmin']


class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'client'
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role == 'client'


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'secretary', 'admin', 'superadmin']
    def has_object_permission(self, request, view, obj):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'secretary', 'admin', 'superadmin']


class IsDoctorOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['doctor', 'admin', 'superadmin']
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'superadmin']:
            return True
        if request.user.role == 'doctor':
            if hasattr(obj, 'user'):
                return obj.user == request.user
            elif hasattr(obj, 'id') and hasattr(request.user, 'id'):
                return obj.id == request.user.id
        return False

