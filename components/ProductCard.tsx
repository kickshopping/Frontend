"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  return (
    <div style={{background: '#000', padding: '10px', borderRadius: '8px', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%'}}>
      <img
        src={product.image_url && product.image_url.startsWith('http') ? product.image_url : "/buzo.jpeg"}
        alt={product.name}
        onError={(e:any) => { e.currentTarget.src = "/buzo.jpeg"; }}
        style={{ width: '100%', borderRadius: '8px' }}
      />
      {product.discount > 0 && (
        <span style={{position: 'absolute', top: '15px', left: '15px', background: '#222', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold'}}>
          {product.discount}% OFF
        </span>
      )}
      <h3>{product.name}</h3>
      <p style={{ textDecoration: 'line-through', color: 'gray', fontSize: '0.9rem' }}>{product.price && product.discount ? `$${(product.price / (1 - product.discount / 100)).toFixed(2)}` : ''}</p>
      <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>${product.price}</p>
      <p style={{ fontSize: '0.9rem', color: '#ccc' }}>{product.description}</p>
      <button
        style={{background: '#222', border: 'none', marginTop: 'auto', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '5px', width: '100%', cursor: 'pointer'}}
        onClick={() => router.push(`/product?id=${product.id}`)}
      >
        COMPRAR
      </button>
    </div>
  );
}