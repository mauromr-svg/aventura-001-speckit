const ITERACOES = 600000;
const TAMANHO_SAL = 16;
const TAMANHO_HASH = 32;
const CAMPOS = Object.freeze({ professor: 'pinProfessor', admin: 'pinAdmin' });
const FORMATO_PIN = /^[0-9]{4,8}$/;

const erro = (mensagem, code) => Object.assign(new Error(mensagem), { code });
const paraBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const deBase64 = (texto) => Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));

async function derivar(pin, sal, iteracoes) {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: iteracoes }, chave, TAMANHO_HASH * 8);
  return new Uint8Array(bits);
}

function iguaisEmTempoConstante(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a[i] ^ b[i];
  return diferenca === 0;
}

function aguardar(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error ?? erro('Transação cancelada.', 'TRANSACAO_ABORTADA'));
    tx.onerror = () => reject(tx.error ?? erro('Falha na transação.', 'TRANSACAO_FALHOU'));
  });
}

function buscar(db, chave) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('config', 'readonly');
    const request = tx.objectStore('config').get(chave);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function pinValido(pin) {
  return typeof pin === 'string' && FORMATO_PIN.test(pin);
}

export function criarPins(db) {
  function campo(perfil) {
    if (!Object.hasOwn(CAMPOS, perfil)) throw erro('Perfil desconhecido.', 'PERFIL_INVALIDO');
    return CAMPOS[perfil];
  }

  return {
    async temPin(perfil) {
      return Boolean(await buscar(db, campo(perfil)));
    },

    async definirPin(perfil, pin) {
      if (!pinValido(pin)) throw erro('O PIN deve ter de 4 a 8 dígitos.', 'PIN_FORMATO');
      const sal = crypto.getRandomValues(new Uint8Array(TAMANHO_SAL));
      const hash = await derivar(pin, sal, ITERACOES);
      const tx = db.transaction('config', 'readwrite');
      tx.objectStore('config').put({ chave: campo(perfil), sal: paraBase64(sal), hash: paraBase64(hash), iteracoes: ITERACOES });
      await aguardar(tx);
    },

    async verificarPin(perfil, pin) {
      const registro = await buscar(db, campo(perfil));
      if (!registro || !pinValido(pin)) return false;
      const esperado = deBase64(registro.hash);
      const calculado = await derivar(pin, deBase64(registro.sal), registro.iteracoes);
      return iguaisEmTempoConstante(esperado, calculado);
    },

    fechar() {
      db.close();
    },
  };
}
