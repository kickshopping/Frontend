"use client"; // Necesario porque usamos onClick (JS en el cliente)
import Link from "next/link";
import { useState } from "react";
import style from "./product.module.css"; // Importa los estilos específicos de esta página

export default function ProductPage() {
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
            <a href="/carrito">
                <i className="bx bx-cart"></i>
            </a>    
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
    
      {/* Vista de Producto */}
      <main className={style["vista-producto"]}>
        <div className={style["producto-detalle"]}>
          {/* Imagen del producto */}
          <div className={style["producto-imagen"]}>
            <img src="/buzo.jpeg" alt="Conjunto DAZLER NEGRO" />
            <span className={style.descuento}>11% OFF</span>
          </div>

          {/* Información del producto */}
          <div className={style["producto-info"]}>
            <h1>Conjunto DAZLER NEGRO [Campera + Jogging] {"{Oversize}"}</h1>
            <p className={style["precio-anterior"]}>$131.950</p>
            <p className={style.precio}>$117.948</p>
            <p className={style.transferencia}>$94.358,40 con Transferencia</p>
            <p className={style.cuotas}>6 cuotas sin interés de $19.658</p>

            {/* Botones de acción */}
            <div className={style.acciones}>
              <button className={style["btn-comprar"]}>COMPRAR</button>
              <button className={style["btn-carrito"]}><i className="bx bx-cart"></i> Agregar al carrito</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}