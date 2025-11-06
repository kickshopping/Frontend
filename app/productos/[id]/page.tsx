"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import style from "./product.module.css";

export default function ProductPage() {
  const params = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVendedor, setIsVendedor] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVendedor(localStorage.getItem("user_type") === "vendedor");
    }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) {
        setError("No se encontró el ID del producto");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching product with ID:', params.id);
        const response = await fetch(`${API_BASE}/productos/${params.id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const json = await response.json();
        console.log('Product data received:', json);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${json.detail || 'No se pudo cargar el producto'}`);
        }
        
        if (!json) {
          throw new Error('No se recibieron datos del producto');
        }

        console.log('Setting product data:', json);
        setError("");
        setProduct(json);
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(null);
        setError(err instanceof Error ? err.message : "No se pudo cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchProduct();
  }, [params.id]);

  return (
    <div>
      {/* Barra de navegación */}
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
        <Link href="/" className="navbar-title">KICKSHOPPING</Link>
        <div className="right-icons">
          <Link href="/carrito">
            <i className="bx bx-cart"></i>
          </Link>
          <Link href="/usuario">
            <i className="bx bx-user"></i>
          </Link>
          <Link href="/">
            <i className="bx bx-home"></i>
          </Link>
        </div>
      </div>

      {/* Menú desplegable */}
      <ul className={`dropdown ${menuOpen ? "show" : ""}`} id="menu">
        <li><Link href="/categoria/ofertas">Ofertas</Link></li>
        <li><Link href="/productos">Todo</Link></li>
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
        <details>
          <summary>Unisex ‣</summary>
          <ol>
            <li><Link href="/categoria/pantalones-unisex">Pantalones</Link></li>
            <li><Link href="/categoria/remeras-unisex">Remeras</Link></li>
            <li><Link href="/categoria/zapatillas-unisex">Zapatillas</Link></li>
            <li><Link href="/categoria/bolsos-unisex">Bolsos</Link></li>
            <li><Link href="/categoria/accesorios-unisex">Accesorios</Link></li>
          </ol>
        </details>
        {isVendedor && (
          <li style={{marginTop:'12px'}}><Link href="/publicar-producto" style={{color:'#2196f3',fontWeight:'bold'}}>Publicar producto</Link></li>
        )}
      </ul>

      {/* Vista de Producto */}
      <main className={style["vista-producto"]}>
        {loading ? (
          <div>Cargando producto...</div>
        ) : error ? (
          <div style={{color: '#ff5555', padding: '20px', textAlign: 'center'}}>{error}</div>
        ) : product ? (
          <div className={style["producto-detalle"]}>
            {/* Imagen del producto */}
            <div className={style["producto-imagen"]}>
                <img
                  src={(() => {
                    const img = product.image_url;
                    console.log('Image URL:', img);
                    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    if (!img) return '/buzo.jpeg';
                    if (typeof img === 'string' && img.startsWith('http')) return img;
                    if (typeof img === 'string' && img.startsWith('/static/uploads/')) return `${API_BASE}${img}`;
                    return '/buzo.jpeg';
                  })()}
                  alt={product.name || 'Producto'}
                  onError={e => { 
                    console.log('Error loading image, using fallback');
                    e.currentTarget.src = "/buzo.jpeg"; 
                  }}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              {product.discount > 0 && (
                <span className={style.descuento}>{product.discount}% OFF</span>
              )}
            </div>
            {/* Información del producto */}
            <div className={style["producto-info"]}>
              <h1>{product.name}</h1>
              <p className={style["precio-anterior"]}>{product.price && product.discount ? `$${(product.price / (1 - product.discount / 100)).toFixed(2)}` : ''}</p>
              <p className={style.precio}>${product.price}</p>
              <p className={style.transferencia}>{product.description}</p>
              <div className={style.acciones}>
                <button
                  className={style["btn-carrito"]}
                  onClick={async () => {
                    const token = typeof window !== "undefined" ? localStorage.getItem("tokenkick") : null;
                    if (!token) {
                      window.location.href = "/login";
                      return;
                    }
                    // Decodificar el user_id del token JWT
                    function parseJwt(token: string): any {
                      try {
                        return JSON.parse(atob(token.split('.')[1]));
                      } catch (e) { return null; }
                    }
                    const payload = parseJwt(token);
                    const userId = payload && payload.user_id ? payload.user_id : null;
                    if (!userId) {
                      window.location.href = "/login";
                      return;
                    }
                    try {
                      const res = await fetch(`${API_BASE}/cart_items`, {
                        method: "POST",
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          user_id: userId,
                          product_id: product.id,
                          quantity: 1
                        })
                      });
                      if (res.ok) {
                        window.location.href = "/carrito";
                      } else {
                        const errorData = await res.json().catch(() => ({}));
                        alert("No se pudo agregar al carrito: " + (errorData.detail || res.statusText));
                        console.error('Error al agregar al carrito:', errorData);
                      }
                    } catch (e) {
                      let errorMsg = '';
                      if (typeof e === 'object' && e !== null && 'message' in e) {
                        errorMsg = (e as any).message;
                      } else {
                        errorMsg = String(e);
                      }
                      alert("Error de red al agregar al carrito: " + errorMsg);
                      console.error('Error de red al agregar al carrito:', e);
                    }
                  }}
                >
                  <i className="bx bx-cart"></i> Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{padding: '20px', textAlign: 'center'}}>No se encontró el producto.</div>
        )}
      </main>
    </div>
  );
}