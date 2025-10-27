"use client";
import React, { useState, useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVendedor, setIsVendedor] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVendedor(localStorage.getItem("user_type") === "vendedor");
    }
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
        <div className="navbar-title">KICKSHOPPING</div>
        <div className="right-icons">
          <a href="/usuario">
            <i className="bx bx-user"></i>
          </a>
          <a href="/carrito">
            <i className="bx bx-cart"></i>
          </a>
        </div>
      </div>

      <ul className={`dropdown ${menuOpen ? "show" : ""}`} id="menu">
        <li><a href="/ofertas">Ofertas</a></li>
        <li><a href="/">Todo</a></li>
        <details>
          <summary>Hombre ‣</summary>
          <ol>
            <li><a href="/categoria/calzones">Calzones</a></li>
            <li><a href="/categoria/gorras">Gorras</a></li>
            <li><a href="/categoria/camperas">Camperas</a></li>
            <li><a href="/categoria/buzos">Buzos</a></li>
            <li><a href="/categoria/pantalones">Pantalones</a></li>
            <li><a href="/categoria/remeras">Remeras</a></li>
            <li><a href="/categoria/camisas">Camisas</a></li>
            <li><a href="/categoria/zapatillas">Zapatillas</a></li>
          </ol>
        </details>
        <details>
          <summary>Mujer ‣</summary>
          <ol>
            <li><a href="/categoria/vestidos">Vestidos</a></li>
            <li><a href="/categoria/blusas">Blusas</a></li>
            <li><a href="/categoria/faldas">Faldas</a></li>
            <li><a href="/categoria/pantalones">Pantalones</a></li>
            <li><a href="/categoria/remeras">Remeras</a></li>
            <li><a href="/categoria/zapatillas">Zapatillas</a></li>
            <li><a href="/categoria/bolsos">Bolsos</a></li>
            <li><a href="/categoria/accesorios">Accesorios</a></li>
          </ol>
        </details>
        <details>
          <summary>Unisex ‣</summary>
          <ol>
            <li><a href="/categoria/pantalones">Pantalones</a></li>
            <li><a href="/categoria/remeras">Remeras</a></li>
            <li><a href="/categoria/zapatillas">Zapatillas</a></li>
            <li><a href="/categoria/bolsos">Bolsos</a></li>
            <li><a href="/categoria/accesorios">Accesorios</a></li>
          </ol>
        </details>
        {isVendedor && (
          <li style={{ marginTop: '12px' }}><a href="/publicar-producto" style={{ color: '#2196f3', fontWeight: 'bold' }}>Publicar producto</a></li>
        )}
      </ul>
    </>
  );
}
