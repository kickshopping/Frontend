"use client";
import { useState } from "react";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8000/productos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: name, precio: parseFloat(price), descripcion: description }),
      });
      if (res.ok) {
        setMessage("Producto agregado correctamente");
        setName("");
        setPrice("");
        setDescription("");
      } else {
        setMessage("Error al agregar producto");
      }
    } catch {
      setMessage("Error de red");
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Agregar nuevo producto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Precio:</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Agregando..." : "Agregar"}</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
