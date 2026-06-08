import React from 'react';
import { Card, Nav, Badge } from 'react-bootstrap';
import { ClipboardList, Wrench, DollarSign,FileText } from 'lucide-react';

export function TabsNavigation({ activeTab, onTabChange, counts = {} }) {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-0">
        <Nav variant="tabs" className="px-3 pt-2">
          {/* TAB DIAGNÓSTICOS */}
          <Nav.Item>
            <Nav.Link
              eventKey="diagnosticos"
              active={activeTab === 'diagnosticos'}
              onClick={() => onTabChange('diagnosticos')}
              className="d-flex align-items-center gap-2"
            >
              <ClipboardList size={18} />
              Diagnósticos
              {counts?.diagnosticos > 0 && (
                <Badge bg="primary" pill className="ms-1">
                  {counts.diagnosticos}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          {/* TAB REPARACIONES */}
          <Nav.Item>
            <Nav.Link
              eventKey="reparaciones"
              active={activeTab === 'reparaciones'}
              onClick={() => onTabChange('reparaciones')}
              className="d-flex align-items-center gap-2"
            >
              <Wrench size={18} />
              Reparaciones
              {counts?.reparaciones > 0 && (
                <Badge bg="warning" pill className="ms-1">
                  {counts.reparaciones}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          {/*  NUEVO TAB RECLAMOS DE GARANTÍA */}
          <Nav.Item>
            <Nav.Link
              eventKey="reclamos"
              active={activeTab === 'reclamos'}
              onClick={() => onTabChange('reclamos')}
              className="d-flex align-items-center gap-2"
            >
              <FileText size={18} />
              Reclamos
              {counts?.reclamos > 0 && (
                <Badge bg="danger" pill className="ms-1">
                  {counts.reclamos}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>


        </Nav>
      </Card.Body>
    </Card>
  );
}