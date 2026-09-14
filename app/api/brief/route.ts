import { getCurrentUser } from "@/modules/auth/service";
import { getBriefData, generateBriefSummary } from "@/modules/brief/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const lang = (new URL(req.url).searchParams.get("lang") === "es" ? "es" : "en") as "en" | "es";
  const user = getCurrentUser();
  const data = await getBriefData(user, lang);
  const summary = await generateBriefSummary(user, data, lang);
  return new Response(
    JSON.stringify({
      ...data,
      summary,
      greeting: data.greeting,
      date: data.date,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}