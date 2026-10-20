/** Razão q = v1/v0 verificada por produto cruzado, para não sair dos inteiros. */
export function geometrica(v) {
  if (v.length < 3) return null;
  for (const x of v) if (x === 0n) return null;
  const [a0, a1] = v;
  for (let i = 2; i < v.length; i++) if (v[i] * a0 !== v[i - 1] * a1) return null;
  return { proximo: { num: v[v.length - 1] * a1, den: a0 } };
}
