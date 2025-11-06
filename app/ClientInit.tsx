"use client";
import { useEffect } from "react";
import { setAutoRefresh } from "../lib/api";

export default function ClientInit() {
  useEffect(() => {
    // Desactivar el refresh automático para evitar que la app fuerce re-login
    // al entrar en las páginas. Si necesitas reactivar, llamar a setAutoRefresh(true).
    try {
      setAutoRefresh(false);
    } catch (e) {}
    // Detectar si el usuario actual es admin: preferir user_type en localStorage; si no existe, intentar /usuarios/me
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tokenkick') : null;
        let userType = typeof window !== 'undefined' ? localStorage.getItem('user_type') : null;

        // Si no tenemos user_type pero sí token, preguntar al backend por /usuarios/me
        if (!userType && token) {
          try {
            const API_BASE = (process && (process as any).env && (process as any).env.NEXT_PUBLIC_API_URL) || 'http://localhost:8000';
            const res = await fetch(`${API_BASE}/usuarios/me`, {
              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            if (res.ok) {
              const me = await res.json();
              if (me && me.rol_nombre) {
                userType = me.rol_nombre as string;
                localStorage.setItem('user_type', userType as string);
              }
            }
          } catch (e) {
            // ignore network errors
          }
        }

        const isAdmin = !!userType && userType.toString().trim().toLowerCase() === 'administrador';
        if (isAdmin) document.body.classList.add('is-admin');
        else document.body.classList.remove('is-admin');
        try { (window as any).__isAdmin = isAdmin; } catch (e) {}

        // Asegurarnos de que el indicador (.admin-indicator-inline) exista siempre
        try {
          const userLinks = document.querySelectorAll('.user-link');
          userLinks.forEach(ul => {
            let span = ul.querySelector('.admin-indicator-inline') as HTMLElement | null;
            if (!span) {
              span = document.createElement('span');
              span.className = 'admin-indicator-inline';
              span.setAttribute('aria-hidden', 'true');
              ul.appendChild(span);
            }
            if (isAdmin) span.classList.add('visible');
            else span.classList.remove('visible');
          });
        } catch (e) {
          // ignore DOM errors
        }
      } catch (e) {}
    })();
  }, []);
  return null;
}
