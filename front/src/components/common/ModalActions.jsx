const ModalActions = ({ 
  onCancel, 
  onSubmit, 
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  isEditing = false,
  submitting = false 
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      borderTop: '1px solid #eee',
      paddingTop: '20px',
      marginTop: '20px'
    }}>
      <button 
        type="button" 
        onClick={onCancel}
        disabled={submitting}
        style={{
          padding: '10px 20px',
          border: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          color: '#333',
          borderRadius: '5px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {cancelText}
      </button>
      <button 
        type="submit"
        disabled={submitting}
        style={{
          padding: '10px 20px',
          border: 'none',
          backgroundColor: submitting ? '#6c757d' : '#007bff',
          color: 'white',
          borderRadius: '5px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {submitting 
          ? (isEditing ? 'Actualizando...' : 'Creando...') 
          : (isEditing ? 'Actualizar' : submitText)
        }
      </button>
    </div>
  );
};

export default ModalActions;
