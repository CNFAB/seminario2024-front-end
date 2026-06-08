// pages/tecnico/componentes/ModalCalculadorPrecio.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Badge, Alert } from 'react-bootstrap';
import { Tag, Cpu, Layers, Package, DollarSign, Wrench, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react';
import { marcaService } from '../../../services/MarcaService';
import { modeloService } from '../../../services/ModeloService';
import { inventarioService } from '../../../services/InventarioService';

const formatPrecio = (valor) =>
  parseFloat(valor || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ModalCalculadorPrecio({ show, onHide, onAceptar }) {
  const [marcaId, setMarcaId] = useState('');
  const [modeloId, setModeloId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [piezaId, setPiezaId] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingPiezas, setLoadingPiezas] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) { resetear(); cargarMarcas(); cargarCategorias(); }
  }, [show]);

  useEffect(() => {
    if (marcaId) {
      setModeloId(''); setPiezaId(''); setPiezaSeleccionada(null); setPiezas([]);
      cargarModelos(marcaId);
    } else { setModelos([]); }
  }, [marcaId]);

  useEffect(() => {
    if (modeloId) {
      setPiezaId(''); setPiezaSeleccionada(null);
      cargarPiezasCompatibles(modeloId, categoriaId);
    } else { setPiezas([]); }
  }, [modeloId, categoriaId]);

  useEffect(() => {
    if (piezaId) {
      setPiezaSeleccionada(piezas.find(p => p.id_pieza?.toString() === piezaId) || null);
    } else { setPiezaSeleccionada(null); }
  }, [piezaId]);

  const resetear = () => {
    setMarcaId(''); setModeloId(''); setCategoriaId(''); setPiezaId('');
    setPiezaSeleccionada(null); setModelos([]); setPiezas([]); setError(null);
  };

  const cargarMarcas = async () => {
    setLoadingMarcas(true);
    try {
      const res = await marcaService.obtenerTodas();
      setMarcas(res?.data || res || []);
    } catch (err) {
      console.error('❌ Error marcas:', err);
      setError('Error al cargar marcas');
    } finally { setLoadingMarcas(false); }
  };

  const cargarModelos = async (idMarca) => {
    setLoadingModelos(true);
    try {
      const res = await modeloService.obtenerPorMarca(idMarca);
      setModelos(res?.data || res || []);
    } catch (err) {
      console.error('❌ Error modelos:', err);
      setError('Error al cargar modelos');
    } finally { setLoadingModelos(false); }
  };

  const cargarCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const res = await inventarioService.obtenerCategorias();
      setCategorias(res);
    } catch (err) {
      console.error('❌ Error categorías:', err);
      setError('Error al cargar categorías');
    } finally { setLoadingCategorias(false); }
  };

  const cargarPiezasCompatibles = async (idModelo, idCategoria) => {
    setLoadingPiezas(true);
    try {
      const res = await modeloService.obtenerPiezasCompatibles(idModelo);
      const data = res?.data || res;
      let piezasCompatibles = data?.piezas || [];

      if (idCategoria) {
        piezasCompatibles = piezasCompatibles.filter(
          p => p.id_categoria?.toString() === idCategoria.toString()
        );
      }
      setPiezas(piezasCompatibles);
    } catch (err) {
      console.error('❌ Error piezas:', err);
      setError('Error al cargar piezas compatibles');
      setPiezas([]);
    } finally { setLoadingPiezas(false); }
  };

  const calcularPrecio = () => {
    if (!piezaSeleccionada) return null;
    const precioPieza = parseFloat(piezaSeleccionada.precio || 0);
    const manoObra = parseFloat(piezaSeleccionada.categoria?.mano_obra || 0);
    const costoMano = precioPieza * (manoObra / 100);
    return { precioPieza, manoObra, costoMano, total: precioPieza + costoMano };
  };

  const calculo = calcularPrecio();

  const handleAceptar = () => {
    if (!calculo) return;
    onAceptar({
      precioTotal: calculo.total.toFixed(2),
      piezaId: piezaSeleccionada?.id_pieza || null,
      nombrePieza: piezaSeleccionada?.nombre_pieza || null
    });
    onHide();
  };

  const marcaSeleccionada = marcas.find(m => m.id_marca?.toString() === marcaId);
  const modeloSeleccionado = modelos.find(m => m.id_modelo?.toString() === modeloId);
  const categoriaSeleccionada = categorias.find(c => c.id_categoria?.toString() === categoriaId);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 p-2 rounded-2">
            <DollarSign size={20} className="text-primary" />
          </div>
          Calculador de precio
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="py-2">
            {error}
          </Alert>
        )}

        {(marcaId || modeloId || categoriaId) && (
          <div className="d-flex align-items-center gap-1 mb-3 flex-wrap">
            <small className="text-muted">Selección:</small>
            {marcaSeleccionada && <><Badge bg="primary" className="fw-normal">{marcaSeleccionada.marca}</Badge><ChevronRight size={12} className="text-muted" /></>}
            {modeloSeleccionado && <><Badge bg="info" className="fw-normal">{modeloSeleccionado.nombre_modelo}</Badge><ChevronRight size={12} className="text-muted" /></>}
            {categoriaSeleccionada && <Badge bg="secondary" className="fw-normal">{categoriaSeleccionada.categoria}</Badge>}
          </div>
        )}

        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted d-flex align-items-center gap-1">
                <Tag size={14} /> MARCA
              </Form.Label>
              {loadingMarcas ? (
                <div className="d-flex align-items-center gap-2 py-2">
                  <Spinner size="sm" animation="border" variant="primary" />
                  <small className="text-muted">Cargando marcas...</small>
                </div>
              ) : (
                <Form.Select size="sm" value={marcaId} onChange={e => setMarcaId(e.target.value)}>
                  <option value="">Seleccionar marca...</option>
                  {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.marca}</option>)}
                </Form.Select>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted d-flex align-items-center gap-1">
                <Cpu size={14} /> MODELO
              </Form.Label>
              {loadingModelos ? (
                <div className="d-flex align-items-center gap-2 py-2">
                  <Spinner size="sm" animation="border" variant="primary" />
                  <small className="text-muted">Cargando modelos...</small>
                </div>
              ) : (
                <Form.Select size="sm" value={modeloId} onChange={e => setModeloId(e.target.value)} disabled={!marcaId}>
                  <option value="">{marcaId ? 'Seleccionar modelo...' : 'Primero seleccioná una marca'}</option>
                  {modelos.map(m => <option key={m.id_modelo} value={m.id_modelo}>{m.nombre_modelo}</option>)}
                </Form.Select>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted d-flex align-items-center gap-1">
                <Layers size={14} /> CATEGORÍA <span className="text-muted fw-normal">(filtro)</span>
              </Form.Label>
              {loadingCategorias ? (
                <div className="d-flex align-items-center gap-2 py-2">
                  <Spinner size="sm" animation="border" variant="primary" />
                  <small className="text-muted">Cargando...</small>
                </div>
              ) : (
                <Form.Select size="sm" value={categoriaId} onChange={e => setCategoriaId(e.target.value)} disabled={!modeloId}>
                  <option value="">Todas las categorías</option>
                  {categorias.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.categoria}{c.mano_obra ? ` (${c.mano_obra}% m.o.)` : ''}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted d-flex align-items-center gap-1">
                <Package size={14} /> PIEZA COMPATIBLE
              </Form.Label>
              {loadingPiezas ? (
                <div className="d-flex align-items-center gap-2 py-2">
                  <Spinner size="sm" animation="border" variant="primary" />
                  <small className="text-muted">Cargando piezas...</small>
                </div>
              ) : (
                <Form.Select size="sm" value={piezaId} onChange={e => setPiezaId(e.target.value)} disabled={!modeloId}>
                  <option value="">
                    {!modeloId ? 'Primero seleccioná un modelo' : piezas.length > 0 ? 'Seleccionar pieza...' : 'Sin piezas compatibles'}
                  </option>
                  {piezas.map(p => (
                    <option key={p.id_pieza} value={p.id_pieza}>
                      {p.nombre_pieza} — ${formatPrecio(p.precio)}{p.stock !== undefined ? ` (stock: ${p.stock})` : ''}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </Col>
        </Row>

        {piezaSeleccionada && calculo && (
          <div className="mt-4 p-3 rounded-3 border border-success border-opacity-25 bg-success bg-opacity-10">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <CheckCircle size={16} className="text-success" /> Desglose del precio
            </h6>
            <div className="bg-white rounded-2 p-2 mb-3">
              <strong>{piezaSeleccionada.nombre_pieza}</strong>
              <div className="d-flex gap-2 mt-1">
                <Badge bg="light" text="dark" className="fw-normal small">
                  {piezaSeleccionada.categoria?.categoria || categoriaSeleccionada?.categoria || 'Sin categoría'}
                </Badge>
                {piezaSeleccionada.stock !== undefined && (
                  <Badge bg={piezaSeleccionada.stock > 0 ? 'success' : 'danger'} className="fw-normal small">
                    Stock: {piezaSeleccionada.stock}
                  </Badge>
                )}
              </div>
            </div>
            <table className="w-100 small">
              <tbody>
                <tr className="border-bottom">
                  <td className="py-1 text-muted"><Package size={13} className="me-1" />Precio de pieza</td>
                  <td className="py-1 text-end fw-medium">${formatPrecio(calculo.precioPieza)}</td>
                </tr>
                <tr className="border-bottom">
                  <td className="py-1 text-muted"><Wrench size={13} className="me-1" />Mano de obra ({calculo.manoObra}%)</td>
                  <td className="py-1 text-end fw-medium text-warning">+ ${formatPrecio(calculo.costoMano)}</td>
                </tr>
                <tr>
                  <td className="pt-2 fw-bold"><DollarSign size={14} className="text-success me-1" />TOTAL A COBRAR</td>
                  <td className="pt-2 text-end fw-bold text-success fs-5">${formatPrecio(calculo.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!piezaSeleccionada && modeloId && piezas.length === 0 && !loadingPiezas && (
          <div className="text-center py-4 mt-3 bg-light rounded-3">
            <Package size={36} className="text-muted mb-2" />
            <p className="text-muted mb-0 small">
              No hay piezas compatibles{categoriaId ? ' con la categoría seleccionada' : ' para este modelo'}
            </p>
            {categoriaId && (
              <Button size="sm" variant="link" className="mt-1 p-0" onClick={() => setCategoriaId('')}>
                Ver todas las categorías
              </Button>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" size="sm" onClick={resetear} className="d-flex align-items-center gap-1 me-auto">
          <RefreshCw size={14} /> Limpiar
        </Button>
        <Button variant="secondary" size="sm" onClick={onHide}>Cancelar</Button>
        <Button variant="success" size="sm" onClick={handleAceptar} disabled={!calculo} className="d-flex align-items-center gap-1">
          <CheckCircle size={14} />
          Usar precio ${calculo ? formatPrecio(calculo.total) : '0.00'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}