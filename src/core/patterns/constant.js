export function constante(v) {
  if (v.length < 2) return null;
  for (let i = 1; i < v.length; i++) if (v[i] !== v[0]) return null;
  return { proximo: { num: v[0], den: 1n } };
}
