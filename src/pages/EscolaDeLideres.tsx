import React, { useState } from 'react';
import TurmaCadastro from '../components/TurmaCadastro';
import ModuloCadastro from '../components/ModuloCadastro';
import  LicaoCadastro  from '../components/LicaoCadastro';
import AlunoCadastro from '../components/AlunoCadastro';

import ProfessorCadastro from '../components/ProfessorCadastro';
import ColaboradorCadastro from '../components/ColaboradorCadastro';
import SecretarioCadastro from '../components/SecretarioCadastro';
import '../styles/EscolaDeLideres.scss';

const ABAS = [
  { id: 'turmas', label: 'Turmas' },
  { id: 'modulos', label: 'Módulos' },
  { id: 'licoes', label: 'Lições' },
  { id: 'alunos', label: 'Alunos' },
  { id: 'professores', label: 'Professores' },
  { id: 'colaboradores', label: 'Colaboradores' },
  { id: 'secretarios', label: 'Secretários' }
];

export default function EscolaDeLideres() {
  const [abaAtiva, setAbaAtiva] = useState('turmas');

  return (
    <div className="escola-lideres-page">
      <h1>Escola de Líderes</h1>
      <div className="abas-escola-lideres">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            className={abaAtiva === aba.id ? 'aba ativa' : 'aba'}
            onClick={() => setAbaAtiva(aba.id)}
          >
            {aba.label}
          </button>
        ))}
      </div>
      <div className="conteudo-aba">
        {abaAtiva === 'turmas' && <TurmaCadastro />}
        {abaAtiva === 'modulos' && <ModuloCadastro />}
        {abaAtiva === 'licoes' && <LicaoCadastro />}
        {abaAtiva === 'alunos' && <AlunoCadastro />}
        {abaAtiva === 'professores' && <ProfessorCadastro />}
        {abaAtiva === 'colaboradores' && <ColaboradorCadastro />}
        {abaAtiva === 'secretarios' && <SecretarioCadastro />}
      </div>
    </div>
  );
}
