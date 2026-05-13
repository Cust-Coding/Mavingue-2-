"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import AdminFerragem from "@/app/(protected)/admin/ferragem/page";

export default function StaffFerragemPage() {
  return (
    <PermissionGate permissions={["ferragem.view"]}>
      <AdminFerragem />
    </PermissionGate>
  );
}
