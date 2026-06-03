import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const parcel = await prisma.parcel.findUnique({
      where: { id },
    });

    if (!parcel) {
      return NextResponse.json(
        { error: "Parsel bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(parcel);
  } catch {
    return NextResponse.json(
      { error: "Veritabanı hatası" },
      { status: 500 }
    );
  }
}
