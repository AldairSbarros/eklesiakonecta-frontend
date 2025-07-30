import React from 'react';
import PermissaoCadastro from '../components/PermissaoCadastro';
import '../styles/PermissaoCadastro.scss';

const Permissoes: React.FC = () => {
  return (
    <div className="permissoes-page">
      <PermissaoCadastro />
    </div>
  );
};

export default Permissoes;
