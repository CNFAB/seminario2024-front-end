import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.loginUsuario(formData);
      
      console.log('Respuesta completa:', response);

      // ✅ response ya ES { success, token, data } gracias al interceptor
      if (response && response.success) {
        const dashboardPath = authService.getDashboardPath(response.data);
        navigate(dashboardPath);
      } else {
        setError(response?.message || 'Erroesr al iniciar sesión');
      }

    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-0" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Row className="w-100 justify-content-center m-0">
        <Col md={5} lg={4}>
          <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold" style={{ color: '#764ba2' }}>ReparaTech</h2>
                <p className="text-muted">Sistema de Gestión de Reparaciones</p>
              </div>

              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    placeholder="ejemplo@techfix.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    placeholder="••••••••"
                    value={formData.contrasena}
                    onChange={handleChange}
                    required
                    size="lg"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Acceso para: Administradores • Recepcionistas • Técnicos
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