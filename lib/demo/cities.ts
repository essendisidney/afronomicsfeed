import { getCountry } from "./countries";

export type City = {
  slug: string;
  name: string;
  countrySlug: string;
  role: string;
  portSlug?: string;
  exchangeHref?: string;
};

export const cities: City[] = [
  { slug: "nairobi", name: "Nairobi", countrySlug: "kenya", role: "Capital / markets", exchangeHref: "/markets/exchanges/nse-20" },
  { slug: "mombasa", name: "Mombasa", countrySlug: "kenya", role: "Port city", portSlug: "mombasa" },
  { slug: "lagos", name: "Lagos", countrySlug: "nigeria", role: "Commercial / port", portSlug: "lagos", exchangeHref: "/markets/exchanges/ngx-asi" },
  { slug: "abuja", name: "Abuja", countrySlug: "nigeria", role: "Federal capital" },
  { slug: "johannesburg", name: "Johannesburg", countrySlug: "south-africa", role: "Markets", exchangeHref: "/markets/exchanges/jse-alsi" },
  { slug: "cape-town", name: "Cape Town", countrySlug: "south-africa", role: "Port city", portSlug: "cape-town" },
  { slug: "durban", name: "Durban", countrySlug: "south-africa", role: "Port city", portSlug: "durban" },
  { slug: "cairo", name: "Cairo", countrySlug: "egypt", role: "Capital / markets", exchangeHref: "/markets/exchanges/egx-30" },
  { slug: "alexandria", name: "Alexandria", countrySlug: "egypt", role: "Port city", portSlug: "alexandria" },
  { slug: "accra", name: "Accra", countrySlug: "ghana", role: "Capital / markets", exchangeHref: "/markets/exchanges/gse-ci" },
  { slug: "kigali", name: "Kigali", countrySlug: "rwanda", role: "Capital" },
  { slug: "kampala", name: "Kampala", countrySlug: "uganda", role: "Capital" },
  { slug: "dar-es-salaam", name: "Dar es Salaam", countrySlug: "tanzania", role: "Port / commercial", portSlug: "dar-es-salaam" },
  { slug: "addis-ababa", name: "Addis Ababa", countrySlug: "ethiopia", role: "Capital / aviation" },
  { slug: "casablanca", name: "Casablanca", countrySlug: "morocco", role: "Commercial / markets" },
  { slug: "luanda", name: "Luanda", countrySlug: "angola", role: "Capital" },
  { slug: "maputo", name: "Maputo", countrySlug: "mozambique", role: "Capital / port", portSlug: "maputo" },
  { slug: "abidjan", name: "Abidjan", countrySlug: "cote-divoire", role: "Commercial / port", portSlug: "abidjan" },
  { slug: "dakar", name: "Dakar", countrySlug: "senegal", role: "Capital / port", portSlug: "dakar" },
  { slug: "djibouti-city", name: "Djibouti", countrySlug: "djibouti", role: "Capital / port", portSlug: "djibouti" },
  { slug: "lusaka", name: "Lusaka", countrySlug: "zambia", role: "Capital" },
  { slug: "kinshasa", name: "Kinshasa", countrySlug: "dr-congo", role: "Capital" },
  { slug: "tunis", name: "Tunis", countrySlug: "tunisia", role: "Capital" },
  { slug: "algiers", name: "Algiers", countrySlug: "algeria", role: "Capital" },
  { slug: "gaborone", name: "Gaborone", countrySlug: "botswana", role: "Capital" },
  { slug: "douala", name: "Douala", countrySlug: "cameroon", role: "Commercial / port" },
  { slug: "windhoek", name: "Windhoek", countrySlug: "namibia", role: "Capital" },
  { slug: "tripoli", name: "Tripoli", countrySlug: "libya", role: "Capital" },
  { slug: "harare", name: "Harare", countrySlug: "zimbabwe", role: "Capital" },
  { slug: "port-louis", name: "Port Louis", countrySlug: "mauritius", role: "Capital / finance" },
  { slug: "libreville", name: "Libreville", countrySlug: "gabon", role: "Capital" },
  { slug: "lilongwe", name: "Lilongwe", countrySlug: "malawi", role: "Capital" },
  { slug: "cotonou", name: "Cotonou", countrySlug: "benin", role: "Commercial / port" },
  { slug: "lome", name: "Lomé", countrySlug: "togo", role: "Capital / port", portSlug: "lome" },
  { slug: "bamako", name: "Bamako", countrySlug: "mali", role: "Capital" },
  { slug: "niamey", name: "Niamey", countrySlug: "niger", role: "Capital" },
  { slug: "ouagadougou", name: "Ouagadougou", countrySlug: "burkina-faso", role: "Capital" },
  { slug: "conakry", name: "Conakry", countrySlug: "guinea", role: "Capital / port" },
  { slug: "monrovia", name: "Monrovia", countrySlug: "liberia", role: "Capital" },
  { slug: "freetown", name: "Freetown", countrySlug: "sierra-leone", role: "Capital / port" },
  { slug: "nouakchott", name: "Nouakchott", countrySlug: "mauritania", role: "Capital" },
  { slug: "banjul", name: "Banjul", countrySlug: "gambia", role: "Capital" },
  { slug: "ndjamena", name: "N’Djamena", countrySlug: "chad", role: "Capital" },
  { slug: "antananarivo", name: "Antananarivo", countrySlug: "madagascar", role: "Capital" },
  { slug: "brazzaville", name: "Brazzaville", countrySlug: "congo", role: "Capital" },
];

export function getCity(slug: string) {
  return cities.find((item) => item.slug === slug);
}

export function citiesInCountry(countrySlug: string) {
  return cities.filter((item) => item.countrySlug === countrySlug);
}

export function cityFileHref(slug: string) {
  return `/cities/${slug}`;
}

export function cityCountryName(city: City) {
  return getCountry(city.countrySlug)?.name ?? city.countrySlug;
}

export function cityForPort(portSlug: string) {
  return cities.find((item) => item.portSlug === portSlug);
}
