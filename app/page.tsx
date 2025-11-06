"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import styles from './home.module.css';

import Header from '@/app/components/Header';
import { authFetchJson } from '../lib/api';

export default function Home() {
  const [isVendedor, setIsVendedor] = useState(false);
  // Estado para productos
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsVendedor(localStorage.getItem("user_type") === "vendedor");
    }
    const fetchProducts = async () => {
      try {
        // Usar authFetchJson para respetar API_BASE y manejo de tokens/refresh
        const { res, json } = await authFetchJson('/productos');
        if (!res.ok) {
          console.error('Error response fetching products:', res.status, json);
          setError('No se pudieron cargar los productos');
          setProducts([]);
          setLoading(false);
          return;
        }
        setProducts(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError("No se pudieron cargar los productos");
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);
  const router = useRouter();
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

        {loading && <div>Cargando productos...</div>}
        {error && <div style={{color: '#ff5555'}}>{error}</div>}
        {!loading && !error && products.length === 0 && <div>No hay productos.</div>}
        {!loading && !error && products.map(product => (
          <div key={product.id} className={styles['producto-card']}>
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
              onClick={() => router.push(`/product?id=${product.id}`)}
            >
              COMPRAR
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}


