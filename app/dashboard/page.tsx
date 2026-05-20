import { redirect } from "next/navigation";

/** Legacy route — video dashboard removed; studio lives at /images. */
export default function DashboardPage() {
  redirect("/images");
}
