"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState, useEffect } from "react";
import { authFetchJson, API_BASE } from "../../lib/api";
import style from "./user.module.css"; // Importa los estilos específicos de esta página

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Alterna abrir/cerrar menú
    const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("tokenkick") : null;
    if (token) {
      setHasToken(true);
        const fetchUser = async () => {
          try {
            const { res, json } = await authFetchJson(`${API_BASE}/usuarios/me`);
            if (res.status === 401) {
              localStorage.removeItem("tokenkick");
              setHasToken(false);
              setUser(null);
              setError("Sesión expirada. Por favor, inicia sesión de nuevo.");
              setLoading(false);
              window.location.href = "/login";
              return;
            }
            if (!res.ok) throw new Error("No autorizado");
            setUser(json);
          } catch (err) {
            setError("No se pudo cargar el usuario");
          }
          setLoading(false);
        };
      fetchUser();
    } else {
      setHasToken(false);
      setLoading(false);
      // Redirigir automáticamente al login si no hay token
      window.location.href = "/login";
    }
  }, []);

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
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}>
                      <circle cx="12" cy="12" r="12" fill="#fff"/>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#888"/>
                    </svg>
                </div>
                {!loading && !error && hasToken && user && (
                  <div className={style["perfil-nombre"]} style={{marginTop: 8, marginBottom: 8}}>
                    {user.usu_nombre_completo || user.full_name || user.username}
                  </div>
                )}
                {loading && <div>Cargando usuario...</div>}
                {error && <div style={{color: '#ff5555'}}>{error}</div>}
                {!loading && !error && hasToken && user && (
                    <>
                        <div className={style["perfil-email"]}>{user.email || user.usu_usuario}</div>
                        {/* Mostrar tipo de usuario debajo del correo */}
                        <div style={{color:'#2196f3',marginTop:4,fontWeight:'bold'}}>
                          {(() => {
                            // Prefer explicit fields returned by backend
                            const tipo = user.user_type || user.rol_nombre || user.usu_rol_id;
                            if (!tipo) {
                              if (typeof window !== 'undefined') {
                                const t = localStorage.getItem('user_type');
                                if (t) return t;
                              }
                              return '';
                            }
                            // If it's a numeric id, map 1 => vendedor else comprador
                            if (typeof tipo === 'number') return tipo === 1 ? 'vendedor' : 'comprador';
                            // Normalize common values
                            const lower = String(tipo).toLowerCase();
                            if (lower.includes('vend')) return 'vendedor';
                            if (lower.includes('comp')) return 'comprador';
                            return tipo;
                          })()}
                        </div>
                          <div className={style["perfil-btns"]}>
                            <button className={style["btn-editar"]} onClick={() => setEditMode(true)}>Editar perfil</button>
                            <button className={style["btn-cerrar"]} onClick={() => {
                              // Remove unified keys
                              localStorage.removeItem("tokenkick");
                              localStorage.removeItem("user_id");
                              localStorage.removeItem("user_type");
                              window.location.href = "/login";
                            }}>Cerrar sesión</button>
                          </div>
                        {editMode && (
                          <form
                            onSubmit={async e => {
                              e.preventDefault();
                              setEditError("");
                              setEditLoading(true);
                              try {
                                const token = localStorage.getItem("tokenkick");
                                const res = await fetch(`${API_BASE}/usuarios/me`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                                  body: JSON.stringify({
                                    full_name: editFullName,
                                    email: editEmail
                                  })
                                });
                                if (res.ok) {
                                  const updated = await res.json();
                                  setUser(updated);
                                  setEditMode(false);
                                } else {
                                  setEditError("No se pudo actualizar el perfil");
                                }
                              } catch (e) {
                                setEditError("Error de red");
                              }
                              setEditLoading(false);
                            }}
                            style={{marginTop: 16, background: '#222', padding: 16, borderRadius: 8}}
                          >
                            <div style={{marginBottom: 8}}>
                              <label>Nombre completo: </label>
                              <input value={editFullName} onChange={e => setEditFullName(e.target.value)} />
                            </div>
                            <div style={{marginBottom: 8}}>
                              <label>Email: </label>
                              <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                            </div>
                            {editError && <div style={{color: '#ff5555'}}>{editError}</div>}
                            <button type="submit" disabled={editLoading} style={{marginRight: 8}}>Guardar</button>
                            <button type="button" onClick={() => setEditMode(false)}>Cancelar</button>
                          </form>
                        )}
                    </>
                )}
                {!loading && !error && !hasToken && (
                    <div style={{textAlign: 'center', color: '#fff'}}>
                        <h2>Debes iniciar sesión o registrarte</h2>
                        <div style={{marginTop: 24}}>
                            <a href="/login" style={{marginRight: 16, color: '#00bfff', textDecoration: 'underline'}}>Iniciar sesión</a>
                            <a href="/register" style={{color: '#00bfff', textDecoration: 'underline'}}>Registrarse</a>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}