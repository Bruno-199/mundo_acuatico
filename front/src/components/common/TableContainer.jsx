import PropTypes from 'prop-types';

const TableContainer = ({ title, onAdd, children }) => {
  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>{title}</h2>
        <button className="btn-agregar" onClick={onAdd}>
          {`Agregar ${title.replace('Gestión de ', '')}`}
        </button>
      </div>
      {children}
    </div>
  );
};

TableContainer.propTypes = {
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default TableContainer;
