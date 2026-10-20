#!/usr/bin/env node
import { main } from './src/cli/app.js';
import { mensagens } from './src/cli/messages.pt-br.js';

// Fora do terminal (entrada redirecionada), Ctrl+C chega como sinal; cada eco já foi gravado.
process.on('SIGINT', () => {
  process.stdout.write(`\n${mensagens.despedida()}\n`);
  process.exit(0);
});

process.exitCode = await main();
