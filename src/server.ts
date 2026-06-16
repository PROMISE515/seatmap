import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { cities } from "./lib/cities";
import { LEGACY_SITE_HOSTS, SITE_HOST, SITE_URL } from "./lib/site";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const STATIC_SEO_HEADERS = {
  "cache-control": "public, max-age=3600",
};

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function buildRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function buildSitemapXml(): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/toilet-finder-china`, priority: "0.9" },
    { loc: `${SITE_URL}/toilets-in-china`, priority: "0.9" },
    { loc: `${SITE_URL}/western-toilet-china`, priority: "0.9" },
    { loc: `${SITE_URL}/squat-toilets-china`, priority: "0.9" },
    { loc: `${SITE_URL}/china-bathroom-tips`, priority: "0.85" },
    { loc: `${SITE_URL}/bathroom-app-china`, priority: "0.85" },
    { loc: `${SITE_URL}/china-public-toilet-app`, priority: "0.85" },
    { loc: `${SITE_URL}/press`, priority: "0.5" },
    ...cities.map((city) => ({
      loc: `${SITE_URL}/${city.slug}/public-toilets`,
      priority: "0.9",
    })),
  ];

  const entries = urls
    .map(
      ({ loc, priority }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function seoStaticResponse(request: Request): Response | null {
  const { pathname } = new URL(request.url);

  if (pathname === "/robots.txt") {
    return new Response(buildRobotsTxt(), {
      headers: {
        ...STATIC_SEO_HEADERS,
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  if (pathname === "/sitemap.xml") {
    return new Response(buildSitemapXml(), {
      headers: {
        ...STATIC_SEO_HEADERS,
        "content-type": "application/xml; charset=utf-8",
      },
    });
  }

  return null;
}

function canonicalHostRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (!LEGACY_SITE_HOSTS.has(url.hostname)) return null;

  url.protocol = "https:";
  url.hostname = SITE_HOST;
  return Response.redirect(url.toString(), 308);
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const redirectResponse = canonicalHostRedirect(request);
      if (redirectResponse) return redirectResponse;

      const staticResponse = seoStaticResponse(request);
      if (staticResponse) return staticResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
