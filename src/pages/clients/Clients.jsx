import React from 'react'
import "../clients/clients.css"
const Clients = () => {
  return (
   
    <div className="container">
    <h2 >CREDENCIALES</h2>
    <div className="inputBox">
       <input type="text" required="required" />
       <span>Correo Electronico</span>
    </div>
    <div className="inputBox">
       <input type="text" required="required" />
       <span>Contraseña</span>
    </div>
    <button className='letrasbtn fw-bold shadow-sm px-4 py-2 rounded-pill  btn-outline-dar' >ingresar </button>
  </div>
  )
}

export default Clients
