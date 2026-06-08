// pages/admin/Precios/Precios.jsx
import React, { useEffect, useState } from "react";
import { 
  Card, Tabs, Tab, Button
} from "react-bootstrap";
import { 
  Percent, Package, FolderPlus, Calculator
} from "lucide-react";
import { precioService } from '../../../services/PrecioService';
import { TablaManoObra } from './componentes/TablaManoObra';
import { FormularioCategoria } from './componentes/FormularioCategoria';
import { GuiaPrecios } from './componentes/GuiaPrecios';

const Precios = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [activeTab, setActiveTab] = useState("mano-obra");

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await precioService.obtenerCategorias();
      if (Array.isArray(response)) {
        setCategorias(response);
      } else {
        setCategorias([]);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowCategoria = (categoria = null) => {
    setEditingCategoria(categoria ? categoria.id_categoria : null);
    setShowCategoriaModal(true);
  };

  const handleCloseCategoria = () => {
    setShowCategoriaModal(false);
    setEditingCategoria(null);
  };

  const handleSaveCategoria = async (formData) => {
    try {
      if (editingCategoria) {
        await precioService.actualizarCategoria(editingCategoria, formData);
        alert('✅ Categoría actualizada correctamente');
      } else {
        await precioService.crearCategoria(formData);
        alert('✅ Categoría creada correctamente');
      }
      await fetchCategorias();
      handleCloseCategoria();
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.message || 'Error al guardar'}`);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta categoría?")) {
      try {
        await precioService.eliminarCategoria(id);
        await fetchCategorias();
        alert('✅ Categoría eliminada correctamente');
      } catch (error) {
        alert("Error al eliminar la categoría");
      }
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <Percent size={28} className="me-2 text-primary" />
          Gestión de Precios
        </h2>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="px-3 pt-3"
          >
            <Tab 
              eventKey="mano-obra" 
              title={
                <span className="d-flex align-items-center gap-2">
                  <Percent size={18} />
                  Categorías ({categorias.length})
                </span>
              }
            >
              <div className="p-3">
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    variant="success" 
                    onClick={() => handleShowCategoria()}
                    className="d-flex align-items-center"
                  >
                    <FolderPlus size={18} className="me-1" />
                    Nueva Categoría
                  </Button>
                </div>
                
                <TablaManoObra 
                  categorias={categorias}
                  loading={loading}
                  onUpdate={fetchCategorias}
                  onEdit={handleShowCategoria}
                  onDelete={handleDeleteCategoria}
                />
              </div>
            </Tab>

            {/* GUÍA DE PRECIOS */}
            <Tab 
              eventKey="guia" 
              title={
                <span className="d-flex align-items-center gap-2">
                  <Calculator size={18} />
                  Guía de Precios
                </span>
              }
            >
              <div className="p-3">
                <GuiaPrecios categorias={categorias} />
              </div>
            </Tab>

            <Tab 
              eventKey="estadisticas" 
              title={
                <span className="d-flex align-items-center gap-2">
                  <Package size={18} />
                  Estadísticas
                </span>
              }
            >
              <div className="p-3">
                <div className="text-center py-5">
                  <Package size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">Estadísticas</h5>
                  <p>Total categorías: {categorias.length}</p>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <FormularioCategoria
        show={showCategoriaModal}
        onHide={handleCloseCategoria}
        onSave={handleSaveCategoria}
        editing={!!editingCategoria}
        initialData={editingCategoria ? categorias.find(c => c.id_categoria === editingCategoria) : null}
      />
    </div>
  );
};

export default Precios;