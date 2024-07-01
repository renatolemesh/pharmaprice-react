import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VerticalMenu from './components/VerticalMenu';
import Relatorios from './pages/Relatorios';
import Precos from './pages/Precos';
import Historico from './pages/Historico';

const AppRouter = () => {
    return (
      <Routes>
        <Route path="/precos" element={<Precos />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    );
  };
  
  export default AppRouter;
