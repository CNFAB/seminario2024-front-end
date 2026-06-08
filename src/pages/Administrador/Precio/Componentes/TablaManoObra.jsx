// pages/admin/Precios/componentes/TablaManoObra.jsx
import React, { useState } from 'react';
import { Table, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { Percent, Edit2, Save, X, Trash2, Pencil } from 'lucide-react';
import { precioService } from '../../../../services/PrecioService';

export const TablaManoObra = ({ categorias, loading, onUpdate, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditInline = (categoria) => {
    setEditingId(categoria.id_categoria);
    setEditValue(categoria.mano_obra);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveInline = async (id) => {
    setSaving(true);
    try {
      await precioService.actualizarManoObra(id, editValue);
      await onUpdate();
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('❌ Error al actualizar el porcentaje');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando categorías...</p>
      </div>
    );
  }

  if (!categorias || categorias.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        <Percent size={24} className="mb-2" />
        <p>No hay categorías registradas</p>
        <small className="text-muted">
          Haz clic en "Nueva Categoría" para comenzar
        </small>
      </Alert>
    );
  }

  return (
    <Table striped hover responsive>
      <thead className="bg-light">
        <tr>
          <th>#</th>
          <th>Categoría</th>
          <th>% Mano de obra</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categorias.map((cat, index) => (
          <tr key={cat.id_categoria}>
            <td>{index + 1}</td>
            <td>
              <strong>{cat.categoria}</strong>
            </td>
            <td>
              {editingId === cat.id_categoria ? (
                <Form.Control
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ width: '100px' }}
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={saving}
                />
              ) : (
                <Badge bg="info" className="px-3 py-2">
                  <Percent size={12} className="me-1" />
                  {cat.mano_obra}%
                </Badge>
              )}
            </td>
            <td>
              {editingId === cat.id_categoria ? (
                <div className="d-flex gap-1">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleSaveInline(cat.id_categoria)}
                    disabled={saving}
                    title="Guardar"
                  >
                    <Save size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                    title="Cancelar"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="d-flex gap-1">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEditInline(cat)}
                    title="Editar porcentaje"
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-warning"
                    onClick={() => onEdit(cat)}
                    title="Editar categoría"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => onDelete(cat.id_categoria)}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};