// Translate Chinese POI names to concise English using Lovable AI Gateway.
// Used server-side only.

const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash-lite";

const SYSTEM = `You translate Chinese place / POI names into concise English display names suitable for a travel app.
Rules:
- Keep well-known brand/venue names in their official English form (e.g. 星巴克 -> Starbucks, 来福士广场 -> Raffles City, JW万豪酒店 -> JW Marriott Hotel, 上海国金中心 -> Shanghai IFC).
- Translate descriptive parts naturally (卫生间/洗手间/厕所 -> Restroom; 男 -> Men's; 女 -> Women's; 无障碍 -> Accessible; 母婴室 -> Nursery Room; 楼/层 -> Floor; 地铁站 -> Metro Station; 机场 -> Airport).
- Use Hanyu Pinyin (Title Case, no tone marks) for proper nouns with no standard English form.
- Keep it short. No quotes, no explanations.
Return ONLY a JSON array of strings, in the same order as the input, same length.`;

export async function translateNames(names: string[]): Promise<string[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey || names.length === 0) return names;

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
    if (!res.ok) return names;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length !== names.length) return names;
    return parsed.map((v, i) => (typeof v === "string" && v.trim() ? v.trim() : names[i]));
  } catch {
    return names;
  }
}
