import React from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import { Check } from "lucide-react";
import axios from "axios";

const FormularioDispositivo = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/dispositivo-agregar", data);
      reset();
    } catch (error) {
      console.error("Error al guardar el dispositivo", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="p-3">
      <h4 className="mb-4">Información del Dispositivo</h4>

      <Form.Group className="mb-3">
        <Form.Label>Marca</Form.Label>
        <Form.Control type="text" {...register("marca", { required: "La marca es obligatoria" })} />
        {errors.marca && <p className="text-danger">{errors.marca.message}</p>}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Modelo</Form.Label>
        <Form.Control type="text" {...register("modelo", { required: "El modelo es obligatorio" })} />
        {errors.modelo && <p className="text-danger">{errors.modelo.message}</p>}
      </Form.Group>

      <Button type="submit" variant="primary" className="w-100">
        <Check size={20} className="me-2" /> Guardar Dispositivo
      </Button>
    </Form>
  );
};

export default FormularioDispositivo;
