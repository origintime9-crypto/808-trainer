"""2026 初试卷答案复核：python tools/verify/zt2026.py，全部通过才算核对完成。"""
from sympy import (I, Rational, Symbol, exp, simplify, sin, cos, sqrt, pi, oo, integrate, limit,
                   arg, Abs, nsimplify, symbols, solve, Function, inverse_laplace_transform, Heaviside, re)

t = Symbol("t", real=True)
w = Symbol("w", real=True)
s = Symbol("s")
z = Symbol("z")
ok = True
count = 0


def check(name, cond):
    global ok, count
    count += 1
    print(("OK  " if cond else "FAIL"), name)
    ok = ok and bool(cond)


# 一(1)(2)
check("一(1)", simplify((t + sin(t)).subs(t, pi / 3) - (pi / 3 + sqrt(3) / 2)) == 0)
check("一(2)", limit(sin(2 * t) / t, t, 0) == 2)

# 三(3) 卷积和
f = {-1: 3, 0: 2, 1: 1}
g = {0: 1, 1: 2, 2: 1}
y = {}
for a, fa in f.items():
    for b, gb in g.items():
        y[a + b] = y.get(a + b, 0) + fa * gb
check("三(3)", [y[n] for n in range(-1, 4)] == [3, 8, 8, 4, 1])

# 四
X1 = integrate(exp(-3 * t) * exp(-I * w * t), (t, 0, oo), conds="none")
check("四(1)", simplify(X1 - 1 / (3 + I * w)) == 0)
X3 = integrate(exp(-I * w * t), (t, -1, 1))
check("四(3)", all(abs(complex((X3 - 2 * sin(w) / w).subs(w, v).evalf())) < 1e-12 for v in (0.3, 1.7, -2.5, 9.1)))

# 五(2) 初值、终值（用级数展开验证 h(n) 闭式）
Hz = 1 / (1 - Rational(1, 4) / z - Rational(3, 4) / z**2)
h = [Rational(0)] * 40
for n in range(40):  # h(n) = δ(n) + 1/4 h(n-1) + 3/4 h(n-2)
    h[n] = (1 if n == 0 else 0) + Rational(1, 4) * (h[n - 1] if n >= 1 else 0) + Rational(3, 4) * (h[n - 2] if n >= 2 else 0)
closed = [Rational(4, 7) + Rational(3, 7) * Rational(-3, 4) ** n for n in range(40)]
check("五(2) 闭式", h == closed)
check("五(2) 初值=1", limit(Hz, z, oo) == 1)
check("五(2) 终值=4/7", limit((z - 1) * Hz, z, 1) == Rational(4, 7))

# 六 全响应分解
yzi, yzs = symbols("yzi yzs")
y1 = exp(-t) - cos(2 * t)
y2 = 2 * exp(-t) - 5 * cos(2 * t)
sol = solve([yzi + yzs - y1, yzi + 2 * yzs - y2], [yzi, yzs])
check("六 yzi=3cos2t", simplify(sol[yzi] - 3 * cos(2 * t)) == 0)
check("六 yzs=e^-t-4cos2t", simplify(sol[yzs] - (exp(-t) - 4 * cos(2 * t))) == 0)
check("六(2)", simplify(2 * sol[yzi] + sol[yzs] / 2 - (exp(-t) / 2 + 4 * cos(2 * t))) == 0)

# 七 极点
check("七(1) 极点", set(solve(s**2 + 4 * s + 3, s)) == {-1, -3})
check("七(3) 极点", set(solve(s**2 + 3 * s + 2, s)) == {-1, -2})

# 九 三种 ROC 下的 h(n) 都满足差分方程 y(n) - 5/2 y(n-1) + y(n-2) = x(n-1)
def u(n):
    return 1 if n >= 0 else 0


cands = {
    "|z|>2": lambda n: Rational(2, 3) * (Rational(2) ** n - Rational(1, 2) ** n) * u(n),
    "1/2<|z|<2": lambda n: -Rational(2, 3) * Rational(2) ** n * u(-n - 1) - Rational(2, 3) * Rational(1, 2) ** n * u(n),
    "|z|<1/2": lambda n: Rational(2, 3) * (Rational(1, 2) ** n - Rational(2) ** n) * u(-n - 1),
}
for name, hn in cands.items():
    good = all(hn(n) - Rational(5, 2) * hn(n - 1) + hn(n - 2) == (1 if n == 1 else 0) for n in range(-15, 15))
    check(f"九 {name}", good)

# 十 零极点 + h(0+)=1
K = Symbol("K")
H = K * s / (s**2 + 2 * s + Rational(7, 4))
check("十 极点", set(solve(s**2 + 2 * s + Rational(7, 4), s)) == {-1 + I * sqrt(3) / 2, -1 - I * sqrt(3) / 2})
check("十 K=1", limit(s * H, s, oo) == K)
H = H.subs(K, 1)
Hj = H.subs(s, I * sqrt(3) / 2)
check("十 |H|=√3/4", simplify(Abs(Hj) - sqrt(3) / 4) == 0)
check("十 φ=π/6", simplify(arg(Hj) - pi / 6) == 0)
ht = inverse_laplace_transform(H, s, Symbol("t", positive=True))
tp = Symbol("t", positive=True)
expect = exp(-tp) * (cos(sqrt(3) * tp / 2) - 2 / sqrt(3) * sin(sqrt(3) * tp / 2))
check("十 h(t)", simplify(ht - expect) == 0)

print(f"全部通过：{count} 项符号、积分或递推检查。" if ok else "有未通过项")
raise SystemExit(0 if ok else 1)
