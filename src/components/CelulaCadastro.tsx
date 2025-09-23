import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as celulasApi from '../backend/services/celulas.service';
import '../styles/CelulaCadastro.scss';

interface CelulaCadastroProps {
  onSuccess?: () => void;
  editing?: boolean;
  editingCelula?: celulasApi.Celula | null;
  onCancelEdit?: () => void;
  onUpdated?: () => void;
}

export default function CelulaCadastro({ onSuccess, editing = false, editingCelula = null, onCancelEdit, onUpdated }: CelulaCadastroProps) {
  const getErrorMessage = (e: unknown): string => {
    if (e instanceof Error && e.message) return e.message;
    if (typeof e === 'object' && e !== null && 'message' in e) {
      const m = (e as Record<string, unknown>).message;
      if (typeof m === 'string') return m;
    }
    return 'Erro ao cadastrar célula.';
  };

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preenche o formulário quando entrar em modo edição
  useEffect(() => {
    if (editing && editingCelula) {
      setNome(editingCelula.nome || '');
      setDescricao(editingCelula.descricao || '');
      setSucesso(false);
      setErro('');
    }
  }, [editing, editingCelula]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    try {
      if (editing && editingCelula?.id != null) {
        await celulasApi.update(editingCelula.id, { nome, descricao });
        toast.success('Célula atualizada com sucesso!');
        if (onUpdated) onUpdated();
      } else {
        await celulasApi.create({ nome, descricao });
        setSucesso(true);
        setNome('');
        setDescricao('');
        toast.success('Célula cadastrada com sucesso!');
        if (onSuccess) onSuccess();
      }
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      setErro(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="celula-cadastro-container">
      <h2>{editing ? 'Editar Célula' : 'Cadastrar Nova Célula'}</h2>
      <form onSubmit={handleSubmit} className="celula-cadastro-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Célula *</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            disabled={loading}
            placeholder="Ex: Célula Jovens Norte"
          />
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            disabled={loading}
            placeholder="Breve descrição da célula"
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {!editing && sucesso && <div className="sucesso-message">Célula cadastrada com sucesso!</div>}
        <div className="actions" style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} className="btn-cadastrar-celula">
            {loading ? (editing ? 'Salvando...' : 'Cadastrando...') : (editing ? 'Salvar Alterações' : 'Cadastrar Célula')}
          </button>
          {editing && (
            <button type="button" disabled={loading} onClick={onCancelEdit} className="btn-cancelar-edicao">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
