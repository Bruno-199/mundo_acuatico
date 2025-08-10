import { useState } from 'react';

// Hook personalizado para manejar formularios de tablas
const useTableForm = (initialData, resetData) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditing(null);
    setFormData(resetData || initialData);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditing(item);
    setFormData({ ...resetData, ...item });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(resetData || initialData);
    setFormErrors({});
    setSubmitting(false);
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const setFieldError = (field, error) => {
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setFormErrors({});
  };

  return {
    showModal,
    setShowModal,
    editing,
    setEditing,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    submitting,
    setSubmitting,
    openAddModal,
    openEditModal,
    closeModal,
    updateFormData,
    setFieldError,
    clearErrors
  };
};

// Hook para manejar operaciones CRUD comunes
const useCRUDOperations = (apiEndpoint, fetchDataCallback) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    const message = error.response?.data?.error || error.message || defaultMessage;
    alert(message);
  };

  const createItem = async (data) => {
    try {
      setLoading(true);
      const result = await fetch(`http://localhost:8000${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json());
      
      if (fetchDataCallback) fetchDataCallback();
      return result;
    } catch (error) {
      handleError(error, 'Error al crear el elemento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, data) => {
    try {
      setLoading(true);
      const result = await fetch(`http://localhost:8000${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json());
      
      if (fetchDataCallback) fetchDataCallback();
      return result;
    } catch (error) {
      handleError(error, 'Error al actualizar el elemento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      return;
    }

    try {
      setLoading(true);
      await fetch(`http://localhost:8000${apiEndpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (fetchDataCallback) fetchDataCallback();
    } catch (error) {
      handleError(error, 'Error al eliminar el elemento');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    createItem,
    updateItem,
    deleteItem,
    handleError
  };
};

export { useTableForm, useCRUDOperations };
