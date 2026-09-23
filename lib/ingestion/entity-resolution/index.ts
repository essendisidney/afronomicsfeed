export function slugCandidate(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export { resolveEntityName, knownEntityCatalog } from "./resolve";
