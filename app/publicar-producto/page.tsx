"use client";
import { useState } from "react";
import Link from 'next/link';
import style from "../product/product.module.css";
import { API_BASE, authFetch } from "../../lib/api";

  // Helper: resize an image file on the client using a canvas
  async function resizeImage(file: File, maxWidth = 1200, maxHeight = 1200): Promise<File> {
    if (!file.type.startsWith('image/')) return file;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });

    let { width, height } = img as any;
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(1, widthRatio, heightRatio);
    const newWidth = Math.round(width * ratio);
    const newHeight = Math.round(height * ratio);

    if (newWidth === width && newHeight === height) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const outputType = file.type || 'image/jpeg';
    const quality = outputType === 'image/png' ? 1.0 : 0.85;

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    URL.revokeObjectURL(objectUrl);
    if (!blob) return file;

    const newFile = new File([blob], file.name, { type: blob.type });
    return newFile;
  }

export default function PublicarProductoPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("0");
  const [category, setCategory] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [parentSection, setParentSection] = useState<string>('');

  // categorías predefinidas (copiadas desde editar-producto)
  const categoryMap: Record<string, string[]> = {
    Hombre: ['calzones-hombre','gorras-hombre','camperas-hombre','buzos-hombre','pantalones-hombre','remeras-hombre','camisas-hombre','zapatillas-hombre','accesorios-hombre'],
    Mujer: ['calzones-mujer','gorras-mujer','camperas-mujer','buzos-mujer','pantalones-mujer','remeras-mujer','camisas-mujer','zapatillas-mujer','accesorios-mujer','vestidos','bolsos','blusas','faldas'],
    Unisex: ['pantalones-unisex','remeras-unisex','zapatillas-unisex','bolsos-unisex','ofertas']
  };
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // immediate preview of original so user sees something
    try {
      const origUrl = URL.createObjectURL(file);
      setPreview(origUrl);
    } catch {}

    setResizing(true);
    try {
      const resized = await resizeImage(file, 1200, 1200);
      setNewImageFile(resized);
      try {
        const url = URL.createObjectURL(resized);
        setPreview(url);
      } catch {}
    } catch (err) {
      console.error('Error redimensionando imagen:', err);
      setNewImageFile(file as any);
      try {
        setPreview(URL.createObjectURL(file));
      } catch {}
    } finally {
      setResizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!name || !price || !newImageFile) {
      setError("Completa todos los campos e incluye una imagen");
      setLoading(false);
      return;
    }
    if (resizing) {
      setError('Por favor espera a que la imagen termine de procesarse');
      setLoading(false);
      return;
    }
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('price', String(price));
      form.append('description', description || '');
      form.append('discount', discount || '0');
          form.append('category', category || '');
      // image is a File
      form.append('file', newImageFile as unknown as File);

      const res = await authFetch(`${API_BASE}/productos/upload`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setError(err.detail || `Error al publicar producto (${res.status})`);
        setLoading(false);
        return;
      }

      const created = await res.json().catch(() => null);
      setSuccess('¡Producto publicado exitosamente!');
      // limpiar formulario
      setName('');
      setPrice('');
      setImage(null);
      setPreview('');
      setLoading(false);
      console.log('Producto creado', created);
      // opcional: redirigir a la lista de productos o forzar recarga
      // window.location.href = '/product';
    } catch (err: any) {
      console.error(err);
      setError('Error de conexión al publicar el producto');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="navbar">
        <Link href="/" className="navbar-title">KICKSHOPPING</Link>
        <div className="right-icons">
          <a href="/">
            <i className="bx bx-home"></i>
          </a>
        </div>
      </div>
      <main className={style["vista-producto"]}>
        <h2 style={{marginBottom:24}}>Publicar nuevo producto</h2>
        <form onSubmit={handleSubmit} style={{maxWidth:400,margin:'0 auto',background:'#fff',padding:24,borderRadius:12,boxShadow:'0 2px 8px #eee'}}>
          <div className={style["producto-imagen"]} style={{marginBottom:16}}>
            {preview ? (
              <img src={preview} alt="preview" style={{width:'100%',borderRadius:'8px'}} />
            ) : (
              <div style={{width:'100%',height:180,background:'#eee',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#aaa'}}>Sin imagen</div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{marginTop:8}} />
          </div>
          <div className={style["input-box"]}>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className={style["input-box"]}>
            <input
              type="number"
              placeholder="Precio"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              min={0}
            />
          </div>
          <div className={style["input-box"]}>
            <input
              type="number"
              placeholder="Descuento (%)"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              min={0}
              max={100}
            />
          </div>
          
          <div className={style["input-box"]}>
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          {error && <div style={{color:'#ff5555',marginBottom:8}}>{error}</div>}
          {success && <div style={{color:'#4caf50',marginBottom:8}}>{success}</div>}
          {resizing && <div style={{color:'#777',marginBottom:8}}>Procesando imagen... por favor espera</div>}

          <label>
            Sección
            <select value={parentSection} onChange={e => {
              const parent = e.target.value;
              setParentSection(parent);
              const subs = categoryMap[parent] || [];
              if (subs.length) setCategory(subs[0]);
            }} style={{ width: '100%', padding: 8, marginTop: 6 }}>
              <option value="">-- Seleccionar sección --</option>
              {Object.keys(categoryMap).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>

          <label>
            Categoría
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }}>
              <option value="">-- Seleccionar categoría --</option>
              {(parentSection ? (categoryMap[parentSection] || []) : Object.entries(categoryMap).flatMap(([, subs]) => subs)).map(sub => (
                <option key={sub} value={sub}>{sub.replace(/-/g, ' ')}</option>
              ))}
            </select>
          </label>

          <button type="submit" className={style["btn-comprar"]} disabled={loading || resizing} style={{width:'100%',marginTop:12}}>
            {loading ? "Publicando..." : "Publicar producto"}
          </button>
        </form>
      </main>
    </div>
  );
}
