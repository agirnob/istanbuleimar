import { BaseScraper } from "./base";

const scrapers = new Map<string, BaseScraper>();

function turkishKey(s: string): string {
  return s.toLocaleLowerCase("tr");
}

export function registerScraper(scraper: BaseScraper): void {
  scrapers.set(turkishKey(scraper.municipality), scraper);
}

export function getScraper(municipality: string): BaseScraper | undefined {
  return scrapers.get(turkishKey(municipality));
}

export function getAvailableMunicipalities(): string[] {
  return Array.from(scrapers.keys());
}

export function resetRegistry(): void {
  scrapers.clear();
}
