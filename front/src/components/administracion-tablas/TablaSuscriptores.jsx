import { useState, useEffect } from 'react';
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
    estado: 'Pendiente'  // Default según la BD
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
    
    // Validaciones del frontend según las restricciones de la BD
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.fecha_nacimiento) {
      alert('Los campos nombre, email, teléfono y fecha de nacimiento son obligatorios');
      return;
    }

    // Validación de nombre (mínimo 2 caracteres)
    if (formData.nombre.trim().length < 2) {
      alert('El nombre debe tener al menos 2 caracteres');
      return;
    }

    // Validación de email
    if (!formData.email.includes('@')) {
      alert('El email debe tener un formato válido');
      return;
    }

    // Validación de teléfono (mínimo 7 caracteres)
    if (formData.telefono.length < 7) {
      alert('El teléfono debe tener al menos 7 caracteres');
      return;
    }

    // Validación de teléfono de emergencia (si se proporciona, mínimo 7 caracteres)
    if (formData.telefono_emergencia && formData.telefono_emergencia.length < 7) {
      alert('El teléfono de emergencia debe tener al menos 7 caracteres');
      return;
    }

    // Validación de DNI (si se proporciona, mínimo 7 caracteres)
    if (formData.dni && formData.dni.length < 7) {
      alert('El DNI debe tener al menos 7 caracteres');
      return;
    }

    // Validación de fecha de nacimiento
    const fechaNac = new Date(formData.fecha_nacimiento);
    const hoy = new Date();
    if (fechaNac >= hoy) {
      alert('La fecha de nacimiento debe ser anterior a la fecha actual');
      return;
    }

    // Validar edad mínima (5 años)
    const edad = Math.floor((hoy - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
    if (edad < 5) {
      alert('El suscriptor debe tener al menos 5 años');
      return;
    }

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
        estado: 'Pendiente'
      });
      fetchSuscriptores();
    } catch (error) {
      console.error('Error al guardar suscriptor:', error);
      const errorMessage = error.response?.data?.error || 'Error al guardar el suscriptor';
      alert(errorMessage);
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
      estado: suscriptor.estado || 'Pendiente'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const suscriptor = suscriptores.find(s => s.id === id);
    const action = suscriptor?.estado === 'Inactivo' ? 'activar' : 'desactivar';
    
    if (window.confirm(`¿Estás seguro de que quieres ${action} este suscriptor?`)) {
      try {
        if (suscriptor?.estado === 'Inactivo') {
          // Reactivar suscriptor (cambiar estado a Activo)
          await api.put(`/suscriptores/editar/${id}`, {...suscriptor, estado: 'Activo'});
        } else {
          // Desactivar suscriptor
          await api.delete(`/suscriptores/eliminar/${id}`);
        }
        fetchSuscriptores();
      } catch (error) {
        console.error(`Error al ${action} suscriptor:`, error);
        const errorMessage = error.response?.data?.error || `Error al ${action} el suscriptor`;
        alert(errorMessage);
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
      estado: 'Pendiente'
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
                {suscriptor.fecha_creacion ? new Date(suscriptor.fecha_creacion).toLocaleDateString() : '-'}
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
                  {suscriptor.estado === 'Inactivo' ? 'Activar' : 'Desactivar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Modal para agregar/editar suscriptor */}
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
                {editingSuscriptor ? 'Editar Suscriptor' : 'Agregar Suscriptor'}
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
                    Nombre: *
                  </label>
                  <input
                    type="text"
                    id="suscriptor-nombre"
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
                    minLength={2}
                    maxLength={100}
                    required
                    autoComplete="name"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Mínimo 2 caracteres</small>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    DNI:
                  </label>
                  <input
                    type="text"
                    id="suscriptor-dni"
                    name="dni"
                    value={formData.dni}
                    onChange={(e) => setFormData({...formData, dni: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    minLength={7}
                    maxLength={20}
                    placeholder="12345678"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Opcional, mínimo 7 caracteres si se proporciona</small>
                </div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Email: *
                  </label>
                  <input
                    type="email"
                    id="suscriptor-email"
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
                    maxLength={100}
                    required
                    autoComplete="email"
                    placeholder="ejemplo@email.com"
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Teléfono: *
                  </label>
                  <input
                    type="tel"
                    id="suscriptor-telefono"
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
                    minLength={7}
                    maxLength={20}
                    required
                    autoComplete="tel"
                    placeholder="+54 11 1234-5678"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Mínimo 7 caracteres</small>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Fecha de nacimiento: *
                  </label>
                  <input
                    type="date"
                    id="suscriptor-fecha-nacimiento"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]}
                    required
                    autoComplete="bday"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Mínimo 5 años de edad</small>
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Estado:
                  </label>
                  <select
                    id="suscriptor-estado"
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
                    <option value="Pendiente">Pendiente</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Dirección:
                </label>
                <textarea
                  id="suscriptor-direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows={2}
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
                  autoComplete="address"
                  placeholder="Calle, número, ciudad, provincia"
                />
                <small style={{color: '#666', fontSize: '12px'}}>Máximo 200 caracteres</small>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Contacto de emergencia:
                  </label>
                  <input
                    type="text"
                    id="suscriptor-contacto-emergencia"
                    name="contacto_emergencia"
                    value={formData.contacto_emergencia}
                    onChange={(e) => setFormData({...formData, contacto_emergencia: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    maxLength={100}
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                    Teléfono de emergencia:
                  </label>
                  <input
                    type="tel"
                    id="suscriptor-telefono-emergencia"
                    name="telefono_emergencia"
                    value={formData.telefono_emergencia}
                    onChange={(e) => setFormData({...formData, telefono_emergencia: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    minLength={7}
                    maxLength={20}
                    placeholder="+54 11 1234-5678"
                  />
                  <small style={{color: '#666', fontSize: '12px'}}>Mínimo 7 caracteres si se proporciona</small>
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Observaciones:
                </label>
                <textarea
                  id="suscriptor-observaciones"
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