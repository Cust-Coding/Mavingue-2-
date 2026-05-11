import PermissionGate from "@/components/layout/PermissionGate";
import AdminStockMovementsPage from "@/app/(protected)/admin/stock/movimentos/page";

export default function StaffStockMovementsPage() {
  return (
    <PermissionGate permissions={["stock.movements.view"]}>
      <AdminStockMovementsPage />
    </PermissionGate>
  );
}
