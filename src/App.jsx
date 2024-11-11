import { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import VerticalMenu from './components/VerticalMenu';
import AppRouter from './AppRouter';
import { checkAuth } from './services/CheckAuth';

const App = () => {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticate = async () => {
      const { isAuthenticated, user, message } = await checkAuth();
      setAuth(isAuthenticated);
      if (isAuthenticated) {
        setName(user.name);
        setRole(user.role);
        console.log(user);
      } else {
        setMessage(message);
      }
      setAuthChecked(true);
    };

    authenticate();
  }, []);

  useEffect(() => {
    if (authChecked && !auth && location.pathname !== '/register' && location.pathname !== '/login') {
      navigate("/login");
    }
    if (authChecked && auth && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate("/precos");
    }
    if (authChecked && auth && role !== 'admin' && (location.pathname !== '/login' || location.pathname !== '/register'))
       { navigate("/pricing");
    }
  }, [authChecked, auth, navigate, location.pathname, role]);

  const handleToggleMenu = (isOpen) => {
    setIsMenuOpen(isOpen);
  };

  const shouldShowMenu = !['/login', '/register'].includes(location.pathname);

  return (
    <div className="flex">
      {shouldShowMenu && <VerticalMenu onToggleMenu={handleToggleMenu} />}
      <div className={`flex-grow transition-all duration-300 ${shouldShowMenu ? (isMenuOpen ? 'ml-64' : 'ml-20') : ''}`}>
        <AppRouter />
      </div>
      { auth ? (
        console.log('You are authorized', name)
      ) : (
        console.log('You are not authorized')
      )}
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
