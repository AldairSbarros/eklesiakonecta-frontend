import { useState, useEffect } from "react";
import "./BibleReader.scss";
import YouTubePlayer from "../YouTubePlayer/YouTubePlayer";
import {
  mateusPlayList,
  marcosPlayList,
  lucasPlayList,
  joaoPlayList,
  aliancaPlayList,
  aliancaPlayList1,
} from "../BibleReader/youtubePlayList";

const API_URL = import.meta.env.VITE_BIBLE_API_URL || "https://4.dbt.io/api";
const API_KEY = import.meta.env.VITE_BIBLE_API_KEY;

function getBookKey(livro: string) {
  const key = livro.toUpperCase();
  if (["MAT", "MT", "MATEUS"].includes(key)) return "MAT";
  if (["MRK", "MC", "MARCOS"].includes(key)) return "MRK";
  if (["LUK", "LC", "LUCAS"].includes(key)) return "LUK";
  if (["JHN", "JO", "JOAO", "JOÃO"].includes(key)) return "JHN";
  if (["ALI"].includes(key)) return "ALI";
  if (["ALF"].includes(key)) return "ALF";
  return key;
}

const idiomas = [
  { code: "por", label: "Português" },
  { code: "spa", label: "Espanhol" },
  { code: "eng", label: "Inglês" },
  { code: "tca", label: "Tikuna" },
];

interface Fileset {
  id: string;
  type: string;
  set_type_code?: string;
  [key: string]: unknown;
}

interface Biblia {
  abbr: string;
  name: string;
  filesets?: { [asset: string]: Fileset[] };
  [key: string]: unknown;
}
interface Livro {
  book_id: string;
  name: string;
  chapters?: number[];
  [key: string]: unknown;
}
interface Verse {
  verse_text: string;
  verse_sequence?: number;
  verse_start?: number;
  book_id?: string;
  chapter?: number;
  [key: string]: unknown;
}

