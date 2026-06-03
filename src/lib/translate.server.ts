import { createHash, randomUUID } from "node:crypto";

// Translate Chinese POI names to concise English using Youdao.
// Used server-side only.

const YOUDAO_ENDPOINT = "https://openapi.youdao.com/api";

const LOCAL_REPLACEMENTS: Array<[RegExp, string]> = [
  [/上海/g, "Shanghai"],
  [/北京/g, "Beijing"],
  [/成都/g, "Chengdu"],
  [/重庆/g, "Chongqing"],
  [/深圳/g, "Shenzhen"],
  [/广州/g, "Guangzhou"],
  [/杭州/g, "Hangzhou"],
  [/西安/g, "Xi'an"],
  [/张家界/g, "Zhangjiajie"],
  [/香港/g, "Hong Kong"],
  [/朗庭智能酒店/g, "Langting Smart Hotel"],
  [/智能酒店/g, "Smart Hotel"],
  [/万豪酒店/g, "Marriott Hotel"],
  [/希尔顿酒店/g, "Hilton Hotel"],
  [/香格里拉/g, "Shangri-La"],
  [/洲际酒店/g, "InterContinental Hotel"],
  [/凯悦酒店/g, "Hyatt Hotel"],
  [/酒店/g, "Hotel"],
  [/来福士/g, "Raffles City"],
  [/国金中心/g, "IFC Mall"],
  [/太古里/g, "Taikoo Li"],
  [/万象城/g, "MixC"],
  [/恒隆广场/g, "Plaza 66"],
  [/购物中心/g, "Shopping Mall"],
  [/商城/g, "Mall"],
  [/商场/g, "Mall"],
  [/广场/g, "Plaza"],
  [/行政中心/g, "Administrative Center"],
  [/卫生间|洗手间|厕所/g, "Restroom"],
  [/男/g, "Men's"],
  [/女/g, "Women's"],
  [/无障碍/g, "Accessible"],
  [/母婴室/g, "Nursery Room"],
  [/楼|层/g, "F"],
  [/小区/g, "Community"],
];

function hasChinese(text: string) {
  return /[\u3400-\u9fff]/.test(text);
}

function truncateForYoudaoSign(value: string) {
  return value.length <= 20 ? value : `${value.slice(0, 10)}${value.length}${value.slice(-10)}`;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function cleanTranslatedName(value: string) {
  let cleaned = value
    .replace(/[（]/g, " (")
    .replace(/[）]/g, ")")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned.replace(/^(.+?)\s+\1$/i, "$1").trim();

  const duplicateParenthetical = cleaned.match(/^(.+?)\s*\((.+)\)$/);
  if (duplicateParenthetical) {
    const outside = duplicateParenthetical[1].trim();
    const inside = duplicateParenthetical[2].trim();
    if (outside.localeCompare(inside, undefined, { sensitivity: "accent" }) === 0) {
      cleaned = outside;
    }
  }

  return cleaned;
}

function localTranslateName(name: string) {
  let translated = cleanTranslatedName(name);

  for (const [pattern, replacement] of LOCAL_REPLACEMENTS) {
    translated = translated.replace(pattern, replacement);
  }

  translated = cleanTranslatedName(
    translated
      .replace(/[\u3400-\u9fff]+/g, " ")
      .replace(/\s*-\s*/g, " - ")
      .replace(/\s+/g, " ")
      .trim(),
  );

  if (translated && translated !== name && !hasChinese(translated)) return translated;
  if (/酒店/.test(name)) return "Traveler-Friendly Hotel";
  if (/购物|商场|商城|广场/.test(name)) return "Traveler-Friendly Mall";
  if (/无障碍/.test(name)) return "Accessible Restroom";
  return "Traveler-Friendly Venue";
}

async function translateNameWithYoudao(name: string, appId: string, appSecret: string) {
  const salt = randomUUID();
  const curtime = Math.floor(Date.now() / 1000).toString();
  const input = truncateForYoudaoSign(name);
  const sign = sha256(`${appId}${input}${salt}${curtime}${appSecret}`);

  const body = new URLSearchParams({
    q: name,
    from: "zh-CHS",
    to: "en",
    appKey: appId,
    salt,
    sign,
    signType: "v3",
    curtime,
  });

  const res = await fetch(YOUDAO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Youdao HTTP ${res.status}`);

  const json = (await res.json()) as {
    errorCode?: string;
    translation?: string[];
  };
  if (json.errorCode && json.errorCode !== "0") {
    throw new Error(`Youdao error ${json.errorCode}`);
  }

  return cleanTranslatedName(json.translation?.[0] ?? "");
}

export async function translateNames(names: string[]): Promise<string[]> {
  if (names.length === 0) return names;

  const appId = process.env.YOUDAO_APP_ID;
  const appSecret = process.env.YOUDAO_APP_SECRET;
  if (!appId || !appSecret) return names.map(localTranslateName);

  try {
    const translated = await Promise.all(
      names.map(async (name) => {
        if (!hasChinese(name)) return cleanTranslatedName(name);
        const result = await translateNameWithYoudao(name, appId, appSecret);
        return result && !hasChinese(result) ? result : localTranslateName(name);
      }),
    );
    return translated;
  } catch {
    return names.map(localTranslateName);
  }
}
