// components/admin/Inventario/FormularioPieza.jsx
import React, { useState, useEffect } from 'react';
import styles from './FormularioPieza.module.css';

export const FormularioPieza = ({ 
  show, 
  onHide, 
  onSave, 
  editing, 
  initialData = null,
  categorias = []
}) => {
  const [formData, setFormData] = useState({
    nombre_pieza: '',
    precio: '',
    stock: '',
    id_categoria: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_pieza: initialData.nombre_pieza || '',
        precio: initialData.precio || '',
        stock: initialData.stock || '',
        id_categoria: initialData.id_categoria || ''
      });
    } else {
      setFormData({
        nombre_pieza: '',
        precio: '',
        stock: '',
        id_categoria: ''
      });
    }
    setErrors({});
  }, [initialData, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre_pieza.trim()) {
      newErrors.nombre_pieza = 'El nombre de la pieza es requerido';
    }

    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido';
    } else if (isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'Ingrese un precio válido';
    }

    if (!formData.stock && formData.stock !== 0) {
      newErrors.stock = 'El stock es requerido';
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Ingrese un stock válido';
    }

    if (!formData.id_categoria) {
      newErrors.id_categoria = 'Seleccione una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Transformar a mayúsculas solo para nombre_pieza
    const processedValue = name === 'nombre_pieza' ? value.toUpperCase() : value;
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        nombre_pieza: formData.nombre_pieza.toUpperCase().trim(),
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        id_categoria: parseInt(formData.id_categoria)
      };
      
      await onSave(dataToSend);
      onHide();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalPiezaOverlay} onClick={onHide}>
      <div className={styles.modalPiezaContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalPiezaHeader}>
          <h3>
            <i className="fas fa-box"></i>
            {editing ? 'Editar Pieza' : 'Agregar Nueva Pieza'}
          </h3>
          <button className={styles.modalPiezaClose} onClick={onHide}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalPiezaBody}>
            {/* Nombre de la pieza */}
            <div className={styles.piezaFormGroup}>
              <label>
                <i className="fas fa-tag"></i>
                Nombre de la Pieza <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="nombre_pieza"
                className={`${styles.piezaInput} ${errors.nombre_pieza ? styles.piezaInputError : ''}`}
                value={formData.nombre_pieza}
                onChange={handleChange}
                placeholder="EJ: PANTALLA LCD, BATERÍA, ETC."
                autoFocus
                style={{ textTransform: 'uppercase' }}
              />
              {errors.nombre_pieza && (
                <span className={styles.piezaErrorMessage}>{errors.nombre_pieza}</span>
              )}
            </div>

            {/* Precio y Stock en fila */}
            <div className={styles.piezaFormRow}>
              <div className={styles.piezaFormGroup}>
                <label>
                  <i className="fas fa-dollar-sign"></i>
                  Precio <span className={styles.required}>*</span>
                </label>
                <div className={styles.piezaInputGroup}>
                  <span className={styles.piezaInputIcon}>$</span>
                  <input
                    type="number"
                    name="precio"
                    className={`${styles.piezaInput} ${errors.precio ? styles.piezaInputError : ''}`}
                    value={formData.precio}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.precio && (
                  <span className={styles.piezaErrorMessage}>{errors.precio}</span>
                )}
              </div>

              <div className={styles.piezaFormGroup}>
                <label>
                  <i className="fas fa-cubes"></i>
                  Stock <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  className={`${styles.piezaInput} ${errors.stock ? styles.piezaInputError : ''}`}
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && (
                  <span className={styles.piezaErrorMessage}>{errors.stock}</span>
                )}
              </div>
            </div>

            {/* Categoría */}
            <div className={styles.piezaFormGroup}>
              <label>
                <i className="fas fa-folder"></i>
                Categoría <span className={styles.required}>*</span>
              </label>
              <select
                name="id_categoria"
                className={`${styles.piezaSelect} ${errors.id_categoria ? styles.piezaSelectError : ''}`}
                value={formData.id_categoria}
                onChange={handleChange}
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.categoria}
                  </option>
                ))}
              </select>
              {errors.id_categoria && (
                <span className={styles.piezaErrorMessage}>{errors.id_categoria}</span>
              )}
            </div>
          </div>

          <div className={styles.modalPiezaFooter}>
            <button 
              type="button" 
              className={styles.piezaBtnCancel} 
              onClick={onHide}
              disabled={loading}
            >
              <i className="fas fa-times"></i>
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.piezaBtnSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.piezaSpinner}></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {editing ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};