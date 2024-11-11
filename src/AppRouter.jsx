import {Route, Routes } from 'react-router-dom';
import Relatorios from './pages/Relatorios';
import Precos from './pages/Precos';
import Historico from './pages/Historico';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Pricing from './pages/Pricing.jsx';

const AppRouter = () => {
    return (
      <Routes>
        <Route path="/precos" element={<Precos />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    );
  };
  
  export default AppRouter;
