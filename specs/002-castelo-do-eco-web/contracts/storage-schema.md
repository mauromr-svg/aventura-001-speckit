# Contrato: Armazenamento no Navegador

Banco IndexedDB `castelo-do-eco`, versão 1, na origem onde o Castelo do Eco é servido (ex.: `http://127.0.0.1:8080`). Origem diferente significa banco diferente.

## Stores

| Store | keyPath | Índices | Conteúdo |
|---|---|---|---|
| `ecos` | `id` | `aluno` (não único), `criadoEm` (não único) | Ecos, ver [data-model.md](../data-model.md) |
| `config` | `chave` | — | `pinProfessor`, `pinAdmin` |
| `logs` | autoincremento | — | Log técnico, no máximo 500 registros |

Exemplo de eco:

```json
{
  "id": "6f1d2b0e-8a3c-4f1e-9d52-0c1f7a6b9e10",
  "aluno": "Ana",
  "criadoEm": "2026-10-20T14:03:21.000Z",
  "entrada": "1, 4, 9, 16",
  "quantidade": 4,
  "truncado": false,
  "status": "ok",
  "padrao": "polinomial",
  "grau": 2,
  "proximo": "25",
  "erro": null,
  "versaoEsquema": 1
}
```

Exemplo de PIN:

```json
{ "chave": "pinProfessor", "sal": "<base64 16 bytes>", "hash": "<base64 32 bytes>", "iteracoes": 600000 }
```

## Regras

- Toda gravação usa uma transação `readwrite`; falha da transação significa que nada foi gravado.
- Apagar memórias limpa só o store `ecos`, numa única transação.
- Na abertura, `navigator.storage.persist()` é solicitado; a recusa não impede o uso.
- Mudanças incompatíveis exigem nova versão do banco e migração em `upgradeneeded`, documentada aqui (constituição, Princípio V).
- Os históricos da web e do console (`dados/memorias.json`) são independentes.
