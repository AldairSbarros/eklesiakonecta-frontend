// cSpell:disable
import { FaMoneyBillWave, FaHeart, FaEdit, FaFileImage } from 'react-icons/fa';
import '../styles/OfertaDizimoCard.scss';

interface OfertaDizimoCardProps {
  registro: import('../types/OfertaDizimo').OfertaDizimo;
  onEdit: () => void;
}

const OfertaDizimoCard: React.FC<OfertaDizimoCardProps> = ({ registro, onEdit }) => {
  return (
    <div className={`oferta-card ${registro.tipo}`}>  
      <div className="oferta-card-header">
        <span className="oferta-tipo">
          {registro.tipo === 'dizimo' ? <FaMoneyBillWave /> : <FaHeart />}
          {registro.tipo === 'dizimo' ? 'Dízimo' : 'Oferta'}
        </span>
        <span className="oferta-valor">R$ {registro.valor}</span>
        <button className="btn-edit" onClick={onEdit}><FaEdit /> Editar</button>
      </div>
      <div className="oferta-card-body">
        <div><strong>Data:</strong> {registro.data}</div>
        <div><strong>Membro:</strong> {registro.membro}</div>
        <div><strong>Congregação:</strong> {registro.congregacao}</div>
        {registro.observacao && <div><strong>Obs:</strong> {registro.observacao}</div>}
        {registro.comprovante && (
          <div className="oferta-comprovante">
            <FaFileImage /> <span>Comprovante enviado</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfertaDizimoCard;
