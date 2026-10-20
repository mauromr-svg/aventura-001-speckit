const DEZ = 10n;

/** Converte um token já validado ("-1,5", "3") em dígitos inteiros e quantidade de casas decimais. */
export function parseDecimal(token) {
  const negativo = token.startsWith('-');
  const semSinal = token.replace(/^[+-]/, '');
  const [inteira, fracionaria = ''] = semSinal.split(/[.,]/);
  const digitos = BigInt(inteira + fracionaria);
  return { digitos: negativo ? -digitos : digitos, casas: fracionaria.length };
}

/** Coloca todos os números na mesma escala 10^casas, para que a lógica opere só com inteiros. */
export function escalar(decimais) {
  let casas = 0;
  for (const d of decimais) if (d.casas > casas) casas = d.casas;
  const valores = decimais.map((d) => (d.casas === casas ? d.digitos : d.digitos * DEZ ** BigInt(casas - d.casas)));
  return { valores, casas };
}

function mdc(a, b) {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function fracao(num, den) {
  if (den === 0n) throw new RangeError('denominador zero');
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = mdc(num, den);
  return g > 1n ? { num: num / g, den: den / g } : { num, den };
}

/** Decimal exato quando o denominador só tem fatores 2 e 5; caso contrário, "a/b". */
export function formatar({ num, den }) {
  if (den === 1n) return num.toString();

  let resto = den;
  let dois = 0;
  let cinco = 0;
  while (resto % 2n === 0n) {
    resto /= 2n;
    dois++;
  }
  while (resto % 5n === 0n) {
    resto /= 5n;
    cinco++;
  }
  if (resto !== 1n) return `${num}/${den}`;

  const casas = Math.max(dois, cinco);
  const escalado = num * (DEZ ** BigInt(casas) / den);
  const negativo = escalado < 0n;
  const digitos = (negativo ? -escalado : escalado).toString().padStart(casas + 1, '0');
  const inteira = digitos.slice(0, -casas);
  const fracionaria = digitos.slice(-casas).replace(/0+$/, '');
  return `${negativo ? '-' : ''}${inteira}${fracionaria ? `.${fracionaria}` : ''}`;
}
