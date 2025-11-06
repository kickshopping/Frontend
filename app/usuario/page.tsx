"use client";
import { useState, useEffect } from "react";
import { authFetchJson } from "../../lib/api";
import style from "./user.module.css";

interface User {
  usu_id: number;
  usu_usuario: string;
  usu_nombre_completo: string;
  rol_nombre?: string;
  birthdate?: string;
  user_type?: string;
  usu_rol_id?: number;
  email?: string;
  username?: string;
  full_name?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("tokenkick");
        if (!token) {
          setLoading(false);
          setHasToken(false);
          window.location.href = "/login";
          return;
        }

        setHasToken(true);
        setError("");

        // Intentar mostrar datos en caché mientras verificamos
        const cached = localStorage.getItem('user');
        if (cached) {
          const cachedUser = JSON.parse(cached);
          setUser(cachedUser);
        }

        // Verificar la sesión con el backend
        const { res, json } = await authFetchJson('/usuarios/me');
        if (!res.ok) {
          if (res.status === 0) {
            throw new Error('NetworkError');
          }
          
          if (res.status === 401) {
            const hasRefreshToken = localStorage.getItem("refresh_token");
            if (!hasRefreshToken) {
              // Limpiar todo y redirigir a login
              localStorage.clear();
              window.location.href = "/login";
              return;
            }
            setError("Verificando sesión...");
            return;
          }
          
          throw new Error(json.detail || "Error de autenticación");
        }

        // Actualizar cache y estado
        localStorage.setItem('user', JSON.stringify(json));
        setUser(json);
        setError("");
      } catch (err: any) {
        console.error('Error en verificación de sesión:', err);
        if (err.message === 'NetworkError') {
          setError('Error de conexión. Verificando...');
        } else {
          setError(err.message || "Error al verificar sesión");
        }
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar la verificación
    checkSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tokenkick");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_type");
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      const { res: putRes, json: updated } = await authFetchJson(`/usuarios/${user?.usu_id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usu_nombre_completo: editFullName,
          usu_usuario: editEmail
        })
      });

      if (putRes.ok) {
        setUser(updated);
        setEditMode(false);
      } else {
        setEditError("No se pudo actualizar el perfil");
      }
    } catch (e) {
      setEditError("Error de conexión");
      console.error('Error updating profile:', e);
    }

    setEditLoading(false);
  };

  return (
    <main className={style["profile-container"]}>
      <div className={style["perfil-container"]}>
        <div className={style["perfil-avatar"]}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}>
            <circle cx="12" cy="12" r="12" fill="#fff"/>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#888"/>
          </svg>
        </div>
        {loading ? (
          <div>Cargando usuario...</div>
        ) : error ? (
          <div style={{color: '#ff5555'}}>{error}</div>
        ) : user ? (
          <>
            <div className={style["perfil-nombre"]} style={{marginTop: 8, marginBottom: 8}}>
              {user.usu_nombre_completo}
            </div>
            <div className={style["perfil-email"]}>{user.usu_usuario}</div>
            {/* Mostrar tipo de usuario debajo del correo */}
            <div style={{color:'#2196f3',marginTop:4,fontWeight:'bold'}}>
              {user.rol_nombre || user.user_type || ''}
            </div>
            <div className={style["perfil-btns"]}>
              <button 
                className={style["btn-editar"]} 
                onClick={() => {
                  setEditMode(true);
                  setEditFullName(user.usu_nombre_completo);
                  setEditEmail(user.usu_usuario);
                }}
              >
                Editar perfil
              </button>
              <button className={style["btn-cerrar"]} onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
            {editMode && (
              <form onSubmit={handleSubmit}>
                <div style={{marginBottom: 8}}>
                  <label>Nombre completo: </label>
                  <input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                  />
                </div>
                <div style={{marginBottom: 8}}>
                  <label>Email: </label>
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    type="email"
                    required
                  />
                </div>
                {editError && (
                  <div style={{color: '#ff5555', marginBottom: 8}}>{editError}</div>
                )}
                <div>
                  <button type="submit" disabled={editLoading}>
                    {editLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div style={{textAlign: 'center', color: '#fff'}}>
            <h2>Debes iniciar sesión</h2>
            <div style={{marginTop: 24}}>
              <a href="/login" style={{color: '#00bfff', textDecoration: 'underline'}}>
                Iniciar sesión
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}