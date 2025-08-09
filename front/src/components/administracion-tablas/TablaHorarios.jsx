import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaHorarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [formData, setFormData] = useState({
    actividad_id: '',
    profesor_id: '',
    dias_semana: '',
    hora_inicio: '',
    hora_fin: '',
    cupo_maximo: '',
    observaciones: '',
    activo: true
  });

  useEffect(() => {
    fetchHorarios();
    fetchActividades();
    fetchProfesores();
  }, []);

  const fetchHorarios = async () => {
    try {
      setLoading(true);
      const data = await api.get('/horarios');
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActividades = async () => {
    try {
      const data = await api.get('/actividades');
      setActividades(data);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    }
  };

  const fetchProfesores = async () => {
    try {
      const data = await api.get('/profesores');
      setProfesores(data);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHorario) {
        await api.put(`/horarios/editar/${editingHorario.id}`, formData);
      } else {
        await api.post('/horarios/agregar', formData);
      }
      setShowModal(false);
      setEditingHorario(null);
      setFormData({
        actividad_id: '',
        profesor_id: '',
        dias_semana: '',
        hora_inicio: '',
        hora_fin: '',
        cupo_maximo: '',
        observaciones: '',
        activo: true
      });
      fetchHorarios();
    } catch (error) {
      console.error('Error al guardar horario:', error);
      alert('Error al guardar el horario');
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      actividad_id: horario.actividad_id,
      profesor_id: horario.profesor_id,
      dias_semana: horario.dias_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      cupo_maximo: horario.cupo_maximo,
      observaciones: horario.observaciones || '',
      activo: horario.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este horario?')) {
      try {
        await api.delete(`/horarios/eliminar/${id}`);
        fetchHorarios();
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        alert('Error al eliminar el horario');
      }
    }
  };

  const openAddModal = () => {
    setEditingHorario(null);
    setFormData({
      actividad_id: '',
      profesor_id: '',
      dias_semana: '',
      hora_inicio: '',
      hora_fin: '',
      cupo_maximo: '',
      observaciones: '',
      activo: true
    });
    setShowModal(true);
  };

  const formatDiasSemana = (dias) => {
    const diasMap = {
      'Lunes': 'L',
      'Martes': 'M',
      'Miércoles': 'X',
      'Miercoles': 'X',
      'Jueves': 'J',
      'Viernes': 'V',
      'Sábado': 'S',
      'Sabado': 'S',
      'Domingo': 'D'
    };
    
    return dias.split(',').map(dia => diasMap[dia.trim()] || dia.trim()).join(', ');
  };

  if (loading) {
    return <div className="loading">Cargando horarios...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Horarios</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Horario
        </button>
      </div>
      
      <table className="tabla-admin">
        <thead>
          <tr>
            <th>ID</th>
            <th>Actividad</th>
            <th>Profesor</th>
            <th>Días</th>
            <th>Horario</th>
            <th>Cupo</th>
            <th>Inscriptos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {horarios.map(horario => (
            <tr key={horario.id}>
              <td>{horario.id}</td>
              <td>{horario.actividad_nombre}</td>
              <td>{horario.profesor_nombre}</td>
              <td>
                <span className="dias-semana">
                  {formatDiasSemana(horario.dias_semana)}
                </span>
              </td>
              <td>
                <span className="horario-tiempo">
                  {horario.hora_inicio} - {horario.hora_fin}
                </span>
              </td>
              <td>{horario.cupo_maximo}</td>
              <td>
                <span className={`inscriptos ${horario.suscripciones_actuales >= horario.cupo_maximo ? 'completo' : ''}`}>
                  {horario.suscripciones_actuales || 0}
                </span>
              </td>
              <td>
                <span className={`estado ${horario.activo ? 'activo' : 'inactivo'}`}>
                  {horario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(horario)}
                >
                  Editar
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(horario.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar/editar horario */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingHorario ? 'Editar Horario' : 'Agregar Horario'}</h3>
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
                  <label>Actividad:</label>
                  <select
                    value={formData.actividad_id}
                    onChange={(e) => setFormData({...formData, actividad_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar actividad</option>
                    {actividades.map(actividad => (
                      <option key={actividad.id} value={actividad.id}>
                        {actividad.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Profesor:</label>
                  <select
                    value={formData.profesor_id}
                    onChange={(e) => setFormData({...formData, profesor_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar profesor</option>
                    {profesores.map(profesor => (
                      <option key={profesor.id} value={profesor.id}>
                        {profesor.nombre} - {profesor.especialidad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Días de la semana:</label>
                <input
                  type="text"
                  value={formData.dias_semana}
                  onChange={(e) => setFormData({...formData, dias_semana: e.target.value})}
                  placeholder="Ej: Lunes, Miércoles, Viernes"
                  required
                />
                <small>Separar días con comas</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Hora inicio:</label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hora fin:</label>
                  <input
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cupo máximo:</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cupo_maximo}
                    onChange={(e) => setFormData({...formData, cupo_maximo: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Estado:</label>
                  <select
                    value={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Observaciones:</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {editingHorario ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaHorarios;
