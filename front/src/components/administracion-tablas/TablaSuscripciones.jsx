import { useState, useEffect } from 'react';
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
    estado: 'Pendiente',  // Default según la BD
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
      // Filtrar solo horarios activos para nuevas suscripciones
      setHorarios(data.filter(horario => horario.activo));
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones del frontend según las restricciones de la BD
    if (!formData.suscriptor_id || !formData.horario_id || formData.monto_mensual === '') {
      alert('Los campos suscriptor, horario y monto mensual son obligatorios');
      return;
    }

    // Validación de monto (debe ser >= 0)
    if (parseFloat(formData.monto_mensual) < 0) {
      alert('El monto mensual debe ser mayor o igual a 0');
      return;
    }

    // Validación de fecha de último pago (no puede ser futura)
    if (formData.fecha_ultimo_pago) {
      const fechaPago = new Date(formData.fecha_ultimo_pago);
      const hoy = new Date();
      if (fechaPago > hoy) {
        alert('La fecha de último pago no puede ser futura');
        return;
      }
    }

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
        estado: 'Pendiente',
        monto_mensual: '',
        fecha_ultimo_pago: '',
        metodo_pago: 'Efectivo',
        observaciones: ''
      });
      fetchSuscripciones();
    } catch (error) {
      console.error('Error al guardar suscripción:', error);
      const errorMessage = error.response?.data?.error || 'Error al guardar la suscripción';
      alert(errorMessage);
    }
  };

  const handleEdit = (suscripcion) => {
    setEditingSuscripcion(suscripcion);
    setFormData({
      suscriptor_id: suscripcion.suscriptor_id,
      horario_id: suscripcion.horario_id,
      estado: suscripcion.estado || 'Pendiente',
      monto_mensual: suscripcion.monto_mensual || '',
      fecha_ultimo_pago: suscripcion.fecha_ultimo_pago ? suscripcion.fecha_ultimo_pago.split('T')[0] : '',
      metodo_pago: suscripcion.metodo_pago || 'Efectivo',
      observaciones: suscripcion.observaciones || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const suscripcion = suscripciones.find(s => s.id === id);
    const action = suscripcion?.estado === 'Cancelada' ? 'reactivar' : 'cancelar';
    
    if (window.confirm(`¿Estás seguro de que quieres ${action} esta suscripción?`)) {
      try {
        if (suscripcion?.estado === 'Cancelada') {
          // Reactivar suscripción (cambiar estado a Activa)
          await api.put(`/suscripciones/editar/${id}`, {...suscripcion, estado: 'Activa'});
        } else {
          // Cancelar suscripción
          await api.delete(`/suscripciones/eliminar/${id}`);
        }
        fetchSuscripciones();
      } catch (error) {
        console.error(`Error al ${action} suscripción:`, error);
        const errorMessage = error.response?.data?.error || `Error al ${action} la suscripción`;
        alert(errorMessage);
      }
    }
  };

  const handleRegistrarPago = async (suscripcion) => {
    const fechaPago = new Date().toISOString().split('T')[0];
    const metodoPago = prompt('Método de pago (Efectivo/Transferencia/Tarjeta):', suscripcion.metodo_pago || 'Efectivo');
    
    if (metodoPago !== null) {
      const metodosValidos = ['Efectivo', 'Transferencia', 'Tarjeta'];
      if (!metodosValidos.includes(metodoPago)) {
        alert('Método de pago no válido. Debe ser: Efectivo, Transferencia o Tarjeta');
        return;
      }
      
      try {
        await api.put(`/suscripciones/pago/${suscripcion.id}`, {
          fecha_ultimo_pago: fechaPago,
          metodo_pago: metodoPago
        });
        fetchSuscripciones();
      } catch (error) {
        console.error('Error al registrar pago:', error);
        const errorMessage = error.response?.data?.error || 'Error al registrar el pago';
        alert(errorMessage);
      }
    }
  };

  const openAddModal = () => {
    setEditingSuscripcion(null);
    setFormData({
      suscriptor_id: '',
      horario_id: '',
      estado: 'Pendiente',
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
                  {suscripcion.estado === 'Cancelada' ? 'Reactivar' : 'Cancelar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal para agregar/editar suscripción */}
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
                {editingSuscripcion ? 'Editar Suscripción' : 'Agregar Suscripción'}
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
                    Suscriptor: *
                  </label>
                  <select
                    id="suscripcion-suscriptor"
                    name="suscriptor_id"
                    value={formData.suscriptor_id}
                    onChange={(e) => setFormData({...formData, suscriptor_id: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: editingSuscripcion ? '#f5f5f5' : 'white'
                    }}
                    required
                    disabled={editingSuscripcion}
                  >
                    <option value="">Seleccionar suscriptor</option>
                    {suscriptores.map(suscriptor => (
                      <option key={suscriptor.id} value={suscriptor.id}>
                        {suscriptor.nombre} - {suscriptor.dni || 'Sin DNI'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Horario: *
                  </label>
                  <select
                    id="suscripcion-horario"
                    name="horario_id"
                    value={formData.horario_id}
                    onChange={(e) => setFormData({...formData, horario_id: e.target.value})}
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
                    <option value="">Seleccionar horario</option>
                    {horarios.map(horario => (
                      <option key={horario.id} value={horario.id}>
                        {horario.actividad_nombre} - {horario.dias_semana} ({horario.hora_inicio}-{horario.hora_fin}) 
                        - Cupo: {horario.suscripciones_actuales || 0}/{horario.cupo_maximo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Estado:
                  </label>
                  <select
                    id="suscripcion-estado"
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
                    <option value="Activa">Activa</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Vencida">Vencida</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Monto mensual: * ($)
                  </label>
                  <input
                    type="number"
                    id="suscripcion-monto"
                    name="monto_mensual"
                    step="0.01"
                    min="0"
                    value={formData.monto_mensual}
                    onChange={(e) => setFormData({...formData, monto_mensual: e.target.value})}
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
                  <small style={{color: '#666', fontSize: '12px'}}>Debe ser mayor o igual a 0</small>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Fecha último pago:
                  </label>
                  <input
                    type="date"
                    id="suscripcion-ultimo-pago"
                    name="fecha_ultimo_pago"
                    value={formData.fecha_ultimo_pago}
                    onChange={(e) => setFormData({...formData, fecha_ultimo_pago: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>No puede ser fecha futura</small>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Método de pago:
                  </label>
                  <select
                    id="suscripcion-metodo-pago"
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({...formData, metodo_pago: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Observaciones:
                </label>
                <textarea
                  id="suscripcion-observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  rows={3}
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
