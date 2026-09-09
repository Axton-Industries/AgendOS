import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { deleteTransaction } from "@/modules/finance/service";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;
  const ok = deleteTransaction(auth.user.id, (await params).id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
