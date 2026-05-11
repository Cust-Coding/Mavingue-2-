import type { ProductCategory, ProductCategoryOption } from "./types";

const fallbackCategories: ProductCategory[] = [
  { id: 0, name: "Construcao", slug: "construcao" },
  { id: 0, name: "Ferragem", slug: "ferragem" },
  { id: 0, name: "Agua", slug: "agua" },
  { id: 0, name: "Premium", slug: "premium" },
];

function titleFromSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildProductCategoryOptions(categories: ProductCategory[], includeAll = false): ProductCategoryOption[] {
  const options = new Map<string, ProductCategoryOption>();

  if (includeAll) {
    options.set("todos", { value: "todos", label: "Todos" });
  }

  [...fallbackCategories, ...categories].forEach((category) => {
    if (!category.slug) return;
    options.set(category.slug, {
      value: category.slug,
      label: category.name || titleFromSlug(category.slug),
    });
  });

  return [...options.values()];
}

export function formatProductCategoryLabel(value?: string | null, categories: ProductCategory[] = []) {
  if (!value) {
    return "Construcao";
  }

  const normalized = value.trim().toLowerCase();
  const option = buildProductCategoryOptions(categories).find((item) => item.value === normalized);
  return option?.label ?? titleFromSlug(normalized);
}
