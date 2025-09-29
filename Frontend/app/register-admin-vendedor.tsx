"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterAdminVendedor() {
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8000/roles")
      .then(res => res.json())
      .then(data => setRoles(data.filter((r:any) => r.rol_nombre === "Administrador" || r.rol_nombre === "Vendedor")));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usu_usuario: username,
          usu_nombre_completo: fullname,
          usu_contrasenia: password,
          usu_rol_id: Number(roleId)
        })
      });
      if (res.ok) {
        setMessage("Usuario creado correctamente");
        setUsername("");
        setFullname("");
        setPassword("");
        setRoleId(roles[0]?.rol_id || "");
      } else {
        const data = await res.json();
        setMessage(data.detail || "Error al crear usuario");
      }
    } catch {
      setMessage("Error de red");
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Registrar Admin o Vendedor</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario:</label>
          <input value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Nombre completo:</label>
          <input value={fullname} onChange={e => setFullname(e.target.value)} required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Rol:</label>
          <select value={roleId} onChange={e => setRoleId(e.target.value)} required>
            <option value="">Selecciona un rol</option>
            {roles.map((r:any) => (
              <option key={r.rol_id} value={r.rol_id}>{r.rol_nombre}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>{loading ? "Registrando..." : "Registrar"}</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
