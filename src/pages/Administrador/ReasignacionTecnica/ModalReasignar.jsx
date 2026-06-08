// components/Admin/Reasignaciones/ModalReasignar.jsx
import React, { useState } from 'react';
import styles from './ModalReasignar.module.css'; // Importamos el CSS Module

const ModalReasignar = ({ 
  show, 
  onClose, 
  tecnicos, 
  onConfirm, 
  cantidadSeleccionados 
}) => {
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleConfirm = async () => {
    if (!tecnicoSeleccionado) {
      alert('Seleccione un técnico');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(parseInt(tecnicoSeleccionado));
      setTecnicoSeleccionado(''); // Limpiar selección
      onClose(); // Cerrar modal después de confirmar
    } catch (error) {
      console.error('Error al reasignar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTecnicoSeleccionado('');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>
            <i className="fas fa-exchange-alt"></i>
            Reasignar Diagnósticos
          </h3>
          <button className={styles.modalClose} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <div className={styles.sectionTitle}>
            <i className="fas fa-info-circle me-2"></i>
            Información de reasignación
          </div>
          
          {/* Alerta de advertencia */}
          <div className={styles.alertWarning}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Va a reasignar <strong>{cantidadSeleccionados}</strong> diagnóstico(s) a otro técnico.
            <br />
            <small>Los diagnósticos mantendrán su estado actual.</small>
          </div>

          {/* Selector de técnico */}
          <div className={styles.formGroup}>
            <label>
              <i className="fas fa-user-cog"></i>
              Técnico de destino <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.input}
              value={tecnicoSeleccionado}
              onChange={(e) => setTecnicoSeleccionado(e.target.value)}
            >
              <option value="">-- Seleccione un técnico --</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id_usuario} value={tecnico.id_usuario}>
                  {tecnico.nombre} {tecnico.apellido} - {tecnico.carga_actual || 0} diagnóstico(s) activo(s)
                  {tecnico.en_linea ? ' 🟢 En línea' : ' 🔴 Desconectado'}
                </option>
              ))}
            </select>
            <small className={styles.fieldHelp}>
              Se mostrarán los técnicos con menor carga de trabajo primero
            </small>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button 
            className={styles.btnCancel} 
            onClick={handleClose}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          <button 
            className={styles.btnSave} 
            onClick={handleConfirm}
            disabled={loading || !tecnicoSeleccionado}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Reasignando...
              </>
            ) : (
              <>
                <i className="fas fa-arrow-right"></i>
                Reasignar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalReasignar;