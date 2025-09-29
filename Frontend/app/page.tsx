"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Simulación de autenticación: obtener rol del usuario (en real, usar auth real)
  useEffect(() => {
    // Aquí deberías obtener el rol real del usuario autenticado
    // Por demo, lo leo de localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:8000/productos/");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError("No se pudieron cargar los productos");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // Escuchar si se vuelve de agregar producto
    window.addEventListener("focus", fetchProducts);
    return () => window.removeEventListener("focus", fetchProducts);
  }, []);

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

      {/* Botón solo para admin y vendedor */}
      {(userRole === "admin" || userRole === "vendedor") && (
        <div style={{ margin: "1rem 0", textAlign: "right" }}>
          <button onClick={() => router.push("/add-product")}>Agregar producto</button>
        </div>
      )}

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

        {loading && <div>Cargando productos...</div>}
        {error && <div style={{color: '#ff5555'}}>{error}</div>}
        {!loading && !error && products.length === 0 && <div>No hay productos.</div>}
        {!loading && !error && products.map(product => (
          <div key={product.id} style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',}}>
            <img src={product.image_url || "/buzo.jpeg"} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
            {product.discount > 0 && (
              <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold',}}>
                {product.discount}% OFF
              </span>
            )}
            <h3>{product.name}</h3>
            <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>{product.price && product.discount ? `$${(product.price / (1 - product.discount / 100)).toFixed(2)}` : ''}</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>${product.price}</p>
            <p style={{ fontSize: '0.9rem', color: '#ccc' }}>{product.description}</p>
            <button
              style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer',}}
              onClick={async () => {
                try {
                  const res = await fetch(`http://localhost:8000/cart/?user_id=1`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: product.id, quantity: 1 })
                  });
                  if (res.ok) {
                    alert("Producto agregado al carrito");
                  } else {
                    alert("No se pudo agregar al carrito");
                  }
                } catch (e) {
                  alert("Error de red al agregar al carrito");
                }
              }}
            >
              COMPRAR
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}

