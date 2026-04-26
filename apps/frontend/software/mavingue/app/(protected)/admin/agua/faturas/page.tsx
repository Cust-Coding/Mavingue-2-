"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterBillsPage } from "@/features/water/BackofficeWaterPages";

export default function AdminWaterBillsRoute() {
  return (
    <PermissionGate permissions={["water.bills.manage"]}>
      <WaterBillsPage scope="admin" />
    </PermissionGate>
  );
}
