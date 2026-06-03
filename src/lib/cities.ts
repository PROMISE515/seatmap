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
      "Shanghai is the safest first city for SeatMap: luxury malls, international hotels, and coffee chains are dense around the main traveler areas.",
    travelerTip:
      "In Shanghai, IFC, K11, Plaza 66, Taikoo Li Qiantan, and international hotel lobbies are usually better than street-side public toilets.",
    neighborhoods: ["Lujiazui", "Jing'an", "Xintiandi", "The Bund", "Former French Concession"],
    centerLat: 31.2304,
    centerLng: 121.4737,
    radius: 5000,
  },
  {
    slug: "beijing",
    name: "Beijing",
    nameLocal: "北京",
    country: "China",
    countryCode: "CN",
    intro:
      "Beijing has many public toilets, but travelers usually need cleaner seated options near malls, hotels, and tourist districts.",
    travelerTip:
      "Sanlitun, Wangfujing, SKP, China World Mall, and hotel lobbies near tourist areas are stronger candidates than standalone public toilets.",
    neighborhoods: ["Sanlitun", "Wangfujing", "CBD / Guomao", "Forbidden City area", "Houhai"],
    centerLat: 39.9042,
    centerLng: 116.4074,
    radius: 5000,
  },
  {
    slug: "chengdu",
    name: "Chengdu",
    nameLocal: "成都",
    country: "China",
    countryCode: "CN",
    intro:
      "Chengdu is popular with foreign travelers and has reliable seated options around premium malls, hotels, and modern lifestyle districts.",
    travelerTip:
      "Taikoo Li Chengdu, IFS, hotel lobbies, and larger coffee chains around Chunxi Road are the best first checks.",
    neighborhoods: ["Taikoo Li", "IFS", "Chunxi Road", "Tianfu Square", "Kuanzhai Alley"],
    centerLat: 30.5728,
    centerLng: 104.0668,
    radius: 5000,
  },
  {
    slug: "xian",
    name: "Xi'an",
    nameLocal: "西安",
    country: "China",
    countryCode: "CN",
    intro:
      "Xi'an is tourism-heavy, but seated-toilet reliability is best around major malls and international hotels.",
    travelerTip:
      "Around the Bell Tower, SKP, large malls, and international hotels are better candidates.",
    neighborhoods: ["Bell Tower", "Muslim Quarter", "SKP", "Qujiang", "High-Tech Zone"],
    centerLat: 34.3416,
    centerLng: 108.9398,
    radius: 5000,
  },
  {
    slug: "chongqing",
    name: "Chongqing",
    nameLocal: "重庆",
    country: "China",
    countryCode: "CN",
    intro:
      "Chongqing is dense and vertical, so SeatMap prioritizes indoor venues where travelers are more likely to find clean seated toilets.",
    travelerTip:
      "Try Raffles City, Jiefangbei malls, high-end hotels, and large coffee chains before standalone public toilets.",
    neighborhoods: ["Jiefangbei", "Raffles City", "Hongyadong", "Guanyinqiao", "Nanbin Road"],
    centerLat: 29.563,
    centerLng: 106.5516,
    radius: 5000,
  },
  {
    slug: "shenzhen",
    name: "Shenzhen",
    nameLocal: "深圳",
    country: "China",
    countryCode: "CN",
    intro:
      "Shenzhen has many modern malls and hotels, making it a strong SeatMap city for reliable seated-restroom candidates.",
    travelerTip:
      "MixC, Coco Park, OCT Harbour, hotel lobbies, and coffee chains around Futian and Nanshan are strong first stops.",
    neighborhoods: ["Futian", "Nanshan", "Coco Park", "MixC", "OCT Harbour"],
    centerLat: 22.5431,
    centerLng: 114.0579,
    radius: 5000,
  },
  {
    slug: "guangzhou",
    name: "Guangzhou",
    nameLocal: "广州",
    country: "China",
    countryCode: "CN",
    intro:
      "Guangzhou mixes business travel and tourism, with better seated-toilet odds in premium commercial districts.",
    travelerTip:
      "Taikoo Hui, TeeMall, Parc Central, hotel lobbies, and chain coffee shops in Tianhe are the safest first checks.",
    neighborhoods: ["Tianhe", "Zhujiang New Town", "Beijing Road", "Shamian", "Canton Tower"],
    centerLat: 23.1291,
    centerLng: 113.2644,
    radius: 5000,
  },
  {
    slug: "hangzhou",
    name: "Hangzhou",
    nameLocal: "杭州",
    country: "China",
    countryCode: "CN",
    intro:
      "Hangzhou has strong tourist demand around West Lake and modern commercial districts where reliable seated options are more likely.",
    travelerTip:
      "Look first around West Lake malls, Kerry Centre, MixC, hotels, and larger coffee chains.",
    neighborhoods: ["West Lake", "Kerry Centre", "MixC", "Hubin", "Wulin"],
    centerLat: 30.2741,
    centerLng: 120.1551,
    radius: 5000,
  },
  {
    slug: "zhangjiajie",
    name: "Zhangjiajie",
    nameLocal: "张家界",
    country: "China",
    countryCode: "CN",
    intro:
      "Zhangjiajie is a major international nature destination, but seated-toilet availability is uneven outside hotels and larger visitor venues.",
    travelerTip:
      "International hotels and larger tourist-area venues are safer than small scenic-area public toilets.",
    neighborhoods: ["Wulingyuan", "Tianmen Mountain", "Dayong", "Hotel areas"],
    centerLat: 29.1167,
    centerLng: 110.4792,
    radius: 8000,
  },
  {
    slug: "hong-kong",
    name: "Hong Kong",
    nameLocal: "香港",
    country: "China",
    countryCode: "CN",
    intro:
      "Hong Kong is highly traveler-friendly, with many seated toilets inside malls, hotels, MTR-connected complexes, and coffee chains.",
    travelerTip:
      "IFC, Harbour City, Times Square, Pacific Place, hotel lobbies, and MTR-linked malls are strong options.",
    neighborhoods: ["Central", "Tsim Sha Tsui", "Causeway Bay", "Admiralty", "Mong Kok"],
    centerLat: 22.3193,
    centerLng: 114.1694,
    radius: 5000,
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
