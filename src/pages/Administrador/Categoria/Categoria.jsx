import React, { useState, useEffect } from 'react';
import { categoriaService } from '../../../services/CategoriaService';
import styles from './Categoria.module.css';

const Categoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [formData, setFormData] = useState({
    categoria: '',
    mano_obra: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

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
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await categoriaService.obtenerTodas();
      const data = response?.data || response || [];
      setCategorias(data);
    } catch (err) {
      setError('Error al cargar las categorías');
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
    
    if (!formData.categoria.trim()) {
      errors.categoria = 'El nombre de la categoría es requerido';
    } else if (formData.categoria.length < 2) {
      errors.categoria = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.categoria.length > 50) {
      errors.categoria = 'El nombre no puede tener más de 50 caracteres';
    }
    
    if (formData.mano_obra) {
      const manoObraNum = parseFloat(formData.mano_obra);
      if (isNaN(manoObraNum)) {
        errors.mano_obra = 'La mano de obra debe ser un número válido';
      } else if (manoObraNum < 0) {
        errors.mano_obra = 'La mano de obra no puede ser negativa';
      }
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

      const dataToSend = {
        categoria: formData.categoria.trim(),
        ...(formData.mano_obra !== '' && { mano_obra: parseFloat(formData.mano_obra) })
      };

      let response;
      if (editMode && selectedCategoria) {
        response = await categoriaService.actualizar(
          selectedCategoria.id_categoria,
          dataToSend
        );
      } else {
        response = await categoriaService.crear(dataToSend);
      }

      if (response?.status === 200 || response?.status === 201 || response?.data) {
        setSuccess(
          editMode 
            ? '✅ Categoría actualizada correctamente' 
            : '✅ Categoría creada correctamente'
        );
        await cargarCategorias();
        handleCloseModal();
      } else {
        setError(response?.data?.message || 'Error al guardar la categoría');
      }

    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || 'Error al guardar la categoría';
      setError(errorMessage);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditMode(true);
    setSelectedCategoria(categoria);
    setFormData({
      categoria: categoria.categoria,
      mano_obra: categoria.mano_obra !== null && categoria.mano_obra !== undefined 
        ? categoria.mano_obra 
        : ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (categoria) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.categoria}"?`)) {
      try {
        setSaving(true);
        const response = await categoriaService.eliminar(categoria.categoria);
        if (response?.status === 200 || response?.data?.success) {
          setSuccess('🗑️ Categoría eliminada correctamente');
          await cargarCategorias();
        } else {
          setError(response?.data?.message || 'Error al eliminar categoría');
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Error al eliminar la categoría';
        setError(errorMessage);
        console.error(err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreateNew = () => {
    setEditMode(false);
    setSelectedCategoria(null);
    setFormData({
      categoria: '',
      mano_obra: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditMode(false);
    setSelectedCategoria(null);
    setFormData({
      categoria: '',
      mano_obra: ''
    });
    setFormErrors({});
  };

  const filteredCategorias = categorias.filter(cat => 
    cat.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.categoriasLoading}>
        <div className={styles.spinner}></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className={styles.categoriasContainer}>
      {/* Header */}
      <div className={styles.categoriasHeader}>
        <div>
          <h1 className={styles.categoriasTitle}>Categorías</h1>
          <p className={styles.categoriasSubtitle}>
            Gestiona las categorías de piezas y dispositivos
          </p>
        </div>
        <button className={styles.categoriasBtnPrimary} onClick={handleCreateNew} disabled={saving}>
          <i className="fas fa-plus"></i> Nueva Categoría
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className={styles.searchBarCategorias}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Toast de éxito */}
      {success && (
        <div className={styles.toastSuccess}>
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {/* Toast de error */}
      {error && (
        <div className={styles.toastError}>
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de categorías */}
      <div className={styles.categoriasTableContainer}>
        {filteredCategorias.length === 0 ? (
          <div className={styles.categoriasEmpty}>
            <i className="fas fa-tags"></i>
            <p>
              {searchTerm 
                ? `No se encontraron categorías que coincidan con "${searchTerm}"`
                : 'No hay categorías registradas'}
            </p>
            {!searchTerm && (
              <button className={styles.categoriasBtnSecondary} onClick={handleCreateNew} disabled={saving}>
                Crear primera categoría
              </button>
            )}
          </div>
        ) : (
          <table className={styles.categoriasTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Mano de obra</th>
                <th>Piezas asociadas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategorias.map((categoria) => (
                <tr key={categoria.id_categoria}>
                  <td>{categoria.id_categoria}</td>
                  <td>
                    <div className={styles.categoriaName}>
                      <div className={styles.categoriaAvatar}>
                        <i className="fas fa-tag"></i>
                      </div>
                      {categoria.categoria}
                    </div>
                  </td>
                  <td className={styles.manoObraCell}>
                    {categoria.mano_obra !== null && categoria.mano_obra !== undefined ? (
                      <span className={styles.manoObraBadge}>
                        <i className="fas fa-percent"></i>
                        {typeof categoria.mano_obra === 'number' 
                          ? categoria.mano_obra.toFixed(2) 
                          : parseFloat(categoria.mano_obra).toFixed(2)}%
                      </span>
                    ) : (
                      <span className={styles.sinManoObra}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.piezasCount}>
                      <i className="fas fa-microchip"></i>
                      {categoria.piezas_count || 0} piezas
                    </span>
                  </td>
                  <td>
                    <div className={styles.categoriasActions}>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionEdit}`} 
                        onClick={() => handleEdit(categoria)} 
                        title="Editar categoría"
                        disabled={saving}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionDelete}`} 
                        onClick={() => handleDelete(categoria)} 
                        title="Eliminar categoría"
                        disabled={saving}
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
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus-circle'}`}></i>
                {editMode ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button className={styles.modalClose} onClick={handleCloseModal} disabled={saving}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="categoria">
                    Nombre de la categoría <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    placeholder="Ej: Pantallas, Baterías, Cámaras..."
                    className={formErrors.categoria ? styles.error : ''}
                    autoFocus
                    disabled={saving}
                  />
                  {formErrors.categoria && (
                    <span className={styles.errorMessage}>{formErrors.categoria}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="mano_obra">
                    Porcentaje de la mano de obra
                  </label>
                  <input
                    type="number"
                    id="mano_obra"
                    name="mano_obra"
                    value={formData.mano_obra}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={formErrors.mano_obra ? styles.error : ''}
                    disabled={saving}
                  />
                  {formErrors.mano_obra && (
                    <span className={styles.errorMessage}>{formErrors.mano_obra}</span>
                  )}
                  <small className={styles.fieldHelp}>
                    <i className="fas fa-info-circle"></i>
                    Este valor se usará como porcentaje de mano de obra para reparaciones de esta categoría
                  </small>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.categoriasBtnCancel} 
                  onClick={handleCloseModal} 
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={styles.categoriasBtnSave} 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {editMode ? ' Actualizando...' : ' Guardando...'}
                    </>
                  ) : (
                    editMode ? 'Actualizar' : 'Guardar'
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

export default Categoria;