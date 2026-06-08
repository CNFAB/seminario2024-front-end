// src/components/Recepcion/GestionReclamosGarantia.jsx
import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import reclamoGarantiaService from '../../../services/reclamoGarantiaService';
import styles from './ModalIngreso.module.css';

const GestionReclamosGarantia = () => {
  const [email, setEmail] = useState('');
  const [reclamos, setReclamos] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [procesando, setProcesando] = useState(null);

  // Estados para el modal de ingreso
  const [showModal, setShowModal] = useState(false);
  const [selectedReclamo, setSelectedReclamo] = useState(null);
  const [memoriaSd, setMemoriaSd] = useState(false);
  const [sim, setSim] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleBuscar = async () => {
    if (!email.trim()) {
      setError('Ingrese un email válido');
      return;
    }

    setLoading(true);
    setError(null);
    setExito(null);
    setReclamos([]);
    setCliente(null);

    try {
      const response = await reclamoGarantiaService.buscarReclamosAprobadosPorEmail(email);

      if (response.success) {
        setReclamos(response.data || []);
        setCliente(response.cliente);
        if (response.data.length === 0) {
          setError('No hay reclamos aprobados pendientes para este cliente');
        }
      } else {
        setError(response.message || 'Error al buscar cliente');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (reclamo) => {
    setSelectedReclamo(reclamo);
    setMemoriaSd(false);
    setSim(false);
    setShowModal(true);
  };

  const handleRegistrarIngreso = async () => {
    if (!selectedReclamo) return;

    setSubmitting(true);
    setError(null);

    try {
      const data = {
        memoria_sd: memoriaSd,
        sim: sim,
      };

      const response = await reclamoGarantiaService.registrarIngresoReclamo(
        selectedReclamo.id_reclamo,
        data
      );

      if (response.success) {
        setExito(
          `✅ Reclamo #${selectedReclamo.id_reclamo}: ${response.message || 'Ingreso registrado correctamente'}`
        );
        setReclamos((prev) => prev.filter((r) => r.id_reclamo !== selectedReclamo.id_reclamo));
        setShowModal(false);
        setTimeout(() => setExito(null), 4000);
      } else {
        setError(response.message || 'Error al registrar ingreso');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al registrar el ingreso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Función para obtener el nombre del dispositivo
  const getDispositivoNombre = (reclamo) => {
    let dispositivo = reclamo?.garantia?.reparacion?.ingreso?.dispositivo;
    if (!dispositivo) {
      dispositivo = reclamo?.garantia?.reparacion?.diagnostico?.ingreso?.dispositivo;
    }
    if (dispositivo) {
      const marca = dispositivo?.modelo?.marca?.marca || '';
      const modelo = dispositivo?.modelo?.nombre_modelo || '';
      const nombreCompleto = `${marca} ${modelo}`.trim();
      return nombreCompleto || 'Dispositivo no especificado';
    }
    return 'Dispositivo no especificado';
  };

  // Obtener iniciales del cliente
  const getInitials = () => {
    if (!cliente) return '??';
    const first = cliente.nombre?.[0] || '';
    const last = cliente.apellido?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="rec-reclamos-container">
      <div className="rec-reclamos-card">
        <div className="rec-reclamos-icon">
          <i className="fas fa-gavel"></i>
        </div>

        <h2 className="rec-reclamos-titulo">Gestión de reclamos de garantía</h2>
        <p className="rec-reclamos-subtitulo">
          Registre el ingreso físico de dispositivos cuando el cliente llega al taller
        </p>

        <div className="rec-reclamos-input-group">
          <input
            className="rec-reclamos-input"
            type="email"
            placeholder="Email del cliente..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            autoFocus
          />
          <button className="rec-reclamos-btn" onClick={handleBuscar} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <i className="fas fa-search"></i> Buscar
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="rec-reclamos-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {exito && (
          <div className="rec-reclamos-exito">
            <i className="fas fa-check-circle"></i> {exito}
          </div>
        )}

        {cliente && reclamos.length === 0 && !error && (
          <div className="rec-reclamos-cliente-card">
            <div className="rec-reclamos-cliente-avatar">
              {(cliente.nombre?.[0] ?? '').toUpperCase()}
              {(cliente.apellido?.[0] ?? '').toUpperCase()}
            </div>
            <div className="rec-reclamos-cliente-info">
              <div className="rec-reclamos-cliente-nombre">
                {cliente.nombre} {cliente.apellido}
              </div>
              <div className="rec-reclamos-cliente-detalle">
                <span>
                  <i className="fas fa-envelope"></i> {cliente.correo}
                </span>
                <span>
                  <i className="fas fa-phone"></i> {cliente.numero_celular}
                </span>
              </div>
            </div>
          </div>
        )}

        {reclamos.length > 0 && (
          <div className="rec-reclamos-lista">
            <div className="rec-reclamos-lista-titulo">
              <i className="fas fa-list"></i> Reclamos aprobados
              <span>{reclamos.length}</span>
            </div>

            {reclamos.map((reclamo) => (
              <div key={reclamo.id_reclamo} className="rec-reclamo-item">
                <div className="rec-reclamo-header">
                  <div className="rec-reclamo-badges">
                    <span className="rec-badge-reclamo">Reclamo #{reclamo.id_reclamo}</span>
                    <span className="rec-badge-estado">{reclamo.estado}</span>
                  </div>

                  <button
                    onClick={() => handleAbrirModal(reclamo)}
                    disabled={procesando === reclamo.id_reclamo}
                    className="rec-reclamo-btn"
                  >
                    <i className="fas fa-sign-in-alt"></i> Registrar ingreso
                  </button>
                </div>

                <div className="rec-reclamo-dispositivo">
                  <i className="fas fa-mobile-alt"></i>
                  {getDispositivoNombre(reclamo)}
                </div>

                <div className="rec-reclamo-fecha">
                  <i className="fas fa-calendar-alt"></i>
                  Reclamo: {formatearFecha(reclamo.fecha_reclamo)}
                </div>

                {reclamo.descripcion_problema && (
                  <div className="rec-reclamo-descripcion">
                    <strong>Problema:</strong> {reclamo.descripcion_problema}
                  </div>
                )}

                {reclamo.diagnostico_tecnico && (
                  <div className="rec-reclamo-diagnostico">
                    <strong>Diagnóstico técnico:</strong> {reclamo.diagnostico_tecnico}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal moderno con CSS Module */}
      {showModal && selectedReclamo && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                ×
              </button>

              <div className={styles.modalIcon}>
                <i className="fas fa-clipboard-list"></i>
              </div>

              <h2 className={styles.modalTitle}>Registrar Ingreso</h2>

              <div className={styles.reclamoBadge}>Reclamo #{selectedReclamo.id_reclamo}</div>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              {/* Info del cliente */}
              <div className={styles.infoCard}>
                <div className={styles.clienteHeader}>
                  <div className={styles.clienteAvatar}>{getInitials()}</div>
                  <div className={styles.clienteMainInfo}>
                    <div className={styles.clienteNombre}>
                      {cliente?.nombre} {cliente?.apellido}
                    </div>
                    <div className={styles.clienteEmail}>
                      <i className="fas fa-envelope"></i> {cliente?.correo}
                    </div>
                  </div>
                  <div className={styles.dispositivoInfo}>
                    <div className={styles.dispositivoIcon}>
                      <i className="fas fa-mobile-alt"></i>
                    </div>
                    <div className={styles.dispositivoTexto}>
                      <div className={styles.dispositivoLabel}>Dispositivo</div>
                      <div className={styles.dispositivoNombre}>
                        {getDispositivoNombre(selectedReclamo)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.clienteDetalles}>
                  <div className={styles.detalleItem}>
                    <i className="fas fa-phone"></i>
                    <span>cel: {cliente?.numero_celular || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className={styles.separator}>
                <i className="fas fa-question-circle"></i> Verificación de componentes
              </div>

              {/* Pregunta: Memoria SD */}
              <div className={styles.preguntaGroup}>
                <div className={styles.preguntaLabel}>
                  <i className="fas fa-microchip"></i>
                  ¿El dispositivo tiene memoria SD?
                </div>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="memoria_sd"
                      checked={memoriaSd === true}
                      onChange={() => setMemoriaSd(true)}
                    />
                    <span className={styles.radioLabel}>Sí</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="memoria_sd"
                      checked={memoriaSd === false}
                      onChange={() => setMemoriaSd(false)}
                    />
                    <span className={styles.radioLabel}>No</span>
                  </label>
                </div>
              </div>

              {/* Pregunta: SIM */}
              <div className={styles.preguntaGroup}>
                <div className={styles.preguntaLabel}>
                  <i className="fas fa-sim-card"></i>
                  ¿El dispositivo tiene SIM?
                </div>
                <div className={styles.radioGroup}>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="sim"
                      checked={sim === true}
                      onChange={() => setSim(true)}
                    />
                    <span className={styles.radioLabel}>Sí</span>
                  </label>
                  <label className={styles.radioOption}>
                    <input
                      type="radio"
                      name="sim"
                      checked={sim === false}
                      onChange={() => setSim(false)}
                    />
                    <span className={styles.radioLabel}>No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i> Cancelar
              </button>
              <button
                className={styles.btnConfirm}
                onClick={handleRegistrarIngreso}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Procesando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i> Confirmar ingreso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionReclamosGarantia;
