import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { authService } from './services/authService';
import LocationDebugger from './components/debug/LocationDebugger';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import DoctorDashboard from './pages/dashboard/DoctorDashboard';
import SecretaryDashboard from './pages/dashboard/SecretaryDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Client Pages
import MyAppointmentsPage from './pages/client/MyAppointmentsPage';
import ProfilePage from './pages/client/ProfilePage';
import MedicalHistoryPage from './pages/client/MedicalHistoryPage';

// Doctor Pages
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorConsultationsPage from './pages/doctor/DoctorConsultationsPage';
import DoctorConsultationsPageSimple from './pages/doctor/DoctorConsultationsPageSimple';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import PatientMedicalHistoryPage from './pages/doctor/PatientMedicalHistoryPage';

// Secretary Pages
import SecretaryAppointments from './pages/secretary/SecretaryAppointments';
import SecretaryPatients from './pages/secretary/SecretaryPatients';
import SecretaryCalendar from './pages/secretary/SecretaryCalendar';

// Admin Pages
import DoctorList from './pages/doctors/DoctorList';
import DoctorProfile from './pages/doctors/DoctorProfile';
import PatientList from './pages/patients/PatientList';
import PatientProfile from './pages/patients/PatientProfile';
import PatientEdit from './pages/patients/PatientEdit';
import SecretaryList from './pages/secretaries/SecretaryList';
import ReportCenter from './pages/reports/ReportCenter';
import NotificationCenter from './pages/notifications/NotificationCenter';

// Components
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';
import { useRoleRedirect } from './lib/hooks/useRoleRedirect';

// Test Components (para desarrollo)
import TestComponent from './components/TestComponent';
import UILibrariesTest from './components/UILibrariesTest';
import UIComponentsTest from './components/UIComponentsTest';
import ReactQueryTest from './components/ReactQueryTest';
import RoleTestComponent from './components/RoleTestComponent';
import AppointmentServiceTest from './test/appointmentService.test';
import AppointmentList from './pages/appointments/AppointmentList';
import AppointmentComponents from './pages/appointments/AppointmentComponents';
import PharmacyLandingPage from './pages/pharmacy/PharmacyLandingPage';
import PharmacyLoginPage from './pages/pharmacy/PharmacyLoginPage';
import PharmacyRegisterPage from './pages/pharmacy/PharmacyRegisterPage';
import PharmacyCatalogGate from './pages/pharmacy/PharmacyCatalogGate';
import PharmacyOrdersPage from './pages/pharmacy/PharmacyOrdersPage';
import PharmacyOrderDetailPage from './pages/pharmacy/PharmacyOrderDetailPage';
import PharmacyCartPage from './pages/pharmacy/PharmacyCartPage';
import PaymentSuccessPage from './pages/pharmacy/PaymentSuccessPage';
import PaymentCancelPage from './pages/pharmacy/PaymentCancelPage';
// Admin E-commerce Pages
import AdminEcommerceHome from './pages/admin/ecommerce/AdminEcommerceHome';
import AdminProductsPage from './pages/admin/ecommerce/AdminProductsPage';
import AdminInventoryPage from './pages/admin/ecommerce/AdminInventoryPage';
import AdminPricesPage from './pages/admin/ecommerce/AdminPricesPage';


/**
 * 🚀 APLICACIÓN PRINCIPAL
 * 
 * Configuración del router principal con rutas protegidas y públicas.
 * Incluye páginas principales del sistema de citas médicas.
 * 
 * Características:
 * - Rutas protegidas por rol
 * - Redirección automática según permisos
 * - Manejo de acceso no autorizado
 */
