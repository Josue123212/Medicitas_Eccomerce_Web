import React from 'react';
import { aiService } from '../../services/aiService';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: 'system' as const, content: 'Rol: Agente de Farmacia MediCitas (cliente). Idioma: Español. Tono: cercano, claro. Objetivo: recomendar productos de salud de venta libre, orientar compra y próximos pasos. Reglas: 1) No diagnosticas ni indicas prescripciones; si es urgente o requiere receta, sugieres consultar profesional. 2) Siempre ofreces alternativas seguras (analgésicos, antigripales, vitaminas) con advertencias básicas. 3) Eres proactivo: propones “Añadir al carrito”, “Ver detalle”, “Consultar disponibilidad”. 4) Primera respuesta de la sesión y ante saludos o “quién eres”: DEBES comenzar exactamente con: "Yo soy tu agente de Farmacia MediCitas; ¿qué necesitas hoy?" y luego continúas ofreciendo ayuda y opciones.' },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inFlightRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen) {
      setMessages([
        { role: 'system' as const, content: 'Rol: Agente de Farmacia MediCitas (cliente). Idioma: Español. Tono: cercano, claro. Objetivo: recomendar productos de salud de venta libre, orientar compra y próximos pasos. Reglas: 1) No diagnosticas ni indicas prescripciones; si es urgente o requiere receta, sugieres consultar profesional. 2) Siempre ofreces alternativas seguras (analgésicos, antigripales, vitaminas) con advertencias básicas. 3) Eres proactivo: propones “Añadir al carrito”, “Ver detalle”, “Consultar disponibilidad”. 4) Primera respuesta de la sesión y ante saludos o “quién eres”: DEBES comenzar exactamente con: "Yo soy tu agente de Farmacia MediCitas; ¿qué necesitas hoy?" y luego continúas ofreciendo ayuda y opciones.' },
      ]);
      setError(null);
      setInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const send = async () => {
    if (inFlightRef.current) return;
    if (!input.trim()) return;
    const next: ChatMessage[] = [...messages, { role: 'user' as const, content: input.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    inFlightRef.current = true;
    setError(null);
    try {
      const res = await aiService.chat(next);
      const content = res?.choices?.[0]?.message?.content || res?.message || JSON.stringify(res);
      const isFirstAssistant = next.findIndex(m => m.role === 'assistant') === -1;
      const prefix = 'Yo soy tu agente de Farmacia MediCitas; ¿qué necesitas hoy? ';
      let finalContent = isFirstAssistant ? (prefix + content) : content;
      const lastUser = next[next.length - 1]?.content?.toLowerCase() || '';
      const sugg: string[] = [];
      if (lastUser.includes('dolor de cabeza')) {
        sugg.push('Sugerencia MediCitas: analgésicos de venta libre como paracetamol o ibuprofeno (leer indicaciones y evitar duplicar principios activos). Puedes buscar en la categoría Analgésicos y añadir al carrito.');
      }
      if (lastUser.includes('gripe') || lastUser.includes('resfriado')) {
        sugg.push('Sugerencia MediCitas: antigripales combinados, vitamina C y descongestionantes nasales. Revisa la categoría Antigripales y considera reposo e hidratación.');
      }
      if (lastUser.includes('tos')) {
        sugg.push('Sugerencia MediCitas: jarabes antitusivos o expectorantes según tipo de tos. Consulta la categoría Jarabes y verifica advertencias.');
      }
      if (sugg.length) {
        finalContent = `${finalContent}\n\n${sugg.join('\n')}`;
      }
      setMessages([...next, { role: 'assistant' as const, content: finalContent }]);
    } catch (e: any) {
      setError('No se pudo obtener respuesta del asistente');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
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
            onKeyDown={(e) => { if (e.key === 'Enter' && !loading && !inFlightRef.current) send(); }}
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
