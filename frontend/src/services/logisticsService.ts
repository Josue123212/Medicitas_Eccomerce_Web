export type AuditItem = {
  id: number;
  productId: number;
  quantity: number;
  action: 'block' | 'release';
  reason?: string;
  status?: string;
  createdAt?: string;
};

const logisticsOrigin = (import.meta.env.VITE_LOGISTICS_ORIGIN as string) ?? 'http://localhost:8081';

export const logisticsService = {
  async listAudits(): Promise<AuditItem[]> {
    const res = await fetch(`${logisticsOrigin}/audits`, { method: 'GET' });
    if (!res.ok) throw new Error('No se pudo listar auditorías');
    return (await res.json()) as AuditItem[];
  },
  async createAudit(payload: { product_id: number; quantity: number; action: 'block' | 'release'; reason?: string }): Promise<any> {
    const res = await fetch(`${logisticsOrigin}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('No se pudo crear auditoría');
    return await res.json();
  },
};

