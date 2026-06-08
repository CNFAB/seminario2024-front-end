import React, { useState, useEffect } from 'react';
import { marcaService } from '../../../services/marcaService';
import styles from './Marca.module.css';

const Marcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [formData, setFormData] = useState({ nombre_marca: '' });
  const [formErrors, setFormErrors] = useState({});

  // Limpiar mensajes después de 3 segundos
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
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    try {
      setLoading(true);
      const response = await marcaService.obtenerTodas();

      if (Array.isArray(response)) {
        setMarcas(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setMarcas(response.data);
      } else if (response?.success && response.data) {
        setMarcas(response.data);
      } else {
        setError('Error al cargar marcas');
        setMarcas([]);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
      console.error(err);
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
    if (!formData.nombre_marca.trim()) {
      errors.nombre_marca = 'El nombre de la marca es requerido';
    } else if (formData.nombre_marca.length < 2) {
      errors.nombre_marca = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre_marca.length > 50) {
      errors.nombre_marca = 'El nombre no puede tener más de 50 caracteres';
    }
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

      let response;
      if (editMode && selectedMarca) {
        response = await marcaService.actualizar(selectedMarca.id_marca, {
          marca: formData.nombre_marca
        });
      } else {
        response = await marcaService.crear({
          marca: formData.nombre_marca
        });
      }

      if (response?.success || response?.id_marca) {
        setSuccess(editMode ? '✅ Marca actualizada correctamente' : '✅ Marca creada correctamente');
        await cargarMarcas();
        handleCloseModal();
      } else {
        setError(response?.message || 'Error al guardar la marca');
      }

    } catch (err) {
      setError('Error al guardar la marca');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (marca) => {
    setEditMode(true);
    setSelectedMarca(marca);
    setFormData({ nombre_marca: marca.marca });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (marca) => {
    if (window.confirm(`¿Estás seguro de eliminar la marca "${marca.marca}"?`)) {
      try {
        const response = await marcaService.eliminar(marca.id_marca);
        if (response?.success) {
          setSuccess('🗑️ Marca eliminada correctamente');
          await cargarMarcas();
        } else {
          setError(response?.message || 'Error al eliminar marca');
        }
      } catch (err) {
        setError('Error al eliminar la marca');
        console.error(err);
      }
    }
  };

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedMarca(null);
    setFormData({ nombre_marca: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedMarca(null);
    setFormData({ nombre_marca: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className={styles.marcasLoading}>
        <div className={styles.spinner}></div>
        <p>Cargando marcas...</p>
      </div>
    );
  }

  return (
    <div className={styles.marcasContainer}>
      {/* Header */}
      <div className={styles.marcasHeader}>
        <div>
          <h1 className={styles.marcasTitle}>Marcas</h1>
          <p className={styles.marcasSubtitle}>Gestiona las marcas de dispositivos</p>
        </div>
        <button className={styles.marcasBtnPrimary} onClick={handleCreateNew}>
          <i className="fas fa-plus"></i> Nueva Marca
        </button>
      </div>

      {/* Toast éxito */}
      {success && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          backgroundColor: '#10b981', color: 'white',
          padding: '14px 20px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', fontWeight: '500',
          animation: 'slideIn 0.3s ease'
        }}>
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {/* Toast error */}
      {error && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          backgroundColor: '#ef4444', color: 'white',
          padding: '14px 20px', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '14px', fontWeight: '500'
        }}>
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Tabla */}
      <div className={styles.marcasTableContainer}>
        {marcas.length === 0 ? (
          <div className={styles.marcasEmpty}>
            <i className="fas fa-trademark"></i>
            <p>No hay marcas registradas</p>
            <button className={styles.marcasBtnSecondary} onClick={handleCreateNew}>
              Crear primera marca
            </button>
          </div>
        ) : (
          <table className={styles.marcasTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Modelos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((marca) => (
                <tr key={marca.id_marca}>
                  <td>{marca.id_marca}</td>
                  <td>
                    <div className={styles.marcaName}>
                      <div className={styles.marcaAvatar}>
                        {marca.marca?.charAt(0).toUpperCase() || '?'}
                      </div>
                      {marca.marca}
                    </div>
                  </td>
                  <td>
                    <span className={styles.modelosBadge}>
                      {marca.modelos_count || 0} modelos
                    </span>
                  </td>
                  <td>
                    <div className={styles.marcasActions}>
                      <button className={`${styles.actionBtn} ${styles.actionEdit}`} onClick={() => handleEdit(marca)} title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(marca)} title="Eliminar">
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
        <div className={styles.marcasModalOverlay} onClick={handleCloseModal}>
          <div className={styles.marcasModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.marcasModalHeader}>
              <h3>
                <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                {editMode ? ' Editar Marca' : ' Nueva Marca'}
              </h3>
              <button className={styles.marcasModalClose} onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.marcasModalBody}>
                <div className={styles.marcasFormGroup}>
                  <label>Nombre de la marca <span className={styles.marcasRequired}>*</span></label>
                  <input
                    type="text"
                    name="nombre_marca"
                    value={formData.nombre_marca}
                    onChange={handleInputChange}
                    placeholder="Ej: Samsung, Apple, LG, Xiaomi..."
                    className={formErrors.nombre_marca ? styles.error : ''}
                    autoFocus
                  />
                  {formErrors.nombre_marca && (
                    <span className={styles.marcasErrorMessage}>{formErrors.nombre_marca}</span>
                  )}
                </div>
              </div>
              <div className={styles.marcasModalFooter}>
                <button type="button" className={styles.marcasBtnCancel} onClick={handleCloseModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className={styles.marcasBtnSave} disabled={saving}>
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

export default Marcas;