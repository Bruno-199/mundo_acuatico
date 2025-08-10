import { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [errors, setErrors] = useState({});
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
      alert('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  };

  // Función de validación del frontend
  const validateForm = () => {
    const newErrors = {};

    // Validación de título (mínimo 5 caracteres, máximo 200)
    if (!formData.titulo || formData.titulo.trim() === '') {
      newErrors.titulo = 'El título es obligatorio';
    } else {
      const tituloTrimmed = formData.titulo.trim();
      if (tituloTrimmed.length < 5) {
        newErrors.titulo = 'El título debe tener al menos 5 caracteres';
      } else if (tituloTrimmed.length > 200) {
        newErrors.titulo = 'El título no puede exceder los 200 caracteres';
      }
    }

    // Validación de contenido (mínimo 10 caracteres)
    if (!formData.contenido || formData.contenido.trim() === '') {
      newErrors.contenido = 'El contenido es obligatorio';
    } else {
      const contenidoTrimmed = formData.contenido.trim();
      if (contenidoTrimmed.length < 10) {
        newErrors.contenido = 'El contenido debe tener al menos 10 caracteres';
      }
    }

    // Validación de imagen_url (opcional, pero si se proporciona debe ser válida y no exceder 500 caracteres)
    if (formData.imagen_url && formData.imagen_url.trim() !== '') {
      const urlTrimmed = formData.imagen_url.trim();
      if (urlTrimmed.length > 500) {
        newErrors.imagen_url = 'La URL de la imagen no puede exceder los 500 caracteres';
      } else {
        try {
          new URL(urlTrimmed);
        } catch {
          newErrors.imagen_url = 'La URL de la imagen no tiene un formato válido';
        }
      }
    }

    // Validación de estado
    const estadosValidos = ['Borrador', 'Publicado', 'Archivado'];
    if (!estadosValidos.includes(formData.estado)) {
      newErrors.estado = 'Debe seleccionar un estado válido';
    }

    // Validación de fecha de publicación si el estado es "Publicado"
    if (formData.estado === 'Publicado' && formData.fecha_publicacion && formData.fecha_publicacion.trim() !== '') {
      const fecha = new Date(formData.fecha_publicacion);
      if (isNaN(fecha.getTime())) {
        newErrors.fecha_publicacion = 'La fecha de publicación no es válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        titulo: formData.titulo.trim(),
        contenido: formData.contenido.trim(),
        imagen_url: formData.imagen_url.trim() || null
      };

      if (editingNoticia) {
        await api.put(`/noticias/editar/${editingNoticia.id}`, dataToSend);
      } else {
        await api.post('/noticias/agregar', dataToSend);
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
      setErrors({});
      fetchNoticias();
    } catch (error) {
      console.error('Error al guardar noticia:', error);
      
      // Mostrar errores específicos del servidor
      if (error.response && error.response.data && error.response.data.detalles) {
        const serverErrors = {};
        error.response.data.detalles.forEach(detalle => {
          if (detalle.includes('título')) {
            serverErrors.titulo = detalle;
          } else if (detalle.includes('contenido')) {
            serverErrors.contenido = detalle;
          } else if (detalle.includes('imagen')) {
            serverErrors.imagen_url = detalle;
          } else if (detalle.includes('estado')) {
            serverErrors.estado = detalle;
          }
        });
        setErrors(serverErrors);
      } else if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al guardar la noticia');
      }
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
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres archivar esta noticia?')) {
      try {
        await api.delete(`/noticias/eliminar/${id}`);
        fetchNoticias();
      } catch (error) {
        console.error('Error al archivar noticia:', error);
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error);
        } else {
          alert('Error al archivar la noticia');
        }
      }
    }
  };

  const handlePublish = async (noticia) => {
    // Validar que la noticia cumple con los requisitos mínimos
    if (!noticia.titulo || noticia.titulo.length < 5) {
      alert('La noticia debe tener un título de al menos 5 caracteres para ser publicada');
      return;
    }

    if (!noticia.contenido || noticia.contenido.length < 10) {
      alert('La noticia debe tener contenido de al menos 10 caracteres para ser publicada');
      return;
    }

    try {
      await api.put(`/noticias/publicar/${noticia.id}`, {
        fecha_publicacion: new Date().toISOString().split('T')[0]
      });
      fetchNoticias();
    } catch (error) {
      console.error('Error al publicar noticia:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al publicar la noticia');
      }
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
    setErrors({});
    setShowModal(true);
  };

  // Función para obtener el color del estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Publicado':
        return 'estado-publicado';
      case 'Borrador':
        return 'estado-borrador';
      case 'Archivado':
        return 'estado-archivado';
      default:
        return '';
    }
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
              <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {noticia.titulo}
              </td>
              <td>
                <span className={`estado ${getEstadoClass(noticia.estado)}`}>
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
                {noticia.estado !== 'Archivado' && (
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleDelete(noticia.id)}
                  >
                    Archivar
                  </button>
                )}
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
                  Título: * (5-200 caracteres)
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
                    border: errors.titulo ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                  minLength={5}
                  maxLength={200}
                  autoComplete="off"
                />
                {errors.titulo && (
                  <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>
                    {errors.titulo}
                  </div>
                )}
                <div style={{fontSize: '12px', color: '#666', marginTop: '3px'}}>
                  {formData.titulo.length}/200 caracteres
                </div>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Contenido: * (mínimo 10 caracteres)
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
                    border: errors.contenido ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  required
                  minLength={10}
                />
                {errors.contenido && (
                  <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>
                    {errors.contenido}
                  </div>
                )}
                <div style={{fontSize: '12px', color: '#666', marginTop: '3px'}}>
                  {formData.contenido.length} caracteres (mínimo 10)
                </div>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  URL de imagen: (máximo 500 caracteres)
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
                    border: errors.imagen_url ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  maxLength={500}
                  placeholder="https://..."
                />
                {errors.imagen_url && (
                  <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>
                    {errors.imagen_url}
                  </div>
                )}
                {formData.imagen_url && (
                  <div style={{fontSize: '12px', color: '#666', marginTop: '3px'}}>
                    {formData.imagen_url.length}/500 caracteres
                  </div>
                )}
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
                    border: errors.estado ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Borrador">Borrador</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Archivado">Archivado</option>
                </select>
                {errors.estado && (
                  <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>
                    {errors.estado}
                  </div>
                )}
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
                      border: errors.fecha_publicacion ? '1px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.fecha_publicacion && (
                    <div style={{color: '#dc3545', fontSize: '12px', marginTop: '5px'}}>
                      {errors.fecha_publicacion}
                    </div>
                  )}
                  <div style={{fontSize: '12px', color: '#666', marginTop: '3px'}}>
                    Si se deja vacío, se usará la fecha actual
                  </div>
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