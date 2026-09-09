import { NextRequest, NextResponse } from "next/server";
import { requireUser, badRequest } from "@/lib/api";
import { createTransaction, listTransactions } from "@/modules/finance/service";

export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const { searchParams } = new URL(req.url);
  const transactions = listTransactions(auth.user.id, {
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
  });
  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  try {
    const body = await req.json();
    const transaction = createTransaction(auth.user.id, {
      type: body.type,
      amountCents: Math.round(parseFloat(body.amount) * 100),
      description: body.description,
      category: body.category,
      date: body.date,
    });
    return NextResponse.json({ transaction });
  } catch (e: any) {
    return badRequest(e.message);
  }
}
