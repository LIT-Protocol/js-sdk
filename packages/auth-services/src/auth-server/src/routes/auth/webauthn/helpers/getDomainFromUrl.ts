import { URL } from 'url';

export function getDomainFromUrl(url: string) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname;
}
