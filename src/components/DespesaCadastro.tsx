import { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaInfoCircle, FaSearch } from 'react-icons/fa';
// import { http } from '../config/http';
import * as despesasApi from '../backend/services/despesas.service';
import type { DespesaItem } from '../types/Despesa';
import * as manualApi from '../backend/services/manualTesouraria.service';
import { toast } from 'react-toastify';
import GenericModal from './GenericModal';
import '../styles/DespesaCadastro.scss';

type DespesaInput = Omit<DespesaItem, 'valor'> & { valor: string };

export default function DespesaCadastro() {
  const [despesas, setDespesas] = useState<DespesaInput[]>([
    { codigo: '', descricao: '', valor: '' }
  ]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAreaIeadam, setIsAreaIeadam] = useState<boolean>(false);

  // Estado do modal de consulta IEADAM
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupRow, setLookupRow] = useState<number | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupList, setLookupList] = useState<manualApi.ManualCodigo[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Detecta se a igreja atual é uma Área IEADAM a partir do objeto salvo
  useEffect(() => {
    try {
      const raw = localStorage.getItem('eklesiakonecta_igreja');
      if (!raw) return;
      const igreja = JSON.parse(raw);
      // Preferência: flag explícita no objeto (ex.: igreja.isAreaIeadam), senão heurística por tipo/nome
      const flag = Boolean(igreja?.isAreaIeadam) || igreja?.tipo === 'AREA_IEADAM' || /area\s*ieadam/i.test(String(igreja?.nome || ''));
      setIsAreaIeadam(!!flag);
    } catch { /* ignore */ }
  }, []);

  // Busca item do manual (quando for Área IEADAM)
  const buscarItemPorCodigo = async (codigo: string) => {
    if (!isAreaIeadam) return null;
    if (!codigo) return null;
    try {
      const item = await manualApi.validarCodigo('despesa', codigo);
      return item;
    } catch {
      return null;
    }
  };

  const handleInputChange = async (idx: number, field: keyof DespesaInput, value: string) => {
    const novas = [...despesas];
    switch (field) {
      case 'codigo':
        novas[idx].codigo = value;
        break;
      case 'descricao':
        novas[idx].descricao = value;
        break;
      case 'categoria':
        novas[idx].categoria = value;
        break;
      case 'valor':
        novas[idx].valor = value;
        break;
      default:
        // no-op to satisfy exhaustive check
        break;
    }
    if (field === 'codigo' && value.length > 0) {
      const item = await buscarItemPorCodigo(value.trim());
      if (item) {
        novas[idx].descricao = item.descricao || '';
        novas[idx].categoria = item.categoria || '';
      } else if (isAreaIeadam) {
        // Se for área IEADAM e não achou, alerta o usuário
        toast.warn('Código não encontrado no manual IEADAM');
        novas[idx].descricao = '';
        novas[idx].categoria = '';
      }
    }
    setDespesas(novas);
  };

  const adicionarLinha = () => {
    setDespesas([...despesas, { codigo: '', descricao: '', valor: '' }]);
  };

  const removerLinha = (idx: number) => {
    if (despesas.length === 1) return;
    setDespesas(despesas.filter((_, i) => i !== idx));
  };

  const openLookup = async (rowIdx: number) => {
    if (!isAreaIeadam) return;
    setLookupRow(rowIdx);
    setLookupOpen(true);
    setLookupQuery('');
    await loadLookup('');
  };

  const loadLookup = async (q: string) => {
    setLookupLoading(true);
    setLookupError('');
    try {
      const list = await manualApi.listCodigos('despesa', q);
      setLookupList(list);
    } catch {
      setLookupError('Falha ao carregar códigos do manual.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookupSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadLookup(lookupQuery);
  };

  const handlePickCodigo = (codigo: string, descricao: string, categoria?: string) => {
    if (lookupRow === null) return;
    const novas = [...despesas];
    novas[lookupRow].codigo = codigo;
    novas[lookupRow].descricao = descricao;
    novas[lookupRow].categoria = categoria || '';
    setDespesas(novas);
    setLookupOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    try {
      const result = await despesasApi.createMany(despesas);
      if (result) {
        setSucesso(true);
        setDespesas([{ codigo: '', descricao: '', valor: '' }]);
      } else {
        setErro('Erro ao cadastrar despesas.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro de conexão. Tente novamente.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="despesa-cadastro-container">
      <h2>Lançar Despesas</h2>
      <p className="despesa-dica"><FaInfoCircle style={{marginRight: 6}}/> Informe o código da despesa para preencher automaticamente a descrição. {isAreaIeadam && 'Você pode também usar o botão "Consultar código (IEADAM)" para pesquisar.'} Adicione quantas despesas quiser antes de salvar.</p>
      <form onSubmit={handleSubmit} className="despesa-cadastro-form" autoComplete="off">
        {despesas.map((despesa, idx) => (
          <div className="despesa-row" key={idx}>
            <div className="form-group">
              <label htmlFor={`codigo-${idx}`}>Código *</label>
              <input
                type="text"
                id={`codigo-${idx}`}
                name="codigo"
                value={despesa.codigo}
                onChange={e => handleInputChange(idx, 'codigo', e.target.value)}
                placeholder="Ex: 1001"
                required
                disabled={loading}
                autoComplete="off"
              />
              {isAreaIeadam && (
                <button
                  type="button"
                  className="btn-lookup"
                  onClick={() => openLookup(idx)}
                  disabled={loading}
                  style={{ marginTop: 6 }}
                >
                  <FaSearch style={{ marginRight: 6 }} /> Consultar código (IEADAM)
                </button>
              )}
            </div>
            <div className="form-group">
              <label htmlFor={`descricao-${idx}`}>Descrição</label>
              <input
                type="text"
                id={`descricao-${idx}`}
                name="descricao"
                value={despesa.descricao}
                onChange={e => handleInputChange(idx, 'descricao', e.target.value)}
                placeholder="Descrição automática pelo código"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor={`categoria-${idx}`}>Categoria</label>
              <input
                type="text"
                id={`categoria-${idx}`}
                name="categoria"
                value={despesa.categoria || ''}
                onChange={e => handleInputChange(idx, 'categoria' as keyof DespesaInput, e.target.value)}
                placeholder="Categoria automática pelo código"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor={`valor-${idx}`}>Valor (R$) *</label>
              <input
                type="number"
                id={`valor-${idx}`}
                name="valor"
                value={despesa.valor}
                onChange={e => handleInputChange(idx, 'valor', e.target.value)}
                placeholder="0,00"
                min={0}
                step="0.01"
                required
                disabled={loading}
              />
            </div>
            <button type="button" className="btn-remove" onClick={() => removerLinha(idx)} disabled={despesas.length === 1 || loading} title="Remover linha">
              <FaTrash />
            </button>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={adicionarLinha} disabled={loading}>
          <FaPlus /> Adicionar Despesa
        </button>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Despesas lançadas com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-despesa">
          {loading ? 'Salvando...' : 'Salvar Despesas'}
        </button>
      </form>

      {/* Modal de Consulta IEADAM */}
      <GenericModal isOpen={lookupOpen} onClose={() => setLookupOpen(false)}>
        <h3>Consulta de Código (IEADAM)</h3>
        <form onSubmit={handleLookupSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Filtrar por código ou descrição"
            value={lookupQuery}
            onChange={e => setLookupQuery(e.target.value)}
            disabled={lookupLoading}
            autoFocus
          />
          <button type="submit" disabled={lookupLoading}>
            <FaSearch style={{ marginRight: 4 }} /> Buscar
          </button>
        </form>
        {lookupError && <div className="erro-message" style={{ marginBottom: 8 }}>{lookupError}</div>}
        {lookupLoading ? (
          <div>Carregando…</div>
        ) : (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {lookupList.length === 0 ? (
              <div style={{ opacity: 0.8 }}>Nenhum código encontrado.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {lookupList.map(item => (
                  <li key={item.codigo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.codigo}</div>
                      <div style={{ fontSize: 13, color: '#555' }}>{item.descricao}</div>
                      {item.categoria && <div style={{ fontSize: 12, color: '#777' }}>Categoria: {item.categoria}</div>}
                    </div>
                    <button type="button" onClick={() => handlePickCodigo(item.codigo, item.descricao, item.categoria)}>Selecionar</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </GenericModal>
    </div>
  );
}
