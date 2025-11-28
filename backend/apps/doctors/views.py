from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta, time
from decimal import Decimal, InvalidOperation
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Doctor
from .serializers import (
    DoctorSerializer,
    DoctorCreateSerializer,
    DoctorCreateWithUserSerializer,
    DoctorUpdateSerializer,
    DoctorListSerializer,
    DoctorPublicSerializer,
    DoctorProfileSerializer
)
from .filters import DoctorFilter
from apps.appointments.models import Appointment
from apps.core.permissions import IsDoctor, IsDoctorOrAdmin, IsAdminOrSuperAdmin


class DoctorViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de doctores.
    
    Proporciona operaciones CRUD completas para doctores:
    - list: Listar doctores (con filtros y búsqueda)
    - create: Crear nuevo doctor
    - retrieve: Obtener doctor específico
    - update: Actualizar doctor completo
    - partial_update: Actualizar doctor parcial
    - destroy: Eliminar doctor (soft delete)
    
    Acciones personalizadas:
    - available_slots: Obtener horarios disponibles del doctor
    - schedule: Obtener agenda del doctor
    - statistics: Estadísticas del doctor
    - toggle_availability: Cambiar disponibilidad del doctor
    - public_profile: Perfil público del doctor
    
    Filtros disponibles:
    - name: Búsqueda por nombre o apellido
    - specialization: Filtro por especialización
    - is_available: Filtro por disponibilidad
    - experience_min, experience_max: Filtros por años de experiencia
    
    Búsqueda disponible en:
    - Nombre y apellido del doctor
    - Especialización
    - Número de licencia médica
    
    Ordenamiento disponible por:
    - first_name, last_name, specialization, years_experience, is_available
    """
    
    queryset = Doctor.objects.select_related('user').all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Configuración de filtros
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DoctorFilter
    
    # Configuración de búsqueda
    search_fields = [
        'user__first_name',
        'user__last_name',
        'specialization',
        'medical_license',
    ]
    
    # Configuración de ordenamiento
    ordering_fields = [
        'user__first_name', 
        'user__last_name', 
        'specialization', 
        'years_experience', 
        'is_available',
        'created_at'
    ]
    ordering = ['user__last_name', 'user__first_name']  # Ordenamiento por defecto: alfabético por apellido
    
    def get_serializer_class(self):
        """
        Retorna la clase de serializer apropiada según la acción.
        """
        if self.action == 'create':
            return DoctorCreateWithUserSerializer
        elif self.action in ['update', 'partial_update']:
            return DoctorUpdateSerializer
        elif self.action == 'list':
            return DoctorListSerializer
        elif self.action == 'retrieve':
            return DoctorProfileSerializer
        elif self.action == 'public_profile':
            return DoctorPublicSerializer
        return DoctorSerializer
    
    def get_permissions(self):
        """
        Instancia y retorna la lista de permisos requeridos para esta vista.
        Implementa permisos granulares según el rol del usuario.
        """
        # Endpoints públicos (sin autenticación requerida)
        if self.action in ['list', 'retrieve', 'public_profile', 'available_slots']:
            permission_classes = [permissions.AllowAny]
        
        # Endpoints que requieren ser doctor o admin
        elif self.action in ['schedule', 'statistics', 'toggle_availability']:
            permission_classes = [IsDoctorOrAdmin]
        
        # Endpoints de creación y eliminación (solo admin)
        elif self.action in ['create', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
        
        # Endpoints de actualización (doctor propietario o admin, pero solo admin puede cambiar status)
        elif self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated, IsDoctorOrAdmin]
        
        # Por defecto, requiere autenticación
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Retorna el queryset filtrado según los parámetros de búsqueda.
        """
        queryset = Doctor.objects.select_related('user').prefetch_related('appointments')
        
        # Filtro por búsqueda general
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(specialization__icontains=search) |
                Q(medical_license__icontains=search)
            )
        
        # Filtro por especialización
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        
        # Filtro por disponibilidad
        is_available = self.request.query_params.get('is_available', None)
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        
        # Filtro por rango de tarifa de consulta
        min_fee = self.request.query_params.get('min_fee', None)
        max_fee = self.request.query_params.get('max_fee', None)
        
        if min_fee:
            try:
                queryset = queryset.filter(consultation_fee__gte=float(min_fee))
            except ValueError:
                pass
        
        if max_fee:
            try:
                queryset = queryset.filter(consultation_fee__lte=float(max_fee))
            except ValueError:
                pass
        
        # Filtro por años de experiencia
        min_experience = self.request.query_params.get('min_experience', None)
        if min_experience:
            try:
                queryset = queryset.filter(years_experience__gte=int(min_experience))
            except ValueError:
                pass
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo doctor.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            doctor = serializer.save()
            
            return Response(
                {
                    'message': 'Doctor creado exitosamente',
                    'data': DoctorSerializer(doctor).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al crear doctor',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar doctor completo o parcial.
        Solo administradores pueden cambiar el status del doctor.
        """
        import logging
        logger = logging.getLogger('django.request')
        
        logger.info(f"🔍 UPDATE REQUEST - User: {request.user.username} (admin: {request.user.is_admin()})")
        logger.info(f"🔍 UPDATE REQUEST - Data: {request.data}")
        logger.info(f"🔍 UPDATE REQUEST - Content-Type: {request.content_type}")
        
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        logger.info(f"🔍 UPDATE REQUEST - Doctor ID: {instance.id}, Current status: {instance.status}")
        
        # Verificar si se está intentando cambiar el status
        if 'status' in request.data:
            logger.info(f"🔍 UPDATE REQUEST - Intentando cambiar status a: {request.data['status']}")
            # Solo administradores pueden cambiar el status
            if not request.user.is_admin():
                logger.warning(f"❌ UPDATE REQUEST - Usuario sin permisos para cambiar status")
                return Response(
                    {
                        'error': 'Sin permisos',
                        'detail': 'Solo los administradores pueden cambiar el estado del doctor'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        logger.info(f"🔍 UPDATE REQUEST - Serializer class: {serializer.__class__.__name__}")
        
        try:
            is_valid = serializer.is_valid(raise_exception=False)
            logger.info(f"🔍 UPDATE REQUEST - Serializer valid: {is_valid}")
            
            if not is_valid:
                logger.error(f"❌ UPDATE REQUEST - Serializer errors: {serializer.errors}")
                return Response(
                    {
                        'error': 'Datos inválidos',
                        'detail': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            doctor = serializer.save()
            logger.info(f"✅ UPDATE REQUEST - Doctor actualizado exitosamente")
            
            return Response(
                {
                    'message': 'Doctor actualizado exitosamente',
                    'data': DoctorSerializer(doctor).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"❌ UPDATE REQUEST - Exception: {str(e)}")
            logger.error(f"❌ UPDATE REQUEST - Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"❌ UPDATE REQUEST - Traceback: {traceback.format_exc()}")
            return Response(
                {
                    'error': 'Error al actualizar doctor',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class DoctorListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para endpoints públicos de listado de doctores.
    
    Endpoints implementados:
    - GET /api/doctors/public/ - Listar doctores disponibles (público)
    - GET /api/doctors/public/{id}/ - Obtener doctor específico (público)
    - GET /api/doctors/public/specializations/ - Listar especializaciones
    - GET /api/doctors/public/search/ - Buscar doctores
    """
    queryset = Doctor.objects.filter(is_available=True).select_related('user')
    serializer_class = DoctorPublicSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DoctorFilter
    search_fields = ['user__first_name', 'user__last_name', 'specialization', 'bio']
    ordering_fields = ['user__first_name', 'user__last_name', 'specialization', 'consultation_fee']
    ordering = ['user__first_name']
    
    def get_queryset(self):
        """Filtrar solo doctores disponibles y activos para endpoints públicos."""
        return Doctor.objects.filter(
            is_available=True,
            user__is_active=True,
            status__in=['active', 'inactive']  # Excluir doctores inhabilitados
        ).select_related('user')
    
    @action(detail=False, methods=['get'], url_path='specializations')
    def specializations(self, request):
        """
        GET /api/doctors/public/specializations/
        Obtener lista de todas las especializaciones disponibles.
        """
        specializations = Doctor.objects.filter(
            is_available=True,
            user__is_active=True
        ).values_list('specialization', flat=True).distinct().order_by('specialization')
        
        # Filtrar valores vacíos o None
        specializations = [spec for spec in specializations if spec and spec.strip()]
        
        return Response(
            {
                'message': 'Especializaciones obtenidas exitosamente',
                'data': {
                    'specializations': list(specializations),
                    'total_specializations': len(specializations)
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='stats')
    def general_stats(self, request):
        """
        GET /api/doctors/public/stats/
        Obtener estadísticas generales del sistema (total de doctores y especialidades).
        """
        # Total de doctores disponibles
        total_doctors = Doctor.objects.filter(
            is_available=True,
            user__is_active=True
        ).count()
        
        # Total de especialidades únicas
        specializations = Doctor.objects.filter(
            is_available=True,
            user__is_active=True
        ).values_list('specialization', flat=True).distinct()
        
        # Filtrar valores vacíos o None
        unique_specializations = [spec for spec in specializations if spec and spec.strip()]
        total_specializations = len(unique_specializations)
        
        return Response(
            {
                'message': 'Estadísticas generales obtenidas exitosamente',
                'data': {
                    'total_doctors': total_doctors,
                    'total_specializations': total_specializations
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='search')
    def search_doctors(self, request):
        """
        GET /api/doctors/public/search/
        Buscar doctores con filtros avanzados.
        
        Parámetros de búsqueda:
        - q: término de búsqueda general
        - specialization: filtrar por especialización
        - min_fee: tarifa mínima de consulta
        - max_fee: tarifa máxima de consulta
        - available_only: solo doctores disponibles (default: true)
        """
        queryset = self.get_queryset()
        
        # Parámetros de búsqueda
        search_term = request.query_params.get('q', '').strip()
        specialization = request.query_params.get('specialization', '').strip()
        min_fee = request.query_params.get('min_fee', None)
        max_fee = request.query_params.get('max_fee', None)
        available_only = request.query_params.get('available_only', 'true').lower() == 'true'
        
        # Aplicar filtros
        if search_term:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_term) |
                Q(user__last_name__icontains=search_term) |
                Q(specialization__icontains=search_term) |
                Q(bio__icontains=search_term)
            )
        
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        
        if min_fee:
            try:
                min_fee_decimal = Decimal(min_fee)
                queryset = queryset.filter(consultation_fee__gte=min_fee_decimal)
            except (ValueError, InvalidOperation):
                return Response(
                    {
                        'error': 'Parámetro inválido',
                        'detail': 'min_fee debe ser un número válido'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if max_fee:
            try:
                max_fee_decimal = Decimal(max_fee)
                queryset = queryset.filter(consultation_fee__lte=max_fee_decimal)
            except (ValueError, InvalidOperation):
                return Response(
                    {
                        'error': 'Parámetro inválido',
                        'detail': 'max_fee debe ser un número válido'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if not available_only:
            # Si no se requiere solo disponibles, incluir todos los doctores activos
            queryset = Doctor.objects.filter(user__is_active=True).select_related('user')
            # Reaplicar filtros anteriores
            if search_term:
                queryset = queryset.filter(
                    Q(user__first_name__icontains=search_term) |
                    Q(user__last_name__icontains=search_term) |
                    Q(specialization__icontains=search_term) |
                    Q(bio__icontains=search_term)
                )
            if specialization:
                queryset = queryset.filter(specialization__icontains=specialization)
            if min_fee:
                queryset = queryset.filter(consultation_fee__gte=Decimal(min_fee))
            if max_fee:
                queryset = queryset.filter(consultation_fee__lte=Decimal(max_fee))
        
        # Ordenar resultados
        ordering = request.query_params.get('ordering', 'user__first_name')
        if ordering in ['user__first_name', '-user__first_name', 'user__last_name', '-user__last_name', 
                       'specialization', '-specialization', 'consultation_fee', '-consultation_fee']:
            queryset = queryset.order_by(ordering)
        
        # Paginación
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'message': 'Búsqueda de doctores realizada exitosamente',
                'data': serializer.data,
                'search_params': {
                    'search_term': search_term,
                    'specialization': specialization,
                    'min_fee': min_fee,
                    'max_fee': max_fee,
                    'available_only': available_only,
                    'ordering': ordering
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                'message': 'Búsqueda de doctores realizada exitosamente',
                'data': serializer.data,
                'total_results': queryset.count(),
                'search_params': {
                    'search_term': search_term,
                    'specialization': specialization,
                    'min_fee': min_fee,
                    'max_fee': max_fee,
                    'available_only': available_only,
                    'ordering': ordering
                }
            },
            status=status.HTTP_200_OK
        )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Actualizar doctor parcial.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Eliminar doctor (soft delete).
        """
        instance = self.get_object()
        
        # Verificar si tiene citas futuras
        future_appointments = Appointment.objects.filter(
            doctor=instance,
            date__gte=timezone.now().date(),
            status__in=['scheduled', 'confirmed']
        ).exists()
        
        if future_appointments:
            return Response(
                {
                    'error': 'No se puede eliminar el doctor',
                    'detail': 'El doctor tiene citas futuras programadas'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Soft delete: desactivar el usuario asociado
            instance.user.is_active = False
            instance.user.save()
            
            return Response(
                {
                    'message': 'Doctor eliminado exitosamente'
                },
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al eliminar doctor',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny], url_path='available-slots')
    def available_slots(self, request, pk=None):
        """
        Obtener horarios disponibles del doctor para una fecha específica.
        """
        doctor = self.get_object()
        
        # Verificar si el doctor está disponible
        if not doctor.is_available:
            return Response(
                {
                    'error': 'Doctor no disponible',
                    'detail': 'El doctor no está aceptando citas en este momento'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener fecha del query parameter
        date_str = request.query_params.get('date', None)
        if not date_str:
            return Response(
                {
                    'error': 'Fecha requerida',
                    'detail': 'Debe proporcionar una fecha en formato YYYY-MM-DD'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {
                    'error': 'Formato de fecha inválido',
                    'detail': 'Use el formato YYYY-MM-DD'
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
    
    @action(detail=True, methods=['get'], url_path='schedule')
    def schedule(self, request, pk=None):
        """
        Obtener la agenda del doctor para un rango de fechas.
        """
        doctor = self.get_object()
        
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
        
        # Obtener citas en el rango de fechas
        appointments = Appointment.objects.filter(
            doctor=doctor,
            date__range=[start_date, end_date]
        ).select_related('patient__user').order_by('date', 'time')
        
        from apps.appointments.serializers import AppointmentListSerializer
        appointments_data = AppointmentListSerializer(appointments, many=True).data
        
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
                    'appointments': appointments_data,
                    'total_appointments': appointments.count()
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='statistics')
    def statistics(self, request, pk=None):
        """
        Obtener estadísticas del doctor.
        """
        doctor = self.get_object()
        
        # Estadísticas de citas
        appointments = Appointment.objects.filter(doctor=doctor)
        
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
        
        # Pacientes únicos atendidos
        unique_patients = appointments.values('patient').distinct().count()
        
        # Ingresos estimados (solo citas completadas)
        completed_appointments = appointments.filter(status='completed').count()
        estimated_revenue = completed_appointments * doctor.consultation_fee
        
        statistics = {
            'doctor_info': {
                'full_name': doctor.full_name,
                'specialization': doctor.specialization,
                'years_experience': doctor.years_experience,
                'consultation_fee': doctor.consultation_fee,
                'is_available': doctor.is_available
            },
            'appointments_summary': {
                'total': appointments.count(),
                'by_status': list(appointments_by_status),
                'monthly_trend': list(monthly_appointments),
                'unique_patients': unique_patients
            },
            'financial_summary': {
                'completed_appointments': completed_appointments,
                'estimated_revenue': estimated_revenue,
                'average_per_appointment': doctor.consultation_fee
            },
            'availability': {
                'is_available': doctor.is_available,
                'next_available_date': timezone.now().date() + timedelta(days=1) if doctor.is_available else None
            }
        }
        
        return Response(
            {
                'message': 'Estadísticas obtenidas exitosamente',
                'data': statistics
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], url_path='toggle-availability')
    def toggle_availability(self, request, pk=None):
        """
        Cambiar el estado de disponibilidad del doctor.
        """
        doctor = self.get_object()
        
        # Verificar que el usuario autenticado sea el doctor o un admin
        if request.user != doctor.user and not request.user.is_staff:
            return Response(
                {
                    'error': 'Sin permisos',
                    'detail': 'Solo el doctor o un administrador puede cambiar la disponibilidad'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            doctor.toggle_availability()
            
            return Response(
                {
                    'message': f'Disponibilidad cambiada a {"disponible" if doctor.is_available else "no disponible"}',
                    'data': {
                        'is_available': doctor.is_available,
                        'doctor_name': doctor.full_name
                    }
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al cambiar disponibilidad',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny], url_path='public-profile')
    def public_profile(self, request, pk=None):
        """
        Obtener el perfil público del doctor (información básica sin datos sensibles).
        """
        doctor = self.get_object()
        
        # Solo mostrar doctores disponibles en el perfil público
        if not doctor.is_available:
            return Response(
                {
                    'error': 'Doctor no disponible',
                    'detail': 'Este doctor no está aceptando citas en este momento'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = DoctorPublicSerializer(doctor)
        
        # Agregar estadísticas públicas
        total_appointments = Appointment.objects.filter(
            doctor=doctor,
            status='completed'
        ).count()
        
        years_practicing = doctor.years_experience
        
        public_data = serializer.data
        public_data.update({
            'statistics': {
                'total_appointments_completed': total_appointments,
                'years_practicing': years_practicing,
                'specialization': doctor.specialization
            }
        })
        
        return Response(
            {
                'message': 'Perfil público obtenido exitosamente',
                'data': public_data
            },
            status=status.HTTP_200_OK
        )


class DoctorProfileViewSet(viewsets.ViewSet):
    """
    ViewSet específico para el perfil del doctor logueado.
    
    Endpoints implementados:
    - GET /api/doctors/me/ - Obtener perfil del doctor logueado
    - PUT /api/doctors/me/ - Actualizar perfil del doctor logueado
    - GET /api/doctors/me/appointments/ - Obtener citas del doctor
    - GET /api/doctors/me/schedule/ - Obtener horario del doctor
    - PUT /api/doctors/me/availability/ - Cambiar disponibilidad
    """
    permission_classes = [IsDoctor]
    
    def get_doctor_profile(self):
        """Helper method para obtener el perfil del doctor logueado."""
        try:
            return self.request.user.doctor
        except Doctor.DoesNotExist:
            return None
    
    @action(detail=False, methods=['get', 'put'], url_path='')
    def me(self, request):
        """
        GET /api/doctors/me/ - Obtener el perfil completo del doctor logueado.
        PUT /api/doctors/me/ - Actualizar el perfil del doctor logueado.
        """
        doctor = self.get_doctor_profile()
        
        if not doctor:
            return Response(
                {
                    'error': 'Perfil de doctor no encontrado',
                    'detail': 'El usuario actual no tiene un perfil de doctor asociado'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = DoctorProfileSerializer(doctor)
            return Response(
                {
                    'message': 'Perfil de doctor obtenido exitosamente',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        elif request.method == 'PUT':
            serializer = DoctorProfileSerializer(doctor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        'message': 'Perfil de doctor actualizado exitosamente',
                        'data': serializer.data
                    },
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {
                    'error': 'Datos inválidos',
                    'detail': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    
    @action(detail=False, methods=['get'], url_path='appointments')
    def my_appointments(self, request):
        """
        GET /api/doctors/me/appointments/
        Obtener todas las citas del doctor logueado.
        """
        doctor = self.get_doctor_profile()
        if not doctor:
            return Response(
                {
                    'error': 'Perfil de doctor no encontrado',
                    'detail': 'El usuario actual no tiene un perfil de doctor asociado'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Filtros opcionales
        status_filter = request.query_params.get('status', None)
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        # Construir queryset
        appointments = Appointment.objects.filter(doctor=doctor).select_related(
            'patient__user', 'doctor__user'
        ).order_by('-date', '-time')
        
        # Aplicar filtros
        if status_filter:
            appointments = appointments.filter(status=status_filter)
        
        if date_from:
            try:
                date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d').date()
                appointments = appointments.filter(date__gte=date_from_parsed)
            except ValueError:
                return Response(
                    {
                        'error': 'Formato de fecha inválido',
                        'detail': 'Use el formato YYYY-MM-DD para date_from'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if date_to:
            try:
                date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d').date()
                appointments = appointments.filter(date__lte=date_to_parsed)
            except ValueError:
                return Response(
                    {
                        'error': 'Formato de fecha inválido',
                        'detail': 'Use el formato YYYY-MM-DD para date_to'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Serializar datos
        appointments_data = []
        for appointment in appointments:
            appointments_data.append({
                'id': appointment.id,
                'patient': {
                    'id': appointment.patient.id,
                    'name': appointment.patient.user.get_full_name(),
                    'email': appointment.patient.user.email
                },
                'appointment_date': appointment.date.isoformat(),
                'appointment_time': appointment.time.strftime('%H:%M'),
                'status': appointment.status,
                'reason': appointment.reason,
                'notes': appointment.notes,
                'created_at': appointment.created_at.isoformat()
            })
        
        return Response(
            {
                'message': 'Citas del doctor obtenidas exitosamente',
                'data': {
                    'doctor': {
                        'id': doctor.id,
                        'name': doctor.full_name,
                        'specialization': doctor.specialization
                    },
                    'appointments': appointments_data,
                    'total_appointments': len(appointments_data),
                    'filters_applied': {
                        'status': status_filter,
                        'date_from': date_from,
                        'date_to': date_to
                    }
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='patients')
    def my_patients(self, request):
        """
        GET /api/doctors/me/patients/
        Obtener todos los pacientes del doctor logueado.
        """
        doctor = self.get_doctor_profile()
        if not doctor:
            return Response(
                {
                    'error': 'Perfil de doctor no encontrado',
                    'detail': 'El usuario actual no tiene un perfil de doctor asociado'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Filtros opcionales
        search = request.query_params.get('search', None)
        page = request.query_params.get('page', 1)
        
        # Obtener pacientes únicos que han tenido citas con este doctor
        from apps.patients.models import Patient
        from django.db.models import Count, Max, Min
        
        patients_query = Patient.objects.filter(
            appointments__doctor=doctor
        ).select_related('user').annotate(
            total_appointments=Count('appointments'),
            last_appointment=Max('appointments__date'),
            first_appointment=Min('appointments__date')
        ).distinct().order_by('-last_appointment')
        
        # Aplicar filtro de búsqueda
        if search:
            patients_query = patients_query.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        
        # Serializar datos
        patients_data = []
        for patient in patients_query:
            # Obtener próxima cita
            next_appointment = Appointment.objects.filter(
                doctor=doctor,
                patient=patient,
                date__gte=timezone.now().date(),
                status__in=['scheduled', 'confirmed']
            ).order_by('date', 'time').first()
            
            patients_data.append({
                'id': patient.id,
                'user': {
                    'first_name': patient.user.first_name,
                    'last_name': patient.user.last_name,
                    'email': patient.user.email,
                    'phone': getattr(patient.user, 'phone', None)
                },
                'total_appointments': patient.total_appointments,
                'last_appointment': patient.last_appointment.isoformat() if patient.last_appointment else None,
                'next_appointment': next_appointment.date.isoformat() if next_appointment else None
            })
        
        return Response(
            {
                'count': len(patients_data),
                'next': None,  # Simplificado por ahora
                'previous': None,  # Simplificado por ahora
                'results': patients_data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='schedule')
    def my_schedule(self, request):
        """
        GET /api/doctors/me/schedule/
        Obtener el horario de trabajo del doctor logueado.
        """
        doctor = self.get_doctor_profile()
        if not doctor:
            return Response(
                {
                    'error': 'Perfil de doctor no encontrado',
                    'detail': 'El usuario actual no tiene un perfil de doctor asociado'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        schedule_data = {
            'doctor': {
                'id': doctor.id,
                'name': doctor.full_name,
                'specialization': doctor.specialization
            },
            'work_schedule': {
                'start_time': doctor.work_start_time.strftime('%H:%M') if doctor.work_start_time else None,
                'end_time': doctor.work_end_time.strftime('%H:%M') if doctor.work_end_time else None,
                'work_days': doctor.work_days,
                'formatted_schedule': doctor.get_work_schedule()
            },
            'availability': {
                'is_available': doctor.is_available,
                'consultation_fee': str(doctor.consultation_fee)
            }
        }
        
        return Response(
            {
                'message': 'Horario del doctor obtenido exitosamente',
                'data': schedule_data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['put'], url_path='availability')
    def update_availability(self, request):
        """
        PUT /api/doctors/me/availability/
        Cambiar el estado de disponibilidad del doctor.
        """
        doctor = self.get_doctor_profile()
        if not doctor:
            return Response(
                {
                    'error': 'Perfil de doctor no encontrado',
                    'detail': 'El usuario actual no tiene un perfil de doctor asociado'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener nuevo estado de disponibilidad
        is_available = request.data.get('is_available', None)
        
        if is_available is None:
            return Response(
                {
                    'error': 'Parámetro requerido',
                    'detail': 'Debe proporcionar el campo is_available (true/false)'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar tipo de dato
        if not isinstance(is_available, bool):
            return Response(
                {
                    'error': 'Tipo de dato inválido',
                    'detail': 'El campo is_available debe ser un valor booleano (true/false)'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar disponibilidad
        old_availability = doctor.is_available
        doctor.is_available = is_available
        doctor.save(update_fields=['is_available', 'updated_at'])
        
        return Response(
            {
                'message': 'Disponibilidad actualizada exitosamente',
                'data': {
                    'doctor': {
                        'id': doctor.id,
                        'name': doctor.full_name,
                        'specialization': doctor.specialization
                    },
                    'availability': {
                        'previous_status': old_availability,
                        'current_status': doctor.is_available,
                        'updated_at': doctor.updated_at.isoformat()
                    }
                }
            },
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def public_doctors_list(request):
    """Vista de función para listar doctores públicos disponibles"""
    doctors = Doctor.objects.filter(
        is_available=True,
        user__is_active=True
    ).select_related('user')
    
    serializer = DoctorPublicSerializer(doctors, many=True)
    return Response({
        'count': doctors.count(),
        'results': serializer.data
    })


@api_view(['GET', 'PUT'])
@permission_classes([IsDoctor])
def doctor_me_view(request):
    """
    Vista de función para el perfil del doctor logueado.
    
    GET /api/doctors/me/ - Obtener perfil del doctor logueado
    PUT /api/doctors/me/ - Actualizar perfil del doctor logueado
    """
    try:
        doctor = request.user.doctor
    except Doctor.DoesNotExist:
        return Response(
            {
                'error': 'Perfil de doctor no encontrado',
                'detail': 'El usuario actual no tiene un perfil de doctor asociado'
            },
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = DoctorProfileSerializer(doctor)
        return Response(
            {
                'message': 'Perfil de doctor obtenido exitosamente',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    elif request.method == 'PUT':
        serializer = DoctorProfileSerializer(doctor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    'message': 'Perfil de doctor actualizado exitosamente',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(
            {
                'error': 'Datos inválidos',
                'detail': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
