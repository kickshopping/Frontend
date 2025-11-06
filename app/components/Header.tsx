"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      {/* Barra de navegación */}
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
        <Link href="/" className="navbar-title">
          KICKSHOPPING
        </Link>
        <div className="right-icons">
          <Link href="/carrito">
            <i className="bx bx-cart"></i>
          </Link>
          <Link href="/usuario">
            <i className="bx bx-user"></i>
          </Link>
          {isVendedor && (
            <Link href="/publicar-producto">
              <i className="bx bx-plus"></i>
            </Link>
          )}
        </div>
      </div>

      {/* Menú desplegable con categorías */}
      <ul className={`dropdown ${menuOpen ? "show" : ""}`} id="menu">
        <li>
          <Link href="/categoria/ofertas" onClick={toggleMenu}>
            Ofertas
          </Link>
        </li>
        <li>
          <Link href="/" onClick={toggleMenu}>
            Todo
          </Link>
        </li>
        <details>
          <summary>Hombre ‣</summary>
          <ol>
            <li>
              <Link href="/categoria/calzones" onClick={toggleMenu}>
                Calzones
              </Link>
            </li>
            <li>
              <Link href="/categoria/camperas" onClick={toggleMenu}>
                Camperas
              </Link>
            </li>
            <li>
              <Link href="/categoria/buzos" onClick={toggleMenu}>
                Buzos
              </Link>
            </li>
            <li>
              <Link href="/categoria/pantalones" onClick={toggleMenu}>
                Pantalones
              </Link>
            </li>
            <li>
              <Link href="/categoria/remeras-hombre" onClick={toggleMenu}>
                Remeras
              </Link>
            </li>
            <li>
              <Link href="/categoria/accesorios-hombre" onClick={toggleMenu}>
                Accesorios
              </Link>
            </li>
          </ol>
        </details>
        <details>
          <summary>Mujer ‣</summary>
          <ol>
            <li>
              <Link href="/categoria/vestidos" onClick={toggleMenu}>
                Vestidos
              </Link>
            </li>
            <li>
              <Link href="/categoria/blusas" onClick={toggleMenu}>
                Blusas
              </Link>
            </li>
            <li>
              <Link href="/categoria/buzos-mujer" onClick={toggleMenu}>
                Buzos
              </Link>
            </li>
            <li>
              <Link href="/categoria/faldas" onClick={toggleMenu}>
                Faldas
              </Link>
            </li>
            <li>
              <Link href="/categoria/pantalones-mujer" onClick={toggleMenu}>
                Pantalones
              </Link>
            </li>
            <li>
              <Link href="/categoria/remeras-mujer" onClick={toggleMenu}>
                Remeras
              </Link>
            </li>
            <li>
              <Link href="/categoria/accesorios-mujer" onClick={toggleMenu}>
                Accesorios
              </Link>
            </li>
          </ol>
        </details>
      </ul>
    </>
  );
}