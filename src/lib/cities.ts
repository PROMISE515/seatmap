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
      "Shanghai is the safest first city for Western Toilet Map: luxury malls, international hotels, and coffee chains are dense around the main traveler areas.",
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
      "Chongqing is dense and vertical, so Western Toilet Map prioritizes indoor venues where travelers are more likely to find clean seated toilets.",
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
      "Shenzhen has many modern malls and hotels, making it a strong Western Toilet Map city for reliable seated-restroom candidates.",
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
    slug: "suzhou",
    name: "Suzhou",
    nameLocal: "苏州",
    country: "China",
    countryCode: "CN",
    intro:
      "Suzhou is a common Shanghai side trip, and seated-toilet candidates are strongest around malls, hotels, and garden-adjacent commercial areas.",
    travelerTip:
      "Prioritize Suzhou Center, Times Square, large hotels, and shopping areas before smaller old-town public toilets.",
    neighborhoods: [
      "Suzhou Center",
      "Guanqian Street",
      "Pingjiang Road",
      "Jinji Lake",
      "Humble Administrator's Garden",
    ],
    centerLat: 31.2989,
    centerLng: 120.5853,
    radius: 6000,
  },
  {
    slug: "nanjing",
    name: "Nanjing",
    nameLocal: "南京",
    country: "China",
    countryCode: "CN",
    intro:
      "Nanjing combines heritage sites, student areas, and business districts, so Western Toilet Map focuses on reliable indoor venues near the main traveler routes.",
    travelerTip:
      "Deji Plaza, Xinjiekou, major hotels, and malls near tourist districts are safer first checks for seated toilets.",
    neighborhoods: ["Xinjiekou", "Confucius Temple", "Deji Plaza", "Fuzimiao", "Xuanwu Lake"],
    centerLat: 32.0603,
    centerLng: 118.7969,
    radius: 6000,
  },
  {
    slug: "xiamen",
    name: "Xiamen",
    nameLocal: "厦门",
    country: "China",
    countryCode: "CN",
    intro:
      "Xiamen is a coastal leisure city where seated-toilet confidence is better around malls, ferry areas, hotels, and international chains.",
    travelerTip:
      "Look first around SM City, MixC, Zhongshan Road, ferry terminals, and larger hotels before small scenic-area toilets.",
    neighborhoods: [
      "Zhongshan Road",
      "Gulangyu ferry area",
      "SM City",
      "MixC",
      "Xiamen University area",
    ],
    centerLat: 24.4798,
    centerLng: 118.0894,
    radius: 6000,
  },
  {
    slug: "guilin",
    name: "Guilin",
    nameLocal: "桂林",
    country: "China",
    countryCode: "CN",
    intro:
      "Guilin and Yangshuo are classic nature destinations, but travelers often need clearer guidance on where seated toilets are likely.",
    travelerTip:
      "Hotels, larger restaurants, malls, and visitor centers are better candidates than rural scenic-area public toilets.",
    neighborhoods: [
      "Two Rivers and Four Lakes",
      "Zhengyang Pedestrian Street",
      "Guilin Railway Station",
      "Yangshuo West Street",
      "Resort areas",
    ],
    centerLat: 25.2736,
    centerLng: 110.29,
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
  {
    slug: "macau",
    name: "Macau",
    nameLocal: "澳门",
    country: "China",
    countryCode: "CN",
    intro:
      "Macau has strong international visitor demand, with seated toilets most likely inside malls, hotels, casinos, ferry terminals, and heritage-area commercial venues.",
    travelerTip:
      "Large integrated resorts, Senado Square malls, ferry terminals, and hotel lobbies are the safest first checks.",
    neighborhoods: ["Senado Square", "Cotai", "Taipa", "Outer Harbour", "Macau Peninsula"],
    centerLat: 22.1987,
    centerLng: 113.5439,
    radius: 5000,
  },
  {
    slug: "sanya",
    name: "Sanya",
    nameLocal: "三亚",
    country: "China",
    countryCode: "CN",
    intro:
      "Sanya is a resort-heavy destination where travelers move between beaches, malls, hotels, and attractions, making reliable seated-toilet guidance useful.",
    travelerTip:
      "Hotel lobbies, beach resort malls, duty-free shopping areas, and larger cafes are safer than small beachside public toilets.",
    neighborhoods: ["Sanya Bay", "Dadonghai", "Yalong Bay", "Haitang Bay", "Duty Free City"],
    centerLat: 18.2528,
    centerLng: 109.512,
    radius: 8000,
  },
  {
    slug: "kunming",
    name: "Kunming",
    nameLocal: "昆明",
    country: "China",
    countryCode: "CN",
    intro:
      "Kunming is the gateway to Yunnan routes, and seated-toilet candidates are strongest around central malls, hotels, and transport hubs.",
    travelerTip:
      "Nanping Street, Shuncheng, Tongde Kunming Plaza, railway station areas, and international hotels are good first checks.",
    neighborhoods: [
      "Nanping Street",
      "Green Lake",
      "Tongde Plaza",
      "Kunming Railway Station",
      "Dianchi area",
    ],
    centerLat: 25.0389,
    centerLng: 102.7183,
    radius: 7000,
  },
  {
    slug: "lijiang",
    name: "Lijiang",
    nameLocal: "丽江",
    country: "China",
    countryCode: "CN",
    intro:
      "Lijiang is popular with foreign leisure travelers, but old-town routes can make clean seated toilets harder to identify quickly.",
    travelerTip:
      "Try larger hotels, shopping streets near the old town, visitor centers, and modern cafes before small alley public toilets.",
    neighborhoods: [
      "Lijiang Old Town",
      "Shuhe Old Town",
      "Dayan Old Town",
      "Black Dragon Pool",
      "Hotel areas",
    ],
    centerLat: 26.8721,
    centerLng: 100.2296,
    radius: 7000,
  },
  {
    slug: "dali",
    name: "Dali",
    nameLocal: "大理",
    country: "China",
    countryCode: "CN",
    intro:
      "Dali attracts foreign backpackers and leisure travelers, especially around old-town and lake routes where restroom reliability can vary.",
    travelerTip:
      "Larger hotels, old-town commercial streets, cafes, and shopping areas are better first checks than small scenic public toilets.",
    neighborhoods: ["Dali Old Town", "Erhai Lake", "Xiaguan", "Foreigner Street", "Cangshan area"],
    centerLat: 25.6065,
    centerLng: 100.2676,
    radius: 7000,
  },
  {
    slug: "qingdao",
    name: "Qingdao",
    nameLocal: "青岛",
    country: "China",
    countryCode: "CN",
    intro:
      "Qingdao is a coastal city with summer tourism, historic districts, and mall-heavy areas where seated-toilet candidates are easier to find.",
    travelerTip:
      "MixC, Hisense Plaza, May Fourth Square, large hotels, and mall-linked cafes are stronger first checks.",
    neighborhoods: ["May Fourth Square", "MixC", "Taidong", "Old Town", "Badaguan"],
    centerLat: 36.0671,
    centerLng: 120.3826,
    radius: 7000,
  },
];

export function getCityBySlug(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug);
}
