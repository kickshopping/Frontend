"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVendedor, setIsVendedor] = useState(false);
  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);
  // Estado para productos
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVendedor(localStorage.getItem("user_type") === "vendedor");
    }
    const fetchProducts = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE}/productos/`);
        if (!res.ok) {
          // Intentar leer cuerpo para obtener detalle del error
          let bodyText = '';
          try { bodyText = await res.text(); } catch (e) { bodyText = ''; }
          throw new Error(`HTTP ${res.status} ${res.statusText} - ${bodyText}`);
        }
        const data = await res.json();
        setProducts(data);
      } catch (err:any) {
        // Mostrar mensaje de error más descriptivo para debugging en UI
        const msg = err && err.message ? err.message : String(err);
        setError(`No se pudieron cargar los productos: ${msg}`);
        console.error('Error fetching products:', err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);
  const router = useRouter();
  return (
    <div>
      <Header />

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
            <img
              src={product.image_url && product.image_url.startsWith('http') ? product.image_url : "/buzo.jpeg"}
              alt={product.name}
              onError={e => { e.currentTarget.src = "/buzo.jpeg"; }}
              style={{ width: '100%', borderRadius: '8px' }}
            />
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
              onClick={() => router.push(`/product?id=${product.id}`)}
            >
              COMPRAR
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}


