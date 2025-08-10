import PropTypes from 'prop-types';

const FormField = ({ 
  type = 'text',
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  error,
  options = [],
  rows,
  style = {},
  disabled = false,
  autoComplete,
  step,
  min,
  max
}) => {
  const baseInputStyle = {
    width: '100%',
    padding: '10px',
    border: error ? '1px solid #dc3545' : '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: disabled ? '#f5f5f5' : 'white',
    ...style
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const containerStyle = {
    marginBottom: '15px'
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows || 3}
            style={{...baseInputStyle, resize: 'vertical'}}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            style={baseInputStyle}
            disabled={disabled}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            style={baseInputStyle}
            disabled={disabled}
            autoComplete={autoComplete}
            step={step}
            min={min}
            max={max}
          />
        );
    }
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label} {required && '*'}
        </label>
      )}
      {renderInput()}
      {error && (
        <span style={{color: '#dc3545', fontSize: '12px'}}>{error}</span>
      )}
    </div>
  );
};

FormField.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.array,
  rows: PropTypes.number,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
  step: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FormField;
