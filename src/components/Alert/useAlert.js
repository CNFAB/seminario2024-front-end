// hooks/useAlert.js
import AlertCustom from './AlertCustom';

const useAlert = () => {
  const showSuccess = (message, title = '¡Éxito!', timer = null) => {
    return AlertCustom.success(message, title, { timer });
  };

  const showError = (message, title = '¡Error!', timer = null) => {
    return AlertCustom.error(message, title, { timer });
  };

  const showWarning = (message, title = '¡Advertencia!', timer = null) => {
    return AlertCustom.warning(message, title, { timer });
  };

  const showInfo = (message, title = 'Información', timer = null) => {
    return AlertCustom.info(message, title, { timer });
  };
  const showConfirm = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    confirmButtonColor,
  }) => {
    return AlertCustom.confirm({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      confirmButtonColor,
    });
  };

  const showToast = (message, type = 'success', duration = 3000) => {
    return AlertCustom.toast(message, type, 'top-right', duration);
  };

  const showHtml = ({ title, html, type, confirmText }) => {
    return AlertCustom.html({ title, html, type, confirmText });
  };

  const showPrompt = ({ title, message, inputType, placeholder, onConfirm }) => {
    return AlertCustom.prompt({ title, message, inputType, placeholder, onConfirm });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showToast,
    showHtml,
    showPrompt,
    AlertCustom,
  };
};

export default useAlert;
