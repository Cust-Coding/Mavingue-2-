import PermissionGate from "@/components/layout/PermissionGate";
import AdminEditarProdutoPage from "@/app/(protected)/admin/produtos/[id]/editar/page";

export default function StaffProductEditPage() {
  return (
    <PermissionGate permissions={["products.manage"]}>
      <AdminEditarProdutoPage />
    </PermissionGate>
  );
}
