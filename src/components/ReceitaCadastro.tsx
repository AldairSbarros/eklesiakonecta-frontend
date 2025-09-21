import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "./ReceitaCadastro.scss";

interface Receita {
  id: number;
  valor: number;
  data: string;
  descricao: string;
  categoria: string;
  origem: string;
}

import { http } from '../config/http';

function ReceitaCadastro() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [valor, setValor] = useState(0);
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [origem, setOrigem] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReceitas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await http('/api/receita');
      setReceitas(Array.isArray(data) ? data as Receita[] : []);
    } catch {
      toast.error("Erro ao buscar receitas");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReceitas();
  }, [fetchReceitas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || !data || !descricao || !categoria || !origem)
      return toast.error("Preencha todos os campos!");
    setLoading(true);
    try {
      await http('/api/receita', {
        method: 'POST',
        body: JSON.stringify({ valor, data, descricao, categoria, origem })
      });
      toast.success("Receita cadastrada!");
      setValor(0);
      setData("");
      setDescricao("");
      setCategoria("");
      setOrigem("");
      fetchReceitas();
    } catch {
      toast.error("Erro ao cadastrar receita");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remover receita?")) return;
    setLoading(true);
    try {
      await http(`/api/receita/${id}`, { method: 'DELETE' });
      toast.success("Receita removida");
      fetchReceitas();
    } catch {
      toast.error("Erro ao remover receita");
    }
    setLoading(false);
  };

  const handleEdit = async (id: number) => {
    const receita = receitas.find(r => r.id === id);
    if (!receita) return;
    setValor(receita.valor);
    setData(receita.data);
    setDescricao(receita.descricao);
    setCategoria(receita.categoria);
    setOrigem(receita.origem);
    // Remover a receita antiga para evitar duplicidade
    await handleDelete(id);
  };

  return (
    <div className="receita-cadastro">
      <h2>Cadastro de Receita Financeira</h2>
      <form onSubmit={handleSubmit} className="receita-form">
        <label>Valor:</label>
        <input type="number" value={valor} onChange={e => setValor(Number(e.target.value))} min={0.01} step={0.01} required />
        <label>Data:</label>
        <input type="date" value={data} onChange={e => setData(e.target.value)} required />
        <label>Descrição:</label>
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} required />
        <label>Categoria:</label>
        <input type="text" value={categoria} onChange={e => setCategoria(e.target.value)} required />
        <label>Origem:</label>
        <input type="text" value={origem} onChange={e => setOrigem(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Cadastrar Receita"}</button>
      </form>
      <h3>Receitas Registradas</h3>
      <div className="receita-list">
        {receitas.map(r => (
          <div key={r.id} className="receita-item">
            <span><b>Valor:</b> R$ {r.valor.toFixed(2)}</span>
            <span><b>Data:</b> {r.data}</span>
            <span><b>Descrição:</b> {r.descricao}</span>
            <span><b>Categoria:</b> {r.categoria}</span>
            <span><b>Origem:</b> {r.origem}</span>
            <button onClick={() => handleEdit(r.id)} disabled={loading}>Editar</button>
            <button onClick={() => handleDelete(r.id)} disabled={loading}>Remover</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReceitaCadastro;
