# 🎨 Patrones de Diseño del Dashboard

## 📋 Índice
1. [Sistema de Colores](#sistema-de-colores)
2. [Tipografía y Espaciado](#tipografía-y-espaciado)
3. [Componentes Base](#componentes-base)
4. [Layout Responsive](#layout-responsive)
5. [Interacciones y Animaciones](#interacciones-y-animaciones)
6. [Accesibilidad](#accesibilidad)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🎨 Sistema de Colores

### Paleta Principal
```css
/* Color Primario */
--primary: rgba(0, 206, 209, 0.8);     /* Turquesa principal */
--primary-light: rgba(0, 206, 209, 0.1); /* Fondo suave */
--primary-dark: rgba(0, 180, 183, 1);   /* Hover states */

/* Grises Neutros */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-800: #1f2937;

/* Estados */
--success: #10b981;     /* Verde - Confirmado */
--warning: #f59e0b;     /* Amarillo - Pendiente */
--error: #ef4444;       /* Rojo - Error/Cancelado */
--info: #3b82f6;        /* Azul - Información */
--disabled: #9ca3af;    /* Gris - Deshabilitado/Desvanecido */
```

### Uso de Colores
- **Primario**: Botones principales, iconos activos, indicadores de progreso
- **Grises**: Textos, bordes, fondos neutros
- **Estados**: Badges, alertas, indicadores de status
- **Deshabilitado**: Elementos inactivos, texto desvanecido, controles bloqueados

---

## 📝 Tipografía y Espaciado

### Fuente Principal
```css
font-family: 'Inter', sans-serif;
```

### Escala Tipográfica Responsive
```css
/* Títulos Principales */
.title-xl { @apply text-2xl sm:text-3xl lg:text-4xl font-light; }
.title-lg { @apply text-xl sm:text-2xl lg:text-3xl font-light; }
.title-md { @apply text-lg sm:text-xl font-light; }

/* Texto Cuerpo */
.text-base { @apply text-sm sm:text-base; }
.text-small { @apply text-xs sm:text-sm; }

/* Pesos */
.font-light { font-weight: 300; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
```

### Sistema de Espaciado
```css
/* Mobile First - Espaciado Progresivo */
.spacing-sm { @apply p-4 sm:p-6 lg:p-8; }
.spacing-md { @apply p-6 sm:p-8 lg:p-12; }
.spacing-lg { @apply p-8 sm:p-12 lg:p-16; }

/* Gaps Responsive */
.gap-responsive { @apply gap-4 sm:gap-6 lg:gap-8; }
.gap-large { @apply gap-6 sm:gap-8 lg:gap-12; }
```

---

## 🧩 Componentes Base

### 1. Card Container
```css
.card-base {
  @apply bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100;
  @apply hover:shadow-md transition-all duration-300;
}

.card-padding {
  @apply p-4 sm:p-6 lg:p-8;
}
```

### 2. Stats Card
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ComponentType;
  trend?: 'up' | 'down' | 'neutral';
}

const StatsCard = ({ title, value, change, icon: Icon, trend }: StatsCardProps) => (
  <div className="card-base card-padding group">
    <div className="flex items-center justify-between mb-4 lg:mb-6">
      {Icon && (
        <div className="p-2 rounded-lg" style={{backgroundColor: 'rgba(0, 206, 209, 0.1)'}}>
          <Icon className="h-5 w-5" style={{color: 'rgba(0, 206, 209, 0.8)'}} />
        </div>
      )}
      {change && (
        <span className={`text-sm font-medium ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-800 mb-2">
      {value}
    </h3>
    <p className="text-gray-500 text-xs sm:text-sm">
      {title}
    </p>
  </div>
);
```

### 3. Action Button
```typescript
interface ActionButtonProps {
  title: string;
  description: string;
  icon: React.ComponentType;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const ActionButton = ({ title, description, icon: Icon, onClick, variant = 'secondary', disabled = false }: ActionButtonProps) => (
  <button 
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`p-4 sm:p-6 rounded-lg lg:rounded-xl border transition-all duration-300 text-left group w-full ${
      disabled 
        ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60' 
        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
    }`}
  >
    <div className="flex items-center mb-3 lg:mb-4">
      <div className={`p-2 rounded-lg transition-transform duration-300 ${
        disabled 
          ? 'bg-gray-200' 
          : variant === 'primary' 
            ? 'bg-primary group-hover:scale-110' 
            : 'bg-gray-100 group-hover:scale-110'
      }`}>
        <Icon className={`h-5 w-5 ${
          disabled 
            ? 'text-gray-400' 
            : variant === 'primary' 
              ? 'text-white' 
              : 'text-gray-600'
        }`} />
      </div>
    </div>
    <h4 className={`text-sm sm:text-base font-medium mb-1 ${
      disabled ? 'text-gray-400' : 'text-gray-800'
    }`}>
      {title}
    </h4>
    <p className={`text-xs sm:text-sm ${
      disabled ? 'text-gray-400' : 'text-gray-500'
    }`}>
      {description}
    </p>
  </button>
);
```

---

## 📱 Layout Responsive

### Breakpoints Sistema
```css
/* Mobile First Approach */
sm: 640px   /* Tablets pequeñas */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Desktop extra grande */
```

### Grid Patterns
```css
/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8;
}

/* Content Grid */
.content-grid {
  @apply grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8;
}

/* Actions Grid */
.actions-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6;
}
```

### Sidebar Responsive
```typescript
const SidebarLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar content */}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header con hamburguesa */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MenuIcon className="h-6 w-6 text-gray-600" />
          </button>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Dashboard content */}
        </main>
      </div>
    </div>
  );
};
```

---

## ✨ Interacciones y Animaciones

### Transiciones Base
```css
/* Transiciones Estándar */
.transition-base { @apply transition-all duration-300 ease-in-out; }
.transition-fast { @apply transition-all duration-200 ease-in-out; }
.transition-slow { @apply transition-all duration-500 ease-in-out; }

/* Hover Effects */
.hover-lift { @apply hover:shadow-md hover:-translate-y-1; }
.hover-scale { @apply hover:scale-105; }
.hover-glow { @apply hover:shadow-lg hover:shadow-primary/20; }
```

### Micro-interacciones
```typescript
// Hover en iconos
.icon-hover {
  @apply group-hover:scale-110 transition-transform duration-300;
}

// Loading states
.loading-pulse {
  @apply animate-pulse bg-gray-200;
}

// Progress bars animadas
.progress-bar {
  @apply transition-all duration-500 ease-out;
}
```

---

## ♿ Accesibilidad

### Contraste y Legibilidad
```css
/* Cumple WCAG AA (4.5:1) */
.text-primary { color: #1f2937; }     /* Ratio: 12.6:1 */
.text-secondary { color: #6b7280; }   /* Ratio: 4.7:1 */
.text-muted { color: #9ca3af; }       /* Ratio: 3.1:1 - Solo para texto no crítico */
```

### Focus States
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}

.focus-visible {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary;
}
```

### Navegación por Teclado
```typescript
// Ejemplo de componente accesible
const AccessibleButton = ({ children, onClick, ...props }) => (
  <button
    onClick={onClick}
    className="focus-ring transition-base"
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    {...props}
  >
    {children}
  </button>
);
```

---

## 💡 Ejemplos de Implementación

### Dashboard Completo
```typescript
const Dashboard = () => {
  const stats = [
    { title: 'Total Citas', value: '1,234', change: '+12%', trend: 'up' },
    { title: 'Pacientes', value: '856', change: '+8%', trend: 'up' },
    { title: 'Doctores', value: '24', change: '+2%', trend: 'up' },
    { title: 'Ingresos', value: '$45,678', change: '+15%', trend: 'up' }
  ];

  return (
    <div className="space-y-8" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          <QuickActions />
          <ChartSection />
        </div>
        
        {/* Sidebar Content */}
        <div className="space-y-6">
          <RecentAppointments />
          <SystemAlerts />
        </div>
      </div>
    </div>
  );
};
```

### Gráfico Simple
```typescript
const SimpleChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="card-base card-padding">
      <h3 className="title-md text-gray-800 mb-6 lg:mb-8">
        {title}
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const width = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex items-center space-x-3 lg:space-x-4">
              <span className="text-small text-gray-500 w-8">
                {item.label}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full progress-bar" 
                  style={{
                    backgroundColor: 'rgba(0, 206, 209, 0.8)', 
                    width: `${width}%`
                  }}
                />
              </div>
              <span className="text-small font-medium text-gray-700 w-6">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 🔧 Configuración Tailwind

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'rgba(0, 206, 209, 0.05)',
          100: 'rgba(0, 206, 209, 0.1)',
          500: 'rgba(0, 206, 209, 0.8)',
          600: 'rgba(0, 180, 183, 1)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 📚 Recursos y Referencias

### Herramientas de Diseño
- **Figma**: Para prototipado y sistema de diseño
- **Tailwind CSS**: Framework de utilidades
- **Heroicons**: Iconografía consistente
- **Inter Font**: Tipografía principal

### Guías de Referencia
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Testing de Accesibilidad
- **axe-core**: Testing automático
- **WAVE**: Evaluación web
- **Lighthouse**: Auditoría de performance y a11y

---

*Documento creado para el Sistema de Gestión de Citas Médicas*  
*Última actualización: Diciembre 2024*