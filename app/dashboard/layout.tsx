export const dynamic = "force-dynamic";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { requireVerifiedSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireVerifiedSession();
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
}
