"use client";
// Hook neutralizado por petición del usuario; ya no hace fetch al backend.
export default function useCategories() {
  return { data: null, loading: false, error: null };
}
