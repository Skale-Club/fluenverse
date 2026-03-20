import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceClient } from "@/components/workspace-client";

export default function AdminWorkspacePage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get("fluenverse_admin_auth")?.value === "1";

  if (!isAuthenticated) {
    redirect("/login");
  }

  const username = decodeURIComponent(cookieStore.get("fluenverse_admin_user")?.value ?? "Admin");

  return <WorkspaceClient username={username} />;
}
