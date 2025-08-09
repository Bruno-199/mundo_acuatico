import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import '../../css/TablaStyles.css';

const TablaSuscripciones = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [suscriptores, setSuscriptores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSuscripcion, setEditingSuscripcion] = useState(null);
  const [formData, setFormData] = useState({
    suscriptor_id: '',
    horario_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activa',
    monto_mensual: '',
    fecha_ultimo_pago: '',
    metodo_pago: 'Efectivo',
    observaciones: ''
  });

  useEffect(() => {
    fetchSuscripciones();
    fetchSuscriptores();
    fetchHorarios();
  }, []);

  const fetchSuscripciones = async () => {
    try {
      setLoading(true);
      const data = await api.get('/suscripciones');
      setSuscripciones(data);
    } catch (error) {
      console.error('Error al cargar suscripciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuscriptores = async () => {
    try {
      const data = await api.get('/suscriptores');
      setSuscriptores(data);
    } catch (error) {
      console.error('Error al cargar suscriptores:', error);
    }
  };

  const fetchHorarios = async () => {
    try {
      const data = await api.get('/horarios');
      setHorarios(data);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSuscripcion) {
        await api.put(`/suscripciones/editar/${editingSuscripcion.id}`, formData);
      } else {
        await api.post('/suscripciones/agregar', formData);
      }
      setShowModal(false);
      setEditingSuscripcion(null);
      setFormData({
        suscriptor_id: '',
        horario_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'Activa',
        monto_mensual: '',
        fecha_ultimo_pago: '',
        metodo_pago: 'Efectivo',
        observaciones: ''
      });
      fetchSuscripciones();
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
      alert('Error al guardar la suscripción');
    }
  };

  const handleEdit = (suscripcion) => {
    setEditingSuscripcion(suscripcion);
    setFormData({
      suscriptor_id: suscripcion.suscriptor_id,
      horario_id: suscripcion.horario_id,
      fecha_inicio: suscripcion.fecha_inicio ? suscripcion.fecha_inicio.split('T')[0] : '',
      fecha_fin: suscripcion.fecha_fin ? suscripcion.fecha_fin.split('T')[0] : '',
      estado: suscripcion.estado,
      monto_mensual: suscripcion.monto_mensual || '',
      fecha_ultimo_pago: suscripcion.fecha_ultimo_pago ? suscripcion.fecha_ultimo_pago.split('T')[0] : '',
      metodo_pago: suscripcion.metodo_pago || 'Efectivo',
      observaciones: suscripcion.observaciones || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta suscripción?')) {
      try {
        await api.delete(`/suscripciones/eliminar/${id}`);
        fetchSuscripciones();
      } catch (error) {
        console.error('Error al cancelar suscripción:', error);
        alert('Error al cancelar la suscripción');
      }
    }
  };

  const handleRegistrarPago = async (suscripcion) => {
    const fechaPago = new Date().toISOString().split('T')[0];
    const metodoPago = prompt('Método de pago:', suscripcion.metodo_pago || 'Efectivo');
    
    if (metodoPago !== null) {
      try {
        await api.put(`/suscripciones/pago/${suscripcion.id}`, {
          fecha_ultimo_pago: fechaPago,
          metodo_pago: metodoPago
        });
        fetchSuscripciones();
      } catch (error) {
        console.error('Error al registrar pago:', error);
        alert('Error al registrar el pago');
      }
    }
  };

  const openAddModal = () => {
    setEditingSuscripcion(null);
    setFormData({
      suscriptor_id: '',
      horario_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'Activa',
      monto_mensual: '',
      fecha_ultimo_pago: '',
      metodo_pago: 'Efectivo',
      observaciones: ''
    });
    setShowModal(true);
  };

  const calcularDiasSinPago = (fechaUltimoPago) => {
    if (!fechaUltimoPago) return 'Sin pagos';
    const fecha = new Date(fechaUltimoPago);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - fecha);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} días`;
  };

  if (loading) {
    return <div className="loading">Cargando suscripciones...</div>;
  }

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Gestión de Suscripciones</h2>
        <button className="btn-agregar" onClick={openAddModal}>
          Agregar Suscripción
        </button>
      </div>
      
      <table className="tabla-admin">
        <thead>
          <tr>
            <th>ID</th>
            <th>Suscriptor</th>
            <th>Actividad</th>
            <th>Horario</th>
            <th>Estado</th>
            <th>Monto</th>
            <th>Último Pago</th>
            <th>Días sin Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suscripciones.map(suscripcion => (
            <tr key={suscripcion.id}>
              <td>{suscripcion.id}</td>
              <td>
                <div className="suscriptor-info">
                  <div className="nombre">{suscripcion.suscriptor_nombre}</div>
                  <small className="email">{suscripcion.suscriptor_email}</small>
                </div>
              </td>
              <td>{suscripcion.actividad_nombre}</td>
              <td>
                <div className="horario-info">
                  <div className="dias">{suscripcion.dias_semana}</div>
                  <small className="horas">
                    {suscripcion.hora_inicio} - {suscripcion.hora_fin}
                  </small>
                </div>
              </td>
              <td>
                <span className={`estado ${suscripcion.estado.toLowerCase()}`}>
                  {suscripcion.estado}
                </span>
              </td>
              <td>
                {suscripcion.monto_mensual 
                  ? `$${parseFloat(suscripcion.monto_mensual).toFixed(2)}`
                  : '-'
                }
              </td>
              <td>
                {suscripcion.fecha_ultimo_pago 
                  ? new Date(suscripcion.fecha_ultimo_pago).toLocaleDateString()
                  : 'Sin pagos'
                }
              </td>
              <td>
                <span className={`dias-pago ${!suscripcion.fecha_ultimo_pago || calcularDiasSinPago(suscripcion.fecha_ultimo_pago).includes('3') ? 'alerta' : ''}`}>
                  {calcularDiasSinPago(suscripcion.fecha_ultimo_pago)}
                </span>
              </td>
              <td className="acciones">
                <button 
                  className="btn-editar"
                  onClick={() => handleEdit(suscripcion)}
                >
                  Editar
                </button>
                <button 
                  className="btn-pago"
                  onClick={() => handleRegistrarPago(suscripcion)}
                >
                  Pago
                </button>
                <button 
                  className="btn-eliminar"
                  onClick={() => handleDelete(suscripcion.id)}
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar/editar suscripción */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingSuscripcion ? 'Editar Suscripción' : 'Agregar Suscripción'}</h3>
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
                  <label>Suscriptor:</label>
                  <select
                    value={formData.suscriptor_id}
                    onChange={(e) => setFormData({...formData, suscriptor_id: e.target.value})}
                    required
                    disabled={editingSuscripcion} // No permitir cambiar suscriptor al editar
                  >
                    <option value="">Seleccionar suscriptor</option>
                    {suscriptores.map(suscriptor => (
                      <option key={suscriptor.id} value={suscriptor.id}>
                        {suscriptor.nombre} - {suscriptor.dni || 'Sin DNI'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Horario:</label>
                  <select
                    value={formData.horario_id}
                    onChange={(e) => setFormData({...formData, horario_id: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar horario</option>
                    {horarios.map(horario => (
                      <option key={horario.id} value={horario.id}>
                        {horario.actividad_nombre} - {horario.dias_semana} ({horario.hora_inicio}-{horario.hora_fin})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha inicio:</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha fin:</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado:</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="Activa">Activa</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pausada">Pausada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Monto mensual:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monto_mensual}
                    onChange={(e) => setFormData({...formData, monto_mensual: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha último pago:</label>
                  <input
                    type="date"
                    value={formData.fecha_ultimo_pago}
                    onChange={(e) => setFormData({...formData, fecha_ultimo_pago: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Método de pago:</label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Mercado Pago">Mercado Pago</option>
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
                  {editingSuscripcion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaSuscripciones;
