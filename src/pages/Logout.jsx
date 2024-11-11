import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Logout = () => { 
    const navigate = useNavigate();

    useEffect(() => {
        Cookies.remove('token');
        navigate('/login');
        window.location.reload(); // Força o recarregamento para atualizar o estado de autenticação
    }, [navigate]);

    return null; // Retorna null, já que não precisa renderizar nada
};

export default Logout;
