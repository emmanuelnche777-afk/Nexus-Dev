import { redirect } from "next/navigation";

/** Legacy route: all public requests are managed through the Requests queues. */
export default function LegacyInquiriesPage() {
  redirect("/admin/requests");
}
