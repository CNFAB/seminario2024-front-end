// pages/admin/Precios/componentes/GuiaPrecios.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Form, InputGroup, Row, Col, 
  Badge, Alert, Button, Spinner
} from 'react-bootstrap';
import { 
  DollarSign, Percent, Calculator, 
  TrendingUp, Info, Package, Search
} from 'lucide-react';
import { inventarioService } from '../../../../services/InventarioService';

export const GuiaPrecios = ({ categorias }) => {
  const [piezas, setPiezas] = useState([]);
  const [piezasFiltradas, setPiezasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // ============================================
  // CARGAR PIEZAS DEL INVENTARIO
  // ============================================
  useEffect(() => {
    fetchPiezas();
  }, []);

  useEffect(() => {
    if (piezas.length > 0) {
      filtrarPiezas();
    }
  }, [piezas, searchTerm, categoriaFiltro]);

  const fetchPiezas = async () => {
    setLoading(true);
    try {
      const data = await inventarioService.obtenerTodas();
      setPiezas(data);
      setPiezasFiltradas(data);
    } catch (error) {
      console.error("Error al cargar piezas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPiezas = () => {
    let filtradas = [...piezas];

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtradas = filtradas.filter(p => 
        p.nombre_pieza?.toLowerCase().includes(term) ||
        p.marca?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (categoriaFiltro !== 'todos') {
      filtradas = filtradas.filter(p => {
        const idCat = typeof p.categoria === 'object' 
          ? p.categoria?.id_categoria 
          : p.id_categoria;
        return idCat === parseInt(categoriaFiltro);
      });
    }

    setPiezasFiltradas(filtradas);
  };

  const calcularPrecioFinal = (precioPieza, manoObra) => {
    const base = parseFloat(precioPieza) || 0;
    const porcentaje = parseFloat(manoObra) || 0;
    return base + (base * porcentaje / 100);
  };

  const getCategoriaInfo = (pieza) => {
    if (typeof pieza.categoria === 'object' && pieza.categoria !== null) {
      return {
        id: pieza.categoria.id_categoria,
        nombre: pieza.categoria.categoria,
        manoObra: pieza.categoria.mano_obra
      };
    }
    // Si solo tenemos id_categoria, buscar en el array de categorías
    const cat = categorias.find(c => c.id_categoria === pieza.id_categoria);
    return {
      id: pieza.id_categoria,
      nombre: cat?.categoria || 'Sin categoría',
      manoObra: cat?.mano_obra || 0
    };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Cargando inventario...</p>
      </div>
    );
  }

  if (!categorias || categorias.length === 0) {
    return (
      <Alert variant="warning">
        <Info size={20} className="me-2" />
        Primero debes crear categorías para calcular precios.
      </Alert>
    );
  }

  if (piezas.length === 0) {
    return (
      <Alert variant="info">
        <Package size={20} className="me-2" />
        No hay piezas en el inventario. Agrega piezas para ver la guía de precios.
      </Alert>
    );
  }

  return (
    <div>
      <h4 className="mb-4">
        <Calculator size={24} className="me-2 text-primary" />
        Guía de Precios por Pieza
      </h4>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar pieza por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Percent size={16} />
                </InputGroup.Text>
                <Form.Select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  <option value="todos">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.categoria} ({cat.mano_obra}%)
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={3}>
              <div className="text-muted small mt-2">
                {piezasFiltradas.length} piezas encontradas
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {piezasFiltradas.length > 0 ? (
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Precios calculados</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <Table striped hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Pieza</th>
                  <th>Categoría</th>
                  <th>Precio pieza</th>
                  <th>% Mano obra</th>
                  <th>Incremento</th>
                  <th>Precio Final</th>
                </tr>
              </thead>
              <tbody>
                {piezasFiltradas.map((pieza, index) => {
                  const catInfo = getCategoriaInfo(pieza);
                  const precioBase = parseFloat(pieza.precio) || 0;
                  const manoObra = parseFloat(catInfo.manoObra) || 0;
                  const incremento = precioBase * (manoObra / 100);
                  const precioFinal = precioBase + incremento;

                  return (
                    <tr key={pieza.id_pieza}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{pieza.nombre_pieza}</strong>
                        <br />
                        <small className="text-muted">
                          {pieza.marca} {pieza.modelo}
                        </small>
                      </td>
                      <td>
                        <Badge bg="secondary" className="px-3 py-2">
                          {catInfo.nombre}
                        </Badge>
                      </td>
                      <td>
                        <span className="fw-bold">${precioBase.toFixed(2)}</span>
                      </td>
                      <td>
                        <Badge bg="info" className="px-3 py-2">
                          <Percent size={12} className="me-1" />
                          {manoObra}%
                        </Badge>
                      </td>
                      <td className="text-success">
                        + ${incremento.toFixed(2)}
                      </td>
                      <td>
                        <span className="fw-bold text-primary fs-5">
                          ${precioFinal.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
          <Card.Footer className="bg-white">
            <Row className="text-center">
              <Col md={4}>
                <small className="text-muted">
                  Precio total inventario: 
                  <strong className="text-primary ms-1">
                    ${piezasFiltradas.reduce((acc, p) => 
                      acc + (parseFloat(p.precio) || 0), 0).toFixed(2)}
                  </strong>
                </small>
              </Col>
              <Col md={4}>
                <small className="text-muted">
                  Precio final promedio: 
                  <strong className="text-success ms-1">
                    ${(piezasFiltradas.reduce((acc, p) => {
                      const cat = getCategoriaInfo(p);
                      const precio = parseFloat(p.precio) || 0;
                      const mano = parseFloat(cat.manoObra) || 0;
                      return acc + (precio + (precio * mano / 100));
                    }, 0) / piezasFiltradas.length).toFixed(2)}
                  </strong>
                </small>
              </Col>
              <Col md={4}>
                <small className="text-muted">
                  Piezas mostradas: {piezasFiltradas.length}
                </small>
              </Col>
            </Row>
          </Card.Footer>
        </Card>
      ) : (
        <Alert variant="secondary" className="text-center">
          <Package size={32} className="mb-2" />
          <p>No hay piezas que coincidan con los filtros</p>
        </Alert>
      )}
    </div>
  );
};