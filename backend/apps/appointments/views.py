from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta, time
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import logging
from django.db import transaction

logger = logging.getLogger(__name__)

from apps.core.permissions import (
    IsAppointmentParticipant, 
    IsAdminOrSuperAdmin, 
    IsSecretaryOrAdmin,
    IsDoctorOrAdmin
)

from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    AppointmentListSerializer
)
from .filters import AppointmentFilter
from apps.patients.models import Patient
from apps.doctors.models import Doctor


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de citas médicas.
    
    Proporciona operaciones CRUD completas para citas:
    - list: Listar citas (con filtros y búsqueda)
    - create: Crear nueva cita
    - retrieve: Obtener cita específica
    - update: Actualizar cita completa
    - partial_update: Actualizar cita parcial
    - destroy: Eliminar cita
    
    Acciones personalizadas:
    - confirm: Confirmar una cita programada
    - cancel: Cancelar una cita
    - complete: Marcar cita como completada
    - reschedule: Reprogramar una cita
    - patient_history: Historial de citas de un paciente
    - doctor_schedule: Agenda de un doctor
    - available_slots: Horarios disponibles para agendar
    
    Filtros disponibles:
    - date, date_from, date_to: Filtros por fecha
    - time_from, time_to: Filtros por hora
    - status: Filtro por estado
    - doctor, doctor_name, doctor_last_name: Filtros por doctor
    - specialization: Filtro por especialización
    - patient_name, patient_last_name: Filtros por paciente
    - today, this_week, this_month, upcoming, past: Filtros de conveniencia
    
    Búsqueda disponible en:
    - Nombre y apellido del doctor
    - Nombre y apellido del paciente
    - Especialización del doctor
    - Notas de la cita
    
    Ordenamiento disponible por:
    - date, time, status, created_at, updated_at
    """
    
    queryset = Appointment.objects.select_related('doctor__user', 'patient__user').all()
    serializer_class = AppointmentSerializer
    # Los permisos se configuran dinámicamente en get_permissions()
    
    # Configuración de filtros
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AppointmentFilter
    
    # Configuración de búsqueda
    search_fields = [
        'doctor__user__first_name',
        'doctor__user__last_name',
        'patient__user__first_name', 
        'patient__user__last_name',
        'doctor__specialization',
        'notes',
    ]
    
    # Configuración de ordenamiento
    ordering_fields = ['date', 'time', 'status', 'created_at', 'updated_at']
    ordering = ['-date', '-time']  # Ordenamiento por defecto: más recientes primero
    
    def get_serializer_class(self):
        """
        Retorna la clase de serializer apropiada según la acción.
        """
        if self.action == 'create':
            return AppointmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AppointmentUpdateSerializer
        elif self.action == 'list':
            return AppointmentListSerializer
        return AppointmentSerializer
    
    def get_permissions(self):
        """
        Instancia y retorna la lista de permisos requeridos para esta vista.
        Implementa permisos granulares según el plan de sincronización.
        """
        # Listar citas: cualquier usuario autenticado (filtrado por get_queryset)
        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated]
        
        # Crear citas: cualquier usuario autenticado (pacientes pueden crear sus propias citas)
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated]
        
        # Ver, actualizar, eliminar citas específicas: participantes de la cita o administradores
        elif self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAppointmentParticipant]
        
        # Confirmar, completar y reprogramar: solo doctores y administradores
        elif self.action in ['confirm', 'complete', 'reschedule']:
            permission_classes = [permissions.IsAuthenticated, IsDoctorOrAdmin]
        
        # Cancelar: participantes de la cita (pacientes y doctores) o administradores
        elif self.action == 'cancel':
            permission_classes = [permissions.IsAuthenticated, IsAppointmentParticipant]
        
        # Historial de paciente: cualquier usuario autenticado (se valida en el método)
        elif self.action == 'patient_history':
            permission_classes = [permissions.IsAuthenticated]
        
        # Agenda de doctor: solo doctores y administradores
        elif self.action == 'doctor_schedule':
            permission_classes = [permissions.IsAuthenticated, IsDoctorOrAdmin]
        
        # Horarios disponibles: acceso público (sin autenticación requerida)
        elif self.action == 'available_slots':
            permission_classes = [permissions.AllowAny]
        
        # Por defecto, requiere autenticación
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Retorna el queryset filtrado según los parámetros de búsqueda y permisos del usuario.
        """
        queryset = Appointment.objects.select_related(
            'patient__user', 'doctor__user'
        )
        
        # Filtrar según el tipo de usuario
        user = self.request.user
        
        # Si es un paciente (role='client'), solo ver sus propias citas
        if user.role == 'client' and hasattr(user, 'patient_profile'):
            queryset = queryset.filter(patient=user.patient_profile)
        
        # Si es un doctor, solo ver sus propias citas
        elif user.role == 'doctor' and hasattr(user, 'doctor'):
            queryset = queryset.filter(doctor=user.doctor)
        
        # Si es secretaria, puede ver todas las citas
        elif user.role == 'secretary':
            # Las secretarias pueden ver todas las citas
            pass
        
        # Si es admin o superadmin, puede ver todas las citas
        elif user.role in ['admin', 'superadmin']:
            # Los administradores pueden ver todas las citas
            pass
        
        # Si no tiene un rol reconocido, no ver nada
        else:
            queryset = queryset.none()
        
        # Filtros adicionales por query parameters
        
        # Filtro por estado
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtro por fecha
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            try:
                start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                pass
        
        if date_to:
            try:
                end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                pass
        
        # Filtro por doctor
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            try:
                queryset = queryset.filter(doctor_id=int(doctor_id))
            except ValueError:
                pass
        
        # Filtro por paciente
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            try:
                queryset = queryset.filter(patient_id=int(patient_id))
            except ValueError:
                pass
        
        # Filtro por búsqueda general
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(patient__user__first_name__icontains=search) |
                Q(patient__user__last_name__icontains=search) |
                Q(doctor__user__first_name__icontains=search) |
                Q(doctor__user__last_name__icontains=search) |
                Q(doctor__specialization__icontains=search) |
                Q(reason__icontains=search) |
                Q(notes__icontains=search)
            )
        
        # Filtro para citas futuras/pasadas
        time_filter = self.request.query_params.get('time_filter', None)
        today = timezone.now().date()
        
        if time_filter == 'upcoming':
            queryset = queryset.filter(date__gte=today)
        elif time_filter == 'past':
            queryset = queryset.filter(date__lt=today)
        elif time_filter == 'today':
            queryset = queryset.filter(date=today)
        
        return queryset.order_by('-date', '-time')
    
    def create(self, request, *args, **kwargs):
        """
        Crear una nueva cita médica.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            with transaction.atomic():
                validated = serializer.validated_data
                doctor = validated['doctor']
                patient = validated['patient']
                date = validated['date']
                time_value = validated['time']
                from apps.doctors.models import Doctor as DoctorModel
                DoctorModel.objects.select_for_update().get(pk=doctor.pk)
                exists_conflict = Appointment.objects.select_for_update().filter(
                    doctor=doctor,
                    date=date,
                    time=time_value
                ).exists()
                if exists_conflict:
                    return Response(
                        {
                            'error': 'Conflicto de horario',
                            'detail': 'Ya existe una cita para el doctor en la fecha y hora especificadas'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                appointment = serializer.save()
            
            return Response(
                {
                    'message': 'Cita creada exitosamente',
                    'data': AppointmentSerializer(appointment).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            detail = str(e)
            conflict_signatures = [
                'El doctor ya tiene una cita programada en este horario',
                'must make a unique set',
            ]
            if any(sig in detail for sig in conflict_signatures):
                return Response(
                    {
                        'error': 'Conflicto de horario',
                        'detail': 'Ya existe una cita para el doctor en la fecha y hora especificadas'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {
                    'error': 'Error al crear la cita',
                    'detail': detail
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar cita completa o parcial.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Verificar permisos para modificar la cita
        if not self._can_modify_appointment(request.user, instance):
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'No tiene permisos para modificar esta cita'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
            with transaction.atomic():
                new_doctor = serializer.validated_data.get('doctor', instance.doctor)
                new_date = serializer.validated_data.get('date', instance.date)
                new_time = serializer.validated_data.get('time', instance.time)
                from apps.doctors.models import Doctor as DoctorModel
                DoctorModel.objects.select_for_update().get(pk=new_doctor.pk)
                exists_conflict = Appointment.objects.select_for_update().filter(
                    doctor=new_doctor,
                    date=new_date,
                    time=new_time,
                ).exclude(pk=instance.pk).exists()
                if exists_conflict:
                    return Response(
                        {
                            'error': 'Conflicto de horario',
                            'detail': 'Ya existe una cita para el doctor en la fecha y hora especificadas'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                appointment = serializer.save()
            return Response(
                {
                    'message': 'Cita actualizada exitosamente',
                    'data': AppointmentSerializer(appointment).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al actualizar la cita',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Actualizar cita parcial.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar una cita.
        """
        instance = self.get_object()
        
        # Verificar permisos para eliminar la cita
        if not self._can_modify_appointment(request.user, instance):
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'No tiene permisos para eliminar esta cita'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar si la cita se puede eliminar
        if instance.status in ['completed', 'cancelled']:
            return Response(
                {
                    'error': 'No se puede eliminar',
                    'detail': f'No se puede eliminar una cita {instance.get_status_display().lower()}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            instance.delete()
            
            return Response(
                {
                    'message': 'Cita eliminada exitosamente'
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al eliminar la cita',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _can_modify_appointment(self, user, appointment):
        """
        Verifica si el usuario puede modificar la cita.
        """
        # Staff/admin puede modificar cualquier cita
        if user.is_staff:
            return True
        
        # El paciente puede modificar sus propias citas
        if hasattr(user, 'patient_profile') and appointment.patient == user.patient_profile:
            return True
        
        # El doctor puede modificar sus propias citas
        if hasattr(user, 'doctor') and appointment.doctor == user.doctor:
            return True
        
        return False
    
    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        """
        Confirmar una cita programada.
        """
        appointment = self.get_object()
        
        # Solo el doctor puede confirmar citas
        if not (hasattr(request.user, 'doctor') and 
                appointment.doctor == request.user.doctor):
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'Solo el doctor asignado puede confirmar la cita'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status != 'scheduled':
            return Response(
                {
                    'error': 'Estado inválido',
                    'detail': 'Solo se pueden confirmar citas programadas'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment.confirm()
            
            return Response(
                {
                    'message': 'Cita confirmada exitosamente',
                    'data': AppointmentSerializer(appointment).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al confirmar la cita',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        Cancelar una cita.
        """
        appointment = self.get_object()
        
        # DEBUG: Imprimir información de debug
        logger.error(f"\n=== DEBUG CANCEL APPOINTMENT {appointment.id} ===")
        logger.error(f"Usuario: {request.user.email} (ID: {request.user.id})")
        logger.error(f"Rol: {request.user.role}")
        logger.error(f"Es staff: {request.user.is_staff}")
        logger.error(f"Tiene patient_profile: {hasattr(request.user, 'patient_profile')}")
        if hasattr(request.user, 'patient_profile'):
            logger.error(f"Patient profile ID: {request.user.patient_profile.id}")
        logger.error(f"Appointment patient ID: {appointment.patient.id}")
        logger.error(f"Appointment doctor ID: {appointment.doctor.id}")
        
        # Verificar permisos
        can_modify = self._can_modify_appointment(request.user, appointment)
        logger.error(f"Puede modificar: {can_modify}")
        logger.error("=== FIN DEBUG ===\n")
        
        if not can_modify:
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'No tiene permisos para cancelar esta cita'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status in ['completed', 'cancelled']:
            return Response(
                {
                    'error': 'Estado inválido',
                    'detail': f'No se puede cancelar una cita {appointment.get_status_display().lower()}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener razón de cancelación
        cancellation_reason = request.data.get('reason', 'Sin razón especificada')
        
        try:
            appointment.cancel(reason=cancellation_reason)
            
            return Response(
                {
                    'message': 'Cita cancelada exitosamente',
                    'data': AppointmentSerializer(appointment).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al cancelar la cita',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        """
        Marcar una cita como completada.
        """
        appointment = self.get_object()
        
        # Solo el doctor puede marcar como completada
        if not (hasattr(request.user, 'doctor') and 
                appointment.doctor == request.user.doctor):
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'Solo el doctor asignado puede completar la cita'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status != 'confirmed':
            return Response(
                {
                    'error': 'Estado inválido',
                    'detail': 'Solo se pueden completar citas confirmadas'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener notas de la consulta
        consultation_notes = request.data.get('notes', '')
        
        try:
            appointment.complete(notes=consultation_notes)
            
            return Response(
                {
                    'message': 'Cita completada exitosamente',
                    'data': AppointmentSerializer(appointment).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al completar la cita',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], url_path='reschedule')
    def reschedule(self, request, pk=None):
        """
        Reprogramar una cita.
        """
        appointment = self.get_object()
        
        # Verificar permisos
        if not self._can_modify_appointment(request.user, appointment):
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'No tiene permisos para reprogramar esta cita'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        if appointment.status in ['completed', 'cancelled']:
            return Response(
                {
                    'error': 'Estado inválido',
                    'detail': f'No se puede reprogramar una cita {appointment.get_status_display().lower()}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener nueva fecha y hora
        new_date = request.data.get('date')
        new_time = request.data.get('time')
        
        if not new_date or not new_time:
            return Response(
                {
                    'error': 'Datos incompletos',
                    'detail': 'Debe proporcionar nueva fecha y hora'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment_date = datetime.strptime(new_date, '%Y-%m-%d').date()
            appointment_time = datetime.strptime(new_time, '%H:%M').time()
            with transaction.atomic():
                from apps.doctors.models import Doctor as DoctorModel
                DoctorModel.objects.select_for_update().get(pk=appointment.doctor.pk)
                conflict = Appointment.objects.select_for_update().filter(
                    doctor=appointment.doctor,
                    date=appointment_date,
                    time=appointment_time,
                ).exclude(pk=appointment.pk).exists()
                if conflict:
                    return Response(
                        {
                            'error': 'Horario no disponible',
                            'detail': 'El doctor ya tiene una cita en ese horario'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                appointment.date = appointment_date
                appointment.time = appointment_time
                appointment.status = 'scheduled'
                appointment.save(update_fields=['date', 'time', 'status', 'updated_at'])
            return Response(
                {
                    'message': 'Cita reprogramada exitosamente',
                    'data': AppointmentSerializer(appointment).data
                },
                status=status.HTTP_200_OK
            )
        except ValueError:
            return Response(
                {
                    'error': 'Formato inválido',
                    'detail': 'Use formato YYYY-MM-DD para fecha y HH:MM para hora'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al reprogramar la cita',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], url_path='patient-history')
    def patient_history(self, request):
        """
        Obtener el historial de citas de un paciente.
        """
        patient_id = request.query_params.get('patient_id')
        
        if not patient_id:
            return Response(
                {
                    'error': 'Parámetro requerido',
                    'detail': 'Debe proporcionar patient_id'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {
                    'error': 'Paciente no encontrado',
                    'detail': 'El paciente especificado no existe'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar permisos
        user = request.user
        
        # DEBUG: Logs para diagnosticar permisos
        logger.error(f"\n=== DEBUG PATIENT HISTORY ===")
        logger.error(f"Usuario: {user.email} (ID: {user.id})")
        logger.error(f"Es staff: {user.is_staff}")
        logger.error(f"Tiene patient_profile: {hasattr(user, 'patient_profile')}")
        if hasattr(user, 'patient_profile'):
            logger.error(f"User patient_profile ID: {user.patient_profile.id}")
        logger.error(f"Patient solicitado ID: {patient.id}")
        logger.error(f"Tiene doctor: {hasattr(user, 'doctor')}")
        logger.error("=== FIN DEBUG ===\n")
        
        if not (user.is_staff or 
                (hasattr(user, 'patient_profile') and user.patient_profile == patient) or
                (hasattr(user, 'doctor'))):
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'No tiene permisos para ver este historial'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Obtener filtros de fecha de los query params
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        status_filter = request.query_params.get('status')
        
        # Construir el queryset base
        appointments = Appointment.objects.filter(patient=patient)
        
        # Aplicar filtros de fecha si están presentes
        if date_from:
            try:
                from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                appointments = appointments.filter(date__gte=from_date)
                logger.error(f"Aplicando filtro date_from: {from_date}")
            except ValueError:
                logger.error(f"Formato de fecha inválido para date_from: {date_from}")
        
        if date_to:
            try:
                to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                appointments = appointments.filter(date__lte=to_date)
                logger.error(f"Aplicando filtro date_to: {to_date}")
            except ValueError:
                logger.error(f"Formato de fecha inválido para date_to: {date_to}")
        
        # Aplicar filtro de estado si está presente
        if status_filter:
            appointments = appointments.filter(status=status_filter)
            logger.error(f"Aplicando filtro status: {status_filter}")
        
        # Finalizar queryset con relaciones y ordenamiento
        appointments = appointments.select_related('doctor__user').order_by('-date', '-time')
        
        # Log para debugging
        logger.error(f"Total de citas encontradas después de filtros: {appointments.count()}")
        if appointments.exists():
            logger.error(f"Primera cita: {appointments.first().date} - {appointments.first().time}")
            logger.error(f"Última cita: {appointments.last().date} - {appointments.last().time}")
        
        serializer = AppointmentListSerializer(appointments, many=True)
        
        return Response(
            {
                'message': 'Historial obtenido exitosamente',
                'data': {
                    'patient': {
                        'id': patient.id,
                        'name': patient.full_name,
                        'email': patient.user.email
                    },
                    'appointments': serializer.data,
                    'total_appointments': appointments.count(),
                    'completed_appointments': appointments.filter(status='completed').count(),
                    'cancelled_appointments': appointments.filter(status='cancelled').count()
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='doctor-schedule')
    def doctor_schedule(self, request):
        """
        Obtener la agenda de un doctor.
        """
        doctor_id = request.query_params.get('doctor_id')
        
        if not doctor_id:
            return Response(
                {
                    'error': 'Parámetro requerido',
                    'detail': 'Debe proporcionar doctor_id'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response(
                {
                    'error': 'Doctor no encontrado',
                    'detail': 'El doctor especificado no existe'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener parámetros de fecha
        date_from = request.query_params.get('date_from', timezone.now().date().isoformat())
        date_to = request.query_params.get('date_to', (timezone.now().date() + timedelta(days=7)).isoformat())
        
        try:
            start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {
                    'error': 'Formato de fecha inválido',
                    'detail': 'Use el formato YYYY-MM-DD'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointments = Appointment.objects.filter(
            doctor=doctor,
            date__range=[start_date, end_date]
        ).select_related('patient__user').order_by('date', 'time')
        
        serializer = AppointmentListSerializer(appointments, many=True)
        
        return Response(
            {
                'message': 'Agenda obtenida exitosamente',
                'data': {
                    'doctor': {
                        'id': doctor.id,
                        'name': doctor.full_name,
                        'specialization': doctor.specialization
                    },
                    'date_range': {
                        'from': start_date.isoformat(),
                        'to': end_date.isoformat()
                    },
                    'appointments': serializer.data,
                    'total_appointments': appointments.count()
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='available-slots')
    def available_slots(self, request):
        """
        Obtener horarios disponibles para agendar citas.
        """
        doctor_id = request.query_params.get('doctor_id')
        date_str = request.query_params.get('date')
        
        if not doctor_id or not date_str:
            return Response(
                {
                    'error': 'Parámetros requeridos',
                    'detail': 'Debe proporcionar doctor_id y date'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            doctor = Doctor.objects.get(id=doctor_id)
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except Doctor.DoesNotExist:
            return Response(
                {
                    'error': 'Doctor no encontrado',
                    'detail': 'El doctor especificado no existe'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {
                    'error': 'Formato de fecha inválido',
                    'detail': 'Use el formato YYYY-MM-DD'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar si el doctor está disponible
        if not doctor.is_available:
            return Response(
                {
                    'error': 'Doctor no disponible',
                    'detail': 'El doctor no está aceptando citas en este momento'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la fecha no sea en el pasado
        if appointment_date < timezone.now().date():
            return Response(
                {
                    'error': 'Fecha inválida',
                    'detail': 'No se pueden agendar citas en fechas pasadas'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generar horarios disponibles (9:00 AM - 5:00 PM, cada 30 minutos)
        available_slots = []
        start_time = time(9, 0)  # 9:00 AM
        end_time = time(17, 0)   # 5:00 PM
        
        current_time = datetime.combine(appointment_date, start_time)
        end_datetime = datetime.combine(appointment_date, end_time)
        
        # Obtener citas existentes para esa fecha
        existing_appointments = Appointment.objects.filter(
            doctor=doctor,
            date=appointment_date,
            status__in=['scheduled', 'confirmed']
        ).values_list('time', flat=True)
        
        while current_time < end_datetime:
            slot_time = current_time.time()
            
            # Verificar si el horario no está ocupado
            if slot_time not in existing_appointments:
                available_slots.append({
                    'time': slot_time.strftime('%H:%M'),
                    'datetime': current_time.isoformat(),
                    'available': True
                })
            
            # Incrementar 30 minutos
            current_time += timedelta(minutes=30)
        
        return Response(
            {
                'message': 'Horarios disponibles obtenidos exitosamente',
                'data': {
                    'doctor': {
                        'id': doctor.id,
                        'name': doctor.full_name,
                        'specialization': doctor.specialization
                    },
                    'date': appointment_date.isoformat(),
                    'available_slots': available_slots,
                    'total_slots': len(available_slots)
                }
            },
            status=status.HTTP_200_OK
        )
