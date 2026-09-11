import { getCurrentUser } from "@/modules/auth/service";
import Sidebar from "./sidebar";
import AssistantDock from "./assistant-dock";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  return (
    <div className="flex min-h-screen pt-14 lg:pt-0">
      <Sidebar />
      <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-10">{children}</main>
      <AssistantDock />
    </div>
  );
}
