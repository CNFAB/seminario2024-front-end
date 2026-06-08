import React, { useState, useEffect } from "react";
import { Check, UserPlus } from "lucide-react";
import { Form, Col, Container, Row, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { clienteService } from "../services/ClienteService.jsx";

const FormularioCliente = ({ onComplete }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState("");
  const [messageType, setMessageType] = useState("");

  //  Contraseña = correo, se sincroniza automáticamente mientras el recepcionista escribe
  const correoValue = watch("correo");
  useEffect(() => {
    setValue("contrasena", correoValue || "");
  }, [correoValue, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await clienteService.registrarCliente(data);

      if (response.success) {
        setMessage(" Cliente registrado exitosamente");
        setMessageType("success");
        reset();

        if (onComplete) {
          onComplete({
            nombre:         data.nombre,
            apellido:       data.apellido,
            correo:         data.correo,
            numero_celular: data.numero_celular,
          });
        }
      }
    } catch (error) {
      console.error("Error completo:", error);

      let errorMessage = "Error al procesar la solicitud";

      if (error.type) {
        switch (error.type) {
          case "VALIDATION_ERROR":
            errorMessage = error.errors && Object.keys(error.errors).length > 0
              ? Object.values(error.errors).join(" | ")
              : error.message;
            break;
          case "AUTH_ERROR":
            errorMessage = error.message || "No autorizado";
            break;
          case "NOT_FOUND":
            errorMessage = error.message || "Recurso no encontrado";
            break;
          case "SERVER_ERROR":
            errorMessage = error.message || "Error interno del servidor";
            break;
          case "NETWORK_ERROR":
            errorMessage = error.message || "Sin conexión al servidor";
            break;
          default:
            errorMessage = error.message || "Error desconocido";
        }
      } else if (error.response) {
        errorMessage = error.response.data?.message || "Error del servidor";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(` ${errorMessage}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="p-3">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <UserPlus size={20} className="me-2" />
            Registro de Nuevo Cliente
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {message && (
              <Alert variant={messageType === "success" ? "success" : "danger"}>
                {message}
              </Alert>
            )}

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Nombre *</strong></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el nombre"
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                    })}
                    isInvalid={errors.nombre}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Apellido *</strong></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese el apellido"
                    {...register("apellido", {
                      required: "El apellido es obligatorio",
                      minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
                    })}
                    isInvalid={errors.apellido}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellido?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Correo Electrónico *</strong></Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...register("correo", {
                      required: "El email es obligatorio",
                      pattern: {
                        value: /^[^\s@]+@(gmail\.com|hotmail\.com|yahoo\.com|outlook\.com)$/i,
                        message: "Formato de email inválido",
                      },
                    })}
                    isInvalid={errors.correo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.correo?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Teléfono/Celular *</strong></Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Ej: 1191234567 o 11151234567"
                    {...register("numero_celular", {
                      required: "El número de celular es obligatorio",
                      validate: {
                        formatoValido: (value) => {
                          const clean = value.replace(/[\s\-\(\)]/g, "");
                          if (/^9\d{10}$/.test(clean)) return true;
                          if (/^\d{10}$/.test(clean)) return true;
                          if (/^(11\d{2}|[2-9]\d{2,3})15\d{6,7}$/.test(clean)) return true;
                          return "Formato inválido. Ejemplos válidos: 3878123456, 93878123456, 387815123456";
                        },
                      },
                    })}
                    isInvalid={errors.numero_celular}
                  />
                  <Form.Text className="text-muted">
                    Ejemplos válidos: <br />
                    • 3878123456 (área 4 dígitos)<br />
                    • 1134567890 (área 2 dígitos)<br />
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.numero_celular?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* Contraseña — solo lectura, se asigna automáticamente igual al correo */}
            <Form.Group className="mb-4">
              <Form.Label><strong>Contraseña</strong></Form.Label>
              <Form.Control
                type="text"
                readOnly
                {...register("contrasena")}
                className="bg-light text-muted"
              />
              <Form.Text className="text-muted">
                 Se asigna automáticamente igual al correo. El cliente puede cambiarla luego.
              </Form.Text>
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="d-flex align-items-center justify-content-center"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={20} className="me-2" />
                    Registrar Cliente
                  </>
                )}
              </Button>
            </div>

            <div className="mt-3 text-center">
              <small className="text-muted">* Campos obligatorios</small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormularioCliente;