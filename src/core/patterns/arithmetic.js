export function aritmetica(v) {
  if (v.length < 2) return null;
  const razao = v[1] - v[0];
  for (let i = 2; i < v.length; i++) if (v[i] - v[i - 1] !== razao) return null;
  return { proximo: { num: v[v.length - 1] + razao, den: 1n } };
}
