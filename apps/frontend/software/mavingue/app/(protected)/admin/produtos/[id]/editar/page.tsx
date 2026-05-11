"use client";

import { useParams } from "next/navigation";
import { ProductEditorPage } from "@/features/products/ProductEditorPage";

export default function EditarProduto() {
  const params = useParams();
  const productId = Number(params.id);

  return <ProductEditorPage mode="edit" productId={productId} />;
}
