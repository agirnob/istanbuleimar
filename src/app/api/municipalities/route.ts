import { NextResponse } from "next/server";
import { MUNICIPALITIES } from "@/lib/turkishFetch";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    municipalities: MUNICIPALITIES.map(m => ({
      key: m.key,
      name: m.name,
    })),
  });
}
