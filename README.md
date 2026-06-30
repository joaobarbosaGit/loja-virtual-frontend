# Loja Virtual Frontend

Frontend da loja virtual, feito com React, Vite, TypeScript e Material UI.

## Requisitos

- Node.js instalado.
- npm instalado.
- API `cad-api` rodando.

No Windows, se o PowerShell bloquear o comando `npm`, use `npm.cmd` nos exemplos.

## Instalacao

Entre na pasta do frontend:

```bash
cd loja-virtual-frontend
```

Instale as dependencias:

```bash
npm install
```

ou, no Windows:

```bash
npm.cmd install
```

## Configuracao

Crie um arquivo `.env` na raiz de `loja-virtual-frontend`, se precisar sobrescrever os valores padrao.

Exemplo:

```env
VITE_API_BASE_URL=http://localhost:3333
VITE_STORE_SLUG=minha-loja
VITE_PAYMENT_PROVIDER=manual
```

Valores:

- `VITE_API_BASE_URL`: endereco da API.
- `VITE_STORE_SLUG`: slug da loja que sera carregada.
- `VITE_PAYMENT_PROVIDER`: provedor de pagamento usado no checkout.

Se o `.env` nao existir, o projeto usa estes padroes:

```text
VITE_API_BASE_URL=http://localhost:3333
VITE_STORE_SLUG=minha-loja
VITE_PAYMENT_PROVIDER=manual
```

## Rodando em desenvolvimento

Antes de iniciar o frontend, suba a API:

```bash
cd ../cad-api
npm run dev
```

Depois, em outro terminal, inicie o frontend:

```bash
cd ../loja-virtual-frontend
npm run dev
```

ou, no Windows:

```bash
npm.cmd run dev
```

O Vite normalmente abre em:

```text
http://localhost:5173
```

Se essa porta estiver ocupada, o Vite mostra outra porta no terminal.

## Build de producao

```bash
npm run build
```

ou:

```bash
npm.cmd run build
```

Para testar o build localmente:

```bash
npm run preview
```

## Scripts disponiveis

- `npm run dev`: inicia o Vite em modo desenvolvimento.
- `npm start`: tambem inicia o Vite.
- `npm run build`: valida TypeScript e gera o build em `dist`.
- `npm run preview`: serve o build gerado para conferencia.

## Fluxo recomendado para rodar tudo local

1. Inicie o Firebird.
2. Configure o `.env` da API.
3. Rode a API em `cad-api`:

```bash
npm run dev
```

4. Configure o `.env` do frontend, se necessario.
5. Rode o frontend em `loja-virtual-frontend`:

```bash
npm run dev
```

6. Abra a URL mostrada pelo Vite, normalmente:

```text
http://localhost:5173
```

## Telas principais

- `/home`: tela principal da loja.
- `/products`: listagem de produtos.
- `/cart`: carrinho.
- `/checkout`: finalizacao.
- `/profile`: perfil do cliente.
- `/admin/produtos-loja`: administracao de produtos visiveis na loja.
- `/admin/destaques`: administracao dos destaques.
- `/admin/pedidos`: administracao de pedidos.
- `/admin/pagamentos`: formas de pagamento.
- `/admin/configuracoes`: configuracoes visuais da loja.

## Destaques da loja

O carrossel da tela inicial usa os produtos configurados em:

```text
/admin/destaques
```

Para um produto aparecer no carrossel:

1. O produto precisa estar marcado como visivel na loja.
2. O admin deve adicionar o produto em destaques.
3. O admin deve definir uma imagem para o destaque.
4. A API deve estar rodando com o banco atualizado.

## Problemas comuns

### A tela nao carrega dados

Verifique se a API esta rodando:

```text
http://localhost:3333/loja/minha-loja/config
```

Se o slug da loja for diferente, ajuste `VITE_STORE_SLUG`.

### PowerShell bloqueou `npm.ps1`

Use:

```bash
npm.cmd run dev
```

### Destaques nao aparecem na Home

Confira:

- Se existe destaque cadastrado no admin.
- Se o produto do destaque esta visivel na loja.
- Se a API foi reiniciada depois de alteracoes no backend.
- Se `VITE_STORE_SLUG` aponta para a loja correta.
