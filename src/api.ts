type Endpoint = 'health' | 'sync' | 'grade';

// 同源部署沿用相对路径；GitHub Pages 构建可指定独立后端。
export function resolveApiUrl(endpoint: Endpoint, base = ''): string {
  if (!base.trim()) return './api/' + endpoint;
  const url = new URL(base.trim());
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash)
    throw new Error('后端地址配置无效');
  return url.href.replace(/\/+$/, '') + '/api/' + endpoint;
}

export const apiUrl = (endpoint: Endpoint) => resolveApiUrl(endpoint, import.meta.env.VITE_API_BASE_URL ?? '');
