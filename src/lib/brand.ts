export interface BrandMeta {
  bg: string;
  fg: string;
  label: string;
}

const BRANDS: Record<string, BrandMeta> = {
  'youtube.com': { bg: '#FF0033', fg: '#FFFFFF', label: 'Y' },
  'x.com': { bg: '#101014', fg: '#FFFFFF', label: 'X' },
  'twitter.com': { bg: '#101014', fg: '#FFFFFF', label: 'X' },
  'notion.so': { bg: '#0D0D0D', fg: '#FFFFFF', label: 'N' },
  'app.notion.so': { bg: '#0D0D0D', fg: '#FFFFFF', label: 'N' },
  'gmail.com': { bg: '#EA4335', fg: '#FFFFFF', label: 'G' },
  'mail.google.com': { bg: '#EA4335', fg: '#FFFFFF', label: 'G' },
  'drive.google.com': { bg: '#1FA463', fg: '#FFFFFF', label: 'D' },
  'docs.google.com': { bg: '#4285F4', fg: '#FFFFFF', label: 'G' },
  'sheets.google.com': { bg: '#0F9D58', fg: '#FFFFFF', label: 'S' },
  'slides.google.com': { bg: '#FBBC04', fg: '#202124', label: 'S' },
  'calendar.google.com': { bg: '#4285F4', fg: '#FFFFFF', label: 'C' },
  'photos.google.com': { bg: '#EA4335', fg: '#FFFFFF', label: 'P' },
  'figma.com': { bg: '#F24E1E', fg: '#FFFFFF', label: 'F' },
  'github.com': { bg: '#181717', fg: '#FFFFFF', label: 'G' },
  'slack.com': { bg: '#4A154B', fg: '#FFFFFF', label: 'S' },
  'canva.com': { bg: '#00C4CC', fg: '#FFFFFF', label: 'C' },
  'dribbble.com': { bg: '#EA4C89', fg: '#FFFFFF', label: 'D' },
  'behance.net': { bg: '#1769FF', fg: '#FFFFFF', label: 'B' },
  'framer.com': { bg: '#0055FF', fg: '#FFFFFF', label: 'F' },
  'linear.app': { bg: '#5E6AD2', fg: '#FFFFFF', label: 'L' },
  'trello.com': { bg: '#0079BF', fg: '#FFFFFF', label: 'T' },
  'asana.com': { bg: '#FF7A59', fg: '#FFFFFF', label: 'A' },
  'miro.com': { bg: '#FFD02F', fg: '#1A1A1A', label: 'M' },
  'zoom.us': { bg: '#2D8CFF', fg: '#FFFFFF', label: 'Z' },
  'meet.google.com': { bg: '#00897B', fg: '#FFFFFF', label: 'M' },
  'calendly.com': { bg: '#006BFF', fg: '#FFFFFF', label: 'C' },
  'typeform.com': { bg: '#262627', fg: '#FFFFFF', label: 'T' },
  'airtable.com': { bg: '#FB4D16', fg: '#FFFFFF', label: 'A' },
  'webflow.com': { bg: '#4353FF', fg: '#FFFFFF', label: 'W' },
  'upwork.com': { bg: '#14A800', fg: '#FFFFFF', label: 'U' },
  'fiverr.com': { bg: '#1DBF73', fg: '#FFFFFF', label: 'F' },
  'gumroad.com': { bg: '#FF90E8', fg: '#1A1A1A', label: 'G' },
  'stripe.com': { bg: '#635BFF', fg: '#FFFFFF', label: 'S' },
  'paypal.com': { bg: '#003087', fg: '#FFFFFF', label: 'P' },
  'cloudflare.com': { bg: '#F38020', fg: '#FFFFFF', label: 'C' },
  'vercel.com': { bg: '#0A0A0A', fg: '#FFFFFF', label: 'V' },
  'netlify.com': { bg: '#00C7B7', fg: '#FFFFFF', label: 'N' },
  'squarespace.com': { bg: '#0A0A0A', fg: '#FFFFFF', label: 'S' },
  'wix.com': { bg: '#FAAD4D', fg: '#FFFFFF', label: 'W' },
  'dropbox.com': { bg: '#0061FF', fg: '#FFFFFF', label: 'D' },
  'evernote.com': { bg: '#00A82D', fg: '#FFFFFF', label: 'E' },
  'todoist.com': { bg: '#E44332', fg: '#FFFFFF', label: 'T' },
  'tiktok.com': { bg: '#010101', fg: '#FFFFFF', label: 'T' },
  'open.spotify.com': { bg: '#1DB954', fg: '#0A0A0A', label: 'S' },
  'spotify.com': { bg: '#1DB954', fg: '#0A0A0A', label: 'S' },
  'netflix.com': { bg: '#E50914', fg: '#FFFFFF', label: 'N' },
  'vimeo.com': { bg: '#1AB7EA', fg: '#FFFFFF', label: 'V' },
  'soundcloud.com': { bg: '#FF5500', fg: '#FFFFFF', label: 'S' },
  'primevideo.com': { bg: '#00A8E1', fg: '#FFFFFF', label: 'P' },
  'hulu.com': { bg: '#1CE783', fg: '#0A0A0A', label: 'H' },
  'disneyplus.com': { bg: '#0A256B', fg: '#FFFFFF', label: 'D' },
  'amazon.com': { bg: '#FF9900', fg: '#131921', label: 'a' },
  'amzn.to': { bg: '#FF9900', fg: '#131921', label: 'a' },
  'aliexpress.com': { bg: '#E62E04', fg: '#FFFFFF', label: 'A' },
  'shopify.com': { bg: '#96BF48', fg: '#FFFFFF', label: 'S' },
  'etsy.com': { bg: '#F1641E', fg: '#FFFFFF', label: 'E' },
  'ebay.com': { bg: '#006CDE', fg: '#FFFFFF', label: 'e' },
  'bestbuy.com': { bg: '#FFE000', fg: '#000000', label: 'b' },
  'walmart.com': { bg: '#0071DC', fg: '#FFC220', label: 'W' },
  'target.com': { bg: '#CC0000', fg: '#FFFFFF', label: 'T' },
  'linkedin.com': { bg: '#0A66C2', fg: '#FFFFFF', label: 'in' },
  'instagram.com': { bg: '#E1306C', fg: '#FFFFFF', label: 'IG' },
  'facebook.com': { bg: '#1877F2', fg: '#FFFFFF', label: 'f' },
  'reddit.com': { bg: '#FF4500', fg: '#FFFFFF', label: 'R' },
  'pinterest.com': { bg: '#BD081C', fg: '#FFFFFF', label: 'P' },
  'twitch.tv': { bg: '#9146FF', fg: '#FFFFFF', label: 'T' },
  'discord.com': { bg: '#5865F2', fg: '#FFFFFF', label: 'D' },
  'telegram.org': { bg: '#26A5E4', fg: '#FFFFFF', label: 'T' },
  'whatsapp.com': { bg: '#25D366', fg: '#FFFFFF', label: 'W' },
  'producthunt.com': { bg: '#DA552F', fg: '#FFFFFF', label: 'PH' },
  'dev.to': { bg: '#0A0A0A', fg: '#FFFFFF', label: 'D' },
  'medium.com': { bg: '#000000', fg: '#FFFFFF', label: 'M' },
  'substack.com': { bg: '#FF6719', fg: '#FFFFFF', label: 'S' },
  'wordpress.com': { bg: '#21759B', fg: '#FFFFFF', label: 'W' },
  'wikipedia.org': { bg: '#FFFFFF', fg: '#202122', label: 'W' },
  'imdb.com': { bg: '#F5C518', fg: '#0A0A0A', label: 'IM' },
  'archive.org': { bg: '#1E1E1E', fg: '#FFFFFF', label: 'A' },
  'stackoverflow.com': { bg: '#F48024', fg: '#FFFFFF', label: 'SO' },
  'codepen.io': { bg: '#0A0A0A', fg: '#FFFFFF', label: 'CP' },
  'replit.com': { bg: '#667781', fg: '#FFFFFF', label: 'R' },
  'gitlab.com': { bg: '#FC6D26', fg: '#FFFFFF', label: 'G' },
};

export function brandFor(url: string): BrandMeta | null {
  let host: string;
  try {
    host = new URL(url.startsWith('http') ? url : `https://${url.toLowerCase()}`)
      .hostname.toLowerCase();
  } catch {
    host = url.trim().toLowerCase();
  }
  if (host.startsWith('www.')) {
    host = host.slice(4);
  }
  return (/^[a-z0-9-]+(?:\.[a-z]{2,})+$/.test(host) ? BRANDS[host] : null) ?? null;
}