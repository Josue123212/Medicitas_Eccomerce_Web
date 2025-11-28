from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Q

from .models import User, PasswordResetToken, SecretaryProfile
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetVerifySerializer,
    PasswordResetConfirmSerializer,
    SecretaryProfileSerializer
)
from apps.users.permissions import IsSecretary
from apps.core.permissions import IsSecretaryOrAdmin, IsAdminOrSuperAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener tokens JWT.
    Permite login con email o username.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        """
        Manejar el login del usuario.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            # Debug: imprimir el error completo
            print(f"Error en login: {type(e).__name__}: {str(e)}")
            print(f"Datos recibidos: {request.data}")
            return Response(
                {
                    'error': 'Credenciales inválidas',
                    'detail': str(e)
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response(
            {
                'message': 'Login exitoso',
                'data': serializer.validated_data
            },
            status=status.HTTP_200_OK
        )


class CustomTokenRefreshView(TokenRefreshView):
    """
    Vista personalizada para refrescar tokens JWT.
    """
    
    def post(self, request, *args, **kwargs):
        """
        Manejar el refresh del token.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        return Response(
            {
                'message': 'Token refrescado exitosamente',
                'data': serializer.validated_data
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    Vista para cerrar sesión del usuario.
    Blacklistea el refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Manejar el logout del usuario.
        """
        try:
            refresh_token = request.data.get('refresh_token')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            # Cerrar sesión de Django (si se usa session authentication)
            logout(request)
            
            return Response(
                {'message': 'Logout exitoso'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al cerrar sesión',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class UserRegistrationView(generics.CreateAPIView):
    """
    Vista para registrar nuevos usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo usuario.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        # Generar tokens para el usuario recién creado
        refresh = RefreshToken.for_user(user)
        
        return Response(
            {
                'message': 'Usuario registrado exitosamente',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            },
            status=status.HTTP_201_CREATED
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Vista para ver y actualizar el perfil del usuario.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """
        Retornar el usuario actual con relaciones optimizadas.
        """
        return User.objects.select_related('patient_profile').get(id=self.request.user.id)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar el perfil del usuario.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        
        return Response(
            {
                'message': 'Perfil actualizado exitosamente',
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )


class ChangePasswordView(APIView):
    """
    Vista para cambiar la contraseña del usuario.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Cambiar la contraseña del usuario.
        """
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Contraseña cambiada exitosamente'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def csrf_token_view(request):
    """
    Vista para obtener el token CSRF.
    Permite al frontend obtener el token CSRF necesario para las peticiones.
    """
    from django.middleware.csrf import get_token
    
    # Obtener el token CSRF
    csrf_token = get_token(request)
    
    return Response({
        'csrf_token': csrf_token,
        'message': 'Token CSRF obtenido exitosamente'
    }, status=status.HTTP_200_OK)


# ==========================================
# SECRETARY VIEWSETS
# ==========================================

class SecretaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar secretarias.
    Proporciona endpoints para:
    - GET /api/secretaries/me/ - Obtener perfil de la secretaria actual
    - PUT /api/secretaries/me/ - Actualizar perfil de la secretaria actual
    - GET /api/secretaries/dashboard/ - Dashboard con estadísticas
    - GET /api/secretaries/appointments/ - Listar citas
    - POST /api/secretaries/appointments/ - Crear nueva cita
    """
    queryset = SecretaryProfile.objects.all()
    serializer_class = SecretaryProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Instanciar y retornar la lista de permisos requeridos para esta vista.
        Implementa permisos granulares según el plan de sincronización.
        """
        # Endpoints específicos para secretarias o administradores
        if self.action in ['me', 'dashboard', 'appointments', 'create_appointment']:
            permission_classes = [permissions.IsAuthenticated, IsSecretaryOrAdmin]
        
        # Endpoints de gestión (solo administradores)
        elif self.action in ['list', 'create', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
        
        # Endpoints de actualización (secretaria propietaria o admin)
        elif self.action in ['update', 'partial_update', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated, IsSecretaryOrAdmin]
        
        # Por defecto, requiere autenticación
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filtrar queryset basado en el usuario actual.
        """
        if not self.request.user.is_authenticated:
            return self.queryset.none()
        
        # Si es admin o superadmin, puede ver todas las secretarias
        if self.request.user.is_admin() or self.request.user.is_superuser:
            return self.queryset.all()
        
        # Si es secretaria, solo puede ver su propio perfil
        if self.request.user.is_secretary():
            return self.queryset.filter(user=self.request.user)
        
        # Otros roles no tienen acceso
        return self.queryset.none()
    
    def get_serializer_class(self):
        """
        Retorna la clase de serializer apropiada según la acción.
        """
        if self.action == 'create':
            from .serializers import SecretaryCreateSerializer
            return SecretaryCreateSerializer
        return self.serializer_class
    
    def create(self, request, *args, **kwargs):
        """
        Crear una nueva secretaria con usuario asociado.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            secretary_profile = serializer.save()
            
            return Response(
                {
                    'message': 'Secretaria creada exitosamente',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al crear secretaria',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        """
        Obtener o actualizar el perfil de la secretaria actual.
        GET /api/users/secretaries/me/ - Obtener perfil
        PUT/PATCH /api/users/secretaries/me/ - Actualizar perfil
        """
        try:
            secretary_profile = self.get_queryset().first()
            if not secretary_profile:
                return Response(
                    {
                        'error': 'Perfil de secretaria no encontrado',
                        'detail': 'No se encontró un perfil de secretaria para el usuario actual'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if request.method == 'GET':
                serializer = self.get_serializer(secretary_profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            elif request.method in ['PUT', 'PATCH']:
                partial = request.method == 'PATCH'
                serializer = self.get_serializer(
                    secretary_profile, 
                    data=request.data, 
                    partial=partial
                )
                
                if serializer.is_valid():
                    serializer.save()
                    return Response(
                        {
                            'message': 'Perfil de secretaria actualizado exitosamente',
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
            
        except Exception as e:
            return Response(
                {
                    'error': 'Error al procesar solicitud de secretaria',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        """
        Dashboard con estadísticas para la secretaria.
        GET /api/secretaries/dashboard/
        """
        try:
            from apps.appointments.models import Appointment
            from django.utils import timezone
            from datetime import timedelta
            
            secretary_profile = self.get_queryset().first()
            if not secretary_profile:
                return Response(
                    {
                        'error': 'Perfil de secretaria no encontrado',
                        'detail': 'No se encontró un perfil de secretaria para el usuario actual'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Obtener fechas para estadísticas
            today = timezone.now().date()
            week_start = today - timedelta(days=today.weekday())
            month_start = today.replace(day=1)
            
            # Estadísticas de citas
            appointments_today = Appointment.objects.filter(
                date=today
            ).count()
            
            appointments_this_week = Appointment.objects.filter(
                date__gte=week_start,
                date__lte=today
            ).count()
            
            appointments_this_month = Appointment.objects.filter(
                date__gte=month_start,
                date__lte=today
            ).count()
            
            # Citas por estado
            pending_appointments = Appointment.objects.filter(
                status='scheduled',
                date__gte=today
            ).count()
            
            completed_appointments = Appointment.objects.filter(
                status='completed',
                date=today
            ).count()
            
            cancelled_appointments = Appointment.objects.filter(
                status='cancelled',
                date=today
            ).count()
            
            # Próximas citas (siguientes 5)
            upcoming_appointments = Appointment.objects.filter(
                date__gte=today,
                status='scheduled'
            ).order_by('date', 'time')[:5]
            
            from apps.appointments.serializers import AppointmentSerializer
            upcoming_appointments_data = AppointmentSerializer(
                upcoming_appointments, 
                many=True
            ).data
            
            dashboard_data = {
                'secretary_profile': self.get_serializer(secretary_profile).data,
                'statistics': {
                    'appointments_today': appointments_today,
                    'appointments_this_week': appointments_this_week,
                    'appointments_this_month': appointments_this_month,
                    'pending_appointments': pending_appointments,
                    'completed_appointments': completed_appointments,
                    'cancelled_appointments': cancelled_appointments,
                },
                'upcoming_appointments': upcoming_appointments_data,
                'working_status': {
                    'is_working_now': secretary_profile.is_working_now(),
                    'shift_start': secretary_profile.shift_start.strftime('%H:%M') if secretary_profile.shift_start else None,
                    'shift_end': secretary_profile.shift_end.strftime('%H:%M') if secretary_profile.shift_end else None,
                    'shift_duration': secretary_profile.get_shift_duration(),
                }
            }
            
            return Response(dashboard_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'Error al obtener dashboard',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='appointments')
    def appointments(self, request):
        """
        Listar citas que puede gestionar la secretaria.
        GET /api/secretaries/appointments/
        """
        try:
            from apps.appointments.models import Appointment
            from apps.appointments.serializers import AppointmentSerializer
            from django.utils import timezone
            
            secretary_profile = self.get_queryset().first()
            if not secretary_profile:
                return Response(
                    {
                        'error': 'Perfil de secretaria no encontrado',
                        'detail': 'No se encontró un perfil de secretaria para el usuario actual'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verificar permisos
            if not secretary_profile.can_manage_appointments:
                return Response(
                    {
                        'error': 'Sin permisos',
                        'detail': 'No tienes permisos para gestionar citas'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Filtros de query parameters
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            status_filter = request.query_params.get('status')
            doctor_id = request.query_params.get('doctor_id')
            patient_id = request.query_params.get('patient_id')
            
            # Construir queryset
            queryset = Appointment.objects.all()
            
            # Aplicar filtros
            if date_from:
                try:
                    from datetime import datetime
                    date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
                    queryset = queryset.filter(date__gte=date_from_obj)
                except ValueError:
                    pass
            
            if date_to:
                try:
                    from datetime import datetime
                    date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
                    queryset = queryset.filter(date__lte=date_to_obj)
                except ValueError:
                    pass
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            if doctor_id:
                queryset = queryset.filter(doctor_id=doctor_id)
            
            if patient_id:
                queryset = queryset.filter(patient_id=patient_id)
            
            # Ordenar por fecha y hora
            queryset = queryset.order_by('-date', '-time')
            
            # Paginación
            from django.core.paginator import Paginator
            page_size = int(request.query_params.get('page_size', 20))
            page_number = int(request.query_params.get('page', 1))
            
            paginator = Paginator(queryset, page_size)
            page_obj = paginator.get_page(page_number)
            
            serializer = AppointmentSerializer(page_obj.object_list, many=True)
            
            return Response({
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page_number,
                'page_size': page_size,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': 'Error al obtener citas',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='appointments')
    def create_appointment(self, request):
        """
        Crear una nueva cita.
        POST /api/secretaries/appointments/
        """
        try:
            from apps.appointments.models import Appointment
            from apps.appointments.serializers import AppointmentCreateSerializer
            
            secretary_profile = self.get_queryset().first()
            if not secretary_profile:
                return Response(
                    {
                        'error': 'Perfil de secretaria no encontrado',
                        'detail': 'No se encontró un perfil de secretaria para el usuario actual'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verificar permisos
            if not secretary_profile.can_manage_appointments:
                return Response(
                    {
                        'error': 'Sin permisos',
                        'detail': 'No tienes permisos para crear citas'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Crear la cita
            serializer = AppointmentCreateSerializer(
                data=request.data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                appointment = serializer.save(created_by=request.user)
                
                from apps.appointments.serializers import AppointmentSerializer
                response_serializer = AppointmentSerializer(appointment)
                
                return Response(
                    {
                        'message': 'Cita creada exitosamente',
                        'data': response_serializer.data
                    },
                    status=status.HTTP_201_CREATED
                )
            
            return Response(
                {
                    'error': 'Datos inválidos',
                    'detail': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            return Response(
                {
                    'error': 'Error al crear cita',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserListView(generics.ListAPIView):
    """
    Vista para listar usuarios (solo para administradores).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar usuarios según el rol del usuario actual.
        """
        user = self.request.user
        
        # Solo superadmin puede ver todos los usuarios
        if user.is_superuser or user.role == 'superadmin':
            return User.objects.all().order_by('-created_at')
        
        # Admin puede ver usuarios que no sean superadmin
        elif user.is_staff or user.role == 'admin':
            return User.objects.exclude(
                role='superadmin'
            ).exclude(
                is_superuser=True
            ).order_by('-created_at')
        
        # Usuarios normales solo pueden ver su propio perfil
        else:
            return User.objects.filter(id=user.id)


class UserDetailView(generics.RetrieveAPIView):
    """
    Vista para ver detalles de un usuario específico.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar usuarios según el rol del usuario actual.
        """
        user = self.request.user
        
        # Solo superadmin puede ver todos los usuarios
        if user.is_superuser or user.role == 'superadmin':
            return User.objects.all()
        
        # Admin puede ver usuarios que no sean superadmin
        elif user.is_staff or user.role == 'admin':
            return User.objects.exclude(
                role='superadmin'
            ).exclude(
                is_superuser=True
            )
        
        # Usuarios normales solo pueden ver su propio perfil
        else:
            return User.objects.filter(id=user.id)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info(request):
    """
    Endpoint para obtener información del usuario actual.
    """
    serializer = UserSerializer(request.user)
    return Response(
        {
            'user': serializer.data
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_email_availability(request):
    """
    Endpoint para verificar si un email está disponible.
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email es requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_available = not User.objects.filter(email=email).exists()
    
    return Response(
        {
            'email': email,
            'is_available': is_available
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_username_availability(request):
    """
    Endpoint para verificar si un username está disponible.
    """
    username = request.data.get('username')
    
    if not username:
        return Response(
            {'error': 'Username es requerido'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_available = not User.objects.filter(username=username).exists()
    
    return Response(
        {
            'username': username,
            'is_available': is_available
        },
        status=status.HTTP_200_OK
    )


# ============================================================================
# VIEWSETS MODERNOS - ENFOQUE DRF RECOMENDADO
# ============================================================================

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de usuarios.
    
    Proporciona operaciones CRUD completas para usuarios:
    - list: Listar usuarios (con filtros)
    - create: Crear nuevo usuario (registro)
    - retrieve: Obtener usuario específico
    - update: Actualizar usuario completo
    - partial_update: Actualizar usuario parcial
    - destroy: Eliminar usuario
    
    Acciones personalizadas:
    - profile: Obtener/actualizar perfil del usuario autenticado
    - change_password: Cambiar contraseña
    - check_email: Verificar disponibilidad de email
    - check_username: Verificar disponibilidad de username
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """
        Retorna la clase de serializer apropiada según la acción.
        """
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['profile', 'update', 'partial_update']:
            return UserProfileSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        Instancia y retorna la lista de permisos requeridos para esta vista.
        Implementa permisos granulares según el plan de sincronización.
        """
        # Endpoints públicos (registro y verificaciones)
        if self.action in ['create', 'check_email', 'check_username']:
            permission_classes = [permissions.AllowAny]
        
        # Endpoints de perfil personal (cualquier usuario autenticado)
        elif self.action in ['profile', 'change_password']:
            permission_classes = [permissions.IsAuthenticated]
        
        # Endpoints de gestión de usuarios (solo administradores)
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]
        
        # Por defecto, requiere autenticación
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Retorna el queryset filtrado según los parámetros de búsqueda.
        """
        queryset = User.objects.all()
        
        # Filtro por búsqueda general
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )
        
        # Filtro por tipo de usuario
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        # Filtro por estado activo
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-date_joined')
    
    def create(self, request, *args, **kwargs):
        """
        Crear un nuevo usuario (registro).
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            return Response(
                {
                    'message': 'Usuario registrado exitosamente',
                    'data': {
                        'user': UserSerializer(user).data,
                        'user_type': user.user_type
                    }
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al registrar usuario',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar usuario completo.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            return Response(
                {
                    'message': 'Usuario actualizado exitosamente',
                    'data': UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Error al actualizar usuario',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def partial_update(self, request, *args, **kwargs):
        """
        Actualizar usuario parcial.
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='profile')
    def profile(self, request):
        """
        Obtener o actualizar el perfil del usuario autenticado.
        
        GET: Retorna el perfil del usuario actual
        PUT/PATCH: Actualiza el perfil del usuario actual
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(
                {
                    'message': 'Perfil obtenido exitosamente',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = UserProfileSerializer(
                user, 
                data=request.data, 
                partial=partial
            )
            
            try:
                serializer.is_valid(raise_exception=True)
                updated_user = serializer.save()
                
                return Response(
                    {
                        'message': 'Perfil actualizado exitosamente',
                        'data': UserProfileSerializer(updated_user).data
                    },
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {
                        'error': 'Error al actualizar perfil',
                        'detail': str(e)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        Cambiar la contraseña del usuario autenticado.
        """
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            
            # Verificar contraseña actual
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {
                        'error': 'La contraseña actual es incorrecta'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Establecer nueva contraseña
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response(
                {
                    'message': 'Contraseña cambiada exitosamente'
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'Error al cambiar contraseña',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='check-email')
    def check_email(self, request):
        """
        Verificar disponibilidad de email.
        """
        email = request.data.get('email', '')
        
        if not email:
            return Response(
                {
                    'error': 'Email es requerido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            is_available = not User.objects.filter(email=email).exists()
            
            return Response(
                {
                    'email': email,
                    'is_available': is_available,
                    'message': 'Email disponible' if is_available else 'Email ya está en uso'
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'Error al verificar disponibilidad del email',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='check-username')
    def check_username(self, request):
        """
        Verificar disponibilidad de username.
        """
        username = request.data.get('username', '')
        
        if not username:
            return Response(
                {
                    'error': 'Username es requerido'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            is_available = not User.objects.filter(username=username).exists()
            
            return Response(
                {
                    'username': username,
                    'is_available': is_available,
                    'message': 'Username disponible' if is_available else 'Username ya está en uso'
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'Error al verificar disponibilidad del username',
                    'detail': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class PasswordResetRequestView(APIView):
    """
    Vista para solicitar recuperación de contraseña.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Solicitar recuperación de contraseña.
        """
        serializer = PasswordResetRequestSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class PasswordResetVerifyView(APIView):
    """
    Vista para verificar token de recuperación.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Verificar si un token de recuperación es válido.
        """
        serializer = PasswordResetVerifySerializer(data=request.data)
        
        if serializer.is_valid():
            # Obtener el token y el usuario asociado
            token = serializer.validated_data['token']
            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token,
                    used=False,
                    expires_at__gt=timezone.now()
                )
                return Response({
                    'valid': True,
                    'message': 'Token válido',
                    'user_email': reset_token.user.email
                }, status=status.HTTP_200_OK)
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'valid': False,
                    'message': 'Token inválido o expirado'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'valid': False,
            'message': 'Token inválido o expirado'
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Vista para confirmar nueva contraseña con token.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Confirmar nueva contraseña usando token de recuperación.
        """
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
