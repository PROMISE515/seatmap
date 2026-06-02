export type City = {
  slug: string;
  name: string;
  nameLocal: string;
  country: string;
  countryCode: string;
  intro: string;
  travelerTip: string;
  neighborhoods: string[];
  // GCJ-02 center coordinates (used for AMap "around" search)
  centerLat: number;
  centerLng: number;
  // search radius in meters
  radius: number;
};

export const cities: City[] = [
  {
    slug: "shanghai",
    name: "Shanghai",
    nameLocal: "上海",
    country: "China",
    countryCode: "CN",
    intro:
      "Finding a clean, Western-style seated toilet in Shanghai is easier than you think if you know where to look. SeatMap pulls live public-toilet results and screens for seated-restroom likelihood around Pudong, Jing'an, and the former French Concession.",
    travelerTip:
      "In Shanghai, luxury malls (IFC, K11, Plaza 66) and international hotel lobbies (Ritz-Carlton, Mandarin Oriental) are usually the safest bet for clean seated toilets.",
    neighborhoods: [
      "Pudong / Lujiazui",
      "Jing'an",
      "Xintiandi",
      "Former French Concession",
      "The Bund",
    ],
    centerLat: 31.2304,
    centerLng: 121.4737,
    radius: 3000,
  },
  {
    slug: "beijing",
    name: "Beijing",
    nameLocal: "北京",
    country: "China",
    countryCode: "CN",
    intro:
      "Beijing's public toilets are widespread but vary in quality. SeatMap pulls live public-toilet results and prioritizes traveler-friendly seated options around Sanlitun, Wangfujing, and major tourist sites.",
    travelerTip:
      "Around the Forbidden City and Temple of Heaven, the nearest 5-star hotel lobby or shopping mall (Taikoo Li, WF Central) is usually a better bet than a street-side public toilet.",
    neighborhoods: ["Sanlitun", "Wangfujing", "CBD / Guomao", "Houhai", "Forbidden City area"],
    centerLat: 39.9042,
    centerLng: 116.4074,
    radius: 3000,
  },
  {
    slug: "qingdao",
    name: "Qingdao",
    nameLocal: "青岛",
    country: "China",
    countryCode: "CN",
    intro:
      "Qingdao has many public toilets, but seated-toilet availability is uneven. SeatMap starts with live map results and only unlocks navigation when there is a seated-toilet signal or a confirmed report.",
    travelerTip:
      "In Qingdao, international hotels, large shopping malls around May Fourth Square, and airport or railway station facilities are better candidates than street-side public toilets.",
    neighborhoods: [
      "May Fourth Square",
      "Shinan",
      "Laoshan",
      "Qingdao Railway Station",
      "Airport area",
    ],
    centerLat: 36.0671,
    centerLng: 120.3826,
    radius: 3000,
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}

const SUPPORTED_SEARCH_REGIONS = new Set(cities.flatMap((city) => [city.name, city.nameLocal]));

export function isSupportedSearchRegion(region: string | null | undefined) {
  return Boolean(region && SUPPORTED_SEARCH_REGIONS.has(region));
}

export function supportedSearchRegionLabel() {
  return cities.map((city) => city.name).join(" and ");
}
