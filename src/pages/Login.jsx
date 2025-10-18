import axios from 'axios';
import { useState } from 'react';
import { BASE_URL } from '../services/Api';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

const Login = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post(`${BASE_URL}/login`, values, {
                withCredentials: false
            });
            const dados = res.data;

            if (dados.message === "The provided credentials are incorrect.") {
                setMessage('Credenciais inválidas');
                return;
            }

            const JWT_token = dados.token;

            if (JWT_token) {
                Cookies.set('token', JWT_token, { expires: 1, secure: true });
                window.location.reload();
            }
        } catch (err) {
            if (err.response) {
                console.log(err.response.data);
                setMessage(err.response.data.message || 'Erro desconhecido');
            } else {
                console.log(err);
                setMessage('Erro desconhecido');
            }
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl mb-6 text-center text-white">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input 
                            type="email" 
                            placeholder="Seu email" 
                            onChange={e => setValues({...values, email: e.target.value})}
                            className="mt-1 px-3 py-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 w-full"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha</label>
                        <input 
                            type="password" 
                            placeholder="Sua senha" 
                            onChange={e => setValues({...values, password: e.target.value})}
                            className="mt-1 px-3 py-2 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 w-full"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500"
                    >
                        Login
                    </button>
                    <div className="mt-5 text-center"> <span className="text-gray-300">Não tem cadastro? </span> <Link to="/register" className="text-blue-500 hover:underline">Registre-se</Link> </div>
                </form>
                {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
