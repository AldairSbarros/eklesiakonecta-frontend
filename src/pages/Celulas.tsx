import { useCallback, useEffect, useState } from 'react';
import CelulaCadastro from '../components/CelulaCadastro';
import * as celulasApi from '../backend/services/celulas.service';
import { toast } from 'react-toastify';

export default function CelulasPage() {
  const [lista, setLista] = useState<celulasApi.Celula[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<celulasApi.Celula | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await celulasApi.list();
      setLista(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar células');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleEdit = (c: celulasApi.Celula) => setEditing(c);

  const handleRemove = async (id: number) => {
    if (!window.confirm('Remover esta célula?')) return;
    setLoading(true);
    try {
      await celulasApi.remove(id);
      toast.success('Célula removida');
      carregar();
    } catch {
      toast.error('Erro ao remover célula');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="celulas-page" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <CelulaCadastro
          onSuccess={carregar}
          editing={!!editing}
          editingCelula={editing}
          onCancelEdit={() => setEditing(null)}
          onUpdated={() => { setEditing(null); carregar(); }}
        />
      </div>
      <div>
        <h2>Lista de Células</h2>
        {loading ? (
          <div>Carregando…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lista.length === 0 ? (
              <div style={{ opacity: .8 }}>Nenhuma célula cadastrada.</div>
            ) : (
              lista.map(c => (
                <div key={c.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.nome || '(Sem nome)'}</div>
                    {c.descricao && <div style={{ color: '#555' }}>{c.descricao}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleEdit(c)} disabled={loading}>Editar</button>
                    <button onClick={() => handleRemove(c.id)} disabled={loading}>Remover</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
