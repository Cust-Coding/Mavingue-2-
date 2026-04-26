"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterReadingsPage } from "@/features/water/BackofficeWaterPages";

export default function AdminWaterReadingsRoute() {
  return (
    <PermissionGate permissions={["water.readings.manage"]}>
      <WaterReadingsPage scope="admin" />
    </PermissionGate>
  );
}
