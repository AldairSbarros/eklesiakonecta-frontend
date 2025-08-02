import { useState } from "react";

const congregacoes = [
  { id: 9, nome: "Congregação 9" },
  { id: 13, nome: "Congregação 13" },
  { id: 17, nome: "Congregação 17" },
  { id: 23, nome: "Congregação 23" }
];

const semanas = ["1ª Semana", "2ª Semana", "3ª Semana", "4ª Semana", "5ª Semana"];

function LancamentoSemanalPage() {
  const [ano] = useState(2025);
  const [mes] = useState("Maio");
  const [valores, setValores] = useState(() => {
    // Tenta carregar do localStorage
    const salvo = localStorage.getItem("lancamentoSemanal");
    return salvo ? JSON.parse(salvo) : {};
  });

  const handleValorChange = (congId: number, semana: string, valor: string) => {
    setValores((v: any) => {
      const novo = { ...v };
      if (!novo[congId]) novo[congId] = { semanas: {}, comissao: "0,00" };
      novo[congId].semanas[semana] = valor;
      localStorage.setItem("lancamentoSemanal", JSON.stringify(novo));
      return novo;
    });
  };

  const handleComissaoChange = (congId: number, valor: string) => {
    setValores((v: any) => {
      const novo = { ...v };
      if (!novo[congId]) novo[congId] = { semanas: {}, comissao: "0,00" };
      novo[congId].comissao = valor;
      localStorage.setItem("lancamentoSemanal", JSON.stringify(novo));
      return novo;
    });
  };

  const somaCongregacao = (congId: number) => {
    const dados = valores[congId];
    if (!dados) return 0;
    let total = 0;
    semanas.forEach(s => {
      const v = dados.semanas?.[s]?.replace("R$","").replace(",",".");
      total += v ? parseFloat(v) : 0;
    });
    const comissao = dados.comissao?.replace("R$","").replace(",",".");
    total += comissao ? parseFloat(comissao) : 0;
    return total;
  };

  const totalGeral = () => {
    return congregacoes.reduce((acc, c) => acc + somaCongregacao(c.id), 0);
  };

  // Exportação Excel
  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const data = [];
    congregacoes.forEach(c => {
      data.push({ Congregacao: c.nome });
      semanas.forEach(s => {
        data.push({ Semana: s, Valor: valores[c.id]?.semanas?.[s] ?? "R$0,00" });
      });
      data.push({ Comissao: valores[c.id]?.comissao ?? "R$0,00" });
      data.push({ Total: `R$${somaCongregacao(c.id).toLocaleString("pt-br",{minimumFractionDigits:2})}` });
      data.push({});
    });
    data.push({ TotalGeral: `R$${totalGeral().toLocaleString("pt-br",{minimumFractionDigits:2})}` });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lançamento Semanal");
    XLSX.writeFile(wb, `LancamentoSemanal_${mes}_${ano}.xlsx`);
  };

  // Exportação PDF
  const exportPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text(`${mes} de ${ano}`, 10, y);
    y += 10;
    congregacoes.forEach(c => {
      doc.setFontSize(13);
      doc.text(c.nome, 10, y);
      y += 8;
      semanas.forEach(s => {
        doc.setFontSize(11);
        doc.text(`${s}: ${valores[c.id]?.semanas?.[s] ?? "R$0,00"}`, 12, y);
        y += 6;
      });
      doc.text(`Comissão: ${valores[c.id]?.comissao ?? "R$0,00"}`, 12, y);
      y += 6;
      doc.text(`Total: R$${somaCongregacao(c.id).toLocaleString("pt-br",{minimumFractionDigits:2})}`, 12, y);
      y += 10;
    });
    doc.setFontSize(13);
    doc.text(`Total Geral: R$${totalGeral().toLocaleString("pt-br",{minimumFractionDigits:2})}`, 10, y);
    doc.save(`LancamentoSemanal_${mes}_${ano}.pdf`);
  };

  // Backend: buscar/salvar lançamentos
  // Exemplo de fetch (ajuste endpoint conforme backend):
  // useEffect(() => {
  //   fetch(`/api/lancamento-semanal?mes=${mes}&ano=${ano}`)
  //     .then(res => res.json())
  //     .then(data => setValores(data));
  // }, [mes, ano]);

  // const salvarBackend = () => {
  //   fetch(`/api/lancamento-semanal`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ mes, ano, valores })
  //   });
  // };

  return (
    <div className="lancamento-semanal-page" style={{maxWidth:500,margin:"0 auto",background:"#fff",padding:24,borderRadius:8,boxShadow:"0 2px 8px #0001"}}>
      <h2 style={{textAlign:"center"}}>{mes} de {ano}</h2>
      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:16}}>
        <button onClick={exportExcel} style={{background:'#2196f3',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600}}>Exportar Excel</button>
        <button onClick={exportPDF} style={{background:'#43a047',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600}}>Exportar PDF</button>
        {/* <button onClick={salvarBackend} style={{background:'#ffa000',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:600}}>Salvar no Backend</button> */}
      </div>
      {congregacoes.map(c => (
        <div key={c.id} style={{marginBottom:32,borderBottom:"1px solid #eee",paddingBottom:16}}>
          <h3 style={{background:"#f8f8f8",padding:"8px 0",marginBottom:8}}>{c.nome}</h3>
          {semanas.map(s => (
            <div key={s} style={{display:"flex",alignItems:"center",marginBottom:4}}>
              <span style={{width:110}}>{s}</span>
              <input
                type="text"
                value={valores[c.id]?.semanas?.[s] ?? "R$0,00"}
                onChange={e => handleValorChange(c.id, s, e.target.value)}
                style={{width:90,background:"#e3f2fd",border:"1px solid #b3e5fc",borderRadius:4,padding:"2px 8px"}}
              />
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",marginTop:8}}>
            <span style={{width:110}}>Comissão</span>
            <input
              type="text"
              value={valores[c.id]?.comissao ?? "R$0,00"}
              onChange={e => handleComissaoChange(c.id, e.target.value)}
              style={{width:90,background:"#c8e6c9",border:"1px solid #a5d6a7",borderRadius:4,padding:"2px 8px"}}
            />
          </div>
          <div style={{marginTop:8,fontWeight:600}}>
            Total: R$ {somaCongregacao(c.id).toLocaleString("pt-br",{minimumFractionDigits:2})}
          </div>
        </div>
      ))}
      <div style={{fontWeight:700,fontSize:18,background:"#e3f2fd",padding:8,borderRadius:6,textAlign:"right"}}>
        Total Geral: R$ {totalGeral().toLocaleString("pt-br",{minimumFractionDigits:2})}
      </div>
    </div>
  );
}

export default LancamentoSemanalPage;
