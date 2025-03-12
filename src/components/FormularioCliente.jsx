import axios from "axios";
import { Check } from "lucide-react";
import React, { useState } from "react";
import { Form, Col, Container, Row, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";

const generarIdCliente= ()=>{
  return Math.random().toString(36).substring(2,8);
}
const FormularioCliente = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [idCliente,setIdCliente] = useState("");

  useEffect(()=>{
    setIdCliente(generarIdCliente());
  },[]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/inicioAgregar", data);
      console.log("Respuesta de la API:", response.data);
      setMessage("Cliente agregado correctamente");
      reset();
      setIdCliente(generarIdCliente());
    } catch (error) {
      console.error("Error al guardar el cliente", error);
      setMessage("Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit(onSubmit)} className="p-3">
        <h4 className="mb-4">Información del Cliente</h4>
        {message && <p className="text-success">{message}</p>}



        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" {...register("nombre", { required: "El nombre es obligatorio" })} />
              {errors.nombre && <p className="text-danger">{errors.nombre.message}</p>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" {...register("apellido", { required: "El apellido es obligatorio" })} />
              {errors.apellido && <p className="text-danger">{errors.apellido.message}</p>}
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" {...register("email", { required: "El email es obligatorio" })} />
          {errors.email && <p className="text-danger">{errors.email.message}</p>}
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 d-flex align-items-center justify-content-center" disabled={loading}>
          {loading ? "Guardando..." : <><Check size={20} className="me-2" /> Guardar Cliente</>}
        </Button>
      </Form>
    </Container>
  );
};

export default FormularioCliente;
