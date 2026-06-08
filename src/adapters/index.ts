import { GenericKeosScraper } from "./genericKeos";
import { EyupsultanScraper } from "./eyupsultan";
import { PuppeteerKeosScraper } from "./puppeteerKeos";
import { MoskbilisimScraper } from "./moskbilisim";
import { GiSoftCbsScraper } from "./gisoftCbs";
import { ArnavutkoyScraper } from "./arnavutkoy";
import { registerScraper } from "@/services/scraper/registry";

// Create scraper instances
const eyupsultan = new EyupsultanScraper();
const pendik = new GenericKeosScraper("pendik");
const gaziosmanpasa = new GenericKeosScraper("gaziosmanpasa");
const avcilar = new PuppeteerKeosScraper("avcilar");
const bakirkoy = new PuppeteerKeosScraper("bakirkoy");
const esenler = new PuppeteerKeosScraper("esenler");
const kucukcekmece = new PuppeteerKeosScraper("kucukcekmece");
const kadikoy = new PuppeteerKeosScraper("kadikoy");
const atasehir = new PuppeteerKeosScraper("atasehir");
const umraniye = new PuppeteerKeosScraper("umraniye");
const basaksehir = new PuppeteerKeosScraper("basaksehir");
const maltepe = new PuppeteerKeosScraper("maltepe");
const tuzla = new PuppeteerKeosScraper("tuzla");
const sultangazi = new PuppeteerKeosScraper("sultangazi");
const catalca = new PuppeteerKeosScraper("catalca");
const bcekmece = new PuppeteerKeosScraper("bcekmece");

// Puppeteer (PuppeteerKeosScraper) - standard KEOS 403
const cekmekoy = new PuppeteerKeosScraper("cekmekoy");

// Direct fetch (GenericKeosScraper) - custom ports/subdomains
const gungoren = new GenericKeosScraper("gungoren");
const zeytinburnu = new GenericKeosScraper("zeytinburnu");

// Puppeteer (PuppeteerKeosScraper) - standard KEOS 403
const besiktas = new PuppeteerKeosScraper("besiktas");
const bayrampasa = new PuppeteerKeosScraper("bayrampasa");
const bahcelievler = new PuppeteerKeosScraper("bahcelievler");

// Puppeteer (PuppeteerKeosScraper) - non-standard subdomains
const kartal = new PuppeteerKeosScraper("kartal");
const silivri = new PuppeteerKeosScraper("silivri");
const beyoglu = new PuppeteerKeosScraper("beyoglu");
const bagcilar = new PuppeteerKeosScraper("bagcilar");
const sile = new PuppeteerKeosScraper("sile");

// Puppeteer (PuppeteerKeosScraper) - webGIS subdomain
const sancaktepe = new PuppeteerKeosScraper("sancaktepe");

// Puppeteer (PuppeteerKeosScraper) - kentrehberi subdomain
const sisli = new PuppeteerKeosScraper("sisli");

// Moskbilisim platform (MoskbilisimScraper) - esenyurt
const esenyurt = new MoskbilisimScraper("esenyurt");

// GiSoft CBS platforms (GiSoftCbsScraper) - require authentication
const fatih = new GiSoftCbsScraper("fatih");
const sariyer = new GiSoftCbsScraper("sariyer");
const beykoz = new GiSoftCbsScraper("beykoz");
const beylikduzu = new GiSoftCbsScraper("beylikduzu");
const sultanbeyli = new GiSoftCbsScraper("sultanbeyli");
const kagithane = new GiSoftCbsScraper("kagithane");
const uskudar = new GiSoftCbsScraper("uskudar");

// Custom maps platform (ArnavutkoyScraper) - arnavutkoy
const arnavutkoy = new ArnavutkoyScraper("arnavutkoy");

let initialized = false;

export async function initAdapters(): Promise<void> {
  if (initialized) return;

  // Register all scrapers
  registerScraper(eyupsultan);
  registerScraper(pendik);
  registerScraper(gaziosmanpasa);
  registerScraper(avcilar);
  registerScraper(bakirkoy);
  registerScraper(esenler);
  registerScraper(kucukcekmece);
  registerScraper(kadikoy);
  registerScraper(atasehir);
  registerScraper(umraniye);
  registerScraper(basaksehir);
  registerScraper(maltepe);
  registerScraper(tuzla);
  registerScraper(sultangazi);
  registerScraper(catalca);
  registerScraper(bcekmece);

  // New districts - direct fetch
  registerScraper(gungoren);
  registerScraper(zeytinburnu);

  // New districts - Puppeteer KEOS 403
  registerScraper(besiktas);
  registerScraper(bayrampasa);
  registerScraper(bahcelievler);

  // New districts - Puppeteer non-standard subdomains
  registerScraper(kartal);
  registerScraper(silivri);
  registerScraper(beyoglu);
  registerScraper(bagcilar);
  registerScraper(sile);

  // New districts - Puppeteer standard KEOS 403
  registerScraper(cekmekoy);

  // New districts - Puppeteer webGIS
  registerScraper(sancaktepe);

  // New districts - Puppeteer kentrehberi
  registerScraper(sisli);

  // Moskbilisim platform
  registerScraper(esenyurt);

  // GiSoft CBS platforms
  registerScraper(fatih);
  registerScraper(sariyer);
  registerScraper(beykoz);
  registerScraper(beylikduzu);
  registerScraper(sultanbeyli);
  registerScraper(kagithane);
  registerScraper(uskudar);

  // Custom maps platform
  registerScraper(arnavutkoy);

  initialized = true;
}

// Auto-initialize when imported
initAdapters().catch(() => {});

export {
  eyupsultan, pendik, gaziosmanpasa,
  avcilar, bakirkoy, esenler, kucukcekmece,
  kadikoy, atasehir, umraniye, basaksehir, maltepe, tuzla, sultangazi,
  catalca, bcekmece,
  // New districts
  cekmekoy,
  gungoren, zeytinburnu,
  besiktas, bayrampasa, bahcelievler,
  kartal, silivri, beyoglu, bagcilar, sile,
  sancaktepe,
  sisli,
  // GiSoft CBS and custom platforms
  esenyurt,
  fatih, sariyer, beykoz, beylikduzu, sultanbeyli, kagithane, uskudar,
  arnavutkoy,
};
