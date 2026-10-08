import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";

export default async function AdminIndexPage() {
  const authed = await isAuthenticated();
  if (authed) {
    redirect("/admin/dashboard");
  }
  redirect("/admin/login");
}
