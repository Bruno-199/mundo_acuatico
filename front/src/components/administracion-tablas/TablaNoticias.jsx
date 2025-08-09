import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    imagen_url: '',
    estado: 'Borrador',
    fecha_publicacion: ''
  });

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const data = await api.get('/noticias/todas'); // Obtener todas las noticias para admin
      setNoticias(data);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNoticia) {
        await api.put(`/noticias/editar/${editingNoticia.id}`, formData);
      } else {
        await api.post('/noticias/agregar', formData);
      }
      setShowModal(false);
      setEditingNoticia(null);
      setFormData({
        titulo: '',
        contenido: '',
        imagen_url: '',
        estado: 'Borrador',
        fecha_publicacion: ''
      });
      fetchNoticias();
    } catch (error) {
      console.error('Error al guardar noticia:', error);
      alert('Error al guardar la noticia');
    }
  };

  const handleEdit = (noticia) => {
    setEditingNoticia(noticia);
    setFormData({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      imagen_url: noticia.imagen_url || '',
      estado: noticia.estado,
      fecha_publicacion: noticia.fecha_publicacion ? noticia.fecha_publicacion.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
      try {
        await api.delete(`/noticias/eliminar/${id}`);
        fetchNoticias();
      } catch (error) {
        console.error('Error al eliminar noticia:', error);
        alert('Error al eliminar la noticia');
      }
    }
  };

  const handlePublish = async (noticia) => {
    try {
      await api.put(`/noticias/publicar/${noticia.id}`, {
        fecha_publicacion: new Date().toISOString().split('T')[0]
      });
      fetchNoticias();
    } catch (error) {
      console.error('Error al publicar noticia:', error);
      alert('Error al publicar la noticia');
    }
  };

  const openAddModal = () => {
    setEditingNoticia(null);
    setFormData({
      titulo: '',
      contenido: '',
      imagen_url: '',
      estado: 'Borrador',
      fecha_publicacion: ''
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Cargando noticias...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Noticias</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Noticia
        </button>
      </div>
      
      <table className="tabla-admin">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha Publicación</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {noticias.map(noticia => (
            <tr key={noticia.id}>
              <td>{noticia.id}</td>
              <td>{noticia.titulo}</td>
              <td>
                <span className={`estado ${noticia.estado.toLowerCase()}`}>
                  {noticia.estado}
                </span>
              </td>
              <td>
                {noticia.fecha_publicacion 
                  ? new Date(noticia.fecha_publicacion).toLocaleDateString()
                  : '-'
                }
              </td>
              <td>
                {new Date(noticia.fecha_creacion).toLocaleDateString()}
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(noticia)}
                >
                  Editar
                </button>
                {noticia.estado === 'Borrador' && (
                  <button 
                    className="btn-publicar"
                    onClick={() => handlePublish(noticia)}
                  >
                    Publicar
                  </button>
                )}
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(noticia.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar/editar noticia */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingNoticia ? 'Editar Noticia' : 'Agregar Noticia'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Título:</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contenido:</label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL de imagen:</label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Archivado">Archivado</option>
                </select>
              </div>
              {formData.estado === 'Publicado' && (
                <div className="form-group">
                  <label>Fecha de publicación:</label>
                  <input
                    type="date"
                    value={formData.fecha_publicacion}
                    onChange={(e) => setFormData({...formData, fecha_publicacion: e.target.value})}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {editingNoticia ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaNoticias;