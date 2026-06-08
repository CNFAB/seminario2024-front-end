import api from './api';

const pagoService = {
  crearPreferencia: async (monto, descripcion, idMultiple, idReparacion) => {
    const response = await api.post('/crear-preferencia', {
      monto,
      descripcion,
      id_multiple:   idMultiple,
      id_reparacion: idReparacion,
    });
    return response;
  },

  abrirCheckout: (initPoint) => {
    window.open(initPoint, '_blank', 'noopener,noreferrer');
  },

  iniciarPago: async (monto, descripcion, idMultiple, idReparacion) => {
    const data = await pagoService.crearPreferencia(monto, descripcion, idMultiple, idReparacion);
     console.log('💳 Datos del pago:', { monto, descripcion, idMultiple, idReparacion });
    if (!data?.init_point) {
      throw new Error(`init_point no encontrado: ${JSON.stringify(data)}`);
    }
    pagoService.abrirCheckout(data.init_point);
    return data;
  },

  leerResultadoURL: () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pago');
  },

  limpiarQueryParams: () => {
    const url = new URL(window.location.href);
    ['pago','collection_id','collection_status','payment_id',
     'status','external_reference','payment_type',
     'merchant_order_id','preference_id'].forEach(p => url.searchParams.delete(p));
    window.history.replaceState({}, '', url.toString());
  },
};

export default pagoService;