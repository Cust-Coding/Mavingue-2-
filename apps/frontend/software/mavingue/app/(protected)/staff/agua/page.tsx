"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterOverviewPage } from "@/features/water/BackofficeWaterPages";

export default function StaffWaterOverviewRoute() {
  return (
    <PermissionGate permissions={["water.overview"]}>
      <WaterOverviewPage scope="staff" />
    </PermissionGate>
  );
}
