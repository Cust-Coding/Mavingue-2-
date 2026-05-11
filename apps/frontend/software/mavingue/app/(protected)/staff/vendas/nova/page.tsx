import PermissionGate from "@/components/layout/PermissionGate";
import AdminNovaVendaPage from "@/app/(protected)/admin/vendas/nova/page";

export default function StaffSalesCreatePage() {
  return (
    <PermissionGate permissions={["sales.create"]}>
      <AdminNovaVendaPage />
    </PermissionGate>
  );
}
