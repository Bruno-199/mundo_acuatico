import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import '../css/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Realizar petición de login a la API
      const response = await api.post('/usuarios/login', {
        usuario: credentials.username,
        password: credentials.password
      });

      if (response && response.id) {
        const user = response;
        // Guardar información del usuario en localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          usuario: user.usuario,
          nombre: user.nombre,
          rol: user.rol
        }));
        // Forzar la recarga para actualizar el estado del Navbar
        window.location.href = '/admin';
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      if (error.message && error.message.includes('401')) {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError('Error al conectar con el servidor. Intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        {error && <div className="error-message">{error}</div>}
        <div>
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={credentials.username}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={credentials.password}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Iniciando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;