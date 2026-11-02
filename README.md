# financeControl - Front-end

Interface web do financeControl, sistema de controle de finanças pessoais desenvolvido na disciplina de Programação Web e Mobile (UPF). Consome a [API financeControl](https://github.com/Henry-FTres/financeControl-backend) e é a versão web do projeto [financeControl em C++](https://github.com/Henry-FTres/financeControl).

Permite entrar ou criar uma conta (pessoa física ou jurídica), cadastrar contas bancárias, lançar entradas e saídas com o saldo atualizado na hora, organizar as movimentações por categoria e acompanhar metas financeiras.

## Tecnologias

- **Next.js 16** (App Router) com **React 19**
- **TypeScript**
- **CSS** próprio, com os tokens do design system em variáveis CSS (tema claro e escuro automático)
- Fonte **Manrope** pelo `next/font`

## Como rodar

A **API precisa estar rodando** antes, em `http://localhost:3000` (veja o README do backend).

```bash
# 1. instalar as dependências
npm install

# 2. iniciar em modo de desenvolvimento
npm run dev
```

O front-end fica disponível em `http://localhost:3001`. A porta é a 3001 porque a 3000 é usada pela API.

O endereço da API fica em `lib/api.ts`, na constante `API_URL`.

## Telas

| Tela | Rota | O que faz |
|---|---|---|
| Login | `/login` | Entrar com e-mail e senha |
| Cadastro | `/cadastro` | Criar conta de pessoa física (CPF) ou jurídica (CNPJ) |
| Visão geral | `/visao-geral` | Saldo total, entradas e saídas do mês, contas, últimas movimentações e metas |
| Contas | `/contas` | Cadastrar, editar e apagar contas bancárias |
| Movimentações | `/movimentacoes` | Lançar, editar e apagar entradas e saídas, com filtros por conta, categoria e tipo |
| Categorias | `/categorias` | Ver as categorias padrão e gerenciar as próprias |
| Metas | `/metas` | Criar metas, guardar valores e acompanhar o progresso |
| Perfil | `/perfil` | Editar os dados, trocar a senha e apagar a conta |

As telas de login e cadastro são públicas. As demais só abrem com o usuário logado; sem login, a pessoa é levada para `/login`.

## Estrutura

```
app/
  (auth)/          telas públicas: login e cadastro
  (privada)/       telas que exigem login, com o menu lateral
  components/      componentes reutilizáveis (botões, campos, modal, cards, tabela...)
  globals.css      tokens do design system e estilos dos componentes
lib/
  api.ts           chamadas à API (envia o token e trata erros)
  auth.ts          guarda e lê o token de login
  format.ts        formatação de valores em reais e de datas
```

Os parênteses em `(auth)` e `(privada)` criam grupos de rotas no Next.js: organizam as pastas e permitem um layout para cada grupo, sem aparecer no endereço.

## Autenticação

Ao entrar, o token recebido da API é guardado no navegador (`localStorage`) e enviado em todas as requisições no cabeçalho `Authorization: Bearer <token>`. Se a API responder que o token é inválido ou expirou, a pessoa é desconectada e volta para o login.

## Autores

- Manuela Larissa Stivanin - 210542
- Henry Afonso Fiorentin Tres - 208487