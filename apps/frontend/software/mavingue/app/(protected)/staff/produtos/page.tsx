import PermissionGate from "@/components/layout/PermissionGate";
import AdminProdutos from "@/app/(protected)/admin/produtos/page";

export default function StaffProdutosPage() {
  return (
    <PermissionGate permissions={["products.view"]}>
      <AdminProdutos />
    </PermissionGate>
  );
}
