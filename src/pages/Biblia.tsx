import React from 'react';
import BibleReader from '../components/BibleReader/BibleReader';
import '../components/BibleReader/BibleReader.scss';

const Biblia: React.FC = () => {
  return (
    <div className="biblia-page">
      <BibleReader />
    </div>
  );
};

export default Biblia;
