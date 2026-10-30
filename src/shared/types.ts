export interface NewsItem { id: string; title: string; url: string; source: string; published: number; }
export interface FeedResult { items: NewsItem[]; errors: { source: string; error: string }[]; fetchedAt: number; offline: boolean; sources: SourceStatus[]; }
export interface SourceStatus { name: string; ok: boolean; count: number; ms: number; error?: string; }
export interface QuickLink { id: string; name: string; url: string; }
export interface StarbaseApi {
  getNews(): Promise<FeedResult>;
  getLinks(): Promise<QuickLink[]>;
  saveLinks(links: QuickLink[]): Promise<QuickLink[]>;
  openExternal(url: string): Promise<boolean>;
  launchSpotify(): Promise<'app' | 'web'>;
}
