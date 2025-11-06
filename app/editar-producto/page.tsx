"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE, authFetch } from "../../lib/api";

export default function EditProductPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [parentSection, setParentSection] = useState<string | ''>('');
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Helper: resize an image file on the client using a canvas
  async function resizeImage(file: File, maxWidth = 1200, maxHeight = 1200): Promise<File> {
    // Only process image types
    if (!file.type.startsWith('image/')) return file;

    // Load the image
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });

    // compute new size while keeping aspect ratio
    let { width, height } = img;
    let newWidth = width;
    let newHeight = height;
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(1, widthRatio, heightRatio);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);

    // If no resizing needed, return original file
    if (newWidth === width && newHeight === height) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    // For PNGs we keep the alpha channel; for others draw normally
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Determine output type: keep original type when possible
    const outputType = file.type || 'image/jpeg';
    const quality = outputType === 'image/png' ? 1.0 : 0.85;

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, outputType, quality));
    URL.revokeObjectURL(objectUrl);
    if (!blob) return file;

    // Create a new File from the blob (preserve original name)
    const outputName = file.name;
    const newFile = new File([blob], outputName, { type: blob.type });
    return newFile;
  }

  // Convert any image File to a JPEG File (useful if backend rejects PNG/other types)
  async function convertToJpeg(file: File, quality = 0.85, maxWidth = 1200, maxHeight = 1200): Promise<File> {
    if (!file.type.startsWith('image/')) return file;
    // load image
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

    let { width, height } = img as any;
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(1, widthRatio, heightRatio);
    const newWidth = Math.round(width * ratio);
    const newHeight = Math.round(height * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    URL.revokeObjectURL(objectUrl);
    if (!blob) return file;
    // ensure filename ends with .jpg
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    return newFile;
  }

  // categorías predefinidas (mapeadas con los enlaces del navbar)
  const categoryMap: Record<string, string[]> = {
    Hombre: ['calzones-hombre','gorras-hombre','camperas-hombre','buzos-hombre','pantalones-hombre','remeras-hombre','camisas-hombre','zapatillas-hombre','accesorios-hombre'],
    Mujer: ['calzones-mujer','gorras-mujer','camperas-mujer','buzos-mujer','pantalones-mujer','remeras-mujer','camisas-mujer','zapatillas-mujer','accesorios-mujer','vestidos','bolsos','blusas','faldas'],
    Unisex: ['pantalones-unisex','remeras-unisex','zapatillas-unisex','bolsos-unisex','ofertas']
  };

  useEffect(() => {
    if (!productId) {
      setError('ID de producto no especificado');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/productos/${productId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || 'No se pudo cargar el producto');

        setName(json.name || '');
        setPrice(json.price ? String(json.price) : '');
        setDescription(json.description || '');
  setDiscount(json.discount != null ? String(json.discount) : '0');
        setCategory(json.category || '');
        setCurrentImage(json.image_url || '');
        // intentar derivar la sección padre a partir de category
        if (json.category) {
          const cat = String(json.category);
          let foundParent = '';
          Object.entries(categoryMap).forEach(([p, subs]) => {
            if (subs.includes(cat)) foundParent = p;
          });
          setParentSection(foundParent as any);
        }
        setError(null);
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    setError(null);

    // Use token if available (don't force login in this page)
    const token = typeof window !== 'undefined' ? localStorage.getItem('tokenkick') : null;

    try {
      // Si hay una nueva imagen, primero la subimos usando authFetch (maneja refresh)
      if (newImage) {
        // Try uploading original resized file first
        const tryUpload = async (fileToSend: File) => {
          const formData = new FormData();
          // append common field names to increase compatibility
          formData.append('file', fileToSend);
          formData.append('image', fileToSend);

          console.debug('EditarProducto: subiendo imagen, productId=', productId, 'file=', fileToSend.name, 'type=', fileToSend.type);

          const resp = await authFetch(`${API_BASE}/productos/${productId}/imagen`, {
            method: 'POST',
            body: formData
          });
          return resp;
        };

        let imageResponse = await tryUpload(newImage);

        // If backend rejects (403) and we didn't try JPEG yet, convert to JPEG and retry
        if (!imageResponse.ok && imageResponse.status === 403 && newImage.type !== 'image/jpeg') {
          console.warn('EditarProducto: upload returned 403, retrying with JPEG conversion');
          try {
            const jpeg = await convertToJpeg(newImage, 0.85, 1200, 1200);
            imageResponse = await tryUpload(jpeg);
          } catch (convErr) {
            console.error('EditarProducto: error converting to JPEG', convErr);
          }
        }

        if (!imageResponse.ok) {
          let imageError: any = {};
          try { imageError = await imageResponse.json(); } catch { imageError = { text: await imageResponse.text().catch(() => '') }; }
          console.error('EditarProducto: image upload failed', imageResponse.status, imageError);
          throw new Error(imageError.detail || imageError.message || imageError.text || `Error al subir la imagen (${imageResponse.status})`);
        }
      }

      // Actualizar los datos del producto usando authFetch (maneja headers y refresh)
      const payload = {
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        category: category || null,
        discount: Number(discount || 0)
      };

      console.debug('EditarProducto: actualizando producto', productId, payload);

      const updateResponse = await authFetch(`${API_BASE}/productos/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      if (!updateResponse.ok) {
        let updateError: any = {};
        try { updateError = await updateResponse.json(); } catch { updateError = { text: await updateResponse.text().catch(() => '') }; }
        console.error('EditarProducto: update failed', updateResponse.status, updateError);
        throw new Error(updateError.detail || updateError.message || updateError.text || `Error al actualizar el producto (${updateResponse.status})`);
      }

      // Redirigir a la página del producto
      router.push(`/product?id=${productId}`);
    } catch (e: any) {
      console.error('Error:', e);
      setError(e?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '24px auto', padding: 16 }}>
      <h2>Editar producto</h2>
      {loading ? <div>Cargando producto...</div> : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          {error && <div style={{ color: '#ff5555' }}>{error}</div>}

          <label>
            Título
            <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 6 }} />
          </label>

          <label>
            Precio
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 6 }} />
          </label>

          <label>
            Descuento (%)
            <input type="number" step="0.01" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6 }} />
          </label>

          <label>
            Descripción
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} style={{ width: '100%', padding: 8, marginTop: 6 }} />
          </label>

          <div>
            <label>
              Imagen del producto
              <div style={{ marginTop: 10, marginBottom: 10 }}>
                {currentImage && !previewUrl && (
                  <div style={{ marginBottom: 10 }}>
                    <p>Imagen actual:</p>
                    <img 
                      src={currentImage} 
                      alt="Imagen actual del producto" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  </div>
                )}
                {previewUrl && (
                  <div style={{ marginBottom: 10 }}>
                    <p>Vista previa de la nueva imagen (redimensionada):</p>
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      // Resize on the client before setting state
                      const resized = await resizeImage(file, 1200, 1200);
                      setNewImage(resized);
                      // preview from resized file
                      try {
                        const url = URL.createObjectURL(resized);
                        setPreviewUrl(url);
                      } catch (err) {
                        // fallback to original preview
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    } catch (err) {
                      console.error('Error al redimensionar imagen:', err);
                      // fallback: set original
                      setNewImage(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  style={{ marginTop: 6 }}
                />
              </div>
            </label>
            {newImage && (
              <div style={{ marginTop: 10 }}>
                <p>Vista previa de la nueva imagen:</p>
                <img
                  src={URL.createObjectURL(newImage)}
                  alt="Vista previa"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          <label>
            Categoría
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <select value={parentSection} onChange={(e) => {
                const parent = e.target.value as string;
                setParentSection(parent as any);
                if (!parent) {
                  setCategory('');
                  return;
                }
                const subs = categoryMap[parent] || [];
                setCategory(prev => subs.includes(prev) ? prev : (subs[0] || ''));
              }}>
                <option value="">-- Seleccionar sección --</option>
                {Object.keys(categoryMap).map(k => <option key={k} value={k}>{k}</option>)}
              </select>

              <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1 }}>
                <option value="">-- Seleccionar categoría --</option>
                {(parentSection ? (categoryMap[parentSection] || []) : Object.entries(categoryMap).flatMap(([, subs]) => subs)).map(sub => (
                  <option key={sub} value={sub}>{sub.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
            <small style={{ color: '#999' }}>Elige la sección y luego la categoría. Ej: Hombre → Pantalones</small>
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ padding: '10px 14px' }}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
            <button type="button" onClick={() => router.back()} style={{ padding: '10px 14px' }}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
