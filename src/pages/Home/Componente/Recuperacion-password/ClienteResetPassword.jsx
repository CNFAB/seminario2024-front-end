// src/pages/Clients/ClienteResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import authService from '../../../../services/AuthService';
import './ClienteAuth.css';

const ClienteResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const token = searchParams.get('token');
    const correo = searchParams.get('email');
    
    const [contrasena, setContrasena] = useState('');
    const [contrasenaConfirmation, setContrasenaConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token || !correo) {
            setError('Enlace inválido. Solicita un nuevo enlace de recuperación.');
        }
    }, [token, correo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!contrasena || !contrasenaConfirmation) {
            setError('Por favor completa todos los campos');
            return;
        }
        
        if (contrasena !== contrasenaConfirmation) {
            setError('Las contraseñas no coinciden');
            return;
        }
        
        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.resetPassword({
                correo,
                token,
                contrasena,
                contrasena_confirmation: contrasenaConfirmation
            });
            
            if (response.success) {
                setSubmitted(true);
                setTimeout(() => {
                    navigate('/home');
                }, 3000);
            } else {
                setError(response.message || 'Error al restablecer la contraseña');
            }
        } catch (err) {
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
                        <h2 className="mt-3"> ¡Contraseña actualizada!</h2>
                        <p className="text-muted mt-2">
                            Tu contraseña ha sido restablecida correctamente.
                        </p>
                        <p className="text-muted small">
                            Serás redirigido al inicio en unos segundos...
                        </p>
                        <a href="/home" className="btn btn-primary mt-4">
                            Ir al inicio
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
                    <h2 className="mb-2">Crear nueva contraseña</h2>
                    <p className="text-muted">
                        Ingresa tu nueva contraseña para continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nueva contraseña</label>
                        <div className="input-icon-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="form-control"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group mt-3">
                        <label className="form-label">Confirmar contraseña</label>
                        <div className="input-icon-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="form-control"
                                value={contrasenaConfirmation}
                                onChange={(e) => setContrasenaConfirmation(e.target.value)}
                                placeholder="Repite tu contraseña"
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
                        disabled={loading || !token}
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
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

export default ClienteResetPassword;