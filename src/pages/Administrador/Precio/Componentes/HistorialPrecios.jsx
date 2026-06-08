// pages/admin/Precios/componentes/HistorialPrecios.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Table, Badge, Spinner } from 'react-bootstrap';
import { History, Calendar, DollarSign, User } from 'lucide-react';
import { precioService } from '../../../../services/PrecioService';

export const HistorialPrecios = ({ show, onHide, servicio }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && servicio) {
      cargarHistorial();
    }
  }, [show, servicio]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const response = await precioService.obtenerHistorial(servicio.id_precio);
      setHistorial(response.data || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title className="d-flex align-items-center">
          <History size={24} className="me-2" />
          Historial de Precios
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {servicio && (
          <div className="mb-3 p-3 bg-light rounded">
            <h6 className="fw-bold mb-2">{servicio.descripcion}</h6>
            <div className="d-flex gap-3">
              <Badge bg="secondary">Precio actual: ${servicio.costo_de_reparcion}</Badge>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="info" />
            <p className="mt-2">Cargando historial...</p>
          </div>
        ) : (
          <Table striped hover responsive size="sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Precio anterior</th>
                <th>Precio nuevo</th>
                <th>Modificado por</th>
              </tr>
            </thead>
            <tbody>
              {historial.length > 0 ? (
                historial.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Calendar size={12} className="me-1" />
                      {new Date(item.fecha).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="text-muted">${item.anterior}</span>
                    </td>
                    <td>
                      <span className="text-success fw-bold">${item.nuevo}</span>
                    </td>
                    <td>
                      <User size={12} className="me-1" />
                      {item.usuario || 'Sistema'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    No hay historial de cambios
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};