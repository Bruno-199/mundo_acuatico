import { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    password: '', // Cambio password_hash por password
    rol: 'Editor',
    estado: 'Activo'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/usuarios');
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar usuario
    if (!formData.usuario || formData.usuario.trim().length < 3) {
      errors.usuario = 'El usuario debe tener al menos 3 caracteres';
    }

    // Validar que el usuario no contenga espacios
    if (formData.usuario && /\s/.test(formData.usuario)) {
      errors.usuario = 'El usuario no debe contener espacios';
    }

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar contraseña (solo para nuevos usuarios o si se cambió)
    if (!editingUsuario && (!formData.password || formData.password.length < 6)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (editingUsuario && formData.password && formData.password.length < 6) {
      errors.password = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const dataToSend = {
        usuario: formData.usuario.trim(),
        nombre: formData.nombre.trim(),
        rol: formData.rol,
        estado: formData.estado
      };

      if (editingUsuario) {
        // Al editar, solo incluir password si se proporcionó uno nuevo
        if (formData.password) {
          dataToSend.password = formData.password; // Cambio password_hash por password
        }
        await api.put(`/usuarios/editar/${editingUsuario.id}`, dataToSend);
      } else {
        // Al crear, password es requerido
        dataToSend.password = formData.password; // Cambio password_hash por password
        await api.post('/usuarios/agregar', dataToSend);
      }
      
      setShowModal(false);
      setEditingUsuario(null);
      setFormData({
        usuario: '',
        nombre: '',
        password: '', // Cambio password_hash por password
        rol: 'Editor',
        estado: 'Activo'
      });
      setFormErrors({});
      fetchUsuarios();
      
      alert(editingUsuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      if (error.message && error.message.includes('usuario ya existe')) {
        setFormErrors({ usuario: 'Este nombre de usuario ya está en uso' });
      } else {
        alert('Error al guardar el usuario: ' + (error.message || 'Error desconocido'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      usuario: usuario.usuario || '',
      nombre: usuario.nombre || '',
      password: '', // No mostrar contraseña actual - cambio password_hash por password
      rol: usuario.rol || 'Editor',
      estado: usuario.estado || 'Activo'
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id, nombreUsuario) => {
    if (window.confirm(`¿Estás seguro de que quieres desactivar al usuario "${nombreUsuario}"?\n\nEsta acción marcará al usuario como inactivo pero conservará sus datos.`)) {
      try {
        setLoading(true);
        await api.delete(`/usuarios/eliminar/${id}`);
        await fetchUsuarios();
        alert('Usuario desactivado correctamente');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario: ' + (error.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddModal = () => {
    setEditingUsuario(null);
    setFormData({
      usuario: '',
      nombre: '',
      password: '', // Cambio password_hash por password
      rol: 'Editor',
      estado: 'Activo'
    });
    setFormErrors({});
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchUsuarios} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Usuario
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
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Último Acceso</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.usuario}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.rol}</td>
              <td>
                {usuario.ultimo_acceso 
                  ? new Date(usuario.ultimo_acceso).toLocaleDateString()
                  : 'Nunca'
                }
              </td>
              <td>
                <span className={`estado ${usuario.estado.toLowerCase()}`}>
                  {usuario.estado}
                </span>
              </td>
              <td>
                {new Date(usuario.fecha_creacion).toLocaleDateString()}
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(usuario)}
                >
                  Editar
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(usuario.id, usuario.usuario)}
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

      {/* Modal para agregar/editar usuario */}
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
                {editingUsuario ? 'Editar Usuario' : 'Agregar Usuario'}
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
                  Usuario: *
                </label>
                <input
                  type="text"
                  id="usuario-username"
                  name="usuario"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: formErrors.usuario ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="nombre_usuario"
                  required
                  autoComplete="username"
                />
                {formErrors.usuario && (
                  <span style={{color: '#dc3545', fontSize: '12px'}}>{formErrors.usuario}</span>
                )}
                <small style={{display: 'block', marginTop: '3px', color: '#666', fontSize: '12px'}}>
                  Solo letras, números y guiones bajos. Sin espacios.
                </small>
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Nombre completo: *
                </label>
                <input
                  type="text"
                  id="usuario-nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: formErrors.nombre ? '1px solid #dc3545' : '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Juan Pérez"
                  required
                  autoComplete="name"
                />
                {formErrors.nombre && (
                  <span style={{color: '#dc3545', fontSize: '12px'}}>{formErrors.nombre}</span>
                )}
              </div>
              
              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  {editingUsuario ? 'Nueva contraseña (dejar en blanco para mantener actual):' : 'Contraseña: *'}
                </label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="usuario-password"
                    name="password"
                    value={formData.password} // Cambio password_hash por password
                    onChange={(e) => setFormData({...formData, password: e.target.value})} // Cambio password_hash por password
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 10px',
                      border: formErrors.password ? '1px solid #dc3545' : '1px solid #ddd', // Cambio password_hash por password
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Mínimo 6 caracteres"
                    required={!editingUsuario}
                    autoComplete={editingUsuario ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '16px'
                    }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formErrors.password && ( // Cambio password_hash por password
                  <span style={{color: '#dc3545', fontSize: '12px'}}>{formErrors.password}</span> // Cambio password_hash por password
                )}
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Rol:
                  </label>
                  <select
                    id="usuario-rol"
                    name="rol"
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Editor">Editor</option>
                    <option value="Admin">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Estado:
                  </label>
                  <select
                    id="usuario-estado"
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
                  disabled={submitting}
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
                  disabled={submitting}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    backgroundColor: submitting ? '#6c757d' : '#007bff',
                    color: 'white',
                    borderRadius: '5px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {submitting 
                    ? (editingUsuario ? 'Actualizando...' : 'Creando...') 
                    : (editingUsuario ? 'Actualizar' : 'Crear')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaUsuarios;