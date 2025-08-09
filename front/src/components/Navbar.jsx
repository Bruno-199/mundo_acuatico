import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import '../css/Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    setIsAuthenticated(authStatus === 'true');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/" onClick={closeMenu}>
          <img src={logoImage} alt="Mundo Acuático Logo" className="navbar-logo" />
          <span className="navbar-title">Mundo Acuático</span>
        </Link>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link className={isActiveLink('/nosotros')} to="/nosotros" onClick={closeMenu}>
            <i className="fas fa-users"></i>
            Acerca de Nosotros
          </Link>
          <Link className={isActiveLink('/capacitaciones')} to="/capacitaciones" onClick={closeMenu}>
            <i className="fas fa-swimming-pool"></i>
            Capacitaciones
          </Link>
          
          {!isAuthenticated ? (
            <Link className={`${isActiveLink('/Login')} login-btn`} to="/Login" onClick={closeMenu}>
              <i className="fas fa-sign-in-alt"></i>
              Iniciar Sesión
            </Link>
          ) : (
            <div className="navbar-user-section">
              <Link className={isActiveLink('/Admin')} to="/Admin" onClick={closeMenu}>
                <i className="fas fa-cog"></i>
                Administrador
              </Link>
              {user && (
                <span className="user-welcome">
                  <i className="fas fa-user-circle"></i>
                  Bienvenido, {user.rol === 'Administrador Principal' ? 'Administrador Principal' : user.nombre}
                </span>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;