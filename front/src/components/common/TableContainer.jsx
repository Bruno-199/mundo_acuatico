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

export default TableContainer;
