// ============================================
// components/LoginModal.jsx — CORREGIDO Y COMENTADO
// ============================================
import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Mail, Lock, Phone, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/AuthService';
import '../css/LoginModal.css';

const LoginModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [intentando, setIntentando] = useState(''); // para el label del spinner
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Limpiar error al escribir
  };

  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 🔧 Convertir el correo a minúsculas y trim antes de enviar
    const datosNormalizados = {
      correo: formData.correo.toLowerCase().trim(),
      contrasena: formData.contrasena,
    };

    try {
      let response = null;

      // ── PASO 1: Intentar como CLIENTE ──────────────────────────────────────
      setIntentando('cliente');
      try {
        response = await authService.loginCliente(datosNormalizados);
      } catch (e) {
        // Si lanza excepción (no debería, porque loginCliente hace catch interno),
        // forzamos success: false para continuar al siguiente intento
        response = { success: false };
      }

      if (!response?.success) {
        setIntentando('usuario');
        try {
          response = await authService.loginUsuario(datosNormalizados);
          console.log('Respuesta usuario interno:', response);
        } catch (e) {
          response = { success: false };
        }
      }

      // ── PASO 3: Evaluar resultado final ────────────────────────────────────
      if (response?.success) {
        onHide(); // Cerrar el modal

        const dashboardPath = authService.getDashboardPath();
        console.log('Login exitoso, redirigiendo a:', dashboardPath);
        navigate(dashboardPath);
      } else {
        // Ambos intentos fallaron → credenciales incorrectas
        setError('Credenciales incorrectas. Verificá tu correo y contraseña.');
      }
    } finally {
      // Siempre resetear el estado de carga al terminar
      setLoading(false);
      setIntentando('');
    }
  };

  const handleClose = () => {
    setFormData({ correo: '', contrasena: '' });
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="md" className="login-modal">
      <div className="modal-content-wrapper">
        <Modal.Header className="border-0 pb-0 modal-header-custom">
          <Button variant="link" onClick={handleClose} className="ms-auto close-button">
            <X size={24} />
          </Button>
        </Modal.Header>

        <Modal.Body className="p-5 pt-2">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2 logo-text">
              Repara<span className="logo-highlight">Tech</span>
            </h2>
            <p className="subtitle">Área de Ingreso</p>

            <div className="roles-container">
              <div className="role-badge cliente-badge">
                <span>Acceso General</span>
              </div>
            </div>
          </div>

          {/* Mensaje de error visible si ambos logins fallaron */}
          {error && (
            <Alert variant="danger" className="text-center mb-4 error-alert">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <Form.Control
                  type="email"
                  name="correo"
                  placeholder="Correo electrónico"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  size="lg"
                  className="custom-input"
                  disabled={loading}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <Form.Control
                  type="password"
                  name="contrasena"
                  placeholder="Contraseña"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                  size="lg"
                  className="custom-input"
                  disabled={loading}
                />
              </div>
            </Form.Group>

            <Button
              type="submit"
              size="lg"
              className="w-100 py-3 mb-3 rounded-pill border-0 submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {/* Muestra en qué paso está el intento */}
                  {intentando === 'cliente' ? 'Verificando cliente...' : 'Verificando usuario...'}
                </>
              ) : (
                'Ingresar'
              )}
            </Button>

            <div className="text-center mb-4">
              <small className="forgot-password">
                ¿Olvidaste tu contraseña?{' '}
                <a
                  href="/cliente/forgot-password"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    onHide(); // Cerrar modal
                    navigate('/cliente/forgot-password'); // Navegar a recuperación
                  }}
                >
                  Recuperá tu cuenta
                </a>
              </small>
            </div>
          </Form>

          <div className="support-section">
            <div className="support-icon-wrapper">
              <Phone className="support-icon" size={18} />
            </div>
            <div>
              <span className="support-label">SOPORTE CLIENTES</span>
              <h6 className="support-phone">+34 900 123 456</h6>
            </div>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default LoginModal;
