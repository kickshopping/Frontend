"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState } from "react";
import style from "./login.module.css"; // Importa los estilos específicos de esta página

export default function Home() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const [menuOpen, setMenuOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Alterna abrir/cerrar menú
    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Por favor ingrese su email y contraseña");
            return;
        }
        
        setLoading(true);
        setError("");

        // Solo permitir emails de Gmail
        if (!email.endsWith("@gmail.com")) {
            setError("Solo se permiten cuentas de Gmail");
            setLoading(false);
            return;
        }

        try {
            setError("Verificando credenciales...");
            
            // Intentar la conexión con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const res = await fetch(`${API_BASE}/usuarios/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email,
                    password: password
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            const data = await res.json();
            if (!res.ok) {
                // Manejar errores HTTP específicos
                if (res.status === 401) {
                    setError("Usuario o contraseña incorrectos");
                } else if (res.status === 404) {
                    setError("Servidor no encontrado");
                } else if (res.status >= 500) {
                    setError("Error del servidor. Por favor intente más tarde");
                } else {
                    setError(data.detail || "Error desconocido");
                }
                setLoading(false);
                return;
            }

            if (!data.access_token || !data.user_id) {
                setError("Respuesta del servidor inválida");
                setLoading(false);
                return;
            }

            // Si llegamos aquí, el login fue exitoso
            // Guardar token y datos de usuario
            localStorage.setItem("tokenkick", data.access_token);
            localStorage.setItem("user_id", data.user_id.toString());
            
            if (data.user_type) {
                localStorage.setItem("user_type", data.user_type);
            }
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            
            const userObj = { 
                user_id: data.user_id, 
                username: data.username || email, 
                user_type: data.user_type 
            };
            localStorage.setItem('user', JSON.stringify(userObj));
            
            // Redireccionar al home
            window.location.href = "/";

        } catch (err: any) {
            console.error("Error en login:", err);
            
            if (err.name === 'AbortError') {
                setError("Tiempo de espera agotado. Por favor intente nuevamente.");
            } else if (err instanceof TypeError) {
                setError("No se pudo conectar con el servidor. Verifique su conexión.");
            } else {
                setError(err.message || "Error inesperado. Por favor intente nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div>
                {/* Barra de navegación */}
                <div className="navbar">
                    <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
                    <div className="navbar-title" style={{cursor:'pointer'}} onClick={()=>window.location.href='/'}>KICKSHOPPING</div>
                    <div className="right-icons">
                        <a href="/usuario">
                            <i className="bx bx-user"></i>
                        </a>
                        <a href="/">
                            <i className="bx bx-home"></i>
                        </a>
                    </div>
                </div>

                <main>
                    <div className={style["login-container"]}>
                        <h2 className={style["login-title"]}>Login</h2>
                        <form onSubmit={handleSubmit}>
                            {/* ...existing code... */}
                            <div className={style["input-box"]} style={{position:'relative'}}>
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#aaa'}}>
                                    <i className="bx bx-envelope"></i>
                                </span>
                            </div>
                            <div className={style["input-box"]} style={{position:'relative'}}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <span
                                    style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',cursor:'pointer',color:'#aaa'}}
                                    onClick={()=>setShowPassword(v=>!v)}
                                    title={showPassword?"Ocultar contraseña":"Mostrar contraseña"}
                                >
                                    <i className={showPassword?"bx bx-show":"bx bx-hide"}></i>
                                </span>
                            </div>
                            <div style={{ width: '100%' }}>
                            </div>
                            {error && <div style={{ color: "#ff5555", marginBottom: 8 }}>{error}</div>}
                            <button type="submit" className={style["btn"]} disabled={loading}>
                          {loading ? "Cargando..." : "Iniciar sesión"}
                            </button>
                            <p className="register-text" style={{marginTop: '18px'}}>¿No tienes una cuenta? <a href="/register" style={{color:'#2196f3',textDecoration:'underline'}}>Regístrate</a></p>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}