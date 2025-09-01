"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState } from "react";

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
          <a href="/carrito">
            <i className="bx bx-cart"></i>
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

      {/* fondo Productos (editar) */}
      <main className="productos-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
        padding: '32px 8vw',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <style>{`
          @media (max-width: 700px) {
            .productos-grid {
              grid-template-columns: 1fr !important;
              padding: 16px 0 !important;
              max-width: 100vw !important;
            }
          }
        `}</style>
          <div style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>
            <img src="/buzo.jpeg" alt="Conjunto Negro" style={{ width: '100%', borderRadius: '8px' }} />
          <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>11% OFF</span>
          <h3>Conjunto DAZLER NEGRO [Campera + Jogging] {"{Oversize}"}</h3>
          <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>$131.950</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>$117.948</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>$94.358,40 con Transferencia</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>6 cuotas sin interés de $19.658</p>
          <button style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}>COMPRAR</button>
        </div>

          {/* Producto 2 */}

        <div style={{ background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>

          <img src="/buzo.jpeg" alt="Buzo Oversize" style={{ width: '100%', borderRadius: '8px' }} />
          
          <span style={{ position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>11% OFF</span>

          <h3>Buzo Oversize Gris Claro</h3>
          <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>$131.950</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>$117.948</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>$94.358,40 con Transferencia</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>6 cuotas sin interés de $19.658</p>
          <button style={{ background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}>COMPRAR</button>
        </div>

        <div style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>
            <img src="/buzo.jpeg" alt="Conjunto Negro" style={{ width: '100%', borderRadius: '8px' }} />
          <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>11% OFF</span>
          <h3>Conjunto DAZLER NEGRO [Campera + Jogging] {"{Oversize}"}</h3>
          <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>$131.950</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>$117.948</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>$94.358,40 con Transferencia</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>6 cuotas sin interés de $19.658</p>
          <button style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}>COMPRAR</button>
        </div>

        <div style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>
            <img src="/buzo.jpeg" alt="Conjunto Negro" style={{ width: '100%', borderRadius: '8px' }} />
          <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>11% OFF</span>
          <h3>Conjunto DAZLER NEGRO [Campera + Jogging] {"{Oversize}"}</h3>
          <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>$131.950</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>$117.948</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>$94.358,40 con Transferencia</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>6 cuotas sin interés de $19.658</p>
          <button style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}>COMPRAR</button>
        </div>

        <div style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>
            <img src="/buzo.jpeg" alt="Conjunto Negro" style={{ width: '100%', borderRadius: '8px' }} />
          <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>11% OFF</span>
          <h3>Conjunto DAZLER NEGRO [Campera + Jogging] {"{Oversize}"}</h3>
          <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>$131.950</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>$117.948</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>$94.358,40 con Transferencia</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>6 cuotas sin interés de $19.658</p>
          <button style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}>COMPRAR</button>
        </div>

        <div style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>
            <img src="/buzo.jpeg" alt="Conjunto Negro" style={{ width: '100%', borderRadius: '8px' }} />
          <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>11% OFF</span>
          <h3>Conjunto DAZLER NEGRO [Campera + Jogging] {"{Oversize}"}</h3>
          <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>$131.950</p>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>$117.948</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>$94.358,40 con Transferencia</p>
          <p style={{ fontSize: '0.9rem', color: '#ccc' }}>6 cuotas sin interés de $19.658</p>
          <button style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}>COMPRAR</button>
        </div>


      </main>
    </div>
  );
}

