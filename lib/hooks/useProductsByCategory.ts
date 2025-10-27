"use client";
import { useEffect, useState } from "react";

type Result = { data: any[] | null; loading: boolean; error: string | null };

export default function useProductsByCategory(categoriaId?: number | string): Result {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(!!categoriaId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoriaId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAndFilter = async () => {
      setLoading(true);
      try {
        const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:8000";
        const res = await fetch(`${API_BASE}/productos/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const all = await res.json();

        //  filtrar productos cuyo name o description contenga la categoría (case-insensitive)
        const q = String(categoriaId).toLowerCase();
        const filtered = (Array.isArray(all) ? all : []).filter((p: any) => {
          const name = (p.name || "").toString().toLowerCase();
          const desc = (p.description || "").toString().toLowerCase();
          return name.includes(q) || desc.includes(q);
        });

        if (!cancelled) {
          setData(filtered);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Error fetching products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAndFilter();
    return () => { cancelled = true; };
  }, [categoriaId]);

  return { data, loading, error };
}
