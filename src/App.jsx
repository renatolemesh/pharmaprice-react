import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import VerticalMenu from './components/VerticalMenu';
import AppRouter from './AppRouter';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleToggleMenu = (isOpen) => {
    setIsMenuOpen(isOpen);
  };

  return (
    <Router>
      <div className="flex">
        <VerticalMenu onToggleMenu={handleToggleMenu} />
        <div className={`flex-grow transition-all duration-300 ${isMenuOpen ? 'ml-64' : 'ml-20'}`}>
          <AppRouter />
        </div>
      </div>
    </Router>
  );
};

export default App;