function App() {
  // Inicializar token CSRF al cargar la aplicación
  useEffect(() => {
    authService.initializeCSRF().catch(error => {
      console.warn('Failed to initialize CSRF token:', error);
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

/**
 * Componente interno para manejar las rutas con hooks
 */
const AppRoutes: React.FC = () => {
  // Hook para redirección automática según rol
  useRoleRedirect();

  return (
    <div className="App">
      <LocationDebugger />
      {/* Configuración de Rutas */}
      <Routes>
          {/* 🏠 RUTA PRINCIPAL - Página de inicio */}
          <Route path="/" element={<HomePage />} />
          
          {/* 🔐 RUTAS PÚBLICAS - Solo accesibles sin autenticación */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/reset-password" 
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            } 
          />
          
          {/* 🛡️ RUTAS PROTEGIDAS - Requieren autenticación */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* 🛍️ RUTAS FARMACIA - Accesibles para invitados y usuarios */}
          <Route path="/pharmacy" element={<PharmacyLandingPage />} />
          <Route path="/pharmacy/catalog" element={<PharmacyCatalogGate />} />
          <Route path="/pharmacy/login" element={<PharmacyLoginPage />} />
          <Route path="/pharmacy/register" element={<PharmacyRegisterPage />} />
          <Route path="/pharmacy/orders" element={<PharmacyOrdersPage />} />
          <Route path="/pharmacy/orders/:id" element={<PharmacyOrderDetailPage />} />
          <Route path="/pharmacy/cart" element={<PharmacyCartPage />} />
          <Route path="/pharmacy/success" element={<PaymentSuccessPage />} />
          <Route path="/pharmacy/cancel" element={<PaymentCancelPage />} />
          
          {/* 🔐 RUTAS PROTEGIDAS POR ROL - SuperAdmin y Admin */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* 🛍️ E‑COMMERCE ADMIN */}
          <Route 
            path="/admin/ecommerce" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <AdminEcommerceHome />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/ecommerce/products" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <AdminProductsPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/ecommerce/inventory" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <AdminInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/admin/ecommerce/prices" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <AdminPricesPage />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/admin/doctors" 
            element={
              <ProtectedRoute requiredRole={['admin']}>
                <DoctorList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/doctors/:id" 
            element={
              <ProtectedRoute requiredRole={['admin']}>
                <DoctorProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole={['superadmin']}>
                <div className="p-8">Gestión de Usuarios (Solo SuperAdmin)</div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/doctors" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <DoctorList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/patients" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <PatientList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/patients/:id" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <PatientProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/patients/:id/edit" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <PatientEdit />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/secretaries" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <SecretaryList />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <ReportCenter />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/notifications" 
            element={
              <ProtectedRoute requiredRole={['superadmin', 'admin']}>
                <NotificationCenter />
              </ProtectedRoute>
            } 
          />
          
          {/* 👨‍⚕️ RUTAS PARA DOCTORES */}
          <Route 
            path="/doctor/dashboard" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/schedule" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <DoctorSchedulePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/patients" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <DoctorPatientsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/patients/:patientId/history" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <PatientMedicalHistoryPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/appointments" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <DoctorAppointmentsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/consultations" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <DoctorConsultationsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/profile" 
            element={
              <ProtectedRoute requiredRole={['doctor']}>
                <DoctorProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* 👩‍💼 RUTAS PARA SECRETARIAS */}
          <Route 
            path="/secretary/dashboard" 
            element={
              <ProtectedRoute requiredRole={['secretary']}>
                <SecretaryDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/secretary/appointments" 
            element={
              <ProtectedRoute requiredRole={['secretary']}>
                <SecretaryAppointments />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/secretary/patients" 
            element={
              <ProtectedRoute requiredRole={['secretary']}>
                <SecretaryPatients />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/secretary/calendar" 
            element={
              <ProtectedRoute requiredRole={['secretary']}>
                <SecretaryCalendar />
              </ProtectedRoute>
            } 
          />
          
          {/* 👤 RUTAS PARA CLIENTES */}
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute requiredRole={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/client/appointments" 
            element={
              <ProtectedRoute requiredRole={['client']}>
                <MyAppointmentsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/client/profile" 
            element={
              <ProtectedRoute requiredRole={['client']}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/client/medical-history" 
            element={
              <ProtectedRoute requiredRole={['client']}>
                <MedicalHistoryPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 🚫 PÁGINA DE ACCESO NO AUTORIZADO */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* 🧪 RUTAS DE DESARROLLO - Para testing de componentes */}
          <Route 
            path="/dev" 
            element={
              <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      🧪 Página de Desarrollo
                    </h1>
                    <p className="text-lg text-gray-600">
                      Componentes de prueba y desarrollo
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <TestComponent />
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <UILibrariesTest />
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <UIComponentsTest />
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <ReactQueryTest />
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <AppointmentServiceTest />
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
          <Route path="/dev/roles" element={<RoleTestComponent />} />
              <Route path="/dev/appointment-service" element={<AppointmentServiceTest />} />
              <Route path="/dev/appointments" element={<AppointmentList />} />
              <Route path="/dev/appointment-components" element={<AppointmentComponents />} />
              <Route path="/dev/doctors" element={<DoctorList />} />
              <Route path="/dev/doctors/:id" element={<DoctorProfile />} />
          
          {/* 🧪 RUTA TEMPORAL - Doctor Dashboard sin autenticación para desarrollo */}
          <Route path="/dev/doctor-dashboard" element={<DoctorDashboard />} />
          
          {/* 🔄 RUTA DE REDIRECCIÓN - Para rutas no encontradas */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Página no encontrada
                  </h2>
                  <p className="text-gray-600 mb-8">
                    La página que buscas no existe o ha sido movida.
                  </p>
                  <a 
                    href="/" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    ← Volver al inicio
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
        
        {/* Toaster configurado en main.tsx */}
      </div>
    );
}

export default App
