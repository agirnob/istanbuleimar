import { NextResponse } from "next/server";
import { MUNICIPALITIES } from "@/lib/turkishFetch";

export async function GET() {
  return NextResponse.json({ municipalities: MUNICIPALITIES });
}
