import { getCurrentUser } from "@/modules/auth/service";
import { getBriefData, generateBriefSummary } from "@/modules/brief/service";
import { fmtCents } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = getCurrentUser();
  const data = await getBriefData(user);
  const summary = await generateBriefSummary(user, data);
  return new Response(
    JSON.stringify({
      ...data,
      summary,
      greeting: data.greeting,  // kept in English for AI system prompt compatibility
      date: data.date,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}