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
  suzhou: [
    venue("suzhou-center", "Suzhou Center", "Jinji Lake", 31.319, 120.674, "B1~L6"),
    venue(
      "suzhou-times-square",
      "Suzhou Times Square",
      "Suzhou Industrial Park",
      31.324,
      120.704,
      "B1~L4",
    ),
    venue(
      "suzhou-golden-eagle",
      "Golden Eagle Suzhou",
      "Guanqian Street",
      31.313,
      120.624,
      "B1~L6",
    ),
    venue(
      "suzhou-hyatt-regency",
      "Hyatt Regency Suzhou",
      "Suzhou Industrial Park",
      31.322,
      120.706,
      "L1~L3",
    ),
  ],
  nanjing: [
    venue("nanjing-deji-plaza", "Deji Plaza", "Xinjiekou", 32.045, 118.784, "B1~L7"),
    venue("nanjing-golden-eagle", "Golden Eagle Xinjiekou", "Xinjiekou", 32.044, 118.785, "B1~L6"),
    venue("nanjing-ifc", "Nanjing IFC", "Hexi CBD", 32.0, 118.735, "B1~L5"),
    venue("nanjing-jinling-hotel", "Jinling Hotel", "Xinjiekou", 32.044, 118.783, "L1~L3"),
  ],
  xiamen: [
    venue("xiamen-sm-city", "SM City Xiamen", "Jiahe Road", 24.505, 118.125, "B1~L5"),
    venue("xiamen-mixc", "The MixC Xiamen", "Hubin East Road", 24.478, 118.112, "B1~L6"),
    venue("xiamen-conrad", "Conrad Xiamen", "Shimao Strait Tower", 24.44, 118.094, "L1~L3"),
    venue(
      "xiamen-ferry-terminal",
      "Xiamen Ferry Terminal",
      "Gulangyu ferry area",
      24.45,
      118.067,
      "L1~L2",
    ),
  ],
  guilin: [
    venue("guilin-mixc", "The MixC Guilin", "Qixing District", 25.27, 110.303, "B1~L5"),
    venue(
      "guilin-central-square",
      "Guilin Central Square",
      "Zhengyang Pedestrian Street",
      25.274,
      110.291,
      "B1~L3",
    ),
    venue("guilin-sheraton", "Sheraton Guilin Hotel", "Binjiang Road", 25.276, 110.297, "L1~L3"),
    venue("guilin-shangri-la", "Shangri-La Guilin", "Qixing District", 25.304, 110.304, "L1~L3"),
  ],
  "hong-kong": [
    venue("hong-kong-ifc", "IFC Mall", "Central", 22.285, 114.158, "L1~L4"),
    venue("hong-kong-harbour-city", "Harbour City", "Tsim Sha Tsui", 22.296, 114.169, "G~L4"),
    venue("hong-kong-pacific-place", "Pacific Place", "Admiralty", 22.277, 114.166, "L1~L4"),
    venue("hong-kong-times-square", "Times Square", "Causeway Bay", 22.279, 114.183, "B1~L13"),
  ],
  macau: [
    venue("macau-venetian", "The Venetian Macao", "Cotai", 22.148, 113.562, "L1~L3"),
    venue("macau-galaxy", "Galaxy Macau", "Cotai", 22.149, 113.553, "G~L2"),
    venue(
      "macau-senado-square",
      "Senado Square Commercial Area",
      "Senado Square",
      22.193,
      113.54,
      "L1~L3",
    ),
    venue(
      "macau-outer-harbour-terminal",
      "Outer Harbour Ferry Terminal",
      "Macau Peninsula",
      22.197,
      113.558,
      "L1~L2",
    ),
  ],
  sanya: [
    venue(
      "sanya-cdf-mall",
      "CDF Sanya International Duty Free City",
      "Haitang Bay",
      18.303,
      109.736,
      "B1~L3",
    ),
    venue("sanya-atlantis", "Atlantis Sanya", "Haitang Bay", 18.338, 109.732, "L1~L3"),
    venue(
      "sanya-phoenix-airport",
      "Sanya Phoenix International Airport",
      "Tianya District",
      18.303,
      109.412,
      "L1~L2",
    ),
    venue("sanya-summer-mall", "Summer Mall", "Dadonghai", 18.221, 109.518, "B1~L5"),
  ],
  kunming: [
    venue(
      "kunming-shuncheng",
      "Shuncheng Shopping Mall",
      "Nanping Street",
      25.039,
      102.706,
      "B1~L6",
    ),
    venue(
      "kunming-tongde-plaza",
      "Tongde Kunming Plaza",
      "Panlong District",
      25.063,
      102.724,
      "B1~L6",
    ),
    venue(
      "kunming-spring-city-66",
      "Spring City 66",
      "Dongfeng East Road",
      25.043,
      102.719,
      "B1~L6",
    ),
    venue(
      "kunming-railway-station",
      "Kunming Railway Station",
      "Guandu District",
      25.016,
      102.722,
      "L1~L2",
    ),
  ],
  lijiang: [
    venue(
      "lijiang-intercontinental",
      "InterContinental Lijiang Ancient Town Resort",
      "Lijiang Old Town",
      26.866,
      100.236,
      "L1~L3",
    ),
    venue(
      "lijiang-dayan-flower-lane",
      "Dayan Flower Lane",
      "Lijiang Old Town",
      26.873,
      100.236,
      "L1~L3",
    ),
    venue(
      "lijiang-old-town-north-gate",
      "Lijiang Old Town North Gate Area",
      "Dayan Old Town",
      26.876,
      100.235,
      "L1~L2",
    ),
    venue(
      "lijiang-hilton-garden-inn",
      "Hilton Garden Inn Lijiang",
      "Old Town area",
      26.88,
      100.226,
      "L1~L3",
    ),
  ],
  dali: [
    venue(
      "dali-old-town-south-gate",
      "Dali Old Town South Gate Area",
      "Dali Old Town",
      25.691,
      100.161,
      "L1~L2",
    ),
    venue(
      "dali-foreigner-street",
      "Foreigner Street Commercial Area",
      "Dali Old Town",
      25.697,
      100.164,
      "L1~L2",
    ),
    venue("dali-hilton", "Hilton Dali Resort & Spa", "Cangshan area", 25.626, 100.221, "L1~L3"),
    venue(
      "dali-xiaguan-commercial-area",
      "Xiaguan Commercial Area",
      "Xiaguan",
      25.596,
      100.236,
      "L1~L4",
    ),
  ],
  qingdao: [
    venue("qingdao-mixc", "The MixC Qingdao", "May Fourth Square", 36.066, 120.386, "B1~L6"),
    venue(
      "qingdao-hisense-plaza",
      "Hisense Plaza",
      "Olympic Sailing Center area",
      36.062,
      120.395,
      "B1~L5",
    ),
    venue("qingdao-shangri-la", "Shangri-La Qingdao", "Shinan District", 36.065, 120.382, "L1~L3"),
    venue(
      "qingdao-railway-station",
      "Qingdao Railway Station",
      "Old Town",
      36.064,
      120.312,
      "L1~L2",
    ),
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
    tags: ["Western Toilet"],
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

export function getCuratedToiletById(id: string): ToiletDTO | null {
  for (const [citySlug, toilets] of Object.entries(curatedCityToilets)) {
    const toilet = toilets.find((item) => item.id === id);
    if (!toilet) continue;
    return {
      ...toilet,
      city: citySlug,
      walkMin: 0,
      distanceM: 0,
      photo: toilet.photo ?? FALLBACK_PHOTO,
    };
  }
  return null;
}