function BibleReader() {
  const [idioma, setIdioma] = useState("");
  const [biblias, setBiblias] = useState<Biblia[]>([]);
  const [biblia, setBiblia] = useState("");
  const [livros, setLivros] = useState<Livro[]>([]);
  const [livro, setLivro] = useState("");
  const [capitulo, setCapitulo] = useState(1);
  const [versiculos, setVersiculos] = useState<Verse[]>([]);
  const [versiculo, setVersiculo] = useState<number | "">("");
  const [audioUrl, setAudioUrl] = useState("");
  const [, setVideoUrl] = useState("");
  const [filesets, setFilesets] = useState<Fileset[]>([]);
  const [loading, setLoading] = useState(false);

  // Verificação se a API key está configurada
  useEffect(() => {
    if (!API_KEY) {
      console.error("VITE_BIBLE_API_KEY não está configurada no arquivo .env");
    }
  }, []);

  useEffect(() => {
    setBiblia("");
    setLivros([]);
    setLivro("");
    setVersiculos([]);
    setFilesets([]);
    setVersiculo("");
    if (idioma && API_KEY) {
      fetch(`${API_URL}/bibles?language_code=${idioma}&v=4&key=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => setBiblias(data.data || []))
        .catch((error) => console.error("Erro ao buscar bíblias:", error));
    }
  }, [idioma]);

  useEffect(() => {
    setLivros([]);
    setLivro("");
    setVersiculos([]);
    setFilesets([]);
    setVersiculo("");
    if (biblia && API_KEY) {
      fetch(`${API_URL}/bibles/${biblia}/book?v=4&key=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => setLivros(data.data || []))
        .catch((error) => console.error("Erro ao buscar livros:", error));
      
      fetch(`${API_URL}/bibles/${biblia}?v=4&key=${API_KEY}`)
        .then((res) => res.json())
        .then((data) => {
          const fsObj = data.data?.filesets || {};
          const fs = Object.values(fsObj).flat() as Fileset[];
          setFilesets(fs);
        })
        .catch((error) => console.error("Erro ao buscar filesets:", error));
    }
  }, [biblia]);

  const buscarConteudo = async () => {
    if (!API_KEY) {
      console.error("API Key não configurada");
      return;
    }

    setLoading(true);
    setVersiculos([]);
    setAudioUrl("");
    setVideoUrl("");
    
    try {
      const textoFileset = filesets.find(
        (f) => f.type?.startsWith("text") || f.set_type_code?.startsWith("text")
      );
      
      if (textoFileset) {
        const textoRes = await fetch(
          `${API_URL}/bibles/filesets/${textoFileset.id}/${livro}/${capitulo}?v=4&key=${API_KEY}`
        );
        const textoData = await textoRes.json();
        setVersiculos(Array.isArray(textoData.data) ? textoData.data : []);
      } else {
        setVersiculos([{ verse_text: "Texto não disponível para esta versão." }]);
      }

      const audioFileset = filesets.find(
        (f) =>
          f.type === "audio" ||
          f.type === "audio_drama" ||
          f.set_type_code === "audio" ||
          f.set_type_code === "audio_drama"
      );
      
      if (audioFileset) {
        const audioRes = await fetch(
          `${API_URL}/bibles/filesets/${audioFileset.id}/${livro}/${capitulo}?v=4&key=${API_KEY}`
        );
        const audioData = await audioRes.json();
        setAudioUrl(audioData.data?.[0]?.path || "");
      } else {
        setAudioUrl("");
      }
    } catch (error) {
      console.error("Erro ao buscar conteúdo:", error);
      setVersiculos([{ verse_text: "Erro ao carregar o conteúdo. Tente novamente." }]);
    }

    setLoading(false);
  };

  const bookKey = getBookKey(livro);
  let videoId: string | undefined = undefined;
  if (bookKey === "MAT" && capitulo >= 1 && capitulo <= mateusPlayList.length) {
    videoId = mateusPlayList[capitulo - 1];
  } else if (bookKey === "MRK" && capitulo >= 1 && capitulo <= marcosPlayList.length) {
    videoId = marcosPlayList[capitulo - 1];
  } else if (bookKey === "LUK" && capitulo >= 1 && capitulo <= lucasPlayList.length) {
    videoId = lucasPlayList[capitulo - 1];
  } else if (bookKey === "JHN" && capitulo >= 1 && capitulo <= joaoPlayList.length) {
    videoId = joaoPlayList[capitulo - 1];
  } else if (bookKey === "ALI" && capitulo >= 1 && capitulo <= aliancaPlayList1.length) {
    videoId = aliancaPlayList1[capitulo - 1];
  } else if (bookKey === "ALF" && capitulo >= 1 && capitulo <= aliancaPlayList.length) {
    videoId = aliancaPlayList[capitulo - 1];
  }

  // Renderização condicional se não houver API key
  if (!API_KEY) {
    return (
      <div className="bible-page">
        <main className="bible-main">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            <h2>Erro de Configuração</h2>
            <p>A chave da API da Bíblia não está configurada.</p>
            <p>Verifique se a variável VITE_BIBLE_API_KEY está definida no arquivo .env</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bible-page">
      <main className="bible-main">
        <section className="bible-controls-section">
          <h2>Bíblia Digital Área 179</h2>
          <form className="bible-controls" onSubmit={(e) => e.preventDefault()}>
            <label>Idioma:</label>
            <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
              <option value="">Selecione</option>
              {idiomas.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.label}
                </option>
              ))}
            </select>
            {biblias.length > 0 && (
              <>
                <label>Bíblia:</label>
                <select value={biblia} onChange={(e) => setBiblia(e.target.value)}>
                  <option value="">Selecione</option>
                  {biblias.map((b: Biblia) => (
                    <option key={b.abbr} value={b.abbr}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </>
            )}
            {livros.length > 0 && (
              <>
                <div className="bible-controls-row">
                  <label>Livro:</label>
                  <select value={livro} onChange={(e) => setLivro(e.target.value)}>
                    <option value="">Selecione</option>
                    {livros.map((l: Livro) => (
                      <option key={l.book_id} value={l.book_id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <label>Capítulo:</label>
                  <input
                    type="number"
                    min={1}
                    value={capitulo}
                    onChange={(e) => setCapitulo(Number(e.target.value))}
                    style={{ width: 60, marginRight: 8 }}
                  />
                  <button
                    type="button"
                    onClick={buscarConteudo}
                    disabled={!livro || !capitulo || loading}
                  >
                    {loading ? "Carregando..." : "Ler"}
                  </button>
                </div>
              </>
            )}
          </form>

          {!loading && versiculos.length > 0 && (
            <div className="bible-content">
              <h3>Texto</h3>
              <div className="verses-list">
                {versiculos.length === 1 && versiculos[0].verse_text === "Texto não disponível para esta versão." ? (
                  <div className="verse-item">
                    <span className="verse-text">{versiculos[0].verse_text}</span>
                  </div>
                ) : (
                  versiculos.map((v, idx) => {
                    const numero = v.verse_sequence || v.verse_start || idx + 1;
                    const isSelected =
                      versiculo && Number(versiculo) === Number(numero);
                    return (
                      <div
                        className={`verse-item${isSelected ? " selected" : ""}`}
                        key={idx}
                      >
                        <span className="verse-number">{numero}</span>
                        <span className="verse-text">{v.verse_text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {!loading && audioUrl && (
            <div>
              <h3>Áudio</h3>
              <audio controls src={audioUrl}></audio>
            </div>
          )}
        </section>

        {videoId && (
          <aside className="bible-video-sidebar">
            <div style={{ position: "sticky", top: 30 }}>
              <h3>Vídeo</h3>
              <YouTubePlayer videoId={videoId} />
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

export default BibleReader;