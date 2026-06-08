import React, { useState } from 'react';
import { 
  Form, 
  Button, 
  Card, 
  Container, 
  Alert, 
  Row, 
  Col,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginUser } from '../../services/authService';
import { FaMobileAlt, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      
      // Guardar en localStorage si "Recordarme" está activado
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Guardar datos de usuario y token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Actualizar contexto de autenticación
      login(response.data.user, response.data.token);
      
      // Redirigir al dashboard
      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-page">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} md={6} lg={4}>
          <Card className="auth-card border-0 shadow-lg">
            <Card.Body className="p-4 p-md-5">
              
              {/* Logo y Título */}
              <div className="text-center mb-4">
                <div className="auth-logo mb-3">
                  <FaMobileAlt size={48} className="text-primary" />
                </div>
                <h2 className="fw-bold mb-2">TechRepair Center</h2>
                <p className="text-muted mb-4">
                  Gestión de reparaciones de celulares
                </p>
              </div>

              {/* Mensaje de error */}
              {error && (
                <Alert 
                  variant="danger" 
                  dismissible 
                  onClose={() => setError('')}
                  className="text-center"
                >
                  <small>{error}</small>
                </Alert>
              )}

              {/* Formulario */}
              <Form onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted mb-1">
                    Correo Electrónico
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaEnvelope className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      required
                      disabled={loading}
                      className="py-2"
                    />
                  </InputGroup>
                </Form.Group>

                {/* Contraseña */}
                <Form.Group className="mb-3">
                  <Form.Label className="small text-muted mb-1">
                    Contraseña
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="py-2"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {/* Recordarme y Olvidé contraseña */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Recordarme"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <Link 
                    to="/forgot-password" 
                    className="text-decoration-none small"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón de Login */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading || !formData.email || !formData.password}
                  className="w-100 py-2 fw-bold"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Ingresando...
                    </>
                  ) : (
                    'Ingresar a Mi Cuenta'
                  )}
                </Button>

                {/* Separador */}
                <div className="text-center my-4">
                  <hr className="text-muted" />
                  <span className="px-3 small text-muted bg-white">
                    ¿No tienes cuenta?
                  </span>
                </div>

                {/* Botón de Registro */}
                <Link to="/register">
                  <Button
                    variant="outline-primary"
                    className="w-100 py-2"
                    disabled={loading}
                  >
                    Crear Nueva Cuenta
                  </Button>
                </Link>
              </Form>

              {/* Información adicional */}
              <div className="text-center mt-4 pt-3 border-top">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Tus datos están protegidos con encriptación SSL
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;