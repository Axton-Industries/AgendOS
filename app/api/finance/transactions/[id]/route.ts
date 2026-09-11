import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { deleteTransaction } from "@/modules/finance/service";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user } = requireUser();
  const ok = deleteTransaction(user.id, (await params).id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
