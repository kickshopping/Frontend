"use client";
import React from "react";
import useProductsByCategory from "../../../lib/hooks/useProductsByCategory";
import ProductCard from "../../../components/ProductCard";
import Header from "../../../components/Header";

export default function CategoriaClient({ categoriaId }: { categoriaId: string }) {
  const { data, loading, error } = useProductsByCategory(categoriaId);

  return (
    <>
      <Header />
      <main style={{ padding: '24px 8vw' }}>
      <h1 style={{ textTransform: 'capitalize' }}>{categoriaId}</h1>
      {loading && <div>Cargando productos de la categoría...</div>}
      {error && <div style={{ color: '#ff5555' }}>Error: {error}</div>}
      {!loading && data && data.length === 0 && <div>No se encontraron productos en esta categoría.</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
        {data && data.map((p: any) => (
          <div key={p.id} style={{ height: '100%' }}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      </main>
    </>
  );
}
