// pages/admin/Precios/componentes/FormularioCategoria.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { FolderPlus, Save, X, Percent } from 'lucide-react';

export const FormularioCategoria = ({ show, onHide, onSave, editing, initialData }) => {
  const [formData, setFormData] = useState({
    categoria: '',
    mano_obra: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        categoria: initialData.categoria || '',
        mano_obra: initialData.mano_obra || ''
      });
    } else {
      setFormData({
        categoria: '',
        mano_obra: ''
      });
    }
    setErrors({});
  }, [initialData, show]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.categoria.trim()) {
      newErrors.categoria = 'El nombre de la categoría es requerido';
    }
    
    if (!formData.mano_obra) {
      newErrors.mano_obra = 'El porcentaje de mano de obra es requerido';
    } else if (isNaN(formData.mano_obra) || parseFloat(formData.mano_obra) < 0 || parseFloat(formData.mano_obra) > 100) {
      newErrors.mano_obra = 'Ingrese un porcentaje válido (0-100)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onHide();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title className="d-flex align-items-center">
          <FolderPlus size={24} className="me-2" />
          {editing ? 'Editar Categoría' : 'Nueva Categoría'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Nombre de la Categoría <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              placeholder="Ej: pantalla, batería, cámara..."
              isInvalid={!!errors.categoria}
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {errors.categoria}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <Percent size={14} className="me-1 text-muted" />
              Porcentaje de Mano de Obra <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="mano_obra"
                value={formData.mano_obra}
                onChange={handleChange}
                placeholder="35"
                step="0.5"
                min="0"
                max="100"
                isInvalid={!!errors.mano_obra}
              />
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup>
            <Form.Control.Feedback type="invalid">
              {errors.mano_obra}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Este porcentaje se aplicará a todos los servicios de esta categoría
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            <X size={16} className="me-1" /> Cancelar
          </Button>
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? (
              <><Spinner size="sm" className="me-2" /> Guardando...</>
            ) : (
              <><Save size={16} className="me-1" /> {editing ? 'Actualizar' : 'Guardar'}</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};