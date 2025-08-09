import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaSuscriptores = () => {
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSuscriptor, setEditingSuscriptor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    fecha_nacimiento: '',
    direccion: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    observaciones: '',
    estado: 'Activo'
  });

  useEffect(() => {
    fetchSuscriptores();
  }, []);

  const fetchSuscriptores = async () => {
    try {
      setLoading(true);
      const data = await api.get('/suscriptores');
      setSuscriptores(data);
    } catch (error) {
      console.error('Error al cargar suscriptores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSuscriptor) {
        await api.put(`/suscriptores/editar/${editingSuscriptor.id}`, formData);
      } else {
        await api.post('/suscriptores/agregar', formData);
      }
      setShowModal(false);
      setEditingSuscriptor(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        dni: '',
        fecha_nacimiento: '',
        direccion: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        observaciones: '',
        estado: 'Activo'
      });
      fetchSuscriptores();
    } catch (error) {
      console.error('Error al guardar suscriptor:', error);
      alert('Error al guardar el suscriptor');
    }
  };

  const handleEdit = (suscriptor) => {
    setEditingSuscriptor(suscriptor);
    setFormData({
      nombre: suscriptor.nombre,
      email: suscriptor.email || '',
      telefono: suscriptor.telefono || '',
      dni: suscriptor.dni || '',
      fecha_nacimiento: suscriptor.fecha_nacimiento ? suscriptor.fecha_nacimiento.split('T')[0] : '',
      direccion: suscriptor.direccion || '',
      contacto_emergencia: suscriptor.contacto_emergencia || '',
      telefono_emergencia: suscriptor.telefono_emergencia || '',
      observaciones: suscriptor.observaciones || '',
      estado: suscriptor.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este suscriptor?')) {
      try {
        await api.delete(`/suscriptores/eliminar/${id}`);
        fetchSuscriptores();
      } catch (error) {
        console.error('Error al eliminar suscriptor:', error);
        alert('Error al eliminar el suscriptor');
      }
    }
  };

  const openAddModal = () => {
    setEditingSuscriptor(null);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      dni: '',
      fecha_nacimiento: '',
      direccion: '',
      contacto_emergencia: '',
      telefono_emergencia: '',
      observaciones: '',
      estado: 'Activo'
    });
    setShowModal(true);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return <div className="loading">Cargando suscriptores...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Suscriptores</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Suscriptor
        </button>
      </div>
      
      <table className="tabla-admin">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>DNI</th>
            <th>Edad</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suscriptores.map(suscriptor => (
            <tr key={suscriptor.id}>
              <td>{suscriptor.id}</td>
              <td>{suscriptor.nombre}</td>
              <td>{suscriptor.email || '-'}</td>
              <td>{suscriptor.telefono || '-'}</td>
              <td>{suscriptor.dni || '-'}</td>
              <td>{calcularEdad(suscriptor.fecha_nacimiento)}</td>
              <td>
                <span className={`estado ${suscriptor.estado.toLowerCase()}`}>
                  {suscriptor.estado}
                </span>
              </td>
              <td>
                {new Date(suscriptor.fecha_registro).toLocaleDateString()}
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(suscriptor)}
                >
                  Editar
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(suscriptor.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar/editar suscriptor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingSuscriptor ? 'Editar Suscriptor' : 'Agregar Suscriptor'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
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
                  <label>DNI:</label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de nacimiento:</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Estado:</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Dirección:</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contacto de emergencia:</label>
                  <input
                    type="text"
                    value={formData.contacto_emergencia}
                    onChange={(e) => setFormData({...formData, contacto_emergencia: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono de emergencia:</label>
                  <input
                    type="tel"
                    value={formData.telefono_emergencia}
                    onChange={(e) => setFormData({...formData, telefono_emergencia: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observaciones:</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {editingSuscriptor ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaSuscriptores;