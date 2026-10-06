"""独立的符号复核辅助；不读取或改写网页答案。"""
from sympy import *

t = Symbol('t', positive=True)
tau = Symbol('tau', real=True)
s = Symbol('s', positive=True)
z = Symbol('z')
w = Symbol('w', real=True, nonzero=True)  # 可去奇点另用 limit 检查
n = Symbol('n', integer=True, nonnegative=True)
checks = []


def check(name, condition):
    passed = bool(condition)
    checks.append(passed)
    print(('OK  ' if passed else 'FAIL'), name)
    if not passed:
        raise AssertionError(name)


def eq(name, left, right):
    delta = simplify(left - right)
    if delta != 0 and delta.has(I):
        delta = simplify(expand_complex(delta))
    check(name, delta == 0)


def roots(poly, variable):
    """求根时去掉积分所用的正实数假设，保留全部复根。"""
    free = Symbol('root')
    return set(solve(poly.subs(variable, free), free))


def lt(expr):
    return laplace_transform(expr, t, s, noconds=True)


def inv_lt(expr):
    return inverse_laplace_transform(expr, s, t)


def u(k):
    return Integer(1 if k >= 0 else 0)


def recurrence(name, hn, coefficients, rhs, lo=-8, hi=20):
    check(name, all(simplify(sum(c * hn(k - i) for i, c in enumerate(coefficients)) - rhs(k)) == 0 for k in range(lo, hi)))


def finish():
    print(f'全部通过：{len(checks)} 项符号、积分或递推检查。')
