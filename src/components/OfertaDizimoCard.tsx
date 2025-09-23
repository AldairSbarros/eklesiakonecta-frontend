// cSpell:disable
import { FaMoneyBillWave, FaHeart, FaEdit, FaFileImage, FaDownload, FaTrash } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import '../styles/OfertaDizimoCard.scss';

interface OfertaDizimoCardProps {
  registro: import('../types/OfertaDizimo').OfertaDizimo;
  onEdit: () => void;
  onDownloadReceipt?: (id: number) => void;
  onDeleteReceipt?: (id: number) => void;
}

const OfertaDizimoCard: React.FC<OfertaDizimoCardProps> = ({ registro, onEdit, onDownloadReceipt, onDeleteReceipt }) => {
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
        <div><strong>Membro:</strong> {registro.membro || (registro.memberId ? `#${registro.memberId}` : '-')}</div>
        <div><strong>Congregação:</strong> {registro.congregacao || (registro.congregacaoId ? `#${registro.congregacaoId}` : '-')}</div>
        {registro.observacao && <div><strong>Obs:</strong> {registro.observacao}</div>}
        {registro.comprovante && (
          <div className="oferta-comprovante">
            <FaFileImage /> <span>Comprovante enviado</span>
            {/* Preview/thumbnail quando for uma imagem conhecida */}
            {(() => {
              const src = registro.comprovante?.startsWith('http')
                ? registro.comprovante
                : getApiUrl(registro.comprovante.startsWith('/') ? registro.comprovante : `/` + registro.comprovante);
              const isImg = /\.(png|jpe?g|gif|webp)$/i.test(registro.comprovante);
              return isImg ? (
                <a href={src} target="_blank" rel="noreferrer" className="thumb-link">
                  <img src={src} alt="Comprovante" className="thumb" />
                </a>
              ) : (
                <a href={src} target="_blank" rel="noreferrer" className="open-link">Abrir</a>
              );
            })()}
            {typeof registro.id === 'number' && (
              <span className="actions">
                <button title="Baixar" onClick={() => onDownloadReceipt && onDownloadReceipt(registro.id as number)}><FaDownload /></button>
                <button title="Excluir" onClick={() => onDeleteReceipt && onDeleteReceipt(registro.id as number)}><FaTrash /></button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfertaDizimoCard;
