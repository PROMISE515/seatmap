// Shared types & helpers for AMap-backed toilets (safe to import from client).

export type ToiletKind = "accessible" | "nursery" | "public" | "indoor";
export type SeatedConfidence = "confirmed" | "likely" | "needs_confirmation";

export type ToiletDTO = {
  id: string;
  name: string; // English display name (synthesized)
  rawName?: string; // original Chinese name from AMap
  floor?: string;
  walkMin: number;
  distanceM: number;
  tags: string[];
  address: string;
  city: string;
  topRated?: boolean;
  duplicateCount?: number;
  seatedConfidence: SeatedConfidence;
  canNavigate: boolean;
  lat: number;
  lng: number;
  photo: string;
  kind: ToiletKind;
};

// Classify a POI from its name into a useful category for the UI.
export function classifyToilet(name: string, address = ""): ToiletKind {
  const hay = `${name} ${address}`;
  if (/无障碍/.test(hay)) return "accessible";
  if (/母婴/.test(hay)) return "nursery";
  if (
    /(商场|广场|中心|mall|MALL|永旺|酒店|宾馆|hotel|HOTEL|大厦|写字楼|地铁|机场|火车站|高铁|星巴克|Starbucks|咖啡|Coffee|麦当劳|KFC|肯德基)/.test(
      hay,
    )
  )
    return "indoor";
  return "public";
}

// Extract a floor label and normalize it to English (e.g. "2F" / "B1").
const CN_NUM: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};
export function parseFloor(address: string): string | undefined {
  if (!address) return undefined;
  let m = address.match(/B(\d+)/i);
  if (m) return `B${m[1]}`;
  m = address.match(/地下(\d*)层?/);
  if (m) return `B${m[1] || 1}`;
  m = address.match(/(\d+)\s*[F层楼]/i);
  if (m) return `${m[1]}F`;
  m = address.match(/([一二三四五六七八九十]+)楼/);
  if (m && CN_NUM[m[1]]) return `${CN_NUM[m[1]]}F`;
  return undefined;
}

// Map Chinese city names to English display labels.
const CITY_EN: Record<string, string> = {
  上海市: "Shanghai",
  上海: "Shanghai",
  北京市: "Beijing",
  北京: "Beijing",
  广州市: "Guangzhou",
  广州: "Guangzhou",
  深圳市: "Shenzhen",
  深圳: "Shenzhen",
  杭州市: "Hangzhou",
  杭州: "Hangzhou",
  青岛市: "Qingdao",
  青岛: "Qingdao",
  成都市: "Chengdu",
  成都: "Chengdu",
  重庆市: "Chongqing",
  重庆: "Chongqing",
  南京市: "Nanjing",
  南京: "Nanjing",
  西安市: "Xi'an",
  西安: "Xi'an",
  苏州市: "Suzhou",
  苏州: "Suzhou",
  天津市: "Tianjin",
  天津: "Tianjin",
  武汉市: "Wuhan",
  武汉: "Wuhan",
  张家界市: "Zhangjiajie",
  张家界: "Zhangjiajie",
  香港: "Hong Kong",
  香港特别行政区: "Hong Kong",
};

// Map Chinese province names to English display labels.
const PROVINCE_EN: Record<string, string> = {
  北京市: "Beijing",
  天津市: "Tianjin",
  上海市: "Shanghai",
  重庆市: "Chongqing",
  河北省: "Hebei",
  山西省: "Shanxi",
  辽宁省: "Liaoning",
  吉林省: "Jilin",
  黑龙江省: "Heilongjiang",
  江苏省: "Jiangsu",
  浙江省: "Zhejiang",
  安徽省: "Anhui",
  福建省: "Fujian",
  江西省: "Jiangxi",
  山东省: "Shandong",
  河南省: "Henan",
  湖北省: "Hubei",
  湖南省: "Hunan",
  广东省: "Guangdong",
  海南省: "Hainan",
  四川省: "Sichuan",
  贵州省: "Guizhou",
  云南省: "Yunnan",
  陕西省: "Shaanxi",
  甘肃省: "Gansu",
  青海省: "Qinghai",
  台湾省: "Taiwan",
  内蒙古自治区: "Inner Mongolia",
  广西壮族自治区: "Guangxi",
  西藏自治区: "Tibet",
  宁夏回族自治区: "Ningxia",
  新疆维吾尔自治区: "Xinjiang",
  香港特别行政区: "Hong Kong",
  澳门特别行政区: "Macau",
};
export function provinceNameToEnglish(cn: string): string | undefined {
  if (!cn) return undefined;
  if (PROVINCE_EN[cn]) return PROVINCE_EN[cn];
  for (const [k, v] of Object.entries(PROVINCE_EN))
    if (cn.includes(k.replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔)/g, ""))) return v;
  return undefined;
}
export function cityNameToEnglish(cn: string): string | undefined {
  if (!cn) return undefined;
  if (CITY_EN[cn]) return CITY_EN[cn];
  for (const [k, v] of Object.entries(CITY_EN)) if (cn.includes(k)) return v;
  return undefined;
}

