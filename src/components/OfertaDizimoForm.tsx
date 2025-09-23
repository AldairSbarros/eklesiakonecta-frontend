import { useEffect, useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import '../styles/OfertaDizimoForm.scss';
import * as membrosApi from '../backend/services/membros.service';
import * as congregacoesApi from '../backend/services/congregacoes.service';

interface OfertaDizimoFormProps {
  editData?: import('../types/OfertaDizimo').OfertaDizimo;
  onClose: () => void;
  onSubmit: (data: import('../types/OfertaDizimo').OfertaDizimo) => void;
}

const OfertaDizimoForm: React.FC<OfertaDizimoFormProps> = ({ editData, onClose, onSubmit }) => {
  const initialTipo = (editData?.tipo === 'dizimo' ? 'dizimo' : 'oferta') as 'oferta' | 'dizimo';
  const [tipo, setTipo] = useState<'oferta' | 'dizimo'>(initialTipo);
  const [valor, setValor] = useState(editData?.valor || '');
  const [data, setData] = useState(editData?.data || '');
  const [membro, setMembro] = useState(editData?.membro || '');
  const [memberId, setMemberId] = useState<number | ''>(editData?.memberId ?? '');
  const [congregacao, setCongregacao] = useState(editData?.congregacao || '');
  const [congregacaoId, setCongregacaoId] = useState<number | ''>(editData?.congregacaoId ?? (Number(localStorage.getItem('eklesiakonecta_congregacaoId') || 0) || ''));
  const [membros, setMembros] = useState<membrosApi.MembroLight[]>([]);
  const [congregacoes, setCongregacoes] = useState<congregacoesApi.CongregacaoLight[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [errorRefs, setErrorRefs] = useState<string | null>(null);
  const [observacao, setObservacao] = useState(editData?.observacao || '');
  const [comprovante, setComprovante] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprovante(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editData?.id || Math.random().toString(36).substring(2, 10);
    const formData = {
      id,
      tipo,
      valor: Number(valor),
      data,
      membro,
      memberId: typeof memberId === 'number' ? memberId : undefined,
      congregacao,
      congregacaoId: typeof congregacaoId === 'number' ? congregacaoId : undefined,
      observacao,
      comprovante: comprovante ? comprovante.name : undefined,
      comprovanteFile: comprovante || undefined
    };
    onSubmit(formData);
  };

  useEffect(() => {
    let ignore = false;
    async function loadRefs() {
      setLoadingRefs(true);
      try {
        const [ms, cs] = await Promise.all([
          membrosApi.list(),
          congregacoesApi.list(),
        ]);
        if (!ignore) {
          setMembros(ms);
          setCongregacoes(cs);
          // se não há valores definidos, tentar escolher padrões
          if (!editData) {
            const savedCongId = Number(localStorage.getItem('eklesiakonecta_congregacaoId') || 0) || '';
            if (savedCongId && typeof savedCongId === 'number') setCongregacaoId(savedCongId);
          }
        }
      } catch {
        if (!ignore) setErrorRefs('Falha ao carregar listas de referência');
      } finally {
        if (!ignore) setLoadingRefs(false);
      }
    }
    loadRefs();
    return () => { ignore = true; };
  }, [editData]);

  return (
    <div className="oferta-form-modal">
      <form className="oferta-form" onSubmit={handleSubmit}>
        <h3>{editData ? 'Editar Registro' : 'Nova Oferta/Dízimo'}</h3>
        {loadingRefs && (
          <div className="form-hint"><span className="spinner" aria-hidden="true" /> Carregando listas de membros e congregações…</div>
        )}
        {errorRefs && (
          <div className="form-error" role="alert">{errorRefs}</div>
        )}
        <div className="form-group">
          <label>Tipo:</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as 'oferta' | 'dizimo')}>
            <option value="oferta">Oferta</option>
            <option value="dizimo">Dízimo</option>
          </select>
        </div>
        <div className="form-group">
          <label>Valor:</label>
          <input type="number" value={valor} onChange={e => setValor(e.target.value)} required min={1} step={0.01} />
        </div>
        <div className="form-group">
          <label>Data:</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Membro:</label>
          <select
            value={memberId || ''}
            onChange={e => {
              const id = e.target.value ? Number(e.target.value) : '';
              setMemberId(id);
              const m = membros.find(mm => mm.id === id);
              setMembro(m?.nome || '');
            }}
            disabled={loadingRefs}
          >
            <option value="">Selecione um membro</option>
            {membros.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Congregação:</label>
          <select
            value={congregacaoId || ''}
            onChange={e => {
              const id = e.target.value ? Number(e.target.value) : '';
              setCongregacaoId(id);
              const c = congregacoes.find(cc => cc.id === id);
              setCongregacao(c?.nome || '');
            }}
            disabled={loadingRefs}
          >
            <option value="">Selecione uma congregação</option>
            {congregacoes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Observação:</label>
          <textarea value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Observações adicionais" />
        </div>
        <div className="form-group">
          <label>Comprovante:</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {comprovante && <span className="file-name">{comprovante.name}</span>}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={loadingRefs}><FaSave /> Salvar</button>
          <button type="button" className="btn-cancel" onClick={onClose}><FaTimes /> Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default OfertaDizimoForm;
