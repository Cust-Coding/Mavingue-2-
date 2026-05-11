import PermissionGate from "@/components/layout/PermissionGate";
import AdminNovoProdutoPage from "@/app/(protected)/admin/produtos/novo/page";

export default function StaffProductCreatePage() {
  return (
    <PermissionGate permissions={["products.manage"]}>
      <AdminNovoProdutoPage />
    </PermissionGate>
  );
}
