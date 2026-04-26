import PermissionGate from "@/components/layout/PermissionGate";
import { UserDetailPage } from "@/features/users/UserDetailPage";

type PageProps = {
  params: {
    id: string;
  };
};

export default function StaffUserEditPage({ params }: PageProps) {
  return (
    <PermissionGate permissions={["users.view"]}>
      <UserDetailPage scope="staff" userId={Number(params.id)} />
    </PermissionGate>
  );
}
