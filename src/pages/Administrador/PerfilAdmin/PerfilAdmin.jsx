import React from 'react'
import {Card, Row, Col, Badge} from 'react-bootstrap';
const PerfilAdmin = ({datos}) => {
  return (
    <div>
        <h2 className = "mb-4"> Perfil Administrativos </h2>    
        <Card className = "shadow-sm">
          <Card.Body>
            <Row>
              <Col md = {6}>
                <p><strong>Nombre:</strong> {datos.nombre}</p>
                <p><strong>Correo:</strong> {datos.correo}</p>
                <p><strong>Rol:</strong> <Badge bg= "success">{datos.rol}</Badge> </p>
                <p><strong>Ultimo acceso:</strong> {datos.ultimoAcceso}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
     </div>
  )
}

export default PerfilAdmin
