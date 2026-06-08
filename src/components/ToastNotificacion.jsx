// components/ToastNotificacion.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const iconos = {
  success: <CheckCircle size={20} className="text-success" />,
  error: <XCircle size={20} className="text-danger" />,
  info: <Info size={20} className="text-info" />,
  warning: <AlertTriangle size={20} className="text-warning" />
};

const colores = {
  success: '#d4edda',
  error: '#f8d7da',
  info: '#d1ecf1',
  warning: '#fff3cd'
};

export function ToastNotificacion({ mensaje, tipo = 'success', duracion = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duracion);
    return () => clearTimeout(timer);
  }, [duracion, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: colores[tipo],
        borderLeft: `4px solid ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : tipo === 'warning' ? '#ffc107' : '#17a2b8'}`,
        borderRadius: '8px',
        padding: '12px 20px',
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {iconos[tipo]}
        <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{mensaje}</span>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.7 }}
        >
          <X size={16} />
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ✅ ToastContainer definido FUERA del hook
export function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      {toasts.map(toast => (
        <ToastNotificacion
          key={toast.id}
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          duracion={toast.duracion}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((mensaje, tipo = 'success', duracion = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo, duracion }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { showToast, toasts, removeToast };
}