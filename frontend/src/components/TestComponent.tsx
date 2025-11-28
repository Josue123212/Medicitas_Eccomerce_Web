// Componente de prueba para verificar imports absolutos
export const TestComponent = () => {
  return (
    <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)' }}>
      <h3 className="text-xl font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
        <span className="mr-2">✅</span>
        TestComponent con Tailwind CSS
      </h3>
      <div className="space-y-2">
        <p style={{ color: 'var(--primary)' }}>
          Este componente se importó usando paths absolutos: 
          <code className="px-2 py-1 rounded text-sm font-mono ml-1" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}>
            @/components/TestComponent
          </code>
        </p>
        <p className="text-sm flex items-center" style={{ color: 'var(--text-secondary)' }}>
          <span className="mr-2">🎯</span>
          Los paths absolutos están funcionando correctamente!
        </p>
        <p className="text-sm flex items-center" style={{ color: 'var(--text-secondary)' }}>
          <span className="mr-2">🎨</span>
          Tailwind CSS configurado y funcionando!
        </p>
      </div>
    </div>
  );
};

export default TestComponent;