/** 单位矩形 x(τ)=1[0,1]、h(τ)=1[0,1] 的卷积。 */
export function rectangleOverlap(t:number) {
  const low=Math.max(0,t-1),high=Math.min(1,t);
  return {low,high,length:Math.max(0,high-low)};
}
/** 稳定、严格真有理示例 H(s)=1/[(s+σ)²+ω₀²]，σ>0。 */
export function poleMagnitude(omega:number,sigma:number,omega0:number) {
  return 1/Math.hypot(sigma*sigma+omega0*omega0-omega*omega,2*sigma*omega);
}
export const hasAliasing=(bandwidth:number,sampling:number)=>sampling<2*bandwidth;
