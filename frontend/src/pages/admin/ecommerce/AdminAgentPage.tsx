import React, { useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal, { ModalFooter, useModal } from '../../../components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';

const AdminAgentPage: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const help = useModal(false);

  const send = async () => {
    setLoading(true); setOutput(null);
    try {
      const res = await fetch('http://localhost:8081/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: input })
      });
      const data = await res.json();
      setOutput(data);
    } catch (e) {
      setOutput({ error: 'No se pudo contactar al agente' });
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Agente Admin</h1>
        <div className="bg-white border rounded p-4 space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Escribe un comando" value={input} onChange={e => setInput(e.target.value)} />
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={send} disabled={loading}>{loading ? 'Enviando…' : 'Enviar'}</button>
            <button className="px-4 py-2 rounded border" onClick={help.openModal}>Ayuda</button>
          </div>
        </div>
        <div className="bg-white border rounded p-4">
          <Tabs defaultValue="normal">
            <TabsList>
              <TabsTrigger value="normal">Respuesta</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="normal">
              {!output && <div className="text-sm text-gray-600">Sin respuesta</div>}
              {output && (
                <div className="space-y-3 text-sm">
                  {(() => {
                    const a = String(output.action || '').toLowerCase();
                    const pid = output.product_id ?? output.product;
                    const qty = output.quantity ?? output.delta;
                    if (a === 'block') return <div>Se realizó el bloqueo de {qty} unidades para el producto {pid}.</div>;
                    if (a === 'release') return <div>Se realizó la liberación de {qty} unidades para el producto {pid}.</div>;
                    if (a === 'adjust_reserved') return <div>Se ajustó el reservado en {qty} unidades para el producto {pid}.</div>;
                    if (a === 'set_stock') return <div>Se estableció el stock a {output.stock} para el producto {pid}.</div>;
                    if (a === 'set_min_stock') return <div>Se estableció el mínimo a {output.min} para el producto {pid}.</div>;
                    if (a === 'summary') {
                      return (
                        <div>
                          <div className="mb-2">Resumen del producto {pid}</div>
                          <table className="w-full text-sm border">
                            <tbody>
                              <tr className="border-b"><td className="p-2">Bloqueos</td><td className="p-2">{output.blocked}</td></tr>
                              <tr className="border-b"><td className="p-2">Liberaciones</td><td className="p-2">{output.released}</td></tr>
                              <tr><td className="p-2">Bloqueo neto</td><td className="p-2">{output.blocked_total}</td></tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    if (output.error) return <div className="text-red-600">Error: {String(output.error)}</div>;
                    return <div>Respuesta recibida.</div>;
                  })()}
                </div>
              )}
            </TabsContent>
            <TabsContent value="json">
              <pre className="text-sm">{output ? JSON.stringify(output, null, 2) : 'Sin respuesta'}</pre>
            </TabsContent>
          </Tabs>
        </div>

        <Modal isOpen={help.isOpen} onClose={help.closeModal} title="Ayuda de comandos" size="md">
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-semibold">Sintaxis</div>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>bloquear producto &lt;id&gt; cantidad &lt;n&gt;</code></li>
                <li><code>liberar producto &lt;id&gt; cantidad &lt;n&gt;</code></li>
                <li><code>adjust_reserved producto &lt;id&gt; delta &lt;n&gt;</code></li>
                <li><code>set_stock producto &lt;id&gt; stock &lt;n&gt;</code></li>
                <li><code>set_min_stock producto &lt;id&gt; min &lt;n&gt;</code></li>
                <li><code>resumen producto &lt;id&gt;</code></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Ejemplos</div>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>bloquear producto 23 cantidad 5</code></li>
                <li><code>liberar producto 23 cantidad 2</code></li>
                <li><code>adjust_reserved producto 23 delta 12</code></li>
                <li><code>set_stock producto 23 stock 100</code></li>
                <li><code>set_min_stock producto 23 min 10</code></li>
                <li><code>resumen producto 23</code></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Formato JSON</div>
              <pre className="bg-gray-50 border rounded p-3 text-xs">{JSON.stringify({ action: 'adjust_reserved', product_id: 23, delta: 12 }, null, 2)}</pre>
            </div>
          </div>
          <ModalFooter>
            <button className="px-4 py-2 rounded border" onClick={help.closeModal}>Cerrar</button>
          </ModalFooter>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminAgentPage;
