import { notFound } from "next/navigation";
import { GlassesWorkspace } from "@/components/glasses/GlassesWorkspace";
import { requireVerifiedSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function GlassesSimulatorPage() {
  await requireVerifiedSession();
  if (process.env.NODE_ENV === "production") notFound();
  return <GlassesWorkspace devMode />;
}
