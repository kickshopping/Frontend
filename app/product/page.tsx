"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authFetchJson, authFetch } from "../../lib/api";
import style from "./product.module.css"; // Importa los estilos específicos de esta página

export default function ProductPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVendedor, setIsVendedor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Obtener el producto por id y el tipo de usuario
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Primero intentar derivar el rol desde el token (más confiable)
      let detectedAdmin = false;
      const token = localStorage.getItem('tokenkick');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && (payload.rol_id === 1 || payload.rol_id === '1')) detectedAdmin = true;
        } catch (e) {
          // token mal formado, fallback a localStorage.user_type
        }
      }

      const userType = localStorage.getItem("user_type");
      // Normalizar y proteger contra valores nulos/espacios
      const normalized = userType?.toString().trim().toLowerCase();
      const finalIsVendedor = normalized === "vendedor";
      let finalIsAdmin = detectedAdmin || normalized === "administrador";
      // Si ClientInit ya marcó el body, respetarlo (evita condiciones de carrera)
      try {
        if (typeof document !== 'undefined' && document.body.classList.contains('is-admin')) {
          finalIsAdmin = true;
        }
      } catch (e) {}
      setIsVendedor(finalIsVendedor);
      setIsAdmin(finalIsAdmin);

      // DEBUG: logs to diagnose why admin flag might not be set in the browser
      try {
        const tokenPresent = !!token;
        let payload: any = null;
        if (tokenPresent) {
          try { payload = JSON.parse(atob((token as string).split('.')[1])); } catch (e) { payload = `malformed: ${e}`; }
        }
        console.log('[DEBUG] product page admin detection', { tokenPresent, payload, userType, normalized, detectedAdmin, finalIsAdmin, finalIsVendedor, bodyIsAdmin: typeof document !== 'undefined' && document.body.classList.contains('is-admin') });
      } catch (e) {}

  const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      console.log('URL product ID:', id);
      setProductId(id);
    }
  }, []); // Este efecto solo se ejecuta una vez al montar el componente

  const handleDeleteProduct = async () => {
    // Determinar id del producto (preferir productId de la URL, si no usar product.id)
    const idToDelete = productId || (product && product.id ? String(product.id) : null);
    if (!idToDelete) {
      alert('No se encontró el ID del producto para eliminar');
      return;
    }

    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("tokenkick");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      setDeleting(true);

      // Usar authFetchJson para obtener cuerpo de error si lo hay
      const { res, json } = await authFetchJson(`${API_BASE}/productos/${idToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // El backend puede devolver 200/204/202; mostrar mensaje y redirigir al inicio
        setSuccessMessage('Producto eliminado correctamente. Redirigiendo al inicio...');
        // Dar tiempo para que el usuario lea el mensaje
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        const detail = (json && (json.detail || json.message)) || res.statusText;
        alert("No se pudo eliminar el producto: " + detail);
        console.error('Error al eliminar el producto:', res.status, json);
      }
    } catch (e) {
      alert("Error al eliminar el producto");
      console.error('Error al eliminar el producto:', e);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No se encontró el ID del producto en la URL");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching product with ID:', productId);
        const response = await fetch(`${API_BASE}/productos/${productId}`, {
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
  }, [productId]);

  return (
    <div>
      {isAdmin && <div className="admin-indicator" />}
      {/* Barra de navegación */}
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
  <Link href="/" className="navbar-title">KICKSHOPPING</Link>
        <div className="right-icons">
          <a href="/carrito">
            <i className="bx bx-cart"></i>
          </a>
          <a href="/usuario" className="user-link">
            <i className="bx bx-user"></i>
            <span className="admin-indicator-inline" aria-hidden="true" />
          </a>
          <a href="/">
            <i className="bx bx-home"></i>
          </a>
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
                <button className={style["btn-comprar"]}>COMPRAR</button>
                
                {/* Botón de eliminar para administradores */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => { router.push(`/editar-producto?id=${productId}`); }}
                      className={style["btn-editar"]}
                    >
                      <i className="bx bx-edit"></i> Editar Producto
                    </button>
                    <button
                      onClick={handleDeleteProduct}
                      className={style["btn-eliminar"]}
                      disabled={deleting}
                    >
                      <i className="bx bx-trash"></i> {deleting ? 'Eliminando...' : 'Eliminar Producto'}
                    </button>
                  </>
                )}
                
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
                      const res = await authFetch(`${API_BASE}/cart_items`, {
                        method: "POST",
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
              {/* Mensaje de éxito después de eliminar */}
              {successMessage && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  background: 'rgba(40,167,69,0.12)',
                  border: '1px solid rgba(40,167,69,0.28)',
                  color: '#28a745',
                  borderRadius: 6,
                  textAlign: 'center'
                }}>{successMessage}</div>
              )}
            </div>
          </div>
        ) : (
          <div style={{padding: '20px', textAlign: 'center'}}>No se encontró el producto.</div>
        )}
      </main>
    </div>
  );
}