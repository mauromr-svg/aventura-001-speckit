export const NOME_BANCO = 'castelo-do-eco';
export const VERSAO_BANCO = 1;

export function abrirBanco(nome = NOME_BANCO) {
  return new Promise((resolve, reject) => {
    let requisicao;
    try {
      requisicao = indexedDB.open(nome, VERSAO_BANCO);
    } catch (erro) {
      reject(erro);
      return;
    }
    requisicao.onupgradeneeded = () => {
      const db = requisicao.result;
      if (!db.objectStoreNames.contains('ecos')) {
        const ecos = db.createObjectStore('ecos', { keyPath: 'id' });
        ecos.createIndex('aluno', 'aluno', { unique: false });
        ecos.createIndex('criadoEm', 'criadoEm', { unique: false });
      }
      if (!db.objectStoreNames.contains('config')) db.createObjectStore('config', { keyPath: 'chave' });
      if (!db.objectStoreNames.contains('logs')) db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
    };
    requisicao.onsuccess = () => resolve(requisicao.result);
    requisicao.onerror = () => {
      const erro = new Error('Banco de versão desconhecida ou indisponível.');
      erro.code = requisicao.error?.name === 'VersionError' ? 'VERSAO_DESCONHECIDA' : 'BANCO_INDISPONIVEL';
      reject(erro);
    };
    requisicao.onblocked = () => {
      const erro = new Error('O banco está aberto em outra versão.');
      erro.code = 'BANCO_BLOQUEADO';
      reject(erro);
    };
  });
}
