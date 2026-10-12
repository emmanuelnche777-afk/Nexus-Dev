import { redirect } from "next/navigation";

/**
 * Manual intake used to display a success message without saving a record.
 * Registrations originate from the public application/payment workflow;
 * staff can review and register paid applicants from the registrations list.
 */
export default function NewRegistrationPage() {
  redirect("/admin/academy/registrations");
}
