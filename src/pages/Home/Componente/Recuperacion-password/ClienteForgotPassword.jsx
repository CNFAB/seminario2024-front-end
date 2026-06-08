// src/pages/Clients/ClienteForgotPassword.jsx
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../../../../services/AuthService';
import emailjs from '@emailjs/browser';
import './ClienteAuth.css';

// Configuración de EmailJS (pon tus propias claves)
const EMAILJS_SERVICE_ID = 'service_ljls08d';
const EMAILJS_TEMPLATE_ID = 'template_m094w4e';
const EMAILJS_PUBLIC_KEY = '404qej1lJI0ONMgi2';

const ClienteForgotPassword = () => {
    const [correo, setCorreo] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!correo) {
        setError('Por favor ingresa tu correo electrónico');
        return;
    }

    setLoading(true);
    setError('');

    try {
        console.log('1. Enviando solicitud al backend con:', correo);
        
        // 1. Obtener token del backend
        const response = await authService.forgotPassword(correo);
        
        console.log('2. Respuesta completa del backend:', response);
        console.log('3. response.success:', response.success);
        console.log('4. response.data:', response.data);
        
        if (response.success && response.data) {
            const { token, correo: emailDestino, nombre } = response.data;
            console.log('5. Token recibido:', token);
            console.log('6. Email destino:', emailDestino);
            
            // 2. Crear URL de restablecimiento
            const resetUrl = `${import.meta.env.VITE_API_URL ||
            window.location.origin}/cliente/reset-password?token=${token}&email=${encodeURIComponent(emailDestino)}`
            
            // 3. Enviar email con EmailJS
            console.log('8. Enviando email con EmailJS...');
            const emailResponse = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_email: emailDestino,
                    to_name: nombre,
                    link: resetUrl,
                },
                EMAILJS_PUBLIC_KEY
            );
            console.log('9. EmailJS respuesta:', emailResponse);
            
            setSubmitted(true);
        } else {
            console.log('10. Error: response.success es false o no hay data');
            setError(response.message || 'Error al generar el enlace');
        }
    } catch (err) {
        console.error('11. Error capturado:', err);
        setError('Error de conexión. Intenta nuevamente.');
    } finally {
        setLoading(false);
    }
};

    if (submitted) {
        return (
            <div className="cliente-auth-container">
                <div className="cliente-auth-card">
                    <div className="text-center">
                        <div className="success-icon">
                            <CheckCircle size={48} className="text-green" />
                        </div>
                        <h2 className="mt-3">📧 Revisa tu correo</h2>
                        <p className="text-muted mt-2">
                            Enviamos un enlace de recuperación a <strong>{correo}</strong>
                        </p>
                        <p className="text-muted small">
                            Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                        </p>
                        <a href="/home" className="btn btn-primary mt-4 d-inline-flex align-items-center gap-2">
                            <ArrowLeft size={16} />
                            Volver al inicio
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cliente-auth-container">
            <div className="cliente-auth-card">
                <div className="text-center mb-4">
                    <h2 className="mb-2">¿Olvidaste tu contraseña?</h2>
                    <p className="text-muted">
                        Ingresa tu correo y te enviaremos un enlace para restablecerla.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <div className="input-icon-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="form-control"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="tu@email.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger mt-3 d-flex align-items-center gap-2">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 mt-3"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                    </button>

                    <a href="/home" className="btn btn-link w-100 mt-2 text-center">
                        <ArrowLeft size={14} className="me-1" />
                        Volver al inicio
                    </a>
                </form>
            </div>
        </div>
    );
};

export default ClienteForgotPassword;