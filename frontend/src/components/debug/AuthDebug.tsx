import React, { useEffect, useState } from 'react';
import { authService } from '../../services';
import { tokenUtils } from '../../services/authService';

const AuthDebug: React.FC = () => {
  const [authInfo, setAuthInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = tokenUtils.getAccessToken();
      const refreshToken = tokenUtils.getRefreshToken();
      const hasTokens = tokenUtils.hasTokens();
      
      let isValidToken = false;
      let userProfile = null;
      
      if (accessToken) {
        try {
          isValidToken = await authService.verifyToken(accessToken);
          if (isValidToken) {
            userProfile = await authService.getProfile();
          }
        } catch (error) {
          console.error('Error verificando token:', error);
        }
      }

      setAuthInfo({
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'No token',
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'No token',
        hasTokens,
        isValidToken,
        userProfile,
        localStorage: {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
          user: localStorage.getItem('user')
        }
      });
    };

    // Agregar funciones de debug al window para uso en consola
    (window as any).testGetPatient = async (patientId = 1) => {
      console.log(`🔍 Probando obtener paciente con ID: ${patientId}`);
      
      try {
        const accessToken = tokenUtils.getAccessToken();
        console.log('🔑 Token de acceso:', accessToken ? 'Presente' : 'No encontrado');
        
        if (!accessToken) {
          console.error('❌ No hay token de acceso en localStorage');
          return;
        }
        
        const response = await fetch(`http://127.0.0.1:8000/api/patients/${patientId}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        console.log('📡 Respuesta del servidor:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Datos del paciente:', data);
          return data;
        } else {
          const errorData = await response.text();
          console.error('❌ Error del servidor:', errorData);
          return null;
        }
        
      } catch (error) {
        console.error('💥 Error en la petición:', error);
        return null;
      }
    };

    (window as any).checkAuthStatus = () => {
      console.log('🔍 Verificando estado de autenticación...');
      
      const accessToken = tokenUtils.getAccessToken();
      const refreshToken = tokenUtils.getRefreshToken();
      
      console.log('🔑 Access Token:', accessToken ? 'Presente' : 'No encontrado');
      console.log('🔄 Refresh Token:', refreshToken ? 'Presente' : 'No encontrado');
      console.log('💾 LocalStorage completo:', localStorage);
      
      return {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
    };

    console.log('🚀 Scripts de debug cargados. Usa:');
    console.log('   - checkAuthStatus() para verificar autenticación');
    console.log('   - testGetPatient(1) para probar obtener paciente');

    checkAuth();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🔍 Auth Debug</h4>
      <div><strong>Has Tokens:</strong> {authInfo.hasTokens ? '✅' : '❌'}</div>
      <div><strong>Valid Token:</strong> {authInfo.isValidToken ? '✅' : '❌'}</div>
      <div><strong>Access Token:</strong> {authInfo.accessToken}</div>
      <div><strong>User:</strong> {authInfo.userProfile?.email || 'No user'}</div>
      <div><strong>Role:</strong> {authInfo.userProfile?.role || 'No role'}</div>
      
      <details style={{ marginTop: '10px' }}>
        <summary>LocalStorage</summary>
        <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px' }}>
          {JSON.stringify(authInfo.localStorage, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default AuthDebug;