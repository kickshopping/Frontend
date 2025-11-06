// No changes made as the specified lines do not exist in the file.
"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState, useEffect } from "react";
import Link from 'next/link';
import style from "./cart.module.css"; // Importa los estilos específicos de esta página
import loadingStyle from "./loading.module.css"; // Importa los estilos del loader
import { authFetch, authFetchJson, API_BASE } from "../../lib/api";


interface CartItem {
  id: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // Función para manejar actualizaciones de cantidad
  const handleQuantityUpdate = async (itemId: number, newQuantity: number) => {
    if (updating) return; // Evitar múltiples actualizaciones simultáneas
    if (newQuantity < 1) return; // Evitar cantidades negativas

    setUpdating(true); 
    try {
      // Primer intento: PATCH usando el cart_item id
      let res = await authFetch(`${API_BASE}/cart_items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setCart(cart.map(item => 
          item.id === itemId ? {...item, quantity: newQuantity} : item
        ));
        console.log('Cantidad actualizada (patch):', data);
        setUpdating(false);
        return;
      }

      // Si PATCH falla, intentar recuperar el cart_item correcto por product_id
      const errorData = await res.json().catch(() => ({}));
      console.warn('PATCH falló, intentando resolver cart_item por product_id', res.status, errorData);

      // Determinar productId (preferir product.id si está disponible en estado)
      const localItem = cart.find(i => i.id === itemId || i.product?.id === itemId);
      const productId = localItem?.product?.id ?? itemId;

      // Refrescar el carrito desde el servidor para buscar el cart_item asociado a ese product
      try {
        const { res: refreshRes, json: refreshed } = await authFetchJson(`/cart_items/user/${userId}`);
        if (refreshRes.ok && Array.isArray(refreshed)) {
          const match = refreshed.find((ci: any) => ci.product && (ci.product.id === productId || ci.product.id == productId));
          if (match && match.id) {
            // Reintentar PATCH con el id correcto
            const retry = await authFetch(`${API_BASE}/cart_items/${match.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: newQuantity })
            });
            if (retry.ok) {
              const data = await retry.json().catch(() => ({}));
              setCart(refreshed);
              console.log('Cantidad actualizada tras refresh:', data);
              setUpdating(false);
              return;
            }
          }
        }
      } catch (refreshErr) {
        console.error('Error al refrescar carrito durante fallback:', refreshErr);
      }

      // Si no encontramos el cart_item en el servidor, intentar crear uno nuevo (POST)
      try {
        const postRes = await authFetch(`${API_BASE}/cart_items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: productId, quantity: newQuantity })
        });
        if (postRes.ok) {
          const created = await postRes.json().catch(() => ({}));
          // Refrescar el carrito local con la lista desde el servidor
          const { res: r2, json: newList } = await authFetchJson(`/cart_items/user/${userId}`);
          if (r2.ok && Array.isArray(newList)) {
            setCart(newList);
          } else {
            // Si no podemos obtener la lista, intentar insertar/actualizar en local
            const exists = cart.some(i => i.product?.id === productId);
            if (exists) {
              setCart(cart.map(i => i.product?.id === productId ? {...i, quantity: newQuantity} : i));
            } else {
              setCart([...cart, { id: created.id ?? Math.floor(Math.random()*1000000), quantity: created.quantity ?? newQuantity, product: created.product ?? { id: productId, name: '', price: 0 } }]);
            }
          }
          console.log('Item creado/actualizado vía POST fallback:', created);
          setUpdating(false);
          return;
        } else {
          const pd = await postRes.json().catch(() => ({}));
          throw new Error(pd.detail || 'No se pudo crear/actualizar el item (fallback)');
        }
      } catch (postErr: any) {
        console.error('Error en fallback POST:', postErr);
        throw new Error(postErr?.message || 'No se pudo actualizar la cantidad (fallback)');
      }
    } catch (error: any) {
      console.error('Error al actualizar cantidad:', error);
      alert(error?.message || "Error al actualizar la cantidad");
    } finally {
      setUpdating(false);
    }
  };

  // Incrementar en 1 unidad (usa endpoint dedicado si existe)
  const incrementItem = async (item: CartItem) => {
    if (updating) return;
    setUpdating(true);
    try {
      // Intentar endpoint increment
      let res = await authFetch(`${API_BASE}/cart_items/${item.id}/increment`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setCart(cart.map(ci => ci.id === item.id ? {...ci, quantity: (ci.quantity || 0) + 1} : ci));
        setUpdating(false);
        return;
      }

      // Si no funciona (404/405), intentar resolver id por product y reintentar
      const status = res.status;
      if (status === 404 || status === 405) {
        // refrescar carrito y buscar cart_item por product id
        const { res: r, json: refreshed } = await authFetchJson(`/cart_items/user/${userId}`);
        if (r.ok && Array.isArray(refreshed)) {
          const match = refreshed.find((ci: any) => ci.product && ci.product.id === item.product?.id);
          if (match && match.id) {
            const retry = await authFetch(`${API_BASE}/cart_items/${match.id}/increment`, { method: 'POST' });
            if (retry.ok) {
              const d = await retry.json().catch(() => ({}));
              setCart(refreshed);
              setUpdating(false);
              return;
            }
          }
        }

        // Fallback: usar POST para agregar 1 unidad (create_or_update behavior)
        const postRes = await authFetch(`${API_BASE}/cart_items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, product_id: item.product?.id ?? item.id, quantity: 1 })
        });
        if (postRes.ok) {
          const created = await postRes.json().catch(() => ({}));
          const { res: r2, json: newList } = await authFetchJson(`/cart_items/user/${userId}`);
          if (r2.ok && Array.isArray(newList)) setCart(newList);
          else {
            setCart(cart.map(ci => ci.product?.id === (item.product?.id ?? item.id) ? {...ci, quantity: (ci.quantity||0) + 1} : ci));
          }
          setUpdating(false);
          return;
        }
      }

      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'No se pudo incrementar el item');
    } catch (e: any) {
      console.error('Error incrementando item:', e);
      alert(e?.message || 'Error al incrementar');
    } finally {
      setUpdating(false);
    }
  };

  // Decrementar en 1 unidad (usa endpoint dedicado si existe)
  const decrementItem = async (item: CartItem) => {
    if (updating) return;
    setUpdating(true);
    try {
      // Si la cantidad es 1, eliminar
      if (item.quantity <= 1) {
        await handleDeleteItem(item.id);
        setUpdating(false);
        return;
      }

      let res = await authFetch(`${API_BASE}/cart_items/${item.id}/decrement`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setCart(cart.map(ci => ci.id === item.id ? {...ci, quantity: Math.max((ci.quantity||0) - 1, 0)} : ci));
        setUpdating(false);
        return;
      }

      const status = res.status;
      if (status === 404 || status === 405) {
        // intentar encontrar por product id y reintentar
        const { res: r, json: refreshed } = await authFetchJson(`/cart_items/user/${userId}`);
        if (r.ok && Array.isArray(refreshed)) {
          const match = refreshed.find((ci: any) => ci.product && ci.product.id === item.product?.id);
          if (match && match.id) {
            const retry = await authFetch(`${API_BASE}/cart_items/${match.id}/decrement`, { method: 'POST' });
            if (retry.ok) {
              const d = await retry.json().catch(() => ({}));
              setCart(refreshed);
              setUpdating(false);
              return;
            }
          }
        }

        // fallback: usar PATCH para setear quantity-1 o eliminar
        const newQ = Math.max(item.quantity - 1, 0);
        if (newQ <= 0) {
          await handleDeleteItem(item.id);
          setUpdating(false);
          return;
        }
        const patch = await authFetch(`${API_BASE}/cart_items/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: newQ }) });
        if (patch.ok) {
          const d = await patch.json().catch(() => ({}));
          setCart(cart.map(ci => ci.id === item.id ? {...ci, quantity: newQ} : ci));
          setUpdating(false);
          return;
        }
      }

      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'No se pudo decrementar el item');
    } catch (e: any) {
      console.error('Error decrementando item:', e);
      alert(e?.message || 'Error al decrementar');
    } finally {
      setUpdating(false);
    }
  };

  // Función para eliminar un producto del carrito
  const handleDeleteItem = async (itemId: number) => {
    if (updating) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) return;

    setUpdating(true);
    try {
      const res = await authFetch(`${API_BASE}/cart_items/${itemId}`, { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        setCart(cart.filter(item => item.id !== itemId));
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || "No se pudo eliminar el producto");
      }
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      alert(error?.message || "Error al eliminar el producto");
    } finally {
      setUpdating(false);
    }
  };
  // Obtener userId real del token
  let userId = 1;
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tokenkick");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.user_id) userId = payload.user_id;
      } catch {}
    }
  }

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Refetch carrito cada vez que la página gana foco (por ejemplo, tras redirección)
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { res, json } = await authFetchJson(`/cart_items/user/${userId}`);
        console.log('Respuesta del backend (carrito):', json);
        
        if (!res.ok) {
          console.error('Error al cargar el carrito:', json);
          throw new Error(json.detail || 'Error al cargar el carrito');
        }
        
        if (!Array.isArray(json)) {
          console.error('Respuesta inválida del carrito:', json);
          throw new Error('Formato de respuesta inválido');
        }
        
        // Verificar que los productos tengan la información necesaria
        const validItems = json.filter(item => item.product && item.product.id && item.product.name);
        if (validItems.length !== json.length) {
          console.warn('Algunos items del carrito no tienen información de producto completa:', json);
        }
        
        setCart(validItems);
      } catch (err) {
        setError("No se pudo cargar el carrito");
      }
      setLoading(false);
    };
    fetchCart();
    // Refetch cuando la página gana foco
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setLoading(true);
        fetchCart();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const total = Array.isArray(cart) ? cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) : 0;

  return (
    <div>
      {/* Barra de navegación */}
      <div className="navbar">
        <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
  <Link href="/" className="navbar-title">KICKSHOPPING</Link>
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
        <li><Link href="/categoria/ofertas">Ofertas</Link></li>
        <li><Link href="/">Todo</Link></li>
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
            <li><Link href="/categoria/vestidos-mujer">Vestidos</Link></li>
            <li><Link href="/categoria/blusas-mujer">Blusas</Link></li>
            <li><Link href="/categoria/buzos-mujer">Buzos</Link></li>
            <li><Link href="/categoria/faldas-mujer">Faldas</Link></li>
            <li><Link href="/categoria/pantalones-mujer">Pantalones</Link></li>
            <li><Link href="/categoria/remeras-mujer">Remeras</Link></li>
            <li><Link href="/categoria/zapatillas-mujer">Zapatillas</Link></li>
            <li><Link href="/categoria/bolsos-mujer">Bolsos</Link></li>
            <li><Link href="/categoria/accesorios-mujer">Accesorios</Link></li>
          </ol>
        </details>
      </ul>

      {/* Productos */}
      <main>
        <div className={style.container}>
          <h2>Carrito de Compras</h2>
          {loading && <div>Cargando carrito...</div>}
          {error && <div style={{color: '#2e2e2eff'}}>{error}</div>}
          {!loading && !error && cart.length === 0 && <div>No hay productos en el carrito.</div>}
          {!loading && !error && cart.length > 0 && (
            <>
              {cart.map(item => (
                <div key={item.id} className={`${style["carrito-item"]} ${updating ? loadingStyle.updating : ''}`}>
                  <img 
                    src={(() => {
                      const img = item.product?.image_url;
                      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                      if (!img) return '/buzo.jpeg';
                      if (typeof img === 'string' && img.startsWith('http')) return img;
                      if (typeof img === 'string' && img.startsWith('/static/uploads/')) return `${API_BASE}${img}`;
                      return '/buzo.jpeg';
                    })()}
                    alt={item.product?.name || "Producto"}
                  />
                  <div className={style.info}>
                    <div className={style.productName}>{item.product?.name || "Producto"}</div>
                    <div className={style.quantityControls}>
                      <button 
                        className={`${style.quantityButton} ${updating ? style.disabled : ''}`}
                        onClick={() => {
                          // Restar de a 1; si queda en 0, eliminar el item
                          if (item.quantity > 1) {
                            decrementItem(item);
                          } else {
                            // cantidad === 1 -> eliminar una unidad = eliminar item
                            handleDeleteItem(item.id);
                          }
                        }}
                        disabled={updating}
                      >
                        <i className='bx bx-minus'></i>
                      </button>
                      <span className={style.quantity}>
                        {updating ? 
                          <span className={loadingStyle.loader}></span> : 
                          item.quantity
                        }
                      </span>
                      <button
                        className={`${style.quantityButton} ${updating ? style.disabled : ''}`}
                        onClick={() => incrementItem(item)}
                        disabled={updating}
                      >
                        <i className='bx bx-plus'></i>
                      </button>
                    </div>
                    <div className={style.price}>
                      Precio: ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <button
                    className={`${style.deleteButton} ${updating ? style.disabled : ''}`}
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={updating}
                  >
                    {updating ? 
                      <span className={loadingStyle.loader}></span> :
                      <>
                        <i className="bx bx-trash"></i>
                        Eliminar
                      </>
                    }
                  </button>
                </div>
              ))}
            </>
          )}
          <div className={style.total} id="carrito-total">Total: ${total.toFixed(2)}</div>
          <button 
            className={style["btn-comprar"]}
            onClick={async () => {
              if (updating || cart.length === 0) return;
              if (!confirm('¿Deseas finalizar la compra?')) return;
              
              setUpdating(true);
              try {
                const { res, json } = await authFetchJson('/cart_items/purchase', {
                  method: 'POST'
                });
                
                if (!res.ok) {
                  throw new Error(json.detail || 'Error al procesar la compra');
                }
                
                // Guardar el ticket en localStorage y redirigir
                localStorage.setItem('lastTicket', JSON.stringify(json));
                window.location.href = '/ticket';
              } catch (error: any) {
                console.error('Error al finalizar la compra:', error);
                alert(error?.message || 'Error al procesar la compra');
              } finally {
                setUpdating(false);
              }
            }}
            disabled={updating || cart.length === 0}
          >
            {updating ? 'Procesando...' : 'Finalizar Compra'}
          </button>
        </div>
      </main>
    </div>
  );
}