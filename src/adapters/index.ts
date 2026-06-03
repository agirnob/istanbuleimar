import { GenericKeosScraper } from "./genericKeos";
import { EyupsultanScraper } from "./eyupsultan";
import { PuppeteerKeosScraper } from "./puppeteerKeos";
import { registerScraper } from "@/services/scraper/registry";

// Register all KEOS-compatible municipalities
// Original working ones (direct fetch works)
const eyupsultan = new EyupsultanScraper();
registerScraper(eyupsultan);

const pendik = new GenericKeosScraper("pendik");
registerScraper(pendik);

const gaziosmanpasa = new GenericKeosScraper("gaziosmanpasa");
registerScraper(gaziosmanpasa);

// KEOS standard API (403-protected, need Puppeteer)
const avcilar = new PuppeteerKeosScraper("avcilar");
registerScraper(avcilar);

const bakirkoy = new PuppeteerKeosScraper("bakirkoy");
registerScraper(bakirkoy);

const esenler = new PuppeteerKeosScraper("esenler");
registerScraper(esenler);

const kucukcekmece = new PuppeteerKeosScraper("kucukcekmece");
registerScraper(kucukcekmece);

// webGIS platform (403-protected, need Puppeteer)
const kadikoy = new PuppeteerKeosScraper("kadikoy");
registerScraper(kadikoy);

const atasehir = new PuppeteerKeosScraper("atasehir");
registerScraper(atasehir);

const umraniye = new PuppeteerKeosScraper("umraniye");
registerScraper(umraniye);

const basaksehir = new PuppeteerKeosScraper("basaksehir");
registerScraper(basaksehir);

const maltepe = new PuppeteerKeosScraper("maltepe");
registerScraper(maltepe);

const tuzla = new PuppeteerKeosScraper("tuzla");
registerScraper(tuzla);

const sultangazi = new PuppeteerKeosScraper("sultangazi");
registerScraper(sultangazi);

// KEOS with custom ports (403-protected, need Puppeteer)
const catalca = new PuppeteerKeosScraper("catalca");
registerScraper(catalca);

const bcekmece = new PuppeteerKeosScraper("bcekmece");
registerScraper(bcekmece);

export {
  eyupsultan, pendik, gaziosmanpasa,
  avcilar, bakirkoy, esenler, kucukcekmece,
  kadikoy, atasehir, umraniye, basaksehir, maltepe, tuzla, sultangazi,
  catalca, bcekmece,
};
