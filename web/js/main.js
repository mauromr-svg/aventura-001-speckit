import { textosWeb } from './textos.js';
import { desenharGrafico } from './grafico-svg.js';
import { abrirBanco } from './banco.js';
import { criarMemorias } from './memorias.js';
import { criarLog } from './log.js';

const nomeRegiao = document.querySelector('#boas-vindas');
const nomeAtual = document.querySelector('#nome-atual');
const entradaRegiao = document.querySelector('#eco');
const campoNome = document.querySelector('#nome-aluno');
const erroNome = document.querySelector('#erro-nome');
const campoSequencia = document.querySelector('#sequencia');
const formulario = document.querySelector('#form-eco');
const botaoOuvir = document.querySelector('#ouvir');
const resposta = document.querySelector('#resposta');
const aviso = document.querySelector('#aviso');
const graficoRegiao = document.querySelector('#grafico-regiao');
const nomeValido = /^[^\p{Cc}]{1,40}$/u;
const worker = new Worker(new URL('./eco-worker.js', import.meta.url), { type: 'module' });
let proximoId = 0;
let enviarAposNome = false;
const textosPorId = new Map();
let memorias = null;
let log = null;
let aluno = null;
let persistenciaPronta = Promise.resolve();

function revelarSala(nome) {
  nomeRegiao.hidden = true;
  entradaRegiao.hidden = false;
  nomeRegiao.dataset.aluno = nome;
  aluno = nome;
  nomeAtual.textContent = nome;
  nomeAtual.hidden = false;
  sessionStorage.setItem('castelo-aluno', nome);
  campoSequencia.focus();
  void carregarHistorico();
  if (enviarAposNome) {
    enviarAposNome = false;
    enviarSequencia();
  }
}

function mostrarResultado(resultado) {
  resposta.replaceChildren();
  const linha = document.createElement('p');
  linha.textContent = resultado.mensagem;
  resposta.append(linha);
  if (resultado.status === 'ok') {
    const link = document.createElement('a');
    link.href = `docs/${resultado.padrao}.html`;
    link.textContent = 'Saiba mais sobre este padrão';
    resposta.append(link);
  }
  aviso.hidden = true;
  graficoRegiao.hidden = resultado.status === 'invalido';
  if (resultado.status !== 'invalido') {
    graficoRegiao.hidden = false;
    graficoRegiao.replaceChildren(desenharGrafico(resultado.grafico));
    if (resultado.grafico.foraDeEscala) {
      aviso.textContent = textosWeb.valoresForaDeEscala;
      aviso.hidden = false;
    } else if (resultado.grafico.reduzido) {
      aviso.textContent = textosWeb.graficoReduzido;
      aviso.hidden = false;
    }
  }
}

function enviarSequencia() {
  const texto = campoSequencia.value;
  const id = ++proximoId;
  textosPorId.set(id, texto);
  botaoOuvir.disabled = true;
  campoSequencia.disabled = true;
  botaoOuvir.textContent = textosWeb.ouvindo;
  resposta.replaceChildren();
  const carregando = document.createElement('p');
  carregando.textContent = textosWeb.ouvindo;
  resposta.append(carregando);
  worker.postMessage({ id, texto });
}

