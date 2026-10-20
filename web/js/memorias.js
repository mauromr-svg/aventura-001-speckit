export const VERSAO_ECO = 1;
const MAX_ENTRADA = 4096;
const STATUS_VALIDOS = new Set(['ok', 'sem_padrao', 'invalido']);
const PADROES_VALIDOS = new Set(['constante', 'aritmetica', 'geometrica', 'fibonacci', 'polinomial']);

export function ecoValido(eco) {
  if (!eco || typeof eco !== 'object') return false;
  if (typeof eco.id !== 'string' || typeof eco.aluno !== 'string' || typeof eco.entrada !== 'string') return false;
  if (eco.aluno.length < 1 || eco.aluno.length > 40 || /\p{Cc}/u.test(eco.aluno)) return false;
  if (eco.entrada.length > MAX_ENTRADA || !Number.isInteger(eco.quantidade) || eco.quantidade < 0) return false;
  if (typeof eco.criadoEm !== 'string' || Number.isNaN(Date.parse(eco.criadoEm))) return false;
  if (typeof eco.truncado !== 'boolean' || eco.versaoEsquema !== VERSAO_ECO || !STATUS_VALIDOS.has(eco.status)) return false;
  if (eco.status === 'ok') {
    return PADROES_VALIDOS.has(eco.padrao) && typeof eco.proximo === 'string' &&
      (eco.grau === null || eco.grau === undefined || Number.isInteger(eco.grau)) && eco.erro == null;
  }
  if (eco.status === 'sem_padrao') return eco.padrao == null && eco.proximo == null && eco.erro == null;
  return eco.padrao == null && eco.proximo == null && typeof eco.erro === 'string';
}

function aguardarTransacao(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error ?? Object.assign(new Error('Gravação cancelada.'), { code: 'TRANSACAO_ABORTADA' }));
    tx.onerror = () => reject(tx.error ?? Object.assign(new Error('Falha na gravação.'), { code: 'TRANSACAO_FALHOU' }));
  });
}

function aguardarRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const maisRecentesPrimeiro = (a, b) => b.criadoEm.localeCompare(a.criadoEm) || b.id.localeCompare(a.id);

export function criarMemorias(db) {
  let danificados = 0;
  const canal = typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('castelo-do-eco')
    : null;

  async function lerTodos() {
    const tx = db.transaction('ecos', 'readonly');
    const registros = await aguardarRequest(tx.objectStore('ecos').getAll());
    await aguardarTransacao(tx);
    const validos = [];
    danificados = 0;
    for (const registro of registros) {
      if (ecoValido(registro)) validos.push(registro);
      else danificados++;
    }
    return validos.sort(maisRecentesPrimeiro);
  }

  return {
    async registrar({ aluno, entrada, quantidade, status, padrao = null, grau = null, proximo = null, erro = null }) {
      const texto = String(entrada);
      const truncado = texto.length > MAX_ENTRADA;
      const tx = db.transaction('ecos', 'readwrite');
      const store = tx.objectStore('ecos');
      const registros = await aguardarRequest(store.getAll());
      const ultimaData = registros.reduce((max, eco) => Math.max(max, Date.parse(eco.criadoEm) || 0), 0);
      const agora = Math.max(Date.now(), ultimaData + 1);
      const eco = {
        id: crypto.randomUUID(),
        aluno,
        criadoEm: new Date(agora).toISOString(),
        entrada: truncado ? texto.slice(0, MAX_ENTRADA) : texto,
        quantidade,
        truncado,
        status,
        padrao: status === 'ok' ? padrao : null,
        grau: status === 'ok' ? grau : null,
        proximo: status === 'ok' ? proximo : null,
        erro: status === 'invalido' ? erro : null,
        versaoEsquema: VERSAO_ECO,
      };
      if (!ecoValido(eco)) {
        tx.abort();
        throw Object.assign(new Error('Memória inválida.'), { code: 'ECO_INVALIDO' });
      }
      store.add(eco);
      await aguardarTransacao(tx);
      canal?.postMessage({ tipo: 'eco_registrado', aluno });
      return eco;
    },

    async listarPorAluno(aluno) {
      return (await lerTodos()).filter((eco) => eco.aluno === aluno);
    },

    async listarTodos() {
      return lerTodos();
    },

    async apagarTudo() {
      const tx = db.transaction('ecos', 'readwrite');
      tx.objectStore('ecos').clear();
      await aguardarTransacao(tx);
      danificados = 0;
    },

    danificados: () => danificados,
    aoAtualizar(callback) {
      if (!canal) return () => {};
      const handler = (evento) => callback(evento.data);
      canal.addEventListener('message', handler);
      return () => canal.removeEventListener('message', handler);
    },
    fechar() {
      canal?.close();
    },
  };
}
