import React from 'react';

interface ModalDebuggerProps {
  formData: any;
  mutation: any;
  onSubmit: (e: React.FormEvent) => void;
}

const ModalDebugger: React.FC<ModalDebuggerProps> = ({ formData, mutation, onSubmit }) => {
  const handleDebugSubmit = (e: React.FormEvent) => {
    console.log('🔍 DEBUG: Submit event triggered');
    console.log('📊 Form data:', formData);
    console.log('🔄 Mutation state:', {
      isPending: mutation.isPending,
      isError: mutation.isError,
      error: mutation.error,
      isSuccess: mutation.isSuccess
    });
    
    // Validar campos requeridos
    const requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Campos faltantes:', missingFields);
    } else {
      console.log('✅ Todos los campos requeridos están presentes');
    }
    
    // Llamar al submit original
    onSubmit(e);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <h4 className="text-sm font-medium text-yellow-800 mb-2">🔍 Debug Info</h4>
      <div className="text-xs text-yellow-700 space-y-1">
        <div>Mutation Status: {mutation.isPending ? 'Loading...' : 'Ready'}</div>
        <div>Form Valid: {formData.username && formData.email && formData.password ? '✅' : '❌'}</div>
        <div>Required Fields: {['username', 'email', 'password', 'first_name', 'last_name'].map(field => 
          formData[field] ? '✅' : '❌'
        ).join(' ')}</div>
        {mutation.error && (
          <div className="text-red-600">Error: {mutation.error.message}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => console.log('Current form data:', formData)}
        className="mt-2 text-xs bg-yellow-200 px-2 py-1 rounded"
      >
        Log Form Data
      </button>
    </div>
  );
};

export default ModalDebugger;