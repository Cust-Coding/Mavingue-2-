"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterCustomersPage } from "@/features/water/BackofficeWaterPages";

export default function AdminWaterCustomersRoute() {
  return (
    <PermissionGate permissions={["water.customers.view"]}>
      <WaterCustomersPage scope="admin" />
    </PermissionGate>
  );
}
