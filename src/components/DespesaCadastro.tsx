import { useState } from 'react';
import { FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { http } from '../config/http';
import '../styles/DespesaCadastro.scss';

interface DespesaInput {
  codigo: string;
  descricao: string;
  valor: string;
}

export default function DespesaCadastro() {
  const [despesas, setDespesas] = useState<DespesaInput[]>([
    { codigo: '', descricao: '', valor: '' }
  ]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulação de busca de código/descrição (substitua por fetch real se necessário)
  const buscarDescricaoPorCodigo = async (codigo: string) => {
    // Aqui você pode fazer um fetch para o backend: /api/despesas/codigos/:codigo
    // Exemplo de resposta simulada:
    const manualCodigos: Record<string, string> = {
      '1001': 'Água',
      '1002': 'Energia',
      '1003': 'Internet',
      '1004': 'Material de Limpeza',
      '1005': 'Manutenção',
      '2001': 'Salário Funcionário',
      '3001': 'Imposto',
      '4001': 'Outros'
    };
    return manualCodigos[codigo] || '';
  };

  const handleInputChange = async (idx: number, field: keyof DespesaInput, value: string) => {
    const novas = [...despesas];
    novas[idx][field] = value;
    if (field === 'codigo' && value.length > 0) {
      const desc = await buscarDescricaoPorCodigo(value);
      novas[idx].descricao = desc;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    try {
      const result = await http('/api/despesas', { method: 'POST', body: JSON.stringify({ despesas }) });
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
      <p className="despesa-dica"><FaInfoCircle style={{marginRight: 6}}/> Informe o código da despesa para preencher automaticamente a descrição. Adicione quantas despesas quiser antes de salvar.</p>
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
    </div>
  );
}
