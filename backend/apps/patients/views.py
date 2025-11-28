from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.core.permissions import (
    IsPatientOwner, 
    IsAdminOrSuperAdmin, 
    IsDoctorOrAdmin,
    IsStaff
)

from .models import Patient
from .serializers import (
    PatientSerializer,
    PatientCreateSerializer,
    PatientUpdateSerializer,
    PatientListSerializer,
    PatientStatusUpdateSerializer
)
from .filters import PatientFilter
from apps.appointments.models import Appointment


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de pacientes.
    
    Proporciona operaciones CRUD completas para pacientes:
    - list: Listar pacientes (con filtros y búsqueda)
    - create: Crear nuevo paciente
    - retrieve: Obtener paciente específico
    - update: Actualizar paciente completo
    - partial_update: Actualizar paciente parcial
    - destroy: Eliminar paciente (soft delete)
    
    Acciones personalizadas:
    - medical_history: Obtener historial médico del paciente
    - appointments: Obtener citas del paciente
    - statistics: Estadísticas del paciente
    
    Filtros disponibles:
    - name: Búsqueda por nombre o apellido
    - phone, email: Filtros por información de contacto
    - birth_date, birth_date_from, birth_date_to: Filtros por fecha de nacimiento
    - age_min, age_max: Filtros por rango de edad
    - address: Filtro por dirección
    - emergency_contact_name, emergency_contact_phone: Filtros por contacto de emergencia
    
    Búsqueda disponible en:
    - Nombre y apellido del paciente
    - Email
    - Teléfono
    - Dirección
    
    Ordenamiento disponible por:
    - first_name, last_name, birth_date, phone, created_at
    """
    
    queryset = Patient.objects.select_related('user')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Configuración de filtros
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PatientFilter
    
    # Configuración de búsqueda
    search_fields = [
        'user__first_name',
        'user__last_name',
        'user__email',
        'phone',
        'address',
    ]
    
    # Configuración de ordenamiento
    ordering_fields = [
        'user__first_name', 
        'user__last_name', 
        'birth_date', 
        'phone',
        'created_at'
    ]
    ordering = ['user__last_name', 'user__first_name']  # Ordenamiento por defecto: alfabético por apellido
    
    def get_serializer_class(self):
        """
        Retorna la clase de serializer apropiada según la acción.
        """
        if self.action == 'create':
            return PatientCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PatientUpdateSerializer
        elif self.action == 'list':
            return PatientListSerializer
        return PatientSerializer
    
    def get_permissions(self):
        """
        Instancia y retorna la lista de permisos requeridos para esta vista.
        Implementa permisos granulares según el plan de sincronización.
        """
        # Listar pacientes: doctores y administradores
        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated, IsStaff]
        
        # Crear pacientes: cualquier usuario autenticado (auto-registro)
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        
        # Ver, actualizar, eliminar pacientes específicos: propietario o administradores
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsPatientOwner]
        
        # Historial médico y citas: propietario, doctores o administradores
        elif self.action in ['medical_history', 'appointments', 'statistics']:
            permission_classes = [permissions.IsAuthenticated, IsPatientOwner]
        
        # Por defecto, requiere autenticación
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Retorna el queryset filtrado según los parámetros de búsqueda.
        Los administradores pueden ver todos los pacientes (incluyendo deshabilitados).
        Los usuarios regulares solo ven pacientes activos.
        """
        queryset = Patient.objects.select_related('user').prefetch_related('appointments')
        
        # Filtrar por estado según el tipo de usuario
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            # Usuarios regulares solo ven pacientes activos
            queryset = queryset.filter(status='active', user__is_active=True)
        
        # Filtro por búsqueda general
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(emergency_contact_name__icontains=search)
            )
        
        # Filtro por tipo de sangre
        blood_type = self.request.query_params.get('blood_type', None)
        if blood_type:
            queryset = queryset.filter(blood_type=blood_type)
        
        # Filtro por género
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)
        
        # Filtro por rango de edad
        min_age = self.request.query_params.get('min_age', None)
        max_age = self.request.query_params.get('max_age', None)
        
        if min_age or max_age:
            today = timezone.now().date()
            
            if max_age:
                min_birth_date = today - timedelta(days=int(max_age) * 365.25)
                queryset = queryset.filter(date_of_birth__gte=min_birth_date)
            
            if min_age:
                max_birth_date = today - timedelta(days=int(min_age) * 365.25)
                queryset = queryset.filter(date_of_birth__lte=max_birth_date)
        
        # Filtro por condiciones médicas
        medical_condition = self.request.query_params.get('medical_condition', None)
        if medical_condition:
            queryset = queryset.filter(medical_conditions__icontains=medical_condition)
        
        # Filtro por alergias
        allergy = self.request.query_params.get('allergy', None)
        if allergy:
            queryset = queryset.filter(allergies__icontains=allergy)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo paciente.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            patient = serializer.save()
            
            return Response(
                {
                    'message': 'Paciente creado exitosamente',
                    'data': PatientSerializer(patient).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al crear paciente',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar paciente completo o parcial.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            patient = serializer.save()
            
            return Response(
                {
                    'message': 'Paciente actualizado exitosamente',
                    'data': PatientSerializer(patient).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al actualizar paciente',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Actualizar paciente parcial.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar paciente (soft delete).
        """
        instance = self.get_object()
        
        # Verificar si tiene citas futuras
        future_appointments = Appointment.objects.filter(
            patient=instance,
            date__gte=timezone.now().date(),
            status__in=['scheduled', 'confirmed']
        ).exists()
        
        if future_appointments:
            return Response(
                {
                    'error': 'No se puede eliminar el paciente',
                    'detail': 'El paciente tiene citas futuras programadas'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Soft delete: desactivar el usuario asociado
            instance.user.is_active = False
            instance.user.save()
            
            return Response(
                {
                    'message': 'Paciente eliminado exitosamente'
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al eliminar paciente',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], url_path='medical-history')
    def medical_history(self, request, pk=None):
        """
        Obtener el historial médico completo del paciente.
        """
        patient = self.get_object()
        
        # Obtener todas las citas del paciente ordenadas por fecha
        appointments = Appointment.objects.filter(
            patient=patient
        ).select_related('doctor__user').order_by('-date', '-time')
        
        # Serializar las citas para el historial
        from apps.appointments.serializers import AppointmentListSerializer
        appointments_data = AppointmentListSerializer(appointments, many=True).data
        
        medical_history = {
            'patient_info': {
                'full_name': patient.full_name,
                'age': patient.age,
                'blood_type': patient.blood_type,
                'allergies': patient.allergies,
                'medical_conditions': patient.medical_conditions,
                'medications': patient.medications,
                'medical_summary': patient.get_medical_summary()
            },
            'appointments_history': appointments_data,
            'statistics': {
                'total_appointments': appointments.count(),
                'completed_appointments': appointments.filter(status='completed').count(),
                'cancelled_appointments': appointments.filter(status='cancelled').count(),
                'last_appointment': appointments.filter(status='completed').first().date if appointments.filter(status='completed').exists() else None
            }
        }
        
        return Response(
            {
                'message': 'Historial médico obtenido exitosamente',
                'data': medical_history
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='appointments')
    def appointments(self, request, pk=None):
        """
        Obtener las citas del paciente con filtros opcionales.
        """
        patient = self.get_object()
        
        # Filtros opcionales
        status_filter = request.query_params.get('status', None)
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        appointments = Appointment.objects.filter(patient=patient)
        
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        if date_from:
            try:
                date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                appointments = appointments.filter(date__gte=date_from)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                appointments = appointments.filter(date__lte=date_to)
            except ValueError:
                pass
        
        appointments = appointments.select_related('doctor__user').order_by('-date', '-time')
        
        from apps.appointments.serializers import AppointmentListSerializer
        serializer = AppointmentListSerializer(appointments, many=True)
        
        return Response(
            {
                'message': 'Citas obtenidas exitosamente',
                'data': serializer.data,
                'count': appointments.count()
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='statistics')
    def statistics(self, request, pk=None):
        """
        Obtener estadísticas del paciente.
        """
        patient = self.get_object()
        
        # Estadísticas de citas
        appointments = Appointment.objects.filter(patient=patient)
        
        # Citas por estado
        appointments_by_status = appointments.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Citas por mes (últimos 12 meses)
        twelve_months_ago = timezone.now().date() - timedelta(days=365)
        monthly_appointments = appointments.filter(
            date__gte=twelve_months_ago
        ).extra(
            select={'month': "strftime('%%Y-%%m', date)"}
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Doctores más visitados
        doctors_visited = appointments.values(
            'doctor__user__first_name',
            'doctor__user__last_name',
            'doctor__specialization'
        ).annotate(
            visit_count=Count('id')
        ).order_by('-visit_count')[:5]
        
        statistics = {
            'patient_info': {
                'full_name': patient.full_name,
                'age': patient.age,
                'registration_date': patient.created_at.date()
            },
            'appointments_summary': {
                'total': appointments.count(),
                'by_status': list(appointments_by_status),
                'monthly_trend': list(monthly_appointments)
            },
            'doctors_visited': list(doctors_visited),
            'health_summary': {
                'blood_type': patient.blood_type,
                'has_allergies': bool(patient.allergies),
                'has_medical_conditions': bool(patient.medical_conditions),
                'has_medications': bool(patient.medications)
            }
        }
        
        return Response(
            {
                'message': 'Estadísticas obtenidas exitosamente',
                'data': statistics
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Actualizar el estado del paciente (active, inactive, disabled).
        Solo administradores pueden usar esta acción.
        """
        patient = self.get_object()
        
        # Verificar permisos de administrador
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {
                    'error': 'Permisos insuficientes',
                    'detail': 'Solo los administradores pueden cambiar el estado de los pacientes'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PatientStatusUpdateSerializer(patient, data=request.data, partial=True)
        
        try:
            serializer.is_valid(raise_exception=True)
            updated_patient = serializer.save()
            
            # Obtener el estado actualizado para la respuesta
            patient_data = PatientListSerializer(updated_patient).data
            
            return Response(
                {
                    'message': f'Estado del paciente actualizado a {updated_patient.get_status_display()}',
                    'data': patient_data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al actualizar estado del paciente',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
