import type { GradeDiagnostic } from '../src/ai/errors';

/** 只映射明确返回的错误代码，无法区分日额度和瞬时限流时保留“额度或频率受限”。 */
export async function gradeFailure(upstream: Response): Promise<{ error: string; diagnostic: GradeDiagnostic }> {
  const status = upstream.status;
  const diagnostic: GradeDiagnostic = {
    kind: status === 429 ? 'limited' : status === 503 ? 'busy' :
      [401, 403].includes(status) ? 'key' : status === 402 ? 'billing' : status === 404 ? 'model' : status === 400 ? 'request' : 'unavailable',
    upstreamStatus: status,
  };
  // Retry-After 可为秒数或 HTTP 日期。只向客户端返回有界的等待秒数。
  const retryHeader = upstream.headers.get('Retry-After');
  let delay = retryHeader ? (/^\d+(?:\.\d+)?$/.test(retryHeader) ? Number(retryHeader) : (Date.parse(retryHeader) - Date.now()) / 1000) : NaN;
  if (status === 429) {
    try {
      const body = await upstream.text();
      if (body.length <= 65536) {
        const error = JSON.parse(body)?.error;
        if (error?.code === 'quota_exceeded') diagnostic.kind = 'daily-quota';
        if (Array.isArray(error?.details)) for (const detail of error.details) {
          if (detail?.['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure' && Array.isArray(detail.violations)) {
            if (detail.violations.some((v: { quotaId?: unknown }) => typeof v?.quotaId === 'string' && v.quotaId.length <= 200 && /perday/i.test(v.quotaId.replace(/[^a-z]/ig, '')))) diagnostic.kind = 'daily-quota';
          }
          if (!Number.isFinite(delay) && detail?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' && typeof detail.retryDelay === 'string' && /^\d+(?:\.\d+)?s$/.test(detail.retryDelay)) delay = Number(detail.retryDelay.slice(0, -1));
        }
      }
    } catch { /* 错误正文不可解析时仍按状态码处理，不输出原文。 */ }
  } else await upstream.body?.cancel().catch(() => undefined);
  if (Number.isFinite(delay) && delay > 0 && delay <= 86400) diagnostic.retryAfterSeconds = Math.ceil(delay);
  const message = diagnostic.kind === 'daily-quota' ? '模型项目的每日调用额度受限，请到 AI Studio 查看额度与重置时间' :
    diagnostic.kind === 'limited' ? '模型调用额度或频率受限，请到 AI Studio 查看当前项目的调用限额' :
    diagnostic.kind === 'busy' ? '模型服务忙碌，请稍后重试' :
    diagnostic.kind === 'key' ? '服务端模型 Key 或访问权限异常' :
    diagnostic.kind === 'billing' ? '模型项目需要检查计费或可用余额' :
    diagnostic.kind === 'model' ? '服务端模型或接口地址不可用' :
    diagnostic.kind === 'request' ? '模型无法处理本次请求，请检查图片与参数' : '模型暂时无法批改';
  return { error: `${message}（${status}）。可使用下方 Gemini 网页备用批改，或对照答案手动评分；失败请求不计入进度。`, diagnostic };
}
