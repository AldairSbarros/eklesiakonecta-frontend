import { useState } from "react";
import type { Member } from "../types/Member";

interface Props {
  member: Member;
  onUpdate?: (lat: number, lng: number) => void;
}

export default function MemberLocalizacao({ member, onUpdate }: Props) {
  const [latitude, setLatitude] = useState(member.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(member.longitude?.toString() || "");
  const [erro, setErro] = useState("");

  const handleUpdate = () => {
    if (!latitude || !longitude) {
      setErro("Latitude e longitude obrigatórios");
      return;
    }
    if (onUpdate) {
      onUpdate(Number(latitude), Number(longitude));
    }
  };

  const handleGeo = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toString());
          setLongitude(pos.coords.longitude.toString());
        },
        () => setErro("Não foi possível obter localização")
      );
    }
  };

  return (
    <div className="member-localizacao">
      <h3>Localização do Membro</h3>
      <input
        type="text"
        value={latitude}
        onChange={e => setLatitude(e.target.value)}
        placeholder="Latitude"
      />
      <input
        type="text"
        value={longitude}
        onChange={e => setLongitude(e.target.value)}
        placeholder="Longitude"
      />
      <button onClick={handleGeo} className="btn-geo">Usar minha localização</button>
      <button onClick={handleUpdate} className="btn-update">Atualizar</button>
      {erro && <div className="error-message">{erro}</div>}
    </div>
  );
}
