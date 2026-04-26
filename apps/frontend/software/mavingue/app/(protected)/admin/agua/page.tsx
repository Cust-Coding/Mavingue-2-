"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterOverviewPage } from "@/features/water/BackofficeWaterPages";

export default function AdminWaterOverviewRoute() {
  return (
    <PermissionGate permissions={["water.overview"]}>
      <WaterOverviewPage scope="admin" />
    </PermissionGate>
  );
}
