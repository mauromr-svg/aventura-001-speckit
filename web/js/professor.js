import { abrirBanco } from './banco.js';
import { criarMemorias } from './memorias.js';
import { criarPins, pinValido } from './pins.js';
import { criarLog } from './log.js';
import { mensagens, textosWeb } from './textos.js';

const avisoProfessor = document.querySelector('#aviso-professor');
const avisoAdmin = document.querySelector('#aviso-admin');
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let memorias;
let pins;
let log;

function mostrarAviso(elemento, texto) {
  elemento.textContent = texto;
  elemento.hidden = false;
}

function mostrarEco(eco) {
  const item = document.createElement('li');
  const linha = document.createElement('p');
  const data = new Date(eco.criadoEm).toLocaleString('pt-BR');
  const resultado = eco.status === 'ok'
    ? `${eco.proximo} (${eco.padrao}${eco.grau ? `, grau ${eco.grau}` : ''})`
    : eco.status === 'sem_padrao' ? 'sem padrão' : `erro: ${eco.erro}`;
  linha.textContent = `[${data}] ${eco.entrada} → ${resultado}`;
  item.append(linha);
  return item;
}

async function mostrarProfessor() {
  const ecos = await memorias.listarTodos();
  const grupos = new Map();
  for (const eco of ecos) {
    if (!grupos.has(eco.aluno)) grupos.set(eco.aluno, []);
    grupos.get(eco.aluno).push(eco);
  }
  const lista = document.querySelector('#lista-professor');
  lista.replaceChildren();
  if (grupos.size === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = textosWeb.semMemorias;
    lista.append(vazio);
  }
  for (const [nome, itens] of grupos) {
    const grupo = document.createElement('section');
    grupo.className = 'grupo-aluno';
    const titulo = document.createElement('h3');
    titulo.textContent = `${nome} (${itens.length} ${itens.length === 1 ? 'eco' : 'ecos'})`;
    const ul = document.createElement('ul');
    ul.append(...itens.map(mostrarEco));
    grupo.append(titulo, ul);
    lista.append(grupo);
  }
  document.querySelector('#autenticacao-professor').hidden = true;
  document.querySelector('#modo-professor').hidden = false;
  void log?.info('modo_professor');
}

function configurarPerfil({ perfil, abreviar, auth, modo, aviso, entrar, sair, definir, salvar, acessar, abrirModo }) {
  const campoPin = document.querySelector(`#pin-${abreviar}`);
  const regiaoConfirmacao = document.querySelector(`#confirmar-${abreviar}-regiao`);
  const campoConfirmacao = document.querySelector(`#confirmar-${abreviar}`);
  const btnDefinir = document.querySelector(`#definir-${abreviar}`);
  const btnAcessar = document.querySelector(`#acessar-${abreviar}`);
  const tentativas = { count: 0 };

  entrar.addEventListener('click', async () => {
    aviso.hidden = true;
    auth.hidden = false;
    campoPin.value = '';
    campoConfirmacao.value = '';
    regiaoConfirmacao.hidden = true;
    try {
      const existe = await pins.temPin(perfil);
      btnDefinir.hidden = existe;
      btnAcessar.hidden = !existe;
      campoPin.focus();
    } catch {
      mostrarAviso(aviso, mensagens.configInvalida());
    }
  });

  definir.addEventListener('click', () => {
    if (!pinValido(campoPin.value.trim())) {
      mostrarAviso(aviso, mensagens.pinFormatoInvalido());
      return;
    }
    regiaoConfirmacao.hidden = false;
    campoConfirmacao.focus();
  });

  salvar.addEventListener('click', async () => {
    const pin = campoPin.value.trim();
    if (pin !== campoConfirmacao.value.trim()) {
      mostrarAviso(aviso, mensagens.pinsDiferentes());
      return;
    }
    try {
      await pins.definirPin(perfil, pin);
      campoPin.value = '';
      campoConfirmacao.value = '';
      auth.hidden = true;
      await abrirModo();
      void log?.info('pin_definido', { codigo: perfil });
    } catch (erro) {
      mostrarAviso(aviso, erro.code === 'PIN_FORMATO' ? mensagens.pinFormatoInvalido() : mensagens.configInvalida());
    }
  });

  acessar.addEventListener('click', async () => {
    const pin = campoPin.value.trim();
    campoPin.value = '';
    try {
      if (await pins.verificarPin(perfil, pin)) {
        tentativas.count = 0;
        auth.hidden = true;
        await abrirModo();
        return;
      }
      tentativas.count++;
      mostrarAviso(aviso, tentativas.count >= 3 ? mensagens.pinBloqueado() : mensagens.pinIncorreto());
      void log?.aviso('pin_recusado', { codigo: perfil });
      if (tentativas.count >= 3) {
        btnAcessar.disabled = true;
        await esperar(1500);
        btnAcessar.disabled = false;
        tentativas.count = 0;
      } else {
        await esperar(tentativas.count * 500);
      }
    } catch {
      mostrarAviso(aviso, mensagens.configInvalida());
    }
  });

  sair.addEventListener('click', () => {
    modo.hidden = true;
    auth.hidden = true;
    mostrarAviso(aviso, 'Sessão encerrada.');
  });
}

async function inicializar() {
  try {
    const db = await abrirBanco();
    memorias = criarMemorias(db);
    pins = criarPins(db);
    log = criarLog(db);
  } catch {
    mostrarAviso(avisoProfessor, textosWeb.semArmazenamento);
    return;
  }

  configurarPerfil({
    perfil: 'professor',
    abreviar: 'professor',
    auth: document.querySelector('#autenticacao-professor'),
    modo: document.querySelector('#modo-professor'),
    aviso: avisoProfessor,
    entrar: document.querySelector('#entrar-professor'),
    sair: document.querySelector('#sair-professor'),
    definir: document.querySelector('#definir-professor'),
    salvar: document.querySelector('#salvar-confirmacao-professor'),
    acessar: document.querySelector('#acessar-professor'),
    abrirModo: mostrarProfessor,
  });

  configurarPerfil({
    perfil: 'admin',
    abreviar: 'admin',
    auth: document.querySelector('#autenticacao-admin'),
    modo: document.querySelector('#modo-admin'),
    aviso: avisoAdmin,
    entrar: document.querySelector('#entrar-admin'),
    sair: document.querySelector('#sair-admin'),
    definir: document.querySelector('#definir-admin'),
    salvar: document.querySelector('#salvar-confirmacao-admin'),
    acessar: document.querySelector('#acessar-admin'),
    abrirModo: async () => {
      document.querySelector('#autenticacao-admin').hidden = true;
      document.querySelector('#modo-admin').hidden = false;
      document.querySelector('#confirmar-apagar').value = '';
    },
  });

  document.querySelector('#apagar-memorias').addEventListener('click', async () => {
    const confirmar = document.querySelector('#confirmar-apagar');
    if (confirmar.value.trim() !== 'APAGAR') {
      mostrarAviso(avisoAdmin, mensagens.nadaApagado());
      return;
    }
    try {
      await memorias.apagarTudo();
      confirmar.value = '';
      mostrarAviso(avisoAdmin, mensagens.memoriasApagadas());
      void log.aviso('memorias_apagadas');
    } catch {
      mostrarAviso(avisoAdmin, mensagens.erroInesperado());
    }
  });
}

void inicializar();
