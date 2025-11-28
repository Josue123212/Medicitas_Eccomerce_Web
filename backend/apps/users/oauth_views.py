# 🔐 Vistas de OAuth para Google Authentication

import json
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    🌐 Autenticación con Google OAuth
    
    Recibe el credential token de Google y:
    1. Verifica el token con Google
    2. Extrae la información del usuario
    3. Crea o actualiza el usuario en la base de datos
    4. Retorna tokens JWT para el frontend
    """
    try:
        credential = request.data.get('credential')
        mode = request.data.get('mode', 'login')  # 'login' o 'register'
        
        if not credential:
            return Response({
                'error': 'Token de Google requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar el token con Google
        try:
            # Verificar el token ID con Google
            idinfo = id_token.verify_oauth2_token(
                credential, 
                google_requests.Request(), 
                settings.GOOGLE_OAUTH2_CLIENT_ID
            )
            
            # Verificar que el token es para nuestra aplicación
            if idinfo['aud'] != settings.GOOGLE_OAUTH2_CLIENT_ID:
                return Response({
                    'error': 'Token inválido'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ValueError as e:
            return Response({
                'error': f'Token de Google inválido: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extraer información del usuario
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        if not email:
            return Response({
                'error': 'Email no encontrado en el token de Google'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Buscar o crear usuario
        try:
            # Primero intentar encontrar el usuario por email
            user = User.objects.get(email=email)
            created = False
        except User.DoesNotExist:
            # Si no existe, crear uno nuevo con username único
            # Generar username basado en email
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            
            # Asegurar que el username sea único
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_active=True,
                role='client',  # Rol por defecto
            )
            created = True
        
        # Si el usuario ya existe pero no está activo
        if not user.is_active:
            return Response({
                'error': 'Cuenta desactivada. Contacta al administrador.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Actualizar información si es necesario
        if not created:
            updated = False
            if not user.first_name and first_name:
                user.first_name = first_name
                updated = True
            if not user.last_name and last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save()
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Preparar respuesta
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
        }
        
        # Actualizar último login
        user.last_login = user.date_joined if created else user.last_login
        user.save(update_fields=['last_login'])
        
        return Response({
            'access': str(access_token),
            'refresh': str(refresh),
            'user': user_data,
            'created': created,
            'message': 'Usuario creado exitosamente' if created else 'Login exitoso'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)