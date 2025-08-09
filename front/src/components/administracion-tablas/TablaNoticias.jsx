import { useState, useEffect } from 'react';
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
      
      <div style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        overflowX: 'auto',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
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
      </div>

      {/* Modal para agregar/editar noticia */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '15px'
            }}>
              <h3 style={{margin: 0, color: '#333'}}>
                {editingNoticia ? 'Editar Noticia' : 'Agregar Noticia'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Título: *
                </label>
                <input
                  type="text"
                  id="noticia-titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                  autoComplete="off"
                />
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Contenido: *
                </label>
                <textarea
                  id="noticia-contenido"
                  name="contenido"
                  value={formData.contenido}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  URL de imagen:
                </label>
                <input
                  type="url"
                  id="noticia-imagen-url"
                  name="imagen_url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="https://..."
                />
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Estado:
                </label>
                <select
                  id="noticia-estado"
                  name="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Archivado">Archivado</option>
                </select>
              </div>
              
              {formData.estado === 'Publicado' && (
                <div style={{marginBottom: '15px'}}>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Fecha de publicación:
                  </label>
                  <input
                    type="date"
                    id="noticia-fecha-publicacion"
                    name="fecha_publicacion"
                    value={formData.fecha_publicacion}
                    onChange={(e) => setFormData({...formData, fecha_publicacion: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                borderTop: '1px solid #eee',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
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