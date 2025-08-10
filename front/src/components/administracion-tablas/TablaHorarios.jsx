import { useState, useEffect } from 'react';
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
    cupo_maximo: 20, // Default según la BD
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
    
    // Validaciones del frontend según las restricciones de la BD
    if (!formData.actividad_id || !formData.profesor_id || !formData.dias_semana || 
        !formData.hora_inicio || !formData.hora_fin) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validación del cupo máximo (1-50)
    const cupo = parseInt(formData.cupo_maximo) || 20;
    if (cupo < 1 || cupo > 50) {
      alert('El cupo máximo debe estar entre 1 y 50 personas');
      return;
    }

    // Validación de días de la semana (mínimo 5 caracteres)
    if (formData.dias_semana.length < 5) {
      alert('Los días de la semana deben tener al menos 5 caracteres (ej: Lunes)');
      return;
    }

    // Validación de horarios
    if (formData.hora_inicio >= formData.hora_fin) {
      alert('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    // Validación de observaciones (máximo 200 caracteres)
    if (formData.observaciones && formData.observaciones.length > 200) {
      alert('Las observaciones no pueden exceder 200 caracteres');
      return;
    }

    try {
      // Asegurar que cupo_maximo tenga un valor válido
      const dataToSend = {
        ...formData,
        cupo_maximo: cupo
      };

      if (editingHorario) {
        await api.put(`/horarios/editar/${editingHorario.id}`, dataToSend);
      } else {
        await api.post('/horarios/agregar', dataToSend);
      }
      setShowModal(false);
      setEditingHorario(null);
      setFormData({
        actividad_id: '',
        profesor_id: '',
        dias_semana: '',
        hora_inicio: '',
        hora_fin: '',
        cupo_maximo: 20,
        observaciones: '',
        activo: true
      });
      fetchHorarios();
    } catch (error) {
      console.error('Error al guardar horario:', error);
      const errorMessage = error.response?.data?.error || 'Error al guardar el horario';
      alert(errorMessage);
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
      cupo_maximo: horario.cupo_maximo || 20,
      observaciones: horario.observaciones || '',
      activo: Boolean(horario.activo) // Asegurar que sea booleano
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const horario = horarios.find(h => h.id === id);
    const action = horario?.activo ? 'desactivar' : 'activar';
    
    if (window.confirm(`¿Estás seguro de que quieres ${action} este horario?`)) {
      try {
        if (horario?.activo) {
          // Desactivar horario
          await api.delete(`/horarios/eliminar/${id}`);
        } else {
          // Activar horario (cambiar activo a true)
          await api.put(`/horarios/editar/${id}`, {...horario, activo: true});
        }
        fetchHorarios();
      } catch (error) {
        console.error(`Error al ${action} horario:`, error);
        const errorMessage = error.response?.data?.error || `Error al ${action} el horario`;
        alert(errorMessage);
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
      cupo_maximo: 20,
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
                  {horario.activo ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal para agregar/editar horario */}
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
                {editingHorario ? 'Editar Horario' : 'Agregar Horario'}
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
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Actividad: *
                  </label>
                  <select
                    id="horario-actividad"
                    name="actividad_id"
                    value={formData.actividad_id}
                    onChange={(e) => setFormData({...formData, actividad_id: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
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
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Profesor: *
                  </label>
                  <select
                    id="horario-profesor"
                    name="profesor_id"
                    value={formData.profesor_id}
                    onChange={(e) => setFormData({...formData, profesor_id: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
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

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Días de la semana: *
                </label>
                <input
                  type="text"
                  id="horario-dias"
                  name="dias_semana"
                  value={formData.dias_semana}
                  onChange={(e) => setFormData({...formData, dias_semana: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ej: Lunes, Miércoles, Viernes"
                  minLength={5}
                  maxLength={50}
                  required
                />
                <small style={{color: '#666', fontSize: '12px'}}>
                  Separar días con comas. Mínimo 5 caracteres (ej: Lunes)
                </small>
                <div style={{marginTop: '8px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, dias_semana: 'Lunes, Miércoles, Viernes'})}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    L-M-V
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, dias_semana: 'Martes, Jueves'})}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    M-J
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, dias_semana: 'Sábado'})}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Sábado
                  </button>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Hora inicio: *
                  </label>
                  <input
                    type="time"
                    id="horario-hora-inicio"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Hora fin: *
                  </label>
                  <input
                    type="time"
                    id="horario-hora-fin"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Cupo máximo: *
                  </label>
                  <input
                    type="number"
                    id="horario-cupo"
                    name="cupo_maximo"
                    min="1"
                    max="50"
                    value={formData.cupo_maximo}
                    onChange={(e) => setFormData({...formData, cupo_maximo: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>
                    Entre 1 y 50 personas (default: 20)
                  </small>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Estado:
                  </label>
                  <select
                    id="horario-estado"
                    name="activo"
                    value={formData.activo ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, activo: e.target.value === 'true'})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Observaciones:
                </label>
                <textarea
                  id="horario-observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows={3}
                  maxLength={200}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Observaciones adicionales..."
                />
                <small style={{color: '#666', fontSize: '12px'}}>
                  Máximo 200 caracteres ({formData.observaciones.length}/200)
                </small>
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
