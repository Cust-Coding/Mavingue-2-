import PermissionGate from "@/components/layout/PermissionGate";
import AdminComprasPage from "@/app/(protected)/admin/compras/page";

export default function StaffPurchasesPage() {
  return (
    <PermissionGate permissions={["purchases.view", "purchases.manage"]}>
      <AdminComprasPage />
    </PermissionGate>
  );
}
