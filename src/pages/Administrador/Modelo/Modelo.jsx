import React, { useState, useEffect } from 'react';
import { modeloService } from '../../../services/modeloService';
import { marcaService } from '../../../services/marcaService';
import styles from './Modelo.module.css';

const Modelos = () => {
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState(null);
  const [filtroMarca, setFiltroMarca] = useState('');
  const [formData, setFormData] = useState({
    id_marca: '',
    nombre_modelo: '',
    ram: '',
    almacenamiento: '',
    procesador: '',
    pantalla: '',
    bateria: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [modelosRes, marcasRes] = await Promise.all([
        modeloService.obtenerTodos(),
        marcaService.obtenerTodas(),
      ]);

      let modelosData = [];
      if (modelosRes?.success && Array.isArray(modelosRes.data)) {
        modelosData = modelosRes.data;
      } else if (Array.isArray(modelosRes)) {
        modelosData = modelosRes;
      } else if (modelosRes?.data && Array.isArray(modelosRes.data)) {
        modelosData = modelosRes.data;
      }

      let marcasData = [];
      if (Array.isArray(marcasRes)) {
        marcasData = marcasRes;
      } else if (marcasRes?.success && Array.isArray(marcasRes.data)) {
        marcasData = marcasRes.data;
      } else if (marcasRes?.data && Array.isArray(marcasRes.data)) {
        marcasData = marcasRes.data;
      }

      const marcasNormalizadas = marcasData.map((marca) => ({
        ...marca,
        nombre_marca: marca.marca || marca.nombre_marca || marca.nombre || 'Sin nombre',
      }));

      setModelos(modelosData);
      setMarcas(marcasNormalizadas);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError('Error al conectar con el servidor');
      setModelos([]);
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.id_marca) errors.id_marca = 'Seleccione una marca';

    if (!formData.nombre_modelo?.trim()) {
      errors.nombre_modelo = 'El nombre del modelo es requerido';
    } else if (formData.nombre_modelo.length > 100) {
      errors.nombre_modelo = 'El nombre no puede tener más de 100 caracteres';
    }

    if (formData.ram && (formData.ram < 1 || formData.ram > 128))
      errors.ram = 'RAM debe ser entre 1 y 128 GB';

    if (formData.almacenamiento && (formData.almacenamiento < 1 || formData.almacenamiento > 1024))
      errors.almacenamiento = 'Almacenamiento debe ser entre 1 y 1024 GB';

    if (formData.procesador && formData.procesador.length > 100)
      errors.procesador = 'El procesador no puede tener más de 100 caracteres';

    if (formData.pantalla && formData.pantalla.length > 50)
      errors.pantalla = 'La pantalla no puede tener más de 50 caracteres';

    if (formData.bateria && (formData.bateria < 1 || formData.bateria > 11000))
      errors.bateria = 'Batería debe ser entre 1 y 11000 mAh';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const dataToSend = {
        id_marca: parseInt(formData.id_marca),
        nombre_modelo: formData.nombre_modelo.trim(),
        ram: formData.ram ? parseInt(formData.ram) : null,
        almacenamiento: formData.almacenamiento ? parseInt(formData.almacenamiento) : null,
        procesador: formData.procesador?.trim() || null,
        pantalla: formData.pantalla?.trim() || null,
        bateria: formData.bateria ? parseInt(formData.bateria) : null,
      };

      let response;
      if (editMode && selectedModelo) {
        response = await modeloService.actualizar(selectedModelo.id_modelo, dataToSend);
      } else {
        response = await modeloService.crear(dataToSend);
      }

      if (response && (response.id_modelo || response.success)) {
        setSuccess(
          editMode ? '✅ Modelo actualizado correctamente' : '✅ Modelo creado correctamente'
        );
        await cargarDatos();
        handleCloseModal();
      } else {
        setError(response?.message || 'Error al guardar el modelo');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el modelo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (modelo) => {
    setEditMode(true);
    setSelectedModelo(modelo);
    setFormData({
      id_marca: modelo.id_marca || '',
      nombre_modelo: modelo.nombre_modelo || '',
      ram: modelo.ram || '',
      almacenamiento: modelo.almacenamiento || '',
      procesador: modelo.procesador || '',
      pantalla: modelo.pantalla || '',
      bateria: modelo.bateria || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (modelo) => {
    if (window.confirm(`¿Estás seguro de eliminar el modelo "${modelo.nombre_modelo}"?`)) {
      try {
        const response = await modeloService.eliminar(modelo.id_modelo);
        if (response?.success) {
          setSuccess('🗑️ Modelo eliminado correctamente');
          await cargarDatos();
        } else {
          setError(response?.message || 'Error al eliminar modelo');
        }
      } catch (err) {
        console.error('❌ Error al eliminar:', err);
        setError(err.response?.data?.message || 'Error al eliminar el modelo');
      }
    }
  };

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedModelo(null);
    setFormData({
      id_marca: '',
      nombre_modelo: '',
      ram: '',
      almacenamiento: '',
      procesador: '',
      pantalla: '',
      bateria: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedModelo(null);
    setFormErrors({});
  };

  const modelosFiltrados = filtroMarca
    ? modelos.filter((m) => m.id_marca === parseInt(filtroMarca))
    : modelos;

  const getMarcaNombre = (idMarca) => {
    const marca = marcas.find((m) => m.id_marca === idMarca);
    return marca?.nombre_marca || 'Desconocida';
  };

  if (loading) {
    return (
      <div className={styles.modelosLoading}>
        <div className={styles.spinner}></div>
        <p>Cargando modelos...</p>
      </div>
    );
  }

  return (
    <div className={styles.modelosContainer}>
      {/* Header */}
      <div className={styles.modelosHeader}>
        <div>
          <h1 className={styles.modelosTitle}>Modelos</h1>
          <p className={styles.modelosSubtitle}>
            Gestiona los modelos de dispositivos con sus especificaciones técnicas
          </p>
        </div>
        <button className={styles.modelosBtnPrimary} onClick={handleCreateNew}>
          <i className="fas fa-plus"></i> Nuevo Modelo
        </button>
      </div>

      {/* Toast éxito */}
      {success && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#10b981',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            animation: 'slideIn 0.3s ease',
          }}
        >
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {/* Toast error */}
      {error && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Filtro */}
      {marcas.length > 0 && (
        <div className={styles.modelosFiltro}>
          <label>Filtrar por marca:</label>
          <select
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
            className={styles.filtroSelect}
          >
            <option value="">Todas las marcas ({modelos.length})</option>
            {marcas.map((marca) => {
              const count = modelos.filter((m) => m.id_marca === marca.id_marca).length;
              return (
                <option key={marca.id_marca} value={marca.id_marca}>
                  {marca.nombre_marca} ({count})
                </option>
              );
            })}
          </select>
          {filtroMarca && (
            <button className={styles.filtroClear} onClick={() => setFiltroMarca('')}>
              <i className="fas fa-times"></i> Limpiar filtro
            </button>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className={styles.modelosTableContainer}>
        {modelosFiltrados.length === 0 ? (
          <div className={styles.modelosEmpty}>
            <i className="fas fa-microchip"></i>
            <p>{filtroMarca ? 'No hay modelos para esta marca' : 'No hay modelos registrados'}</p>
            <button className={styles.modelosBtnSecondary} onClick={handleCreateNew}>
              Crear primer modelo
            </button>
          </div>
        ) : (
          <table className={styles.modelosTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>RAM</th>
                <th>Almacenamiento</th>
                <th>Procesador</th>
                <th>Pantalla</th>
                <th>Batería</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modelosFiltrados.map((modelo) => (
                <tr key={modelo.id_modelo}>
                  <td>{modelo.id_modelo}</td>
                  <td>
                    <span className={styles.marcaBadge}>
                      {modelo.marca?.marca || getMarcaNombre(modelo.id_marca)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.modeloNombre}>
                      <strong>{modelo.nombre_modelo}</strong>
                    </div>
                  </td>
                  <td className={styles.specCell}>{modelo.ram ? `${modelo.ram} GB` : '-'}</td>
                  <td className={styles.specCell}>
                    {modelo.almacenamiento ? `${modelo.almacenamiento} GB` : '-'}
                  </td>
                  <td className={styles.procesadorCell} title={modelo.procesador || ''}>
                    {modelo.procesador || '-'}
                  </td>
                  <td className={styles.specCell}>{modelo.pantalla || '-'}</td>
                  <td className={styles.specCell}>
                    {modelo.bateria ? `${modelo.bateria} mAh` : '-'}
                  </td>
                  <td>
                    <div className={styles.modelosActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.actionEdit}`}
                        onClick={() => handleEdit(modelo)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                        onClick={() => handleDelete(modelo)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modelosModalOverlay} onClick={handleCloseModal}>
          <div className={styles.modelosModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modelosModalHeader}>
              <h3>
                <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                {editMode ? ' Editar Modelo' : ' Nuevo Modelo'}
              </h3>
              <button className={styles.modelosModalClose} onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modelosModalBody}>
                <div className={styles.modelosFormGroup}>
                  <label>
                    Marca <span className={styles.modelosRequired}>*</span>
                  </label>
                  <select
                    name="id_marca"
                    value={formData.id_marca}
                    onChange={handleInputChange}
                    className={formErrors.id_marca ? styles.error : ''}
                  >
                    <option value="">Seleccionar marca</option>
                    {marcas.map((marca) => (
                      <option key={marca.id_marca} value={marca.id_marca}>
                        {marca.nombre_marca}
                      </option>
                    ))}
                  </select>
                  {formErrors.id_marca && (
                    <span className={styles.modelosErrorMessage}>{formErrors.id_marca}</span>
                  )}
                </div>

                <div className={styles.modelosFormGroup}>
                  <label>
                    Nombre del modelo <span className={styles.modelosRequired}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre_modelo"
                    value={formData.nombre_modelo}
                    onChange={handleInputChange}
                    placeholder="Ej: Galaxy S24 Ultra, iPhone 15 Pro Max"
                    className={formErrors.nombre_modelo ? styles.error : ''}
                  />
                  {formErrors.nombre_modelo && (
                    <span className={styles.modelosErrorMessage}>{formErrors.nombre_modelo}</span>
                  )}
                </div>

                <div className={styles.modelosFormRow}>
                  <div className={styles.modelosFormGroup}>
                    <label>RAM (GB)</label>
                    <input
                      type="number"
                      name="ram"
                      value={formData.ram}
                      onChange={handleInputChange}
                      placeholder="4, 6, 8, 12, 16..."
                      min="1"
                      max="128"
                    />
                    {formErrors.ram && (
                      <span className={styles.modelosErrorMessage}>{formErrors.ram}</span>
                    )}
                  </div>
                  <div className={styles.modelosFormGroup}>
                    <label>Almacenamiento (GB)</label>
                    <input
                      type="number"
                      name="almacenamiento"
                      value={formData.almacenamiento}
                      onChange={handleInputChange}
                      placeholder="64, 128, 256, 512..."
                      min="1"
                      max="1024"
                    />
                    {formErrors.almacenamiento && (
                      <span className={styles.modelosErrorMessage}>
                        {formErrors.almacenamiento}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.modelosFormRow}>
                  <div className={styles.modelosFormGroup}>
                    <label>Procesador</label>
                    <input
                      type="text"
                      name="procesador"
                      value={formData.procesador}
                      onChange={handleInputChange}
                      placeholder="Ej: Snapdragon 8 Gen 3, A17 Pro"
                    />
                    {formErrors.procesador && (
                      <span className={styles.modelosErrorMessage}>{formErrors.procesador}</span>
                    )}
                  </div>
                  <div className={styles.modelosFormGroup}>
                    <label>Pantalla</label>
                    <input
                      type="text"
                      name="pantalla"
                      value={formData.pantalla}
                      onChange={handleInputChange}
                      placeholder="Ej: 6.8 pulgadas Dynamic AMOLED"
                    />
                    {formErrors.pantalla && (
                      <span className={styles.modelosErrorMessage}>{formErrors.pantalla}</span>
                    )}
                  </div>
                </div>

                <div className={styles.modelosFormGroup}>
                  <label>Batería (mAh)</label>
                  <input
                    type="number"
                    name="bateria"
                    value={formData.bateria}
                    onChange={handleInputChange}
                    placeholder="Ej: 4000, 4500, 5000"
                    min="1"
                    max="11000"
                  />
                  {formErrors.bateria && (
                    <span className={styles.modelosErrorMessage}>{formErrors.bateria}</span>
                  )}
                </div>
              </div>
              <div className={styles.modelosModalFooter}>
                <button
                  type="button"
                  className={styles.modelosBtnCancel}
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.modelosBtnSave} disabled={saving}>
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {editMode ? ' Actualizando...' : ' Guardando...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'}`}></i>
                      {editMode ? ' Actualizar' : ' Guardar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modelos;
