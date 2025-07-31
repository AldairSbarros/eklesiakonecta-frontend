import { useState } from "react";

const HF_API_URL = "https://api-inference.huggingface.co/models/allenai/t5-base-portuguese";

function SermaoSansao() {
  const [keywords, setKeywords] = useState("");
  const [referencia, setReferencia] = useState("");
  const [sermao, setSermao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [compartilhado, setCompartilhado] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const gerarSermao = async () => {
    setLoading(true);
    setErro("");
    setSermao("");
    setCompartilhado(false);
    setSalvo(false);
    try {
      let prompt = "";
      if (referencia) {
        prompt = `Crie um sermão cristão completo em português baseado na referência bíblica: ${referencia}. Inclua introdução, desenvolvimento, conclusão e aplicação prática.`;
        if (keywords) prompt += ` Use também as palavras-chave: ${keywords}.`;
      } else {
        prompt = `Crie um sermão cristão completo em português sobre: ${keywords}`;
      }
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const texto = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || data[0]?.generated_text || "";
      setSermao(texto);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Desconhecido";
      setErro("Erro ao gerar sermão: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const salvarSermao = () => {
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const compartilharSermao = () => {
    if (navigator.share) {
      navigator.share({
        title: "Sermão Gerado por SansãoIA",
        text: sermao
      }).then(() => setCompartilhado(true));
    } else {
      navigator.clipboard.writeText(sermao);
      setCompartilhado(true);
    }
    setTimeout(() => setCompartilhado(false), 2000);
  };

  return (
    <div className="sermao-ai-generator" style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #0002',maxWidth:600,margin:'32px auto'}}>
      <h2>SansãoIA - Gerador de Sermão Bíblico</h2>
      <p>Digite palavras-chave, tema ou referência bíblica e gere um sermão completo em português.</p>
      <input
        type="text"
        placeholder="Palavras-chave, tema, texto bíblico..."
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        style={{width:'100%',marginBottom:8,padding:8,borderRadius:6,border:'1px solid #ccc'}}
      />
      <input
        type="text"
        placeholder="Referência bíblica (ex: Salmo 23, João 3:16...)"
        value={referencia}
        onChange={e => setReferencia(e.target.value)}
        style={{width:'100%',marginBottom:12,padding:8,borderRadius:6,border:'1px solid #ccc'}}
      />
      <button onClick={gerarSermao} disabled={loading || (!keywords && !referencia)} style={{background:'#2980b9',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer'}}>
        {loading ? "Gerando..." : "Gerar Sermão"}
      </button>
      {erro && <p style={{color:'red',marginTop:12}}>{erro}</p>}
      {sermao && (
        <div style={{marginTop:24}}>
          <h3>Sermão Gerado:</h3>
          <textarea value={sermao} onChange={e => setSermao(e.target.value)} rows={16} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ccc'}} />
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button onClick={salvarSermao} style={{background:'#27ae60',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer'}}>Salvar</button>
            <button onClick={compartilharSermao} style={{background:'#f39c12',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer'}}>Compartilhar</button>
          </div>
          {salvo && <span style={{color:'#27ae60',marginLeft:8}}>Sermão salvo!</span>}
          {compartilhado && <span style={{color:'#f39c12',marginLeft:8}}>Sermão compartilhado!</span>}
          <p style={{marginTop:8}}>Você pode editar o texto antes de salvar ou compartilhar.</p>
        </div>
      )}
    </div>
  );
}

export default SermaoSansao;