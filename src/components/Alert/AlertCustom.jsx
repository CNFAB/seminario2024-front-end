// components/AlertCustom.jsx
import Swal from 'sweetalert2';

// Tipos de alerta predefinidos
const AlertTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  QUESTION: 'question',
};

// Configuraciones predefinidas por tipo
const getConfigByType = (type, title, message, options = {}) => {
  const configs = {
    [AlertTypes.SUCCESS]: {
      icon: 'success',
      title: title || '¡Éxito!',
      confirmButtonColor: '#3B6D11',
      background: 'var(--swal-background, #ffffff)',
      iconColor: '#3B6D11',
      customClass: {
        popup: 'swal-compact',
        title: 'swal-title-compact',
        htmlContainer: 'swal-text-compact',
        confirmButton: 'swal-btn-compact',
      },
    },
    [AlertTypes.ERROR]: {
      icon: 'error',
      title: title || '¡Error!',
      confirmButtonColor: '#dc3545',
      background: '#fff8f8',
      iconColor: '#dc3545',
    },
    [AlertTypes.WARNING]: {
      icon: 'warning',
      title: title || '¡Advertencia!',
      confirmButtonColor: '#ffc107',
      background: '#fffef8',
      iconColor: '#ffc107',
    },
    [AlertTypes.INFO]: {
      icon: 'info',
      title: title || 'Información',
      confirmButtonColor: '#17a2b8',
      background: '#f8faff',
      iconColor: '#17a2b8',
    },
    [AlertTypes.QUESTION]: {
      icon: 'question',
      title: title || 'Confirmar',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      background: '#ffffff',
      iconColor: '#007bff',
    },
  };

  return { ...configs[type], text: message, ...options };
};

// Componente con métodos estáticos
class AlertCustom {
  // Alerta básica
  static show({ type, title, message, onConfirm, timer = null, showConfirmButton = true }) {
    const config = getConfigByType(type, title, message, {
      confirmButtonText: 'Aceptar',
      timer: timer,
      showConfirmButton: showConfirmButton,
      timerProgressBar: timer ? true : false,
      didOpen: () => {
        if (timer) {
          Swal.getPopup()?.addEventListener('mouseenter', Swal.stopTimer);
          Swal.getPopup()?.addEventListener('mouseleave', Swal.resumeTimer);
        }
      },
    });

    return Swal.fire(config).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
      return result;
    });
  }

  // Alerta de éxito
  static success(message, title = '¡Éxito!', options = {}) {
    return this.show({ type: AlertTypes.SUCCESS, title, message, ...options });
  }

  // Alerta de error
  static error(message, title = '¡Error!', options = {}) {
    return this.show({ type: AlertTypes.ERROR, title, message, ...options });
  }

  // Alerta de advertencia
  static warning(message, title = '¡Advertencia!', options = {}) {
    return this.show({ type: AlertTypes.WARNING, title, message, ...options });
  }

  // Alerta de información
  static info(message, title = 'Información', options = {}) {
    return this.show({ type: AlertTypes.INFO, title, message, ...options });
  }

  // Alerta de confirmación (con Sí/No)
  static confirm({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Sí',
    cancelText = 'Cancelar',
    confirmButtonColor = '#28a745',
  }) {
    return Swal.fire({
      title: title || '¿Estás seguro?',
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor: '#dc3545',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      } else if (result.dismiss === Swal.DismissReason.cancel && onCancel) {
        onCancel();
      }
      return result;
    });
  }

  // Toast (notificación pequeña que desaparece sola)
  static toast(message, type = 'success', position = 'top-end', duration = 3000) {
    const Toast = Swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({
      icon: type,
      title: message,
    });
  }

  // Alerta con HTML personalizado
  static html({ title, html, type = 'info', confirmText = 'Aceptar', width = '500px' }) {
    return Swal.fire({
      title: title,
      html: html,
      icon: type,
      confirmButtonText: confirmText,
      width: width,
      confirmButtonColor: '#007bff',
    });
  }

  // Alerta con formulario
  static async prompt({ title, message, inputType = 'text', placeholder = '', onConfirm }) {
    const result = await Swal.fire({
      title: title,
      text: message,
      input: inputType,
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Este campo es requerido';
        }
      },
    });

    if (result.isConfirmed && onConfirm) {
      onConfirm(result.value);
    }
    return result;
  }
}

export { AlertCustom, AlertTypes };
export default AlertCustom;
