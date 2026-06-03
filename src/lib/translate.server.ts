// Translate Chinese POI names to concise English using Lovable AI Gateway.
// Used server-side only.

const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite";

const SYSTEM = `You translate Chinese place / POI names into concise English display names suitable for a travel app.
Rules:
- Keep well-known mall and hotel names in their official English form (e.g. 来福士广场 -> Raffles City, JW万豪酒店 -> JW Marriott Hotel, 上海国金中心 -> Shanghai IFC).
- Translate descriptive parts naturally (卫生间/洗手间/厕所 -> Restroom; 男 -> Men's; 女 -> Women's; 无障碍 -> Accessible; 楼/层 -> Floor).
- Use Hanyu Pinyin (Title Case, no tone marks) for proper nouns with no standard English form.
- Keep it short. No quotes, no explanations.
Return ONLY a JSON array of strings, in the same order as the input, same length.`;

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

export async function translateNames(names: string[]): Promise<string[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (names.length === 0) return names;
  if (!apiKey) return names.map(localTranslateName);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: JSON.stringify(names) },
        ],
      }),
    });
    if (!res.ok) return names.map(localTranslateName);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length !== names.length) {
      return names.map(localTranslateName);
    }
    return parsed.map((v, i) => {
      const translated = typeof v === "string" && v.trim() ? v.trim() : "";
      const cleaned = cleanTranslatedName(translated);
      return cleaned && !hasChinese(cleaned) ? cleaned : localTranslateName(names[i]);
    });
  } catch {
    return names.map(localTranslateName);
  }
}
