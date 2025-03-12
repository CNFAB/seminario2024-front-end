import { Users } from "lucide-react";
import React from "react";
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import FormularioCliente from "../../components/FormularioCliente";

const Forms_ingreso = () => {
  return (
    <Container className="py-5 bg-light">
      <Row className="justify-content-center">
        <Col md={12}>
        <div className="bg-ligh shadow rounded-3 p-4">
          <Tabs defaultActiveKey="cliente" className="mb-4">
            <Tab eventKey="cliente" title = {<><Users size={20}/>Cliente</> }>
              <FormularioCliente/>
            </Tab>

          </Tabs>

        </div>
        
        </Col>
      </Row>
    </Container>
  );
};

export default Forms_ingreso;
