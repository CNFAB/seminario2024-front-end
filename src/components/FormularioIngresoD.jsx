import React from "react";
import { useForm } from "react-hook-form";
import { Form, Button } from "react-bootstrap";
import { Check } from "lucide-react";
import axios from "axios";

const FormularioIngreso = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/ingresoD-agregar", data);
      reset();
    } catch (error) {
      console.error("Error al registrar el ingreso", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="p-3">
      <h4 className="mb-4">Ingreso de Dispositivo</h4>

      <Form.Group className="mb-3">
        <Form.Label>Fecha de Ingreso</Form.Label>
        <Form.Control type="date" {...register("fecha", { required: "La fecha es obligatoria" })} />
        {errors.fecha && <p className="text-danger">{errors.fecha.message}</p>}
      </Form.Group>

      <Button type="submit" variant="primary" className="w-100">
        <Check size={20} className="me-2" /> Registrar Ingreso
      </Button>
    </Form>
  );
};

export default FormularioIngreso;
