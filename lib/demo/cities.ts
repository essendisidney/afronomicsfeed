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
  { slug: "conakry", name: "Conakry", countrySlug: "guinea", role: "Capital / port", portSlug: "conakry" },
  { slug: "monrovia", name: "Monrovia", countrySlug: "liberia", role: "Capital" },
  { slug: "freetown", name: "Freetown", countrySlug: "sierra-leone", role: "Capital / port", portSlug: "freetown" },
  { slug: "nouakchott", name: "Nouakchott", countrySlug: "mauritania", role: "Capital" },
  { slug: "banjul", name: "Banjul", countrySlug: "gambia", role: "Capital" },
  { slug: "ndjamena", name: "N’Djamena", countrySlug: "chad", role: "Capital" },
  { slug: "antananarivo", name: "Antananarivo", countrySlug: "madagascar", role: "Capital" },
  { slug: "brazzaville", name: "Brazzaville", countrySlug: "congo", role: "Capital" },
  { slug: "bujumbura", name: "Bujumbura", countrySlug: "burundi", role: "Commercial capital" },
  { slug: "bangui", name: "Bangui", countrySlug: "central-african-republic", role: "Capital" },
  { slug: "malabo", name: "Malabo", countrySlug: "equatorial-guinea", role: "Capital" },
  { slug: "sao-tome", name: "São Tomé", countrySlug: "sao-tome-and-principe", role: "Capital" },
  { slug: "juba", name: "Juba", countrySlug: "south-sudan", role: "Capital" },
  { slug: "khartoum", name: "Khartoum", countrySlug: "sudan", role: "Capital" },
  { slug: "asmara", name: "Asmara", countrySlug: "eritrea", role: "Capital" },
  { slug: "mogadishu", name: "Mogadishu", countrySlug: "somalia", role: "Capital" },
  { slug: "praia", name: "Praia", countrySlug: "cabo-verde", role: "Capital" },
  { slug: "bissau", name: "Bissau", countrySlug: "guinea-bissau", role: "Capital" },
  { slug: "moroni", name: "Moroni", countrySlug: "comoros", role: "Capital" },
  { slug: "mbabane", name: "Mbabane", countrySlug: "eswatini", role: "Administrative capital" },
  { slug: "maseru", name: "Maseru", countrySlug: "lesotho", role: "Capital" },
  { slug: "victoria", name: "Victoria", countrySlug: "seychelles", role: "Capital" },
  { slug: "nacala", name: "Nacala", countrySlug: "mozambique", role: "Port city", portSlug: "nacala" },
  { slug: "lamu", name: "Lamu", countrySlug: "kenya", role: "Port city", portSlug: "lamu" },
  { slug: "ndola", name: "Ndola", countrySlug: "zambia", role: "Copperbelt" },
  { slug: "pointe-noire", name: "Pointe-Noire", countrySlug: "congo", role: "Port city", portSlug: "pointe-noire" },
  { slug: "matadi", name: "Matadi", countrySlug: "dr-congo", role: "Port city", portSlug: "matadi" },
  { slug: "berbera", name: "Berbera", countrySlug: "somalia", role: "Port city", portSlug: "berbera" },
  { slug: "port-said", name: "Port Said", countrySlug: "egypt", role: "Port city", portSlug: "port-said" },
  { slug: "port-sudan", name: "Port Sudan", countrySlug: "sudan", role: "Port city", portSlug: "port-sudan" },
  { slug: "toamasina", name: "Toamasina", countrySlug: "madagascar", role: "Port city", portSlug: "toamasina" },
  { slug: "yaounde", name: "Yaoundé", countrySlug: "cameroon", role: "Capital" },
  { slug: "massawa", name: "Massawa", countrySlug: "eritrea", role: "Port city", portSlug: "massawa" },
  { slug: "tangier", name: "Tangier", countrySlug: "morocco", role: "Port city", portSlug: "tangier" },
  { slug: "sfax", name: "Sfax", countrySlug: "tunisia", role: "Port city", portSlug: "sfax" },
  { slug: "oran", name: "Oran", countrySlug: "algeria", role: "Port city", portSlug: "oran" },
  { slug: "benghazi", name: "Benghazi", countrySlug: "libya", role: "Port city", portSlug: "benghazi" },
  { slug: "port-gentil", name: "Port-Gentil", countrySlug: "gabon", role: "Port city", portSlug: "port-gentil" },
  { slug: "bata", name: "Bata", countrySlug: "equatorial-guinea", role: "Port city", portSlug: "bata" },
  { slug: "nouadhibou", name: "Nouadhibou", countrySlug: "mauritania", role: "Port city", portSlug: "nouadhibou" },
  { slug: "bulawayo", name: "Bulawayo", countrySlug: "zimbabwe", role: "Inland city" },
  { slug: "kumasi", name: "Kumasi", countrySlug: "ghana", role: "Inland city" },
  { slug: "francistown", name: "Francistown", countrySlug: "botswana", role: "Inland city" },
  { slug: "dodoma", name: "Dodoma", countrySlug: "tanzania", role: "Capital" },
  { slug: "kano", name: "Kano", countrySlug: "nigeria", role: "Inland city" },
  { slug: "blantyre", name: "Blantyre", countrySlug: "malawi", role: "Commercial city" },
  { slug: "aswan", name: "Aswan", countrySlug: "egypt", role: "Inland city" },
  { slug: "marrakech", name: "Marrakech", countrySlug: "morocco", role: "Inland city" },
  { slug: "constantine", name: "Constantine", countrySlug: "algeria", role: "Inland city" },
  { slug: "takoradi", name: "Takoradi", countrySlug: "ghana", role: "Port city", portSlug: "takoradi" },
  { slug: "kisumu", name: "Kisumu", countrySlug: "kenya", role: "Inland city" },
  { slug: "port-harcourt", name: "Port Harcourt", countrySlug: "nigeria", role: "Port city", portSlug: "port-harcourt" },
  { slug: "san-pedro", name: "San-Pédro", countrySlug: "cote-divoire", role: "Port city", portSlug: "san-pedro" },
  { slug: "tete", name: "Tete", countrySlug: "mozambique", role: "Inland city" },
  { slug: "buchanan", name: "Buchanan", countrySlug: "liberia", role: "Port city", portSlug: "buchanan" },
  { slug: "rabat", name: "Rabat", countrySlug: "morocco", role: "Capital" },
  { slug: "pretoria", name: "Pretoria", countrySlug: "south-africa", role: "Administrative capital" },
  { slug: "saint-louis", name: "Saint-Louis", countrySlug: "senegal", role: "City" },
  { slug: "tamale", name: "Tamale", countrySlug: "ghana", role: "Inland city" },
  { slug: "namibe", name: "Namibe", countrySlug: "angola", role: "Port city", portSlug: "namibe" },
  { slug: "lubumbashi", name: "Lubumbashi", countrySlug: "dr-congo", role: "Inland city" },
  { slug: "annaba", name: "Annaba", countrySlug: "algeria", role: "Port city", portSlug: "annaba" },
  { slug: "calabar", name: "Calabar", countrySlug: "nigeria", role: "Port city", portSlug: "calabar" },
  { slug: "entebbe", name: "Entebbe", countrySlug: "uganda", role: "City" },
  { slug: "mwanza", name: "Mwanza", countrySlug: "tanzania", role: "Inland city" },
  { slug: "porto-novo", name: "Porto-Novo", countrySlug: "benin", role: "Capital" },
  { slug: "kara", name: "Kara", countrySlug: "togo", role: "Inland city" },
  { slug: "sousse", name: "Sousse", countrySlug: "tunisia", role: "Port city", portSlug: "sousse" },
  { slug: "luxor", name: "Luxor", countrySlug: "egypt", role: "Inland city" },
  { slug: "kankan", name: "Kankan", countrySlug: "guinea", role: "Inland city" },
  { slug: "franceville", name: "Franceville", countrySlug: "gabon", role: "Inland city" },
  { slug: "nakuru", name: "Nakuru", countrySlug: "kenya", role: "Inland city" },
  { slug: "dire-dawa", name: "Dire Dawa", countrySlug: "ethiopia", role: "Inland city" },
  { slug: "bouake", name: "Bouaké", countrySlug: "cote-divoire", role: "Inland city" },
  { slug: "ibadan", name: "Ibadan", countrySlug: "nigeria", role: "Inland city" },
  { slug: "bloemfontein", name: "Bloemfontein", countrySlug: "south-africa", role: "Judicial capital" },
  { slug: "livingstone", name: "Livingstone", countrySlug: "zambia", role: "Inland city" },
  { slug: "agadir", name: "Agadir", countrySlug: "morocco", role: "Port city", portSlug: "agadir" },
  { slug: "jinja", name: "Jinja", countrySlug: "uganda", role: "Inland city" },
  { slug: "garoua", name: "Garoua", countrySlug: "cameroon", role: "Inland city" },
  { slug: "mutare", name: "Mutare", countrySlug: "zimbabwe", role: "Inland city" },
  { slug: "nampula", name: "Nampula", countrySlug: "mozambique", role: "Inland city" },
  { slug: "cape-coast", name: "Cape Coast", countrySlug: "ghana", role: "City" },
  { slug: "rundu", name: "Rundu", countrySlug: "namibia", role: "Inland city" },
  { slug: "maun", name: "Maun", countrySlug: "botswana", role: "Inland city" },
  { slug: "misrata", name: "Misrata", countrySlug: "libya", role: "Port city", portSlug: "misrata" },
  { slug: "zomba", name: "Zomba", countrySlug: "malawi", role: "Inland city" },
  { slug: "keren", name: "Keren", countrySlug: "eritrea", role: "Inland city" },
  { slug: "malanje", name: "Malanje", countrySlug: "angola", role: "Inland city" },
  { slug: "fianarantsoa", name: "Fianarantsoa", countrySlug: "madagascar", role: "Inland city" },
  { slug: "kaolack", name: "Kaolack", countrySlug: "senegal", role: "Inland city" },
  { slug: "sikasso", name: "Sikasso", countrySlug: "mali", role: "Inland city" },
  { slug: "bobo-dioulasso", name: "Bobo-Dioulasso", countrySlug: "burkina-faso", role: "Inland city" },
  { slug: "kassala", name: "Kassala", countrySlug: "sudan", role: "Inland city" },
  { slug: "moundou", name: "Moundou", countrySlug: "chad", role: "Inland city" },
  { slug: "musanze", name: "Musanze", countrySlug: "rwanda", role: "Inland city" },
  { slug: "mzuzu", name: "Mzuzu", countrySlug: "malawi", role: "Inland city" },
  { slug: "hawassa", name: "Hawassa", countrySlug: "ethiopia", role: "Inland city" },
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
