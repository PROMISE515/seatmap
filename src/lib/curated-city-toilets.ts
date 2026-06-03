import type { ToiletDTO } from "@/lib/amap";

type CuratedToilet = Omit<ToiletDTO, "walkMin" | "distanceM" | "photo"> & {
  photo?: string;
};

const FALLBACK_PHOTO = "/placeholder.svg";

const curatedCityToilets: Record<string, CuratedToilet[]> = {
  shanghai: [
    venue("shanghai-ifc-mall", "IFC Mall", "Lujiazui, Pudong", 31.235, 121.503, "L1~L4"),
    venue("shanghai-k11", "K11 Art Mall", "Huaihai Middle Road", 31.224, 121.475, "B2~L5"),
    venue("shanghai-plaza-66", "Plaza 66", "Nanjing West Road", 31.229, 121.455, "B1~L5"),
    venue(
      "shanghai-taikoo-li-qiantan",
      "Taikoo Li Qiantan",
      "Qiantan, Pudong",
      31.153,
      121.479,
      "B1~L3",
    ),
  ],
  beijing: [
    venue("beijing-skp", "Beijing SKP", "Jianguo Road, Chaoyang", 39.909, 116.478, "B1~L6"),
    venue(
      "beijing-china-world-mall",
      "China World Mall",
      "Guomao, Chaoyang",
      39.909,
      116.46,
      "B1~L4",
    ),
    venue(
      "beijing-taikoo-li-sanlitun",
      "Taikoo Li Sanlitun",
      "Sanlitun, Chaoyang",
      39.936,
      116.455,
      "L1~L4",
    ),
    venue("beijing-apm", "Beijing apm", "Wangfujing", 39.914, 116.411, "B1~L6"),
  ],
  chengdu: [
    venue("chengdu-ifs", "Chengdu IFS", "Chunxi Road", 30.658, 104.081, "B2~L7"),
    venue("chengdu-taikoo-li", "Taikoo Li Chengdu", "Daci Temple area", 30.656, 104.083, "B1~L3"),
    venue("chengdu-skpgalleria", "SKP Chengdu", "Jiaozi Avenue", 30.582, 104.064, "B2~L5"),
    venue("chengdu-niccolo", "Niccolo Chengdu", "IFS Tower", 30.657, 104.081, "L3~L6"),
  ],
  xian: [
    venue("xian-skp", "Xi'an SKP", "Chang'an North Road", 34.24, 108.947, "B1~L6"),
    venue(
      "xian-bell-tower-commercial-area",
      "Bell Tower Commercial Area",
      "Bell Tower",
      34.261,
      108.947,
      "B1~L3",
    ),
    venue("xian-gran-melia", "Gran Melia Xi'an", "Qujiang New District", 34.194, 108.976, "L1~L3"),
    venue(
      "xian-ritz-carlton",
      "The Ritz-Carlton Xi'an",
      "High-Tech Zone",
      34.225,
      108.885,
      "L1~L3",
    ),
  ],
  chongqing: [
    venue(
      "chongqing-raffles-city",
      "Raffles City Chongqing",
      "Chaotianmen",
      29.566,
      106.588,
      "B1~L5",
    ),
    venue("chongqing-starlight-68", "Starlight 68 Plaza", "Jiangbei", 29.58, 106.533, "B1~L5"),
    venue(
      "chongqing-metropolitan-plaza",
      "Metropolitan Oriental Plaza",
      "Jiefangbei",
      29.558,
      106.576,
      "B1~L6",
    ),
    venue("chongqing-niccolo", "Niccolo Chongqing", "Jiangbei CBD", 29.579, 106.536, "L1~L3"),
  ],
  shenzhen: [
    venue("shenzhen-mixc", "The MixC Shenzhen", "Luohu", 22.541, 114.111, "B1~L5"),
    venue("shenzhen-coco-park", "Coco Park", "Futian", 22.535, 114.056, "B1~L3"),
    venue("shenzhen-one-avenue", "One Avenue", "Futian CBD", 22.543, 114.058, "B1~L4"),
    venue("shenzhen-oct-harbour", "OCT Harbour", "Nanshan", 22.537, 113.985, "L1~L3"),
  ],
  guangzhou: [
    venue("guangzhou-taikoo-hui", "Taikoo Hui Guangzhou", "Tianhe Road", 23.133, 113.332, "B2~L5"),
    venue("guangzhou-teemall", "TeeMall", "Tianhe", 23.132, 113.321, "B1~L7"),
    venue("guangzhou-parc-central", "Parc Central", "Tianhe", 23.132, 113.327, "B1~L2"),
    venue(
      "guangzhou-four-seasons",
      "Four Seasons Hotel Guangzhou",
      "Zhujiang New Town",
      23.121,
      113.322,
      "L1~L3",
    ),
  ],
  hangzhou: [
    venue(
      "hangzhou-kerry-centre",
      "Hangzhou Kerry Centre",
      "Yan'an Road",
      30.265,
      120.162,
      "B1~L6",
    ),
    venue("hangzhou-mixc", "The MixC Hangzhou", "Qianjiang New Town", 30.248, 120.21, "B1~L6"),
    venue("hangzhou-in77", "Hubin in77", "West Lake", 30.255, 120.164, "B1~L5"),
    venue("hangzhou-grand-hyatt", "Grand Hyatt Hangzhou", "West Lake", 30.256, 120.162, "L1~L3"),
  ],
  zhangjiajie: [
    venue("zhangjiajie-pullman", "Pullman Zhangjiajie", "Wulingyuan", 29.344, 110.55, "L1~L3"),
    venue(
      "zhangjiajie-huatian",
      "Zhangjiajie Huatian Hotel",
      "Yongding District",
      29.124,
      110.486,
      "L1~L3",
    ),
    venue(
      "zhangjiajie-neodalle",
      "Neodalle Zhangjiajie Wulingyuan",
      "Wulingyuan",
      29.346,
      110.555,
      "L1~L3",
    ),
  ],
  "hong-kong": [
    venue("hong-kong-ifc", "IFC Mall", "Central", 22.285, 114.158, "L1~L4"),
    venue("hong-kong-harbour-city", "Harbour City", "Tsim Sha Tsui", 22.296, 114.169, "G~L4"),
    venue("hong-kong-pacific-place", "Pacific Place", "Admiralty", 22.277, 114.166, "L1~L4"),
    venue("hong-kong-times-square", "Times Square", "Causeway Bay", 22.279, 114.183, "B1~L13"),
  ],
};

function venue(
  id: string,
  name: string,
  address: string,
  lat: number,
  lng: number,
  floor: string,
): CuratedToilet {
  return {
    id: `curated-${id}`,
    name,
    rawName: name,
    floor,
    tags: ["Western Toilet", "Traveler-friendly"],
    address,
    city: "",
    lat,
    lng,
    topRated: true,
    duplicateCount: floor.includes("~") ? 3 : undefined,
    seatedConfidence: "likely",
    canNavigate: true,
    kind: "indoor",
  };
}

export function getCuratedCityToilets(citySlug: string, cityName: string): ToiletDTO[] {
  return (curatedCityToilets[citySlug] ?? []).map((toilet, index) => ({
    ...toilet,
    city: cityName,
    walkMin: index + 1,
    distanceM: 0,
    photo: toilet.photo ?? FALLBACK_PHOTO,
  }));
}