campoNome.addEventListener('input', () => {
  erroNome.textContent = '';
});
document.querySelector('#entrar').addEventListener('click', () => {
  const nome = campoNome.value.trim();
  if (!nomeValido.test(nome)) {
    erroNome.textContent = textosWeb.nomeInvalido;
    return;
  }
  revelarSala(nome);
});
formulario.addEventListener('submit', (event) => {
  event.preventDefault();
  enviarSequencia();
});
worker.addEventListener('message', ({ data }) => {
  if (data.id !== proximoId) return;
  void (async () => {
    botaoOuvir.disabled = false;
    campoSequencia.disabled = false;
    botaoOuvir.textContent = 'Ouvir o eco';
    const texto = textosPorId.get(data.id) ?? '';
    textosPorId.delete(data.id);
    if (data.falha) {
      resposta.textContent = textosWeb.workerFalhou;
      return;
    }
    const resultado = data.resultado;
    let avisoGravacao = '';
    if (!data.reabrir && resultado.erro !== 'ENTRADA_VAZIA') {
      try {
        await persistenciaPronta;
        if (!memorias) throw Object.assign(new Error('Armazenamento indisponível.'), { code: 'BANCO_INDISPONIVEL' });
        await memorias.registrar({
          aluno,
          entrada: texto.trim(),
          quantidade: resultado.quantidade,
          status: resultado.status,
          padrao: resultado.padrao,
          grau: resultado.grau,
          proximo: resultado.proximo,
          erro: resultado.erro,
        });
      } catch (erro) {
        void log?.erro('memoria_nao_salva', { codigo: erro.code ?? 'ERRO_ESCRITA' });
        avisoGravacao = erro.name === 'QuotaExceededError' ? textosWeb.armazenamentoCheio : textosWeb.armazenamentoFalhou;
      }
    }
    mostrarResultado(resultado);
    await carregarHistorico();
    if (avisoGravacao) {
      aviso.textContent = avisoGravacao;
      aviso.hidden = false;
    }
  })();
});
worker.addEventListener('error', () => {
  botaoOuvir.disabled = false;
  campoSequencia.disabled = false;
  botaoOuvir.textContent = 'Ouvir o eco';
  resposta.textContent = textosWeb.workerFalhou;
});

function criarItemHistorico(eco) {
  const item = document.createElement('li');
  item.className = 'item-historico';
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = eco.entrada || '(entrada vazia)';
  botao.addEventListener('click', () => {
    campoSequencia.value = eco.entrada;
    worker.postMessage({ id: ++proximoId, texto: eco.entrada, reabrir: true });
    textosPorId.set(proximoId, eco.entrada);
  });
  const resumo = document.createElement('small');
  resumo.textContent = eco.status === 'ok' ? eco.proximo : eco.status === 'sem_padrao' ? 'Sem padrão' : `Erro: ${eco.erro}`;
  const data = document.createElement('time');
  data.dateTime = eco.criadoEm;
  data.textContent = new Date(eco.criadoEm).toLocaleString('pt-BR');
  item.append(botao, resumo, data);
  if (eco.truncado) {
    const truncado = document.createElement('small');
    truncado.className = 'aviso-truncado';
    truncado.textContent = textosWeb.entradaTruncada;
    item.append(truncado);
  }
  return item;
}

async function carregarHistorico() {
  if (!memorias || !aluno) return;
  try {
    const ecos = await memorias.listarPorAluno(aluno);
    const lista = document.querySelector('#historico');
    lista.replaceChildren(...ecos.map(criarItemHistorico));
    document.querySelector('#contador-memorias').textContent = `${ecos.length} ${ecos.length === 1 ? 'eco' : 'ecos'}`;
    document.querySelector('#historico-vazio').hidden = ecos.length > 0;
    if (memorias.danificados() > 0) {
      aviso.textContent = textosWeb.memoriasDanificadas(memorias.danificados());
      aviso.hidden = false;
    }
  } catch (erro) {
    void log?.erro('historico_indisponivel', { codigo: erro.code ?? 'ERRO_LEITURA' });
    aviso.textContent = textosWeb.semArmazenamento;
    aviso.hidden = false;
  }
}

const alunoAtual = sessionStorage.getItem('castelo-aluno');
const parametro = new URLSearchParams(location.search).get('seq');
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/web/sw.js', { scope: '/' }).catch(() => {});
}
if (parametro !== null) {
  campoSequencia.value = parametro;
  enviarAposNome = true;
}
if (alunoAtual && nomeValido.test(alunoAtual)) {
  revelarSala(alunoAtual);
} else {
  nomeRegiao.hidden = false;
  entradaRegiao.hidden = true;
}

persistenciaPronta = (async () => {
  try {
    const db = await abrirBanco();
    memorias = criarMemorias(db);
    log = criarLog(db);
    void navigator.storage?.persist?.().then((persistente) => {
      if (!persistente) {
        aviso.textContent = textosWeb.armazenamentoPersistenteFalhou;
        aviso.hidden = false;
      }
    }).catch(() => {});
    memorias.aoAtualizar(() => void carregarHistorico());
    await carregarHistorico();
  } catch (erro) {
    aviso.textContent = erro.code === 'VERSAO_DESCONHECIDA' ? textosWeb.semArmazenamento : textosWeb.semArmazenamento;
    aviso.hidden = false;
  }
})();
