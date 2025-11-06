"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tokenkick');
      const userJson = localStorage.getItem('user');
      setIsLoggedIn(!!token);
      
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          setUserType(user.user_type);
          setUserName(user.username);
        } catch (e) {}
      }
    }
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <>
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
        <Link href="/" className="navbar-title" style={{cursor:'pointer'}}>
          KICKSHOPPING
        </Link>
        <div className="right-icons">
          {isLoggedIn ? (
            <>
              <Link href="/carrito" title="Carrito">
                <i className="bx bx-cart"></i>
              </Link>
              <Link href="/usuario" title={`Perfil de ${userName || 'usuario'}`}>
                <i className="bx bx-user"></i>
              </Link>
            </>
          ) : (
            <Link href="/login" title="Iniciar sesión">
              <i className="bx bx-log-in"></i>
            </Link>
          )}
          <Link href="/" title="Inicio">
            <i className="bx bx-home"></i>
          </Link>
        </div>
      </div>

      {/* Menú desplegable */}
      <ul className={`dropdown ${menuOpen ? "show" : ""}`} id="menu">
        <li><Link href="/categoria/ofertas">Ofertas</Link></li>
        <li><Link href="/productos">Todo</Link></li>
        {isLoggedIn && userType === 'Vendedor' && (
          <li><Link href="/publicar-producto">Publicar Producto</Link></li>
        )}
        <details>
          <summary>Hombre ‣</summary>
          <ol>
            <li><Link href="/categoria/calzones-hombre">Calzones</Link></li>
            <li><Link href="/categoria/gorras-hombre">Gorras</Link></li>
            <li><Link href="/categoria/camperas-hombre">Camperas</Link></li>
            <li><Link href="/categoria/buzos-hombre">Buzos</Link></li>
            <li><Link href="/categoria/pantalones-hombre">Pantalones</Link></li>
            <li><Link href="/categoria/remeras-hombre">Remeras</Link></li>
            <li><Link href="/categoria/camisas-hombre">Camisas</Link></li>
            <li><Link href="/categoria/zapatillas-hombre">Zapatillas</Link></li>
          </ol>
        </details>
        <details>
          <summary>Mujer ‣</summary>
          <ol>
            <li><Link href="/categoria/calzones-mujer">Calzones</Link></li>
            <li><Link href="/categoria/gorras-mujer">Gorras</Link></li>
            <li><Link href="/categoria/camperas-mujer">Camperas</Link></li>
            <li><Link href="/categoria/buzos-mujer">Buzos</Link></li>
            <li><Link href="/categoria/pantalones-mujer">Pantalones</Link></li>
            <li><Link href="/categoria/remeras-mujer">Remeras</Link></li>
            <li><Link href="/categoria/camisas-mujer">Camisas</Link></li>
            <li><Link href="/categoria/zapatillas-mujer">Zapatillas</Link></li>
          </ol>
        </details>
      </ul>
    </>
  );
}