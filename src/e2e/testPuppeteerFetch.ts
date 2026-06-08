import { puppeteerFetch } from "@/lib/puppeteerFetch";
import { MUNICIPALITIES } from "@/lib/turkishFetch";

interface MahalleItem {
  OBJECTID: number;
  ADI_NUMARASI: string;
}

(async () => {
  const avcilar = MUNICIPALITIES.find((m) => m.key === "avcilar");
  if (!avcilar) {
    console.error("avcilar not found");
    process.exit(1);
  }

  console.log("Testing puppeteerFetch for avcilar...");
  try {
    const result = await puppeteerFetch<MahalleItem>(avcilar, "type=mahalle");
    console.log(`\nSUCCESS: ${result.length} items`);
    console.log("First item:", JSON.stringify(result[0], null, 2).substring(0, 300));
  } catch (e: unknown) {
    console.error(`FAILED: ${e}`);
  }
  
  process.exit(0);
})();
