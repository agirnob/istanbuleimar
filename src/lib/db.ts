import { prisma } from "./prisma";
import { ZoningPlanInfo, ZoningKadastroInfo } from "@/types/zoning";

interface SaveParcelData {
  objectId: number;
  parcelNo: string;
  plotNo?: string;
  block?: string;
  neighborhood?: string;
  municipality: string;
  sourceUrl?: string;
  planInfo?: ZoningPlanInfo;
  kadastroInfo?: ZoningKadastroInfo;
}

export async function upsertParcel(data: SaveParcelData) {
  const { planInfo, kadastroInfo, ...basic } = data;

  await prisma.parcel.upsert({
    where: { objectId: data.objectId },
    update: {
      ...basic,
      ...(planInfo && {
        planAdi: planInfo.planAdi,
        fonksiyon: planInfo.fonksiyon,
        tasdikTarihi: planInfo.tasdikTarihi,
        olcek: planInfo.olcek,
        pafta: planInfo.pafta,
        hesapAlani: planInfo.hesapAlani,
        binaYuksekligi: planInfo.binaYuksekligi,
        onBahce: planInfo.onBahce,
        yanBahce: planInfo.yanBahce,
        arkaBahce: planInfo.arkaBahce,
        binaDerinligi: planInfo.binaDerinligi,
        katAdedi: planInfo.katAdedi,
        inaatNizami: planInfo.inaatNizami,
        taks: planInfo.taks,
        kaks: planInfo.kaks,
        kotAlinacakNokta: planInfo.kotAlinacakNokta,
        aciklama: planInfo.aciklama,
        kisitlama: planInfo.kisitlama,
      }),
      ...(kadastroInfo && {
        projeksiyon: kadastroInfo.projeksiyon,
        kartezyenKoordinat: kadastroInfo.kartezyenKoordinat,
        cografiKoordinat: kadastroInfo.cografiKoordinat,
      }),
    },
    create: {
      ...basic,
      objectId: data.objectId,
      ...(planInfo && {
        planAdi: planInfo.planAdi,
        fonksiyon: planInfo.fonksiyon,
        tasdikTarihi: planInfo.tasdikTarihi,
        olcek: planInfo.olcek,
        pafta: planInfo.pafta,
        hesapAlani: planInfo.hesapAlani,
        binaYuksekligi: planInfo.binaYuksekligi,
        onBahce: planInfo.onBahce,
        yanBahce: planInfo.yanBahce,
        arkaBahce: planInfo.arkaBahce,
        binaDerinligi: planInfo.binaDerinligi,
        katAdedi: planInfo.katAdedi,
        inaatNizami: planInfo.inaatNizami,
        taks: planInfo.taks,
        kaks: planInfo.kaks,
        kotAlinacakNokta: planInfo.kotAlinacakNokta,
        aciklama: planInfo.aciklama,
        kisitlama: planInfo.kisitlama,
      }),
      ...(kadastroInfo && {
        projeksiyon: kadastroInfo.projeksiyon,
        kartezyenKoordinat: kadastroInfo.kartezyenKoordinat,
        cografiKoordinat: kadastroInfo.cografiKoordinat,
      }),
    },
  });
}

export async function getParcelByObjectId(objectId: number) {
  return prisma.parcel.findUnique({
    where: { objectId },
  });
}

export async function getParcelByParcelNo(parcelNo: string) {
  return prisma.parcel.findFirst({
    where: { parcelNo },
  });
}
