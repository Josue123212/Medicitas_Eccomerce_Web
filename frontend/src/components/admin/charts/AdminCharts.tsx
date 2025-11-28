import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';

// 🎨 Paleta de colores para gráficos
const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  orange: '#f97316',
  pink: '#ec4899'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger, COLORS.purple];

// 📊 Interfaces para los datos de gráficos
interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface TimeSeriesDataPoint {
  date: string;
  [key: string]: any;
}

// 📈 Gráfico de líneas para tendencias temporales
interface TrendChartProps {
  data: TimeSeriesDataPoint[];
  dataKey: string;
  color?: string;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  dataKey,
  color = COLORS.primary,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => {
            const [year, month] = value.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
          }}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelFormatter={(value) => {
            const [year, month] = value.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long'
            });
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={3}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// 📊 Gráfico de área para volúmenes
interface VolumeChartProps {
  title: string;
  data: TimeSeriesDataPoint[];
  dataKeys: { key: string; name: string; color: string }[];
  height?: number;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({
  title,
  data,
  dataKeys = [],
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => {
            const [year, month] = value.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
          }}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {(dataKeys || []).map((item, index) => (
          <Area
            key={item.key}
            type="monotone"
            dataKey={item.key}
            stackId="1"
            stroke={item.color}
            fill={item.color}
            fillOpacity={0.6}
            name={item.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// 📊 Gráfico de barras para comparaciones
interface BarChartProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
  height?: number;
}

export const AdminBarChart: React.FC<BarChartProps> = ({
  title,
  data,
  dataKey,
  color = COLORS.primary,
  height = 300
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 🥧 Gráfico de pastel para distribuciones
interface PieChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey: string;
  height?: number;
}

export const AdminPieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ [nameKey]: name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// 📊 Gráfico de métricas múltiples
interface MultiMetricChartProps {
  data: TimeSeriesDataPoint[];
  metrics: { key: string; name: string; color: string }[];
  height?: number;
}

export const MultiMetricChart: React.FC<MultiMetricChartProps> = ({
  data,
  metrics = [],
  height = 350
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => {
            const [year, month] = value.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
          }}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {(metrics || []).map((metric) => (
          <Area
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stroke={metric.color}
            fill={metric.color}
            fillOpacity={0.3}
            name={metric.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// 📈 Componente de estadísticas rápidas con mini gráficos
interface QuickStatProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  miniChart?: ChartDataPoint[];
}

export const QuickStat: React.FC<QuickStatProps> = ({
  title,
  value,
  change,
  icon,
  color,
  trend = 'stable',
  miniChart
}) => {
  const changeColor = trend === 'up' ? 'text-green-600' : 
                     trend === 'down' ? 'text-red-600' : 
                     'text-gray-600';
  
  const changeIcon = trend === 'up' ? '↗' : 
                    trend === 'down' ? '↘' : '→';

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm ${changeColor} flex items-center mt-1`}>
              <span className="mr-1">{changeIcon}</span>
              {change}
            </p>
          </div>
          <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
            <div style={{ color }} className="h-6 w-6">
              {React.isValidElement(icon) ? (
                React.cloneElement(icon as React.ReactElement, { 
                  className: 'h-6 w-6',
                  style: { color }
                })
              ) : (
                icon
              )}
            </div>
          </div>
        </div>
        
        {/* Mini gráfico */}
        {miniChart && (
          <div className="mt-4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miniChart}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// COLORS se mantiene como constante interna del módulo