"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState } from "react";
import style from "./user.module.css"; // Importa los estilos específicos de esta página

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
<main>
    <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
        <div className="navbar-title">KICKSHOPPING</div>
        <div className="right-icons">
            <a href="/carrito">
                <i className="bx bx-cart"></i>
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
        <details>
            <summary>Unisex ‣</summary>
            <ol>
                <li><a href="#">Pantalones</a></li>
                <li><a href="#">Remeras</a></li>
                <li><a href="#">Zapatillas</a></li>
                <li><a href="#">Bolsos</a></li>
                <li><a href="#">Accesorios</a></li>
            </ol>
        </details>
    </ul>
    {/* Perfil de usuario */}
    <div className={style["perfil-container"]}>
            <div className={style["perfil-avatar"]}>
                <i className={style["icon"]}></i>
            </div>
            <div className={style["perfil-nombre"]}>Juan Pérez</div>
            <div className={style["perfil-email"]}>juan.perez@email.com</div>
            <div className={style["perfil-btns"]}>
                <button className={style["btn-editar"]}>Editar perfil</button>
                <button className={style["btn-cerrar"]}>Cerrar sesión</button>
            </div>
    </div>
</main>
  );
}