import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    password_hash: '',
    rol: 'Empleado',
    estado: 'Activo'
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await api.get('/usuarios');
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUsuario) {
        // Al editar, no enviamos password_hash si está vacío
        const updateData = { ...formData };
        if (!updateData.password_hash) {
          delete updateData.password_hash;
        }
        await api.put(`/usuarios/editar/${editingUsuario.id}`, updateData);
      } else {
        // Al crear, password_hash es requerido
        if (!formData.password_hash) {
          alert('La contraseña es requerida');
          return;
        }
        await api.post('/usuarios/agregar', formData);
      }
      setShowModal(false);
      setEditingUsuario(null);
      setFormData({
        usuario: '',
        nombre: '',
        password_hash: '',
        rol: 'Empleado',
        estado: 'Activo'
      });
      fetchUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar el usuario');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      password_hash: '', // No mostrar contraseña actual
      rol: usuario.rol,
      estado: usuario.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      try {
        await api.delete(`/usuarios/eliminar/${id}`);
        fetchUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const openAddModal = () => {
    setEditingUsuario(null);
    setFormData({
      usuario: '',
      nombre: '',
      password_hash: '',
      rol: 'Empleado',
      estado: 'Activo'
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Usuario
        </button>
      </div>
      
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
                  onClick={() => handleDelete(usuario.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar/editar usuario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUsuario ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Usuario:</label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                  required
                />
              </div>
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
                <label>
                  {editingUsuario ? 'Nueva contraseña (dejar en blanco para mantener actual):' : 'Contraseña:'}
                </label>
                <input
                  type="password"
                  value={formData.password_hash}
                  onChange={(e) => setFormData({...formData, password_hash: e.target.value})}
                  required={!editingUsuario}
                />
              </div>
              <div className="form-group">
                <label>Rol:</label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                >
                  <option value="Empleado">Empleado</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {editingUsuario ? 'Actualizar' : 'Crear'}
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