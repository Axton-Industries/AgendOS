// News via free RSS feeds — no API key needed. Naive RSS 2.0 parsing.
// ponytail: regex parsing handles standard RSS/Atom-lite feeds; if a source
// breaks or Atom support is needed, swap in a parser or per-feed adapters.

import { cached } from "@/lib/cache";

export interface Article {
  source: string;
  title: string;
  link: string;
  published: string | null;
}

export const DEFAULT_FEEDS: { name: string; url: string; category: string }[] = [
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world" },
  { name: "BBC Technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "tech" },
  { name: "Guardian World", url: "https://www.theguardian.com/world/rss", category: "world" },
  { name: "Guardian Sport", url: "https://www.theguardian.com/sport/rss", category: "sport" },
];

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : null;
}

export async function fetchFeed(feed: { name: string; url: string; category: string }): Promise<Article[]> {
  const res = await fetch(feed.url, { headers: { "User-Agent": "AgendOS/0.1" } });
  if (!res.ok) throw new Error(`${feed.name}: feed request failed (${res.status})`);
  const xml = await res.text();
  const items = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/g) ?? [];
  return items.slice(0, 15).map((item) => ({
    source: feed.name,
    category: feed.category,
    title: tag(item, "title") ?? "(untitled)",
    link: tag(item, "link") ?? (item.match(/<link[^>]*href="([^"]+)"/)?.[1] ?? ""),
    published: tag(item, "pubDate") ?? tag(item, "updated") ?? tag(item, "published"),
  }));
}

export async function getHeadlines(category?: string): Promise<Article[]> {
  return cached(`news:${category ?? "all"}`, 600, () => getHeadlinesLive(category));
}

async function getHeadlinesLive(category?: string): Promise<Article[]> {
  const feeds = category ? DEFAULT_FEEDS.filter((f) => f.category === category) : DEFAULT_FEEDS;
  const results = await Promise.allSettled(feeds.map(fetchFeed));
  const articles = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  return articles.sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
}
