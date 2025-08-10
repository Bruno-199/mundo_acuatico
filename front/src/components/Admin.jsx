import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';
import TablaNoticias from './administracion-tablas/TablaNoticias';
import TablaSuscriptores from './administracion-tablas/TablaSuscriptores';
import TablaProfesores from './administracion-tablas/TablaProfesores';
import TablaUsuarios from './administracion-tablas/TablaUsuarios';
import TablaActividades from './administracion-tablas/TablaActividades';
import TablaHorarios from './administracion-tablas/TablaHorarios';
import TablaSuscripciones from './administracion-tablas/TablaSuscripciones';

const Admin = () => {
  const navigate = useNavigate();
  const [menuActivo, setMenuActivo] = useState('noticias');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleVolverInicio = () => {
    navigate('/');
  };

  const renderTabla = () => {
    switch (menuActivo) {
      case 'noticias':
        return <TablaNoticias />;
      case 'suscriptores':
        return <TablaSuscriptores />;
      case 'profesores':
        return <TablaProfesores />;
      case 'usuarios':
        return <TablaUsuarios />;
      case 'actividades':
        return <TablaActividades />;
      case 'horarios':
        return <TablaHorarios />;
      case 'suscripciones':
        return <TablaSuscripciones />;
      default:
        return <TablaNoticias />;
    }
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Panel Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-button ${menuActivo === 'noticias' ? 'active' : ''}`}
            onClick={() => setMenuActivo('noticias')}
          >
            Noticias
          </button>
          <button 
            className={`sidebar-button ${menuActivo === 'suscriptores' ? 'active' : ''}`}
            onClick={() => setMenuActivo('suscriptores')}
          >
            Suscriptores
          </button>
          <button 
            className={`sidebar-button ${menuActivo === 'suscripciones' ? 'active' : ''}`}
            onClick={() => setMenuActivo('suscripciones')}
          >
            Suscripciones
          </button>
          <button 
            className={`sidebar-button ${menuActivo === 'actividades' ? 'active' : ''}`}
            onClick={() => setMenuActivo('actividades')}
          >
            Actividades
          </button>
          <button 
            className={`sidebar-button ${menuActivo === 'horarios' ? 'active' : ''}`}
            onClick={() => setMenuActivo('horarios')}
          >
            Horarios
          </button>
          <button 
            className={`sidebar-button ${menuActivo === 'profesores' ? 'active' : ''}`}
            onClick={() => setMenuActivo('profesores')}
          >
            Profesores
          </button>
          <button 
            className={`sidebar-button ${menuActivo === 'usuarios' ? 'active' : ''}`}
            onClick={() => setMenuActivo('usuarios')}
          >
            Usuarios
          </button>
          <button 
            className="sidebar-button logout"
            onClick={handleVolverInicio}
          >
            Volver Menú Principal
          </button>
        </nav>
      </div>
      <div className="content-area">
        {renderTabla()}
      </div>
    </div>
  );
};

export default Admin;