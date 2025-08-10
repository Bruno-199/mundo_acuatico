import { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    estado: 'Activo'
  });

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/profesores');
      setProfesores(data);
    } catch (error) {
      console.error('TablaProfesores - Error al cargar profesores:', error);
      setError('Error al cargar los profesores. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar teléfono - ahora es requerido
    if (!formData.telefono || formData.telefono.trim().length < 7) {
      errors.telefono = 'El teléfono es requerido y debe tener al menos 7 caracteres';
    }

    // Validar email si se proporciona
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'El email no tiene un formato válido';
      }
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        especialidad: '', // Enviar como cadena vacía
        telefono: formData.telefono.trim(),
        email: formData.email?.trim() || '',
        horario: '' // Enviar como cadena vacía
      };

      // Solo añadir estado si estamos editando
      if (editingProfesor) {
        dataToSend.estado = formData.estado;
      }

      if (editingProfesor) {
        await api.put(`/profesores/editar/${editingProfesor.id}`, dataToSend);
      } else {
        await api.post('/profesores/agregar', dataToSend);
      }
      
      setShowModal(false);
      setEditingProfesor(null);
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        estado: 'Activo'
      });
      fetchProfesores();
      
      // Mostrar mensaje de éxito
      alert(editingProfesor ? 'Profesor actualizado correctamente' : 'Profesor creado correctamente');
    } catch (error) {
      console.error('Error al guardar profesor:', error);
      alert('Error al guardar el profesor: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleEdit = (profesor) => {
    setEditingProfesor(profesor);
    setFormData({
      nombre: profesor.nombre,
      telefono: profesor.telefono || '',
      email: profesor.email || '',
      estado: profesor.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nombreProfesor) => {
    if (window.confirm(`¿Estás seguro de que quieres desactivar al profesor "${nombreProfesor}"?\n\nEsta acción marcará al profesor como inactivo pero conservará sus datos.`)) {
      try {
        setLoading(true);
        await api.delete(`/profesores/eliminar/${id}`);
        await fetchProfesores();
        alert('Profesor desactivado correctamente');
      } catch (error) {
        console.error('Error al eliminar profesor:', error);
        alert('Error al eliminar el profesor: ' + (error.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddModal = () => {
    setEditingProfesor(null);
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      estado: 'Activo'
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando profesores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchProfesores} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Profesores</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Profesor
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
            <th>Especialidad</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {profesores.map(profesor => (
            <tr key={profesor.id}>
              <td>{profesor.id}</td>
              <td>{profesor.nombre}</td>
              <td>{profesor.especialidad}</td>
              <td>{profesor.telefono || '-'}</td>
              <td>{profesor.email || '-'}</td>
              <td>
                <span className={`estado ${profesor.estado.toLowerCase()}`}>
                  {profesor.estado}
                </span>
              </td>
              <td>
                {new Date(profesor.fecha_creacion).toLocaleDateString()}
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(profesor)}
                >
                  Editar
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(profesor.id, profesor.nombre)}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal para agregar/editar profesor */}
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
                {editingProfesor ? 'Editar Profesor' : 'Agregar Profesor'}
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
                  id="profesor-nombre"
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
                  autoComplete="name"
                />
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Teléfono: *
                </label>
                <input
                  type="tel"
                  id="profesor-telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ej: +54 11 1234-5678"
                  required
                  minLength="7"
                  autoComplete="tel"
                />
                <small style={{display: 'block', marginTop: '3px', color: '#666', fontSize: '12px'}}>
                  Mínimo 7 caracteres
                </small>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Email: (Opcional)
                </label>
                <input
                  type="email"
                  id="profesor-email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="profesor@mundoacuatico.com"
                  autoComplete="email"
                />
              </div>
              
              {editingProfesor && (
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Estado:
                  </label>
                  <select
                    id="profesor-estado"
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
                  {editingProfesor ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaProfesores;