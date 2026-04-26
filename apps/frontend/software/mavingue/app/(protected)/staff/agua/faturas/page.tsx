"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterBillsPage } from "@/features/water/BackofficeWaterPages";

export default function StaffWaterBillsRoute() {
  return (
    <PermissionGate permissions={["water.bills.manage"]}>
      <WaterBillsPage scope="staff" />
    </PermissionGate>
  );
}
