// URL guard for the "Test Connection" probes, split out of key-probes.ts so that
// module stays under the 500-line ceiling.
export type FetchInit = Parameters<typeof fetch>[1] & { dispatcher?: unknown };

// Probes send REAL stored credentials to a user/agent-settable base URL.
// Loopback and private hosts stay allowed (local models and LAN gateways are
// legitimate), but cloud metadata / link-local targets and credential-bearing
// or non-http(s) URLs never are — those only appear in SSRF exfil attempts.
export function probeUrlError(url: RequestInfo | URL): string | null {
  let parsed: URL;
  try {
    parsed = new URL(String(url));
  } catch {
    return '探测地址不是合法 URL';
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return `探测地址协议不支持:${parsed.protocol}`;
  }
  if (parsed.username || parsed.password) return '探测地址不允许携带内嵌凭据';
  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(host) || host.startsWith('fe80:')
    || host === 'metadata.google.internal') {
    return '探测地址指向云元数据/链路本地网段,已拒绝';
  }
  return null;
}
