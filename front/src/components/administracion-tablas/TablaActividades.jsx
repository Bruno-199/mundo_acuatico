import React, { useState, useEffect } from 'react';
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
    activa: true
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
    try {
      if (editingActividad) {
        await api.put(`/actividades/editar/${editingActividad.id}`, formData);
      } else {
        await api.post('/actividades/agregar', formData);
      }
      setShowModal(false);
      setEditingActividad(null);
      setFormData({
        nombre: '',
        descripcion: '',
        form_url: '',
        imagen_url: '',
        precio_mensual: '',
        activa: true
      });
      fetchActividades();
    } catch (error) {
      console.error('Error al guardar actividad:', error);
      alert('Error al guardar la actividad');
    }
  };

  const handleEdit = (actividad) => {
    setEditingActividad(actividad);
    setFormData({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      form_url: actividad.form_url || '',
      imagen_url: actividad.imagen_url || '',
      precio_mensual: actividad.precio_mensual || '',
      activa: actividad.activa
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
      activa: true
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
                <span className={`estado ${actividad.activa ? 'activo' : 'inactivo'}`}>
                  {actividad.activa ? 'Activa' : 'Inactiva'}
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

      {/* Modal para agregar/editar actividad */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingActividad ? 'Editar Actividad' : 'Agregar Actividad'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Mensual:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_mensual}
                    onChange={(e) => setFormData({...formData, precio_mensual: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Estado:</label>
                  <select
                    value={formData.activa}
                    onChange={(e) => setFormData({...formData, activa: e.target.value === 'true'})}
                  >
                    <option value={true}>Activa</option>
                    <option value={false}>Inactiva</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>URL del formulario:</label>
                <input
                  type="url"
                  value={formData.form_url}
                  onChange={(e) => setFormData({...formData, form_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>URL de imagen:</label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                  placeholder="https://..."
                />
                {formData.imagen_url && (
                  <div className="imagen-preview" style={{marginTop: '8px'}}>
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

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
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
