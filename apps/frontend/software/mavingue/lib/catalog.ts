import type { Product } from "@/features/products/types";

export type CatalogCategory = "todos" | "construcao" | "ferragem" | "agua" | "premium";
export type CatalogSort = "relevancia" | "preco-asc" | "preco-desc" | "nome";

type FilterParams = {
  query: string;
  category: CatalogCategory;
  sort: CatalogSort;
};

const categoryMatchers: Record<Exclude<CatalogCategory, "todos">, string[]> = {
  construcao: ["cimento", "bloco", "tijolo", "betao", "construcao", "obra", "areia", "massa"],
  ferragem: ["ferro", "parafuso", "martelo", "chave", "fechadura", "arame", "ferragem", "metal"],
  agua: ["agua", "tubo", "cano", "torneira", "bomba", "pvc", "hidraul", "deposito"],
  premium: ["premium", "luxo", "pro", "profissional", "reforcado", "design"],
};

export const catalogCategories: { value: CatalogCategory; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "construcao", label: "Construcao" },
  { value: "ferragem", label: "Ferragem" },
  { value: "agua", label: "Agua" },
  { value: "premium", label: "Premium" },
];

export const catalogSortOptions: { value: CatalogSort; label: string }[] = [
  { value: "relevancia", label: "Mais recentes" },
  { value: "nome", label: "Nome A-Z" },
  { value: "preco-asc", label: "Preco crescente" },
  { value: "preco-desc", label: "Preco decrescente" },
];

export function inferProductCategory(product: Product): CatalogCategory {
  const source = `${product.name} ${product.description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryMatchers) as Array<
    [Exclude<CatalogCategory, "todos">, string[]]
  >) {
    if (keywords.some((keyword) => source.includes(keyword))) {
      return category;
    }
  }

  return "construcao";
}

export function filterCatalogProducts(products: Product[], params: FilterParams) {
  const query = params.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const category = inferProductCategory(product);
    const matchesCategory = params.category === "todos" || category === params.category;
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      category.includes(query);

    return matchesCategory && matchesQuery;
  });

  return filtered.sort((left, right) => {
    switch (params.sort) {
      case "nome":
        return left.name.localeCompare(right.name);
      case "preco-asc":
        return Number(left.price) - Number(right.price);
      case "preco-desc":
        return Number(right.price) - Number(left.price);
      default:
        return Number(right.id) - Number(left.id);
    }
  });
}
