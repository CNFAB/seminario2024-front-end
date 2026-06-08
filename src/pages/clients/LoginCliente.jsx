// src/pages/cliente/LoginCliente.jsx
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/AuthService'; 

const LoginCliente = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Usar authService en lugar de api directamente
      const response = await authService.loginCliente(formData);
      
      console.log('✅ Respuesta login:', response);

      // ✅ authService ya maneja la estructura de la respuesta
      if (response.success) {
        // Redirigir al dashboard
        navigate('/cliente/dashboard');
      } else {
        // Mostrar error del servicio
        setError(response.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      fluid 
      className="d-flex justify-content-center align-items-center p-4" 
      style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0b1e33 0%, #1d3a5c 100%)'
      }}
    >
      <Card style={{ width: '400px' }} className="shadow-lg border-0 overflow-hidden">
        <Card.Header className="text-white text-center py-4 border-0" style={{ background: '#0d6efd' }}>
          <h4 className="mb-0 fw-bold">
            <i className="fas fa-user-circle me-2"></i>
            Repara<span style={{ color: '#ffc107' }}>Tech</span>
          </h4>
          <small className="opacity-75">Acceso para clientes</small>
        </Card.Header>
        
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="text-center mb-4">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                required
                size="lg"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="••••••••"
                required
                size="lg"
              />
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100 py-2 fw-bold"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </Form>
        </Card.Body>
        
        <Card.Footer className="text-center py-3 bg-light border-0">
          <small className="text-muted">
            ¿No tienes cuenta? <Link to="/cliente/registro" className="text-primary">Regístrate aquí</Link>
          </small>
          <div className="mt-2">
            <Link to="/home" className="text-muted small">
              ← Volver al inicio
            </Link>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default LoginCliente;