import React, { useState } from 'react';
import { FaUpload, FaSave, FaTimes, FaMoneyBillWave, FaHeart } from 'react-icons/fa';
import '../styles/OfertaDizimoForm.scss';

interface OfertaDizimoFormProps {
  editData?: import('../types/OfertaDizimo').OfertaDizimo;
  onClose: () => void;
  onSubmit: (data: import('../types/OfertaDizimo').OfertaDizimo) => void;
}

const OfertaDizimoForm: React.FC<OfertaDizimoFormProps> = ({ editData, onClose, onSubmit }) => {
  const [tipo, setTipo] = useState<'oferta' | 'dizimo'>(editData?.tipo || 'oferta');
  const [valor, setValor] = useState(editData?.valor || '');
  const [data, setData] = useState(editData?.data || '');
  const [membro, setMembro] = useState(editData?.membro || '');
  const [congregacao, setCongregacao] = useState(editData?.congregacao || '');
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
      congregacao,
      observacao,
      comprovante: comprovante ? comprovante.name : undefined
    };
    onSubmit(formData);
  };

  return (
    <div className="oferta-form-modal">
      <form className="oferta-form" onSubmit={handleSubmit}>
        <h3>{editData ? 'Editar Registro' : 'Nova Oferta/Dízimo'}</h3>
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
          <input type="text" value={membro} onChange={e => setMembro(e.target.value)} required placeholder="Nome do membro" />
        </div>
        <div className="form-group">
          <label>Congregação:</label>
          <input type="text" value={congregacao} onChange={e => setCongregacao(e.target.value)} required placeholder="Nome da congregação" />
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
          <button type="submit" className="btn-save"><FaSave /> Salvar</button>
          <button type="button" className="btn-cancel" onClick={onClose}><FaTimes /> Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default OfertaDizimoForm;
