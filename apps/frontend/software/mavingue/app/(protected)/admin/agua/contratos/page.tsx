"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterContractsPage } from "@/features/water/BackofficeWaterPages";

export default function AdminWaterContractsRoute() {
  return (
    <PermissionGate permissions={["water.contracts.manage"]}>
      <WaterContractsPage scope="admin" />
    </PermissionGate>
  );
}
