const CAMPOS_PERMITIDOS = new Set(['codigo', 'status']);
const MAX_LOGS = 500;

function esperarTransacao(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error ?? new Error('Transação de log cancelada.'));
    tx.onerror = () => reject(tx.error ?? new Error('Falha ao gravar log.'));
  });
}

export function criarLog(db) {
  async function gravar(nivel, evento, extras = {}) {
    const linha = { ts: new Date().toISOString(), nivel, evento };
    for (const campo of CAMPOS_PERMITIDOS) {
      if (extras[campo] !== undefined) linha[campo] = extras[campo];
    }
    try {
      const tx = db.transaction('logs', 'readwrite');
      const store = tx.objectStore('logs');
      store.add(linha);
      const todos = store.getAll();
      todos.onsuccess = () => {
        const excesso = todos.result.length - MAX_LOGS;
        if (excesso <= 0) return;
        for (const registro of todos.result.sort((a, b) => a.id - b.id).slice(0, excesso)) store.delete(registro.id);
      };
      await esperarTransacao(tx);
    } catch {
      return false;
    }
    return true;
  }

  return {
    info: (evento, extras) => gravar('info', evento, extras),
    aviso: (evento, extras) => gravar('aviso', evento, extras),
    erro: (evento, extras) => gravar('erro', evento, extras),
  };
}
