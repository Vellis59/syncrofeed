import { NextRequest, NextResponse } from "next/server";
import { importOpml, generateOpml } from "@/lib/opml";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const xml = await file.text();
    const result = await importOpml(xml);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 422 }
    );
  }
}

export async function GET() {
  try {
    const xml = await generateOpml();
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": 'attachment; filename="syncrofeed-opml.xml"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
