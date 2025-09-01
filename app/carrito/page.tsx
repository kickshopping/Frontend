"use client"; // Necesario porque usamos onClick (JS en el cliente)
import Link from "next/link";
import { useState } from "react";
import style from "./cart.module.css"; // Importa los estilos específicos de esta página


export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div>
      {/* Barra de navegación */}
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
        <div className="navbar-title">KICKSHOPPING</div>
        <div className="right-icons">
          <a href="/usuario">
            <i className="bx bx-user"></i>
          </a>
          <a href="/">
            <i className="bx bx-home"></i>
          </a>
        </div>
      </div>

      {/* Menú desplegable */}
      <ul className={`dropdown ${menuOpen ? "show" : ""}`} id="menu">
        <li><a href="#">Ofertas</a></li>
        <li><a href="#">Todo</a></li>

        <details>
          <summary>Hombre ‣</summary>
          <ol>
            <li><a href="#">Calzones</a></li>
            <li><a href="#">Gorras</a></li>
            <li><a href="#">Camperas</a></li>
            <li><a href="#">Buzos</a></li>
            <li><a href="#">Pantalones</a></li>
            <li><a href="#">Remeras</a></li>
            <li><a href="#">Camisas</a></li>
            <li><a href="#">Zapatillas</a></li>
          </ol>
        </details>

        <details>
          <summary>Mujer ‣</summary>
          <ol>
            <li><a href="#">Vestidos</a></li>
            <li><a href="#">Blusas</a></li>
            <li><a href="#">Faldas</a></li>
            <li><a href="#">Pantalones</a></li>
            <li><a href="#">Remeras</a></li>
            <li><a href="#">Zapatillas</a></li>
            <li><a href="#">Bolsos</a></li>
            <li><a href="#">Accesorios</a></li>
          </ol>
        </details>
      </ul>

      {/* Productos */}
      <main>

        {/* Contenido */}
        <div className={style.container}>
            <h2>Carrito de Compras</h2>
            <div id="carrito-lista"></div>
            <div className={style.total} id="carrito-total">Total: $0.00</div>
            <button className={style["btn-comprar"]}>Realizar compra</button>
        </div>
      </main>
    </div>
  );
}
