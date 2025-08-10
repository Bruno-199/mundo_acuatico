import { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaActividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    form_url: '',
    imagen_url: '',
    precio_mensual: '',
    estado: 'Activo' // Cambio activa por estado
  });

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      setLoading(true);
      const data = await api.get('/actividades');
      setActividades(data);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      alert('El nombre debe tener al menos 3 caracteres');
      return;
    }
    
    if (formData.precio_mensual && parseFloat(formData.precio_mensual) < 0) {
      alert('El precio mensual no puede ser negativo');
      return;
    }
    
    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || '',
        form_url: formData.form_url?.trim() || '',
        imagen_url: formData.imagen_url?.trim() || '',
        precio_mensual: parseFloat(formData.precio_mensual) || 0.00,
        estado: formData.estado
      };

      if (editingActividad) {
        await api.put(`/actividades/editar/${editingActividad.id}`, dataToSend);
      } else {
        await api.post('/actividades/agregar', dataToSend);
      }
      
      setShowModal(false);
      setEditingActividad(null);
      setFormData({
        nombre: '',
        descripcion: '',
        form_url: '',
        imagen_url: '',
        precio_mensual: '',
        estado: 'Activo'
      });
      fetchActividades();
      
      alert(editingActividad ? 'Actividad actualizada correctamente' : 'Actividad creada correctamente');
    } catch (error) {
      console.error('Error al guardar actividad:', error);
      alert('Error al guardar la actividad: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleEdit = (actividad) => {
    setEditingActividad(actividad);
    setFormData({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion || '',
      form_url: actividad.form_url || '',
      imagen_url: actividad.imagen_url || '',
      precio_mensual: actividad.precio_mensual || '',
      estado: actividad.estado || 'Activo' // Cambio activa por estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta actividad?')) {
      try {
        await api.delete(`/actividades/eliminar/${id}`);
        fetchActividades();
      } catch (error) {
        console.error('Error al eliminar actividad:', error);
        alert('Error al eliminar la actividad');
      }
    }
  };

  const openAddModal = () => {
    setEditingActividad(null);
    setFormData({
      nombre: '',
      descripcion: '',
      form_url: '',
      imagen_url: '',
      precio_mensual: '',
      estado: 'Activo'
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Cargando actividades...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Actividades</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Actividad
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
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio Mensual</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map(actividad => (
            <tr key={actividad.id}>
              <td>{actividad.id}</td>
              <td>
                <div className="actividad-nombre">
                  {actividad.nombre}
                  {actividad.imagen_url && (
                    <img 
                      src={actividad.imagen_url} 
                      alt={actividad.nombre}
                      className="actividad-imagen-mini"
                      style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginLeft: '8px'}}
                    />
                  )}
                </div>
              </td>
              <td>
                <div className="descripcion-corta">
                  {actividad.descripcion?.length > 50 
                    ? `${actividad.descripcion.substring(0, 50)}...`
                    : actividad.descripcion || '-'
                  }
                </div>
              </td>
              <td>
                {actividad.precio_mensual 
                  ? `$${parseFloat(actividad.precio_mensual).toFixed(2)}`
                  : '-'
                }
              </td>
              <td>
                <span className={`estado ${actividad.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                  {actividad.estado}
                </span>
              </td>
              <td>
                {new Date(actividad.fecha_creacion).toLocaleDateString()}
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(actividad)}
                >
                  Editar
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(actividad.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal para agregar/editar actividad */}
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
                {editingActividad ? 'Editar Actividad' : 'Agregar Actividad'}
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
                  Nombre: *
                </label>
                <input
                  type="text"
                  id="actividad-nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                  minLength="3"
                  autoComplete="off"
                />
                <small style={{display: 'block', marginTop: '3px', color: '#666', fontSize: '12px'}}>
                  Mínimo 3 caracteres
                </small>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Descripción: (Opcional)
                </label>
                <textarea
                  id="actividad-descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
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
                  placeholder="Descripción de la actividad..."
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Precio Mensual: *
                  </label>
                  <input
                    type="number"
                    id="actividad-precio"
                    name="precio_mensual"
                    step="0.01"
                    min="0"
                    value={formData.precio_mensual}
                    onChange={(e) => setFormData({...formData, precio_mensual: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                {editingActividad && (
                  <div>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                      Estado:
                    </label>
                    <select
                      id="actividad-estado"
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
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  URL del formulario: (Opcional)
                </label>
                <input
                  type="url"
                  id="actividad-form-url"
                  name="form_url"
                  value={formData.form_url}
                  onChange={(e) => setFormData({...formData, form_url: e.target.value})}
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

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  URL de imagen: (Opcional)
                </label>
                <input
                  type="url"
                  id="actividad-imagen-url"
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
                {formData.imagen_url && (
                  <div style={{marginTop: '8px'}}>
                    <img 
                      src={formData.imagen_url} 
                      alt="Preview"
                      style={{
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                borderTop: '1px solid #eee',
                paddingTop: '20px'
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
                  {editingActividad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaActividades;
