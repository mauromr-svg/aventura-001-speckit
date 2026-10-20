const CACHE_NOME = 'castelo-do-eco-v1';
const ARQUIVOS = [
	'/web/',
	'/web/index.html',
	'/web/professor.html',
	'/web/estilo.css',
	'/web/sw.js',
	'/web/js/main.js',
	'/web/js/textos.js',
	'/web/js/calcular-eco.js',
	'/web/js/eco-worker.js',
	'/web/js/grafico-dados.js',
	'/web/js/grafico-svg.js',
	'/web/js/banco.js',
	'/web/js/memorias.js',
	'/web/js/pins.js',
	'/web/js/log.js',
	'/web/js/professor.js',
	'/web/docs/index.html',
	'/web/docs/precedencia.html',
	'/web/docs/constante.html',
	'/web/docs/aritmetica.html',
	'/web/docs/geometrica.html',
	'/web/docs/fibonacci.html',
	'/web/docs/polinomial.html',
	'/web/docs/docs.js',
	'/web/docs/exemplos.js',
	'/web/img/castelo-eco.svg',
	'/web/img/eco-sinal.svg',
	'/src/cli/messages.pt-br.js',
	'/src/core/parse-input.js',
	'/src/core/exact-number.js',
	'/src/core/predict.js',
	'/src/core/patterns/constant.js',
	'/src/core/patterns/arithmetic.js',
	'/src/core/patterns/geometric.js',
	'/src/core/patterns/fibonacci.js',
	'/src/core/patterns/polynomial.js',
];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then((nomes) => Promise.all(nomes.filter((nome) => nome.startsWith('castelo-do-eco-') && nome !== CACHE_NOME).map((nome) => caches.delete(nome))))
			.then(() => self.clients.claim()),
	);
});

self.addEventListener('fetch', (event) => {
	const requisicao = event.request;
	if (requisicao.method !== 'GET' || new URL(requisicao.url).origin !== self.location.origin) return;
	const url = new URL(requisicao.url);
	const chave = `${url.origin}${url.pathname}`;
	if (!ARQUIVOS.some((arquivo) => new URL(arquivo, self.location.origin).href === chave)) return;
	event.respondWith(
		caches.open(CACHE_NOME).then(async (cache) => {
			const guardado = await cache.match(chave);
			if (guardado) return guardado;
			const resposta = await fetch(requisicao);
			if (resposta.ok) await cache.put(chave, resposta.clone());
			return resposta;
		}),
	);
});
