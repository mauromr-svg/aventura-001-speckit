export function fibonacci(v) {
  if (v.length < 4) return null;
  for (let i = 2; i < v.length; i++) if (v[i] !== v[i - 1] + v[i - 2]) return null;
  return { proximo: { num: v[v.length - 1] + v[v.length - 2], den: 1n } };
}
