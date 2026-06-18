import { cities } from "./cities";

export const seoCityLinks = cities.map((city) => ({
  label: city.name,
  localName: city.nameLocal,
  to: `/${city.slug}/public-toilets`,
  hint: city.neighborhoods.slice(0, 2).join(" / "),
}));

export const seoCityCount = seoCityLinks.length;
