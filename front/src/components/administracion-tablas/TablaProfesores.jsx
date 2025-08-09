import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfesor, setEditingProfesor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    email: '',
    horario: '',
    estado: 'Activo'
  });

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    try {
      setLoading(true);
      const data = await api.get('/profesores');
      setProfesores(data);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProfesor) {
        await api.put(`/profesores/editar/${editingProfesor.id}`, formData);
      } else {
        await api.post('/profesores/agregar', formData);
      }
      setShowModal(false);
      setEditingProfesor(null);
      setFormData({
        nombre: '',
        especialidad: '',
        telefono: '',
        email: '',
        horario: '',
        estado: 'Activo'
      });
      fetchProfesores();
    } catch (error) {
      console.error('Error al guardar profesor:', error);
      alert('Error al guardar el profesor');
    }
  };

  const handleEdit = (profesor) => {
    setEditingProfesor(profesor);
    setFormData({
      nombre: profesor.nombre,
      especialidad: profesor.especialidad,
      telefono: profesor.telefono || '',
      email: profesor.email || '',
      horario: profesor.horario || '',
      estado: profesor.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este profesor?')) {
      try {
        await api.delete(`/profesores/eliminar/${id}`);
        fetchProfesores();
      } catch (error) {
        console.error('Error al eliminar profesor:', error);
        alert('Error al eliminar el profesor');
      }
    }
  };

  const openAddModal = () => {
    setEditingProfesor(null);
    setFormData({
      nombre: '',
      especialidad: '',
      telefono: '',
      email: '',
      horario: '',
      estado: 'Activo'
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Cargando profesores...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Profesores</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Profesor
        </button>
      </div>
      
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
                  onClick={() => handleDelete(profesor.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar/editar profesor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProfesor ? 'Editar Profesor' : 'Agregar Profesor'}</h3>
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
                <label>Especialidad:</label>
                <input
                  type="text"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Horario:</label>
                <textarea
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                  rows={3}
                  placeholder="Ej: Lunes a Viernes 9:00-17:00"
                />
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