import { BaseScraper } from "./base";

const scrapers = new Map<string, BaseScraper>();

export function registerScraper(scraper: BaseScraper): void {
  scrapers.set(scraper.municipality.toLowerCase(), scraper);
}

export function getScraper(municipality: string): BaseScraper | undefined {
  return scrapers.get(municipality.toLowerCase());
}

export function getAvailableMunicipalities(): string[] {
  return Array.from(scrapers.keys());
}