// Note: English display names are produced by translating the raw Chinese
// POI name via the Lovable AI Gateway (see src/lib/translate.server.ts) and
// stored in the `toilets.name_en` column. No hard-coded brand mapping.

// Strict filter: only POIs likely relevant for seated toilets.
// Roadside 公厕 / 公共厕所 in China are predominantly squat-only and must
// be excluded unless the name explicitly mentions a seated/western/accessible
// feature, OR the toilet sits inside a high-confidence indoor venue
// (international hotel, premium mall, branded chain, airport, etc.).

// Hard exclusions — even if other keywords match, reject these.
// Most Chinese 公厕 / 公共厕所 / 卫生间 / 洗手间 / 母婴室 are squat-only and
// not relevant for travelers looking for seated toilets.
const EXCLUDE_RE =
  /(蹲便|蹲坑|蹲位|旱厕|移动厕所|临时厕所|生态厕所|环卫|公厕|公共厕所|母婴室?|第三卫生间|^厕所$|^卫生间$|^洗手间$)/;

// Explicit positive signal: only hard seated/western mentions count.
const SEATED_FEATURE_RE = /(西式|坐便|马桶|seated|western)/i;
const ACCESSIBLE_SEATED_RE = /(无障碍|accessible)/i;

// High-confidence indoor venues that reliably provide seated toilets.
const INDOOR_VENUE_RE =
  /(购物中心|商场|商城|百货|购物公园|商业广场|IFC|国金中心|恒隆|港汇|来福士|Raffles|太古|Taikoo|嘉里中心|Kerry|国贸|万象城|MixC|大悦城|SKP|新世界|K11|环贸|iapm|久光|Sogo|久光百货|银泰|Intime|永旺|AEON|宜家|IKEA|Apple\s*Store|苹果直营|MUJI|无印良品|Uniqlo|优衣库|星巴克臻选|星巴克|Starbucks|Costa|瑞幸|Luckin|Peet'?s|Manner|麦当劳|McDonald|肯德基|KFC|酒店|宾馆|Ritz[- ]?Carlton|丽思卡尔顿|Mandarin\s*Oriental|文华东方|Four\s*Seasons|四季酒店|Hyatt|凯悦|Hilton|希尔顿|Marriott|万豪|Sheraton|喜来登|Westin|威斯汀|Shangri[- ]?La|香格里拉|InterContinental|洲际|JW\s*Marriott|W\s*Hotel|Park\s*Hyatt|柏悦|Grand\s*Hyatt|君悦|机场\s*T\d|Airport\s*Terminal|国际机场|International\s*Airport|高铁站|Railway\s*Station|火车站\s*候车|Metro\s*Station)/i;

export function isReliableVenue(name: string, address = ""): boolean {
  return INDOOR_VENUE_RE.test(`${name} ${address}`);
}

export function isLikelyWestern(name: string, address = ""): boolean {
  const hay = `${name} ${address}`;
  if (EXCLUDE_RE.test(name)) return false;
  if (SEATED_FEATURE_RE.test(hay)) return true;
  if (isReliableVenue(name, address)) return true;
  return false;
}

export function getSeatedConfidence(name: string, address = ""): SeatedConfidence {
  const hay = `${name} ${address}`;
  if (SEATED_FEATURE_RE.test(hay) || ACCESSIBLE_SEATED_RE.test(hay)) return "confirmed";
  if (isReliableVenue(name, address)) return "likely";
  return "needs_confirmation";
}

// WGS-84 -> GCJ-02 (China geodetic offset). Browser geolocation returns WGS-84;
// AMap APIs expect GCJ-02. Without this, results can be offset by ~100-700m.
const PI = Math.PI;
const A = 6378245.0;
const EE = 0.006693421622965943;

function outOfChina(lat: number, lng: number) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}
function transformLat(x: number, y: number) {
  let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3;
  ret += ((20 * Math.sin(y * PI) + 40 * Math.sin((y / 3) * PI)) * 2) / 3;
  ret += ((160 * Math.sin((y / 12) * PI) + 320 * Math.sin((y * PI) / 30)) * 2) / 3;
  return ret;
}
function transformLng(x: number, y: number) {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3;
  ret += ((20 * Math.sin(x * PI) + 40 * Math.sin((x / 3) * PI)) * 2) / 3;
  ret += ((150 * Math.sin((x / 12) * PI) + 300 * Math.sin((x / 30) * PI)) * 2) / 3;
  return ret;
}
export function wgs84ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
  if (outOfChina(lat, lng)) return { lat, lng };
  let dLat = transformLat(lng - 105, lat - 35);
  let dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return { lat: lat + dLat, lng: lng + dLng };
}

export function gcj02ToWgs84(lat: number, lng: number): { lat: number; lng: number } {
  if (outOfChina(lat, lng)) return { lat, lng };
  const gcj = wgs84ToGcj02(lat, lng);
  return { lat: lat * 2 - gcj.lat, lng: lng * 2 - gcj.lng };
}

export function walkMinFromMeters(m: number) {
  return Math.max(1, Math.round(m / 80));
}
