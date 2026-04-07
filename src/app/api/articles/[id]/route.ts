import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const [article] = await db.select().from(articles).where(eq(articles.id, Number(id)));
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.read !== undefined) updates.read = body.read;
  if (body.starred !== undefined) updates.starred = body.starred;

  await db.update(articles).set(updates).where(eq(articles.id, Number(id)));
  return NextResponse.json({ ok: true });
}
