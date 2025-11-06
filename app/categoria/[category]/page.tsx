"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from 'next/link';
import styles from '../../home.module.css';
import Header from '@/app/components/Header';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVendedor, setIsVendedor] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVendedor(localStorage.getItem("user_type") === "vendedor");
    }
  }, []);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Usar el parámetro tal cual (p. ej. "pantalones-hombre") para permitir
  // categorías específicas por sección (hombre/mujer/unisex).
  // El frontend mostrará el título con espacios reemplazando guiones.
  const raw = params.category as string;
  const categoryQuery = raw; // enviar tal cual al backend
  const res = await fetch(`${API_BASE}/productos/categoria/${encodeURIComponent(categoryQuery)}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError("No se pudieron cargar los productos de esta categoría");
        console.error('Error fetching products:', err);
      }
      setLoading(false);
    };

    if (params.category) {
      fetchProductsByCategory();
    }
  }, [params.category]);

  return (
    <div>
      <Header />
      
      <main className="productos-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '32px',
        padding: '32px 8vw',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <style>{`
          @media (max-width: 700px) {
            .productos-grid {
              grid-template-columns: 1fr !important;
              padding: 16px 0 !important;
              max-width: 100vw !important;
            }
          }
        `}</style>

        <h1 style={{
          gridColumn: '1 / -1',
          textTransform: 'capitalize',
          marginBottom: '24px',
          color: 'white'
        }}>
          {params.category}
        </h1>

        {loading && <div>Cargando productos...</div>}
        {error && <div style={{color: '#ff5555'}}>{error}</div>}
        {!loading && !error && products.length === 0 && <div>No hay productos en esta categoría.</div>}
        {!loading && !error && products.map(product => (
          <div 
            key={product.id} 
            className={styles['producto-card']}
            onClick={() => router.push(`/productos/${product.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={(() => {
                const img = product.image_url;
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                if (!img) return '/buzo.jpeg';
                if (typeof img === 'string' && img.startsWith('http')) return img;
                if (typeof img === 'string' && img.startsWith('/static/uploads/')) return `${API_BASE}${img}`;
                return '/buzo.jpeg';
              })()}
              alt={product.name}
              onError={e => { e.currentTarget.src = "/buzo.jpeg"; }}
              className={styles['producto-imagen']}
            />
            {product.discount > 0 && (
              <span className={styles.descuento}>
                {product.discount}% OFF
              </span>
            )}
            <h3 className={styles.titulo}>{product.name}</h3>
            <p className={styles['precio-anterior']}>{product.price && product.discount ? `$${(product.price / (1 - product.discount / 100)).toFixed(2)}` : ''}</p>
            <p className={styles.precio}>${product.price}</p>
            <p className={styles.descripcion}>{product.description}</p>
            <button
              className={styles['btn-comprar']}
              onClick={() => router.push(`/productos/${product.id}`)}
            >
              COMPRAR
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}