// components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const getInitials = (nombre = '', apellido = '') =>
  `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();

const ROL_LABEL = {
  es_tecnico:        'Panel técnico',
  es_administrador:  'Panel administrador',
  es_recepcionista:  'Recepcionista',
  cliente:           'Portal cliente',
};

/**
 * Header reutilizable para Técnico, Admin y Cliente.
 *
 * Props:
 *  - user        : { nombre, apellido, correo, roles?: { es_tecnico, es_administrador, es_recepcionista } }
 *  - rolKey      : 'es_tecnico' | 'es_administrador' | 'es_recepcionista' | 'cliente'
 *  - onLogout    : función para cerrar sesión
 *  - profilePath : ruta para ver perfil (default '/perfil')
 */
const Header = ({ user, rolKey = 'cliente', onLogout, profilePath = '/perfil' }) => {
  const navigate  = useNavigate();
  const rolLabel  = ROL_LABEL[rolKey] || 'Panel';
  const initials  = getInitials(user?.nombre, user?.apellido);

  return (
    <header className="rt-header">

        {/* Logo */}
        <span className="rt-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span>Repara</span><span>Tech</span>
        </span>

        {/* Derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Nombre + rol */}
          <div className="rt-user-info">
            <span className="rt-user-name">
              {user?.nombre} {user?.apellido}
            </span>
            <span className="rt-user-role">{rolLabel} · {user?.correo}</span>
          </div>

          <div className="rt-divider" />

          {/* Avatar → perfil */}
          <div
            className="rt-avatar"
            onClick={() => navigate(profilePath)}
            title="Ver mi perfil"
          >
            {initials}
          </div>

          {/* Cerrar sesión */}
          <button className="rt-btn-logout" onClick={onLogout}>
            Cerrar sesión
          </button>

        </div>
    </header>
  );
};

export default Header;