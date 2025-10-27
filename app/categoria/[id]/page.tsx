import React from "react";
import CategoriaClient from "./CategoriaClient";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  return (
    <CategoriaClient categoriaId={params.id} />
  );
}
