// components/admin/Personal/FormularioPersonal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Lock, Wrench, Headset, Shield, Save, X } from 'lucide-react';
import styles from './FormularioPersonal.module.css';

export const FormularioPersonal = ({ show, onHide, onSave, editing, initialData = null }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    numero_celular: '',
    contrasena: '',
    es_tecnico: false,
    es_recepcionista: false,
    es_administrador: false,
    activo: true,
  });

  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(!editing);

  // Ref para detectar cuándo el modal REALMENTE se abre (false → true)
  const prevShowRef = useRef(false);

  useEffect(() => {
    const justOpened = show && !prevShowRef.current;
    prevShowRef.current = show;

    // Solo resetear cuando el modal se abre, no en cada re-render
    if (!justOpened) return;

    setErrors({});
    setBackendErrors({});

    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        correo: initialData.correo || '',
        numero_celular: initialData.numero_celular || '',
        contrasena: '',
        es_tecnico: initialData.es_tecnico || false,
        es_recepcionista: initialData.es_recepcionista || false,
        es_administrador: initialData.es_administrador || false,
        activo: initialData.activo !== undefined ? initialData.activo : true,
      });
      setPasswordRequired(false);
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        correo: '',
        numero_celular: '',
        contrasena: '',
        es_tecnico: false,
        es_recepcionista: false,
        es_administrador: false,
        activo: true,
      });
      setPasswordRequired(true);
    }
  }, [show, initialData]);

  const handleCorreoChange = (e) => {
    const nuevoCorreo = e.target.value;
    setFormData((prev) => ({
      ...prev,
      correo: nuevoCorreo,
      contrasena: !editing ? nuevoCorreo : prev.contrasena,
    }));
    if (errors.correo) setErrors((prev) => ({ ...prev, correo: null }));
    if (backendErrors.correo) setBackendErrors((prev) => ({ ...prev, correo: null }));
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (backendErrors[name]) setBackendErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede tener más de 50 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    } else if (formData.apellido.length > 50) {
      newErrors.apellido = 'El apellido no puede tener más de 50 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'Ingrese un correo electrónico válido (ej: usuario@dominio.com)';
    } else if (formData.correo.length > 100) {
      newErrors.correo = 'El correo no puede tener más de 100 caracteres';
    }

    const telefono = formData.numero_celular;
    if (!telefono.trim()) {
      newErrors.numero_celular = 'El teléfono es requerido';
    } else {
      const clean = telefono.replace(/[\s\-\(\)]/g, '');
      const formatoValido = (value) => {
        if (/^9\d{10}$/.test(value)) return true;
        if (/^\d{10}$/.test(value)) return true;
        if (/^(11\d{2}|[2-9]\d{2,3})15\d{6,7}$/.test(value)) return true;
        return false;
      };
      if (!formatoValido(clean)) {
        newErrors.numero_celular = 'Formato inválido. Ejemplos: 912345678, 987654321';
      }
    }

    if (passwordRequired && !formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena && formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    } else if (formData.contrasena && formData.contrasena.length > 255) {
      newErrors.contrasena = 'La contraseña es demasiado larga';
    }

    if (!formData.es_tecnico && !formData.es_recepcionista && !formData.es_administrador) {
      newErrors.roles = 'Debe seleccionar al menos un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FormularioPersonal.jsx - handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setBackendErrors({});

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error:', error);

      // Tu error tiene rawErrors directamente en el objeto error
      // porque en Personal.jsx estás propagando el error completo
      if (error?.rawErrors) {
        console.log('Usando rawErrors del error:', error.rawErrors);
        setBackendErrors(error.rawErrors);
      }
      // Si el error está en error.response.data
      else if (error?.response?.data?.rawErrors) {
        console.log('Usando rawErrors de response:', error.response.data.rawErrors);
        setBackendErrors(error.response.data.rawErrors);
      }
      // Si viene con errors
      else if (error?.errors) {
        console.log('Usando errors del error:', error.errors);
        setBackendErrors(error.errors);
      } else if (error?.response?.data?.errors) {
        console.log('Usando errors de response:', error.response.data.errors);
        setBackendErrors(error.response.data.errors);
      } else {
        setBackendErrors({ general: [error?.message || 'Error al guardar los datos'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (fieldName) => {
    if (errors[fieldName]) return errors[fieldName];
    if (backendErrors[fieldName]) {
      const error = backendErrors[fieldName];
      if (Array.isArray(error)) return error[0];
      if (typeof error === 'string') return error;
      return 'Error de validación';
    }
    return null;
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onHide}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            <User size={24} />
            {editing ? 'Editar Personal' : 'Agregar Nuevo Personal'}
          </h3>
          <button className={styles.modalClose} onClick={onHide}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <h6 className={styles.sectionTitle}>Datos Personales</h6>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  <User size={14} />
                  Nombre <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
                  className={getErrorMessage('nombre') ? styles.inputError : styles.input}
                  autoFocus
                />
                {getErrorMessage('nombre') && (
                  <span className={styles.errorMessage}>{getErrorMessage('nombre')}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>
                  <User size={14} />
                  Apellido <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="Ej: Pérez"
                  className={getErrorMessage('apellido') ? styles.inputError : styles.input}
                />
                {getErrorMessage('apellido') && (
                  <span className={styles.errorMessage}>{getErrorMessage('apellido')}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  <Mail size={14} />
                  Correo Electrónico <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleCorreoChange}
                  placeholder="ejemplo@correo.com"
                  className={getErrorMessage('correo') ? styles.inputError : styles.input}
                />
                {getErrorMessage('correo') && (
                  <span className={styles.errorMessage}>{getErrorMessage('correo')}</span>
                )}
                <small className={styles.fieldHelp}>
                  Ingrese un correo válido. Ej: usuario@gmail.com, admin@empresa.cl
                </small>
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Phone size={14} />
                  Teléfono/Celular <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupText}>+56</span>
                  <input
                    type="tel"
                    name="numero_celular"
                    value={formData.numero_celular}
                    onChange={handleChange}
                    placeholder="912345678"
                    className={getErrorMessage('numero_celular') ? styles.inputError : styles.input}
                  />
                </div>
                {getErrorMessage('numero_celular') && (
                  <span className={styles.errorMessage}>{getErrorMessage('numero_celular')}</span>
                )}
                <small className={styles.fieldHelp}>Ejemplos válidos: 912345678, 987654321</small>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  <Lock size={14} />
                  Contraseña {passwordRequired && <span className={styles.required}>*</span>}
                </label>
                <input
                  type="text"
                  name="contrasena"
                  value={formData.contrasena}
                  readOnly={!editing}
                  onChange={handleChange}
                  className={`${getErrorMessage('contrasena') ? styles.inputError : styles.input} ${!editing ? styles.inputReadOnly : ''}`}
                  placeholder={
                    editing
                      ? 'Dejar en blanco para no cambiar'
                      : 'La contraseña es el correo electrónico'
                  }
                />
                {getErrorMessage('contrasena') && (
                  <span className={styles.errorMessage}>{getErrorMessage('contrasena')}</span>
                )}
                {!editing && formData.correo && (
                  <div className={styles.autoPasswordHint}>
                    <Lock size={12} />
                    <span>La contraseña será igual al correo electrónico</span>
                  </div>
                )}
                {editing && (
                  <small className={styles.fieldHelp}>
                    * Dejar en blanco para mantener la contraseña actual
                  </small>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Estado</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="activo"
                      checked={formData.activo === true}
                      onChange={() => setFormData((prev) => ({ ...prev, activo: true }))}
                    />
                    Activo
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="activo"
                      checked={formData.activo === false}
                      onChange={() => setFormData((prev) => ({ ...prev, activo: false }))}
                    />
                    Inactivo
                  </label>
                </div>
              </div>
            </div>

            <h6 className={styles.sectionTitle}>Roles del Usuario</h6>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="es_tecnico"
                  checked={formData.es_tecnico}
                  onChange={handleChange}
                />
                <Wrench size={16} />
                Técnico
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="es_recepcionista"
                  checked={formData.es_recepcionista}
                  onChange={handleChange}
                />
                <Headset size={16} />
                Recepcionista
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="es_administrador"
                  checked={formData.es_administrador}
                  onChange={handleChange}
                />
                <Shield size={16} />
                Administrador
              </label>
            </div>

            {getErrorMessage('roles') && (
              <div className={styles.alertWarning}>
                <small>{getErrorMessage('roles')}</small>
              </div>
            )}

            {/* Error general del backend */}
            {backendErrors.general && (
              <div className={styles.alertWarning}>
                <small>{backendErrors.general[0]}</small>
              </div>
            )}

            {(formData.es_tecnico || formData.es_recepcionista || formData.es_administrador) && (
              <div className={styles.rolesPreview}>
                <small className={styles.rolesPreviewTitle}>Roles seleccionados:</small>
                <div className={styles.rolesPreviewBadges}>
                  {formData.es_tecnico && (
                    <span className={`${styles.roleBadge} ${styles.roleBadgeTecnico}`}>
                      <Wrench size={12} /> Técnico
                    </span>
                  )}
                  {formData.es_recepcionista && (
                    <span className={`${styles.roleBadge} ${styles.roleBadgeRecep}`}>
                      <Headset size={12} /> Recepcionista
                    </span>
                  )}
                  {formData.es_administrador && (
                    <span className={`${styles.roleBadge} ${styles.roleBadgeAdmin}`}>
                      <Shield size={12} /> Administrador
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnCancel} onClick={onHide} disabled={loading}>
              <X size={16} />
              Cancelar
            </button>
            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
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
