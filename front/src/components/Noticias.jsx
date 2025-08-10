import React, { useState, useEffect } from 'react';
import api from '../config/api';
import '../css/Noticias.css';

const Noticias = ({ isVisible, onClose }) => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVisible) {
      fetchNoticias();
    }
  }, [isVisible]);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const data = await api.get('/noticias');
      setNoticias(data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      setError('Error al cargar las noticias');
      // Fallback con noticias de ejemplo si falla la API
      setNoticias([
        {
          id: 1,
          titulo: "Muy pronto curso de guardavidas",
          contenido: "iniciamos curso de guardavidas para jovenes y adultos",
          imagen_url: "https://plus.unsplash.com/premium_photo-1726884009931-f7a73c869697?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
          id: 2,
          titulo: "Evento especial de verano en familia",
          contenido: "veni a disfrutar de nuestras actividades en familia",
          imagen_url: "https://images.unsplash.com/photo-1545960122-23d7d68938a6?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
          id: 3,
          titulo: "preparacion para aguas abiertas",
          contenido: "Iniciamos nuevo programa de preparacion para aguas abiertas",
          imagen_url: "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`noticias-container ${isVisible ? 'visible' : ''}`}>
      <div className="noticias-content">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2>Últimas Noticias</h2>
        {loading && <div className="loading">Cargando noticias...</div>}
        {error && <div className="error">{error}</div>}
        <div className="noticias-grid">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="noticia-card">
              <img 
                src={noticia.imagen_url || noticia.imagen} 
                alt={noticia.titulo}
                className="noticia-imagen"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                }}
              />
              <div className="noticia-contenido">
                <h3>{noticia.titulo}</h3>
                <p>{noticia.contenido}</p>
                {noticia.fecha_publicacion && (
                  <small className="fecha-publicacion">
                    {new Date(noticia.fecha_publicacion).toLocaleDateString()}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Noticias; 