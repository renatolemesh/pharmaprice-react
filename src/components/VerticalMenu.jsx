import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar o hook useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const VerticalMenu = ({ onToggleMenu }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate(); // Obter a função de navegação

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggleMenu(newIsOpen);
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-800 border-r dark:bg-gray-800 dark:border-gray-600 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col px-4 py-8">
        <div className="flex flex-col justify-between flex-1">
          {isOpen && (
            <img src="/logo.png" alt="Logo" className="w-auto p-1"/>
          )}
          <nav className="mt-6">
            <div onClick={() => navigate('/dashboard')} className="flex items-center px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-gray-200 cursor-pointer">
              <span className={`mx-4 font-medium ${isOpen ? 'block' : 'hidden'}`}>Dashboard</span>
            </div>
            <div onClick={() => navigate('/precos')} className="flex items-center px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-gray-200 cursor-pointer">
              <span className={`mx-4 font-medium ${isOpen ? 'block' : 'hidden'}`}>Comparar Preços</span>
            </div>
            <div onClick={() => navigate('/historico')} className="flex items-center px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-gray-200 cursor-pointer">
              <span className={`mx-4 font-medium ${isOpen ? 'block' : 'hidden'}`}>Histórico de Preços</span>
            </div>
            <div onClick={() => navigate('/relatorios')} className="flex items-center px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-gray-200 cursor-pointer">
              <span className={`mx-4 font-medium ${isOpen ? 'block' : 'hidden'}`}>Relatórios</span>
            </div>
            <div onClick={() => navigate('/logout')} className="flex items-center px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-gray-200 cursor-pointer">
              <span className={`mx-4 font-medium ${isOpen ? 'block' : 'hidden'}`}>Logout</span>
            </div>
          </nav>
        </div>
        <div className={`absolute top-1/2 transform -translate-y-1/2 right-0 ${isOpen ? '' : 'left-5'}`}>
          <button
            onClick={toggleMenu}
            className="w-10 h-10 bg-gray-800 text-white rounded-full focus:outline-none flex items-center justify-center shadow-lg"
          >
            <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalMenu;
