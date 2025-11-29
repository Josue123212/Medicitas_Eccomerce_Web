import React from 'react';
import { aiService } from '../../services/aiService';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: 'system', content: 'Eres un asistente útil para MediCitas y su farmacia.' },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.chat(next);
      const content = res?.choices?.[0]?.message?.content || res?.message || JSON.stringify(res);
      setMessages([...next, { role: 'assistant', content }]);
    } catch (e: any) {
      setError('No se pudo obtener respuesta del asistente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-4 shadow-xl" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-icons" style={{ color: 'var(--primary)' }}>smart_toy</span>
            <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Asistente</h2>
          </div>
          <button className="btn-outline px-3 py-1 rounded" onClick={onClose}>Cerrar</button>
        </div>

        <div className="space-y-3 mb-3 max-h-80 overflow-auto pr-1">
          {messages.filter(m => m.role !== 'system').map((m, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`} style={{ border: '1px solid var(--border)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{m.role === 'user' ? 'Tú' : 'Asistente'}</div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{m.content}</div>
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
            placeholder="Escribe tu mensaje..."
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          />
          <button className="btn-primary px-4 py-2 rounded-lg" onClick={send} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;
