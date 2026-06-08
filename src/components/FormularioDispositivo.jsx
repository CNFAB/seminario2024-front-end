import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Container, Alert, Spinner, Card, Row, Col, Badge } from "react-bootstrap";
import { Check, Smartphone, User } from "lucide-react";
import { marcaService } from "../services/MarcaService";
import { modeloService } from "../services/ModeloService";
import { dispositivoService } from "../services/DispositivoService";
import { clienteService } from "../services/ClienteService";

// ✅ Un solo componente, recibe clienteId como prop
const FormularioDispositivo = ({
 onComplete,
  clienteId,
  clienteInfo: clienteInfoProp  
}) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();

  const [message, setMessage]               = useState("");
  const [messageType, setMessageType]       = useState("");
  const [marcas, setMarcas]                 = useState([]);
  const [modelos, setModelos]               = useState([]);
  const [idCliente, setIdCliente]           = useState(null);
  const [clienteInfo, setClienteInfo]       = useState(null);
  const [loading, setLoading]               = useState(false);
  const [marcaCargando, setMarcaCargando]   = useState(true);
  const [modeloCargando, setModeloCargando] = useState(false);

  const selectedMarca  = watch("id_marca");
  const selectedModelo = watch("id_modelo");
  const imei           = watch("imei");

  // Obtener marcas
  useEffect(() => {
    const obtenerMarcas = async () => {
      try {
        const marcasData = await marcaService.obtenerTodas();
        if (Array.isArray(marcasData)) {
          setMarcas(marcasData);
        } else if (marcasData?.data && Array.isArray(marcasData.data)) {
          setMarcas(marcasData.data);
        } else {
          setMessage("❌ Error al cargar las marcas: formato inválido");
          setMessageType("danger");
          setMarcas([]);
        }
      } catch (error) {
        console.error("Error al obtener las marcas", error);
        setMessage("❌ Error al cargar las marcas");
        setMessageType("danger");
        setMarcas([]);
      } finally {
        setMarcaCargando(false);
      }
    };
    obtenerMarcas();
  }, []);

  // ✅ Obtener cliente: usa el prop si viene, sino busca el último
   useEffect(() => {
    // ✅ Si ya tenemos el cliente completo por prop, lo usamos sin hacer fetch
    if (clienteInfoProp && clienteInfoProp.id_cliente) {
      setIdCliente(clienteInfoProp.id_cliente);
      setClienteInfo({
        id_cliente:     clienteInfoProp.id_cliente,
        nombre:         clienteInfoProp.nombre,
        apellido:       clienteInfoProp.apellido,
        correo:         clienteInfoProp.correo,
        numero_celular: clienteInfoProp.numero_celular,
      });
      return; // 👈 no hace falta ningún fetch
    }

    // Fallback: flujo cliente nuevo, busca el último
    const obtenerUltimoCliente = async () => {
      try {
        const result = await clienteService.obtenerUltimoCliente();
        if (result && result.id_cliente) {
          setIdCliente(result.id_cliente);
          setClienteInfo({
            id_cliente:     result.id_cliente,
            nombre:         result.nombre,
            apellido:       result.apellido,
            correo:         result.correo,
            numero_celular: result.numero_celular,
          });
        } else {
          setMessage("❌ No se encontró información del cliente");
          setMessageType("danger");
        }
      } catch (error) {
        setMessage("❌ Error al obtener información del cliente");
        setMessageType("danger");
      }
    };
    obtenerUltimoCliente();
  }, [clienteInfoProp]);

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (selectedMarca) {
      cargarModelos(selectedMarca);
    } else {
      setModelos([]);
      setValue("id_modelo", "");
    }
  }, [selectedMarca, setValue]);

  const cargarModelos = async (id_marca) => {
    setModeloCargando(true);
    try {
      const result = await modeloService.obtenerPorMarca(id_marca);
      if (Array.isArray(result)) {
        setModelos(result);
        if (result.length === 0) {
          setMessage("ℹ️ No hay modelos disponibles para esta marca");
          setMessageType("info");
          setTimeout(() => setMessage(""), 3000);
        }
      } else if (result?.data && Array.isArray(result.data)) {
        setModelos(result.data);
      } else {
        setMessage("❌ Error al cargar los modelos: formato de respuesta inválido");
        setMessageType("danger");
        setModelos([]);
      }
    } catch (error) {
      console.error("Error al cargar los modelos", error);
      setMessage("❌ Error al cargar los modelos");
      setMessageType("danger");
      setModelos([]);
    } finally {
      setModeloCargando(false);
    }
  };

  const onSubmit = async (data) => {
    if (!idCliente) {
      setMessage("❌ Error: No se encontró el ID del cliente");
      setMessageType("danger");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const result = await dispositivoService.registrar({
        id_cliente: idCliente,
        id_modelo:  data.id_modelo,
        imei:       data.imei || null,
      });

      if (result.success) {
        setMessage(result.message || "✅ Dispositivo registrado correctamente");
        setMessageType("success");

        const marcaObj  = marcas.find(m => String(m.id_marca)   === String(data.id_marca));
        const modeloObj = modelos.find(m => String(m.id_modelo) === String(data.id_modelo));

        reset();
        setValue("id_marca", "");
        setValue("id_modelo", "");
        setModelos([]);

        if (onComplete) {
          setTimeout(() => {
            onComplete({
               id_dispositivo: result.data?.id_dispositivo ?? result.id_dispositivo,
              marcaNombre:  marcaObj?.marca          ?? data.id_marca,
              modeloNombre: modeloObj?.nombre_modelo ?? data.id_modelo,
              imei:         data.imei || null,
            });
          }, 1000);
        }
      } else {
        let errorMsg = result.error || "Error al guardar el dispositivo";
        if (result.type === "VALIDATION_ERROR" && result.errors) {
          errorMsg = `Errores en: ${Object.keys(result.errors).join(", ")}`;
        }
        setMessage(`❌ ${errorMsg}`);
        setMessageType("danger");
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      setMessage(`❌ Error inesperado: ${error.message}`);
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="p-3">
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">
            <Smartphone size={20} className="me-2" />
            Registro de Dispositivo
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {message && (
              <Alert variant={messageType === "success" ? "success" : "danger"}>
                {message}
              </Alert>
            )}

            <Card className="mb-4 border-primary">
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <User size={16} className="me-2" />
                  Información del Cliente
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>Nombre</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={clienteInfo ? `${clienteInfo.nombre} ${clienteInfo.apellido}` : "Cargando..."}
                        readOnly
                        className="fw-bold"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><strong>Correo</strong></Form.Label>
                      <Form.Control
                        type="text"
                        value={clienteInfo?.correo || "Cargando..."}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Marca *</strong></Form.Label>
                  <Form.Select
                    {...register("id_marca", { required: "La marca es obligatoria" })}
                    disabled={marcaCargando}
                    isInvalid={errors.id_marca}
                  >
                    <option value="">Seleccione una marca</option>
                    {marcas.map((m) => (
                      <option key={m.id_marca} value={m.id_marca}>{m.marca}</option>
                    ))}
                  </Form.Select>
                  {marcaCargando && (
                    <Form.Text className="text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Cargando marcas...
                    </Form.Text>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {errors.id_marca?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label><strong>Modelo *</strong></Form.Label>
                  <Form.Select
                    {...register("id_modelo", { required: "El modelo es obligatorio" })}
                    disabled={!selectedMarca || modeloCargando || modelos.length === 0}
                    isInvalid={errors.id_modelo}
                  >
                    <option value="">
                      {!selectedMarca ? "Seleccione una marca primero"
                        : modeloCargando ? "Cargando modelos..."
                        : modelos.length === 0 ? "No hay modelos para esta marca"
                        : "Seleccione un modelo"}
                    </option>
                    {modelos.map((mod) => (
                      <option key={mod.id_modelo} value={mod.id_modelo}>{mod.nombre_modelo}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.id_modelo?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>
                <strong>IMEI</strong>{" "}
                <Badge bg="secondary" className="ms-1">Opcional</Badge>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el IMEI del dispositivo (15 dígitos)"
                {...register("imei", {
                  pattern: {
                    value: /^[0-9]{15}$/,
                    message: "El IMEI debe tener exactamente 15 dígitos numéricos",
                  },
                })}
                isInvalid={errors.imei}
              />
              <Form.Text className="text-muted">
                {imei ? `Ingresado: ${imei}` : "Ej: 123456789012345"}
                {imei && imei.length !== 15 && " (deben ser 15 dígitos)"}
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {errors.imei?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="info"
                disabled={loading || !selectedModelo || !idCliente}
                className="d-flex align-items-center justify-content-center py-2"
                style={{ transition: "transform 0.2s ease-in-out", transform: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {loading ? (
                  <><Spinner animation="border" size="sm" className="me-2" />Guardando...</>
                ) : (
                  <><Check size={20} className="me-2" />Registrar Dispositivo</>
                )}
              </Button>
            </div>

            <div className="mt-3 text-center">
              <small className="text-muted">* Campos obligatorios</small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormularioDispositivo;