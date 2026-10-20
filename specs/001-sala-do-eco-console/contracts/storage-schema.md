# Contrato: Formato dos Arquivos de Dados

Pasta: `ECO_DATA_DIR` (padrão `./dados`). Codificação UTF-8. Qualquer mudança incompatível exige aumentar `versaoEsquema` e incluir uma migração documentada (constituição, Princípio V).

## `memorias.json`

```json
{
  "versaoEsquema": 1,
  "ecos": [
    {
      "id": "6f1d2b0e-8a3c-4f1e-9d52-0c1f7a6b9e10",
      "aluno": "Ana",
      "criadoEm": "2026-10-20T14:03:21.000Z",
      "entrada": "3, 6, 9, 12",
      "quantidade": 4,
      "truncado": false,
      "status": "ok",
      "padrao": "aritmetica",
      "proximo": "15",
      "erro": null
    }
  ]
}
```

Regras:
- `status` é `ok`, `sem_padrao` ou `invalido`.
- `padrao` só existe se `status = ok`; `erro` só existe se `status = invalido`.
- `entrada` tem no máximo 4.096 caracteres; se foi cortada, `truncado = true`.
- Os ecos ficam em ordem cronológica de gravação; a consulta inverte a ordem.
- Gravação: arquivo temporário na mesma pasta, `fsync`, `rename` sobre o arquivo final, e cópia anterior em `memorias.json.bak`.
- Se `versaoEsquema` for maior que a conhecida, o programa recusa gravar e avisa o usuário.

## `config.json`

```json
{
  "versaoEsquema": 1,
  "pinProfessor": { "sal": "<base64>", "hash": "<base64>" },
  "pinAdmin": { "sal": "<base64>", "hash": "<base64>" }
}
```

Regras:
- Os campos de PIN são omitidos até o primeiro uso.
- O hash usa `scrypt` com sal aleatório de 16 bytes; o PIN nunca é gravado em texto puro nem registrado em log.
- Permissões do arquivo: leitura e escrita só para o dono, quando o sistema operacional permitir.

## `eco.log` (JSON Lines)

```json
{"ts":"2026-10-20T14:03:21.000Z","nivel":"info","evento":"eco_registrado","status":"ok"}
{"ts":"2026-10-20T14:05:02.000Z","nivel":"erro","evento":"memorias_corrompidas","codigo":"JSON_INVALIDO"}
```

Regras:
- Campos fixos: `ts`, `nivel` (`info`, `aviso`, `erro`), `evento`; campos opcionais: `codigo`, `status`.
- Não registra sequências, apelidos de alunos nem PINs.
- Ao passar de 1 MiB, o arquivo vira `eco.log.1` (substituindo o anterior) e um novo é iniciado.
