import PermissionGate from "@/components/layout/PermissionGate";
import AdminVendasPage from "@/app/(protected)/admin/vendas/page";

export default function StaffSalesPage() {
  return (
    <PermissionGate permissions={["sales.view"]}>
      <AdminVendasPage />
    </PermissionGate>
  );
}
