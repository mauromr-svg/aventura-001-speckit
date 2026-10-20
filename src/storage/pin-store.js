import { readFileSync } from 'node:fs';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { join } from 'node:path';
import { atomicWrite } from './atomic-write.js';

const VERSAO_ESQUEMA = 1;
const FORMATO_PIN = /^[0-9]{4,8}$/;
const TAMANHO_HASH = 32;
const CAMPO = { professor: 'pinProfessor', admin: 'pinAdmin' };

const erroComCodigo = (mensagem, code) => Object.assign(new Error(mensagem), { code });

export const pinValido = (pin) => typeof pin === 'string' && FORMATO_PIN.test(pin);

/** PIN local: proteção leve contra uso acidental, guardado só como hash scrypt com sal. */
export function createPinStore({ dir }) {
  const caminho = join(dir, 'config.json');

  function ler() {
    let texto;
    try {
      texto = readFileSync(caminho, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') return { versaoEsquema: VERSAO_ESQUEMA };
      throw e;
    }
    try {
      const config = JSON.parse(texto);
      if (config && typeof config === 'object' && Number.isInteger(config.versaoEsquema)) return config;
    } catch {
      // tratado abaixo
    }
    // Recusar em vez de recomeçar: um arquivo corrompido não pode permitir redefinir o PIN.
    throw erroComCodigo('config.json inválido', 'CONFIG_INVALIDA');
  }

  const campo = (perfil) => {
    if (!Object.hasOwn(CAMPO, perfil)) throw erroComCodigo(`perfil desconhecido: ${perfil}`, 'PERFIL_INVALIDO');
    return CAMPO[perfil];
  };

  return {
    temPin(perfil) {
      return Boolean(ler()[campo(perfil)]);
    },

    definirPin(perfil, pin) {
      if (!pinValido(pin)) throw erroComCodigo('PIN deve ter de 4 a 8 dígitos', 'PIN_FORMATO');
      const config = ler();
      const sal = randomBytes(16);
      const hash = scryptSync(pin, sal, TAMANHO_HASH);
      config[campo(perfil)] = { sal: sal.toString('base64'), hash: hash.toString('base64') };
      atomicWrite(caminho, JSON.stringify(config, null, 2), { backup: false, modo: 0o600 });
    },

    verificarPin(perfil, pin) {
      const registro = ler()[campo(perfil)];
      if (!registro || !pinValido(pin)) return false;
      const esperado = Buffer.from(registro.hash, 'base64');
      const calculado = scryptSync(pin, Buffer.from(registro.sal, 'base64'), esperado.length);
      return timingSafeEqual(esperado, calculado);
    },
  };
}
