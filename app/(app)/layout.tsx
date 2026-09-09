import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/service";
import Sidebar from "./sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="flex min-h-screen pt-14 lg:pt-0">
      <Sidebar email={user.email} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
