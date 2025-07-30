
import { useState, useEffect } from 'react';
import { FaUserPlus, FaSyncAlt, FaTrash, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import '../styles/DiscipulandoCadastro.scss';

interface DiscipulandoInput {
  nome: string;
  congregacaoId?: string;
  discipuladorId?: string;
  celulaId?: string;
}

interface Option {
  id: string;
  nome: string;
}

export default function DiscipulandoCadastro() {
  const [form, setForm] = useState<DiscipulandoInput>({ nome: '', congregacaoId: '', discipuladorId: '', celulaId: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [congregacoes, setCongregacoes] = useState<Option[]>([]);
  const [celulas, setCelulas] = useState<Option[]>([]);
  const [discipuladores, setDiscipuladores] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Busca opções dinâmicas
  useEffect(() => {
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) return;
    setLoadingOptions(true);
    Promise.all([
      fetch(getApiUrl('/api/congregacoes'), { headers: { schema } }).then(r => r.json()),
      fetch(getApiUrl('/api/celulas'), { headers: { schema } }).then(r => r.json()),
      fetch(getApiUrl('/api/discipuladores'), { headers: { schema } }).then(r => r.json())
    ]).then(([congs, cels, discs]) => {
      setCongregacoes(Array.isArray(congs) ? congs : []);
      setCelulas(Array.isArray(cels) ? cels : []);
      setDiscipuladores(Array.isArray(discs) ? discs : []);
    }).catch(() => {
      setCongregacoes([]);
      setCelulas([]);
      setDiscipuladores([]);
    }).finally(() => setLoadingOptions(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl('/api/discipulandos'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setForm({ nome: '', congregacaoId: '', discipuladorId: '', celulaId: '' });
      } else {
        setErro(result.error || 'Erro ao cadastrar discipulando.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setForm({ nome: '', congregacaoId: '', discipuladorId: '', celulaId: '' });
    setErro('');
    setSucesso(false);
  };

  return (
    <div className="discipulando-cadastro-container">
      <h2>Cadastrar Discipulando</h2>
      <form onSubmit={handleSubmit} className="discipulando-cadastro-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="nome">Nome <span className="required">*</span></label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Nome completo do discipulando"
            autoFocus
          />
        </div>
        <fieldset className="opcionais-fieldset">
          <legend>Vinculações (opcionais)</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="congregacaoId">Congregação</label>
              <select
                id="congregacaoId"
                name="congregacaoId"
                value={form.congregacaoId}
                onChange={handleInputChange}
                disabled={loading || loadingOptions}
              >
                <option value="">Selecione...</option>
                {congregacoes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="celulaId">Célula</label>
              <select
                id="celulaId"
                name="celulaId"
                value={form.celulaId}
                onChange={handleInputChange}
                disabled={loading || loadingOptions}
              >
                <option value="">Selecione...</option>
                {celulas.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="discipuladorId">Discipulador</label>
            <select
              id="discipuladorId"
              name="discipuladorId"
              value={form.discipuladorId}
              onChange={handleInputChange}
              disabled={loading || loadingOptions}
            >
              <option value="">Selecione...</option>
              {discipuladores.map(d => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>
        </fieldset>
        {erro && <div className="erro-message"><FaInfoCircle style={{marginRight: 4}}/>{erro}</div>}
        {sucesso && <div className="sucesso-message"><FaCheckCircle style={{marginRight: 4}}/>Discipulando cadastrado com sucesso!</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-cadastrar-discipulando">
            {loading ? 'Salvando...' : <><FaUserPlus style={{marginRight: 6}}/>Cadastrar</>}
          </button>
          <button type="button" className="btn-limpar" onClick={handleLimpar} disabled={loading} title="Limpar campos">
            <FaTrash style={{marginRight: 4}}/>Limpar
          </button>
        </div>
        {loadingOptions && <div className="loading-options"><FaSyncAlt className="spin"/> Carregando opções...</div>}
      </form>
    </div>
  );

}