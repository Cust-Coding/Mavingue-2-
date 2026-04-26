"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterCustomersPage } from "@/features/water/BackofficeWaterPages";

export default function StaffWaterCustomersRoute() {
  return (
    <PermissionGate permissions={["water.customers.view"]}>
      <WaterCustomersPage scope="staff" />
    </PermissionGate>
  );
}
