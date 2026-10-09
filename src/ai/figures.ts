import type { Problem } from '../types';

export interface GradeFigure { source: string; kind: '题图' | '参考解答图' }
export interface PreparedGradeFigure extends GradeFigure { image: string }

const markdownImages = (text: string) => Array.from(text.matchAll(/!\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^)]*["'])?\s*\)/g), m => m[1]);

/** 按题面、参考解答分别收集图片；同一图片只发送一次，作答照片另行标注。 */
export function gradeFigures(p: Problem): GradeFigure[] {
  const seen = new Set<string>();
  const result: GradeFigure[] = [];
  const add = (source: string, kind: GradeFigure['kind']) => {
    source = source.replace(/^\.\//, '');
    if (seen.has(source)) return;
    seen.add(source); result.push({ source, kind });
  };
  for (const source of [...(p.figures ?? []), ...markdownImages(p.stem), ...(p.options ?? []).flatMap(markdownImages)]) add(source, '题图');
  for (const source of [...markdownImages(p.answer), ...markdownImages(p.solution)]) add(source, '参考解答图');
  return result;
}

async function rasterizeFigure(blob: Blob, signal: AbortSignal): Promise<string> {
  signal.throwIfAborted();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image(); image.src = objectUrl;
    await image.decode(); signal.throwIfAborted();
    const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context || !image.naturalWidth || !image.naturalHeight) throw new Error();
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    // SVG 和位图统一为 PNG；保持波形、下标和正负号清晰。
    return canvas.toDataURL('image/png');
  } finally { URL.revokeObjectURL(objectUrl); }
}

/** 题图加载完整后才发送批改，避免模型根据缺图题面猜测。 */
export async function prepareGradeFigures(p: Problem, signal: AbortSignal): Promise<PreparedGradeFigure[]> {
  return Promise.all(gradeFigures(p).map(async figure => {
    try {
      if (!/^figures\/[\w./-]+\.(?:png|jpe?g|webp|svg)$/i.test(figure.source) || figure.source.split('/').some(part => part === '..')) throw new Error();
      const url = new URL(import.meta.env.BASE_URL + figure.source, document.baseURI);
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      if (blob.size > 5_000_000 || !/^image\/(?:png|jpeg|webp|svg\+xml)$/i.test(blob.type)) throw new Error();
      return { ...figure, image: await rasterizeFigure(blob, signal) };
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof Error && error.name === 'AbortError') throw error;
      throw new Error(`${figure.kind}加载失败，本次未发送批改。请刷新后重试，或在 Gemini 网页附上题图、参考图及作答照片。`);
    }
  }));
}
