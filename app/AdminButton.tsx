"use client";
import { useEffect, useState } from "react";

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Función que intenta determinar si el usuario es admin de forma robusta
  const detectAdmin = () => {
    try {
      // 1) Preferir user_type guardado por el login o ClientInit
      const userType = typeof window !== 'undefined' ? localStorage.getItem('user_type') : null;
      if (userType && userType.toString().trim().toLowerCase() === 'administrador') return true;

      // 2) Body class añadida por ClientInit
      if (typeof document !== 'undefined' && document.body.classList.contains('is-admin')) return true;

      // 3) Marca global establecida por ClientInit
      if (typeof window !== 'undefined' && (window as any).__isAdmin === true) return true;

      // 4) Como último recurso, intentar leer claims textuales del token (si el token incluye nombres)
      const token = typeof window !== 'undefined' ? localStorage.getItem('tokenkick') : null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload) {
            const maybeName = (payload.rol_nombre || payload.rolName || payload.role || payload.rol || payload.rol_nombre_es || payload.rol_nombre_espanol);
            if (typeof maybeName === 'string' && maybeName.toLowerCase().includes('admin')) return true;
          }
        } catch (e) {
          // malformed token, ignore
        }
      }
    } catch (e) {
      // ignore errors
    }
    return false;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;
    // Intento inicial
    if (detectAdmin()) {
      setIsAdmin(true);
      return;
    }

    // Si no está aún, reintentar durante unos segundos porque ClientInit puede poblar datos asíncronamente
    const interval = setInterval(() => {
      if (!mounted) return;
      if (detectAdmin()) {
        setIsAdmin(true);
      }
    }, 300);

    // Detener después de 6s
    const timeout = setTimeout(() => clearInterval(interval), 6000);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    let observer: MutationObserver | null = null;
    let cleanupDone = false;

    const insertButton = () => {
      try {
        // Evitar insertar múltiples veces
        if (document.getElementById('admin-add-button')) return;

        const rightIcons = document.querySelector('.right-icons');
        const anchor = document.createElement('a');
        anchor.id = 'admin-add-button';
        anchor.className = 'admin-add';
        anchor.href = '/publicar-producto';
        anchor.title = 'Agregar producto';
        anchor.setAttribute('aria-label', 'Agregar producto');
        anchor.innerHTML = '<i class="bx bx-plus"></i>';

        if (rightIcons) {
          const cartLink = rightIcons.querySelector('a[href="/carrito"]');
          if (cartLink && cartLink.parentElement === rightIcons) {
            if (cartLink.nextSibling) rightIcons.insertBefore(anchor, cartLink.nextSibling);
            else rightIcons.appendChild(anchor);
          } else {
            rightIcons.appendChild(anchor);
          }
        } else {
          // Fallback: fixed
          anchor.classList.add('fixed');
          document.body.appendChild(anchor);
        }

        // noop listener (mantener para compatibilidad)
        anchor.addEventListener('click', () => {});
      } catch (e) {
        // ignore
      }
    };

    // Intentar insertar ahora
    insertButton();

    // Si no existe .right-icons aún, observar el DOM para cuando aparezca
    if (!document.querySelector('.right-icons') && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver((mutations) => {
        if (document.querySelector('.right-icons')) {
          insertButton();
          if (observer) { observer.disconnect(); observer = null; }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // cleanup
    return () => {
      if (observer) observer.disconnect();
      const el = document.getElementById('admin-add-button');
      if (el && el.parentElement) el.parentElement.removeChild(el);
      cleanupDone = true;
    };
  }, [isAdmin]);

  return null;
}
