# Projeto: Power-Up Personalizado para Trello

> **Status:** 📝 Documentação base criada — aguardando definição do produto/ideia. Preencha a seção [## 🎯 Descrição do Produto](https://claude.ai/chat/028e9858-c270-44c9-b24e-ddc459860966#-descri%C3%A7%C3%A3o-do-produto-preencher) mais abaixo quando tiver a ideia definida.

---

## 📌 Sobre este documento

Este arquivo serve como documentação de referência e briefing para o desenvolvimento de um Power-Up customizado do Trello. Ele contém:

1. Conceitos gerais sobre Power-Ups do Trello (o que são, capacidades disponíveis, arquitetura).
2. Stack tecnológica de referência, baseada no projeto `trello-powerup-full-sample`.
3. Estrutura de projeto sugerida.
4. Um espaço reservado para você descrever o produto/funcionalidade que o Power-Up deve entregar.

---

## 🧩 O que é um Power-Up do Trello?

Um **Power-Up** é uma extensão que adiciona funcionalidades ao Trello, permitindo integrar serviços externos ou criar novas interações dentro de boards e cards, sem sair da interface do Trello. Tecnicamente, é uma aplicação web (hospedada externamente) que o Trello carrega dentro de iframes, comunicando-se através do **Power-Up Client Library** (`t.js`/TrelloPowerUp SDK).

### Capacidades (Capabilities) disponíveis

O Trello expõe "pontos de extensão" (capabilities) que um Power-Up pode implementar. As principais são:


| Capability                                         | Onde aparece                        | Uso típico                                                   |
| -------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------ |
| **Board Button**                                   | Topo direito do Board               | Ações globais, abrir painel com dados agregados do board     |
| **Card Buttons**                                   | Barra lateral do Card               | Ações específicas do card (abrir formulário, popup, etc.)    |
| **Card Badges**                                    | Frente do Card (mini board)         | Exibir informações resumidas (contadores, status, ícones)    |
| **Card Detail Badges**                             | Dentro do Card aberto               | Badges mais detalhados, com clique                           |
| **Card Back Section**                              | Dentro do Card, abaixo da descrição | Seções customizadas de conteúdo/dados                        |
| **Card From Url**                                  | Ao colar uma URL num card           | Detectar links de serviços específicos e enriquecer o card   |
| **List Actions**                                   | Menu "..." da Lista                 | Ações em massa sobre cards da lista                          |
| **List Sorters**                                   | Menu "..." da Lista                 | Ordenar cards por critério customizado                       |
| **Board Bar**                                      | Barra inferior do Board             | Informações/ações fixas no board                             |
| **Settings**                                       | Menu do Power-Up no Board           | Tela de configuração global do Power-Up                      |
| **Authorization Status / Show Authorization**      | Configuração                        | Fluxo de autenticação com serviços externos (OAuth, API key) |
| **Attachment Sections** / **Attachment Thumbnail** | Anexos do Card                      | Customizar exibição de anexos vindos de serviços externos    |
| **Format Url**                                     | Links dentro do Trello              | Customizar como uma URL é exibida                            |


> Referência oficial: [Trello Power-Up Capabilities](https://developer.atlassian.com/cloud/trello/power-ups/capabilities/)

---

## 🏗️ Arquitetura típica

```
Trello (board/card) 
   └── carrega Power-Up via iframe
         └── capabilities.ts  → define quais capacidades estão ativas
               └── cada capability renderiza uma página/rota própria
                     └── UI (React, Vue, HTML puro, etc.)
                           └── comunica com API própria (se houver backend)
                                 └── ou direto com REST API do Trello

```

- O **manifesto** do Power-Up (endpoint `/manifest.json` ou similar) descreve nome, ícone, autor, etc.
- O arquivo de **capabilities** registra funções JS que o Trello chama em cada evento (ex: `card-buttons`, `board-buttons`).
- Cada capability geralmente abre uma **rota própria** (via `t.popup`, `t.overlay`, `t.card`, etc.) que renderiza a interface.
- Autenticação com Trello é feita via **API Key + Token** (REST API) quando o Power-Up precisa ler/escrever dados do board além do que o SDK já fornece.

---

## 🛠️ Stack do projeto (adaptada do `trello-powerup-full-sample` para Vue.js)

O sample original usa React; a arquitetura de capabilities/SDK é a mesma independente do framework de UI, então a adaptação para **Vue.js** é direta — muda só a camada de componentes/build.


| Camada                        | Tecnologia                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| Linguagem                     | TypeScript                                                                                     |
| UI                            | **Vue 3** (Composition API + `<script setup>`)                                                 |
| Build                         | **Vite** (recomendado — dev server + HMR nativos, múltiplos entry points fáceis de configurar) |
| Alternativa de build          | Webpack + `vue-loader` (se quiser manter fiel à estrutura do sample original)                  |
| Lint                          | ESLint (+ `eslint-plugin-vue`)                                                                 |
| Estado local                  | `reactive`/`ref` (Composition API) — dispensa Vuex/Pinia para um Power-Up pequeno              |
| Roteamento entre capabilities | Múltiplas *entradas* HTML (uma por capability), sem necessidade de Vue Router                  |
| Hospedagem (produção)         | Arquivos estáticos (S3, GitHub Pages, Azure Storage, etc.) ou runtime simples (Node/Docker)    |
| Monetização (opcional)        | Integração com [Optro](https://www.optro.cloud/about)                                          |


> 💡 Como cada capability do Trello abre sua própria página em um iframe isolado, não é necessário Vue Router: cada capability é sua própria mini-SPA Vue, montada em um HTML de entrada dedicado (o Vite lida bem com múltiplos `entry points` via `build.rollupOptions.input`).

### Scripts comuns (com Vite)

- `npm run dev` → sobe o Vite dev server local (HTTPS via plugin, ou por trás de um túnel como ngrok/cloudflared) para testar direto no Trello.
- `npm run build` → gera build de produção estático em `dist/`.
- `npm run preview` → serve o build de produção localmente para conferência.

### Estrutura de pastas sugerida

```
src/
  capabilities.ts          # Registro das capabilities habilitadas (chama TrelloPowerUp.initialize)
  components/
    CalculadoraTempo.vue   # Componente com a lógica + UI dos 4 badges
    DateRangeFields.vue    # Componente dos inputs Data Inicial / Data Final
  composables/
    useTaskTimeCalc.ts     # Composable com a regra de negócio (cálculo dos badges)
  api/
    trello.ts              # Wrappers sobre o Power-Up SDK (t.get/t.set) e REST API do Trello
  types/
    trello.d.ts             # Tipagens do Power-Up SDK / REST API
  pages/
    card-back-section.ts    # Entry point que monta o Vue app da seção do card
    card-badges.ts           # Entry point que monta/calcula os badges da frente do card
static/                     # Ícones, favicon, assets fixos
index.html                  # Entry raiz (capabilities.ts)
card-back-section.html      # Entry HTML da capability Card Back Section
.env.example                 # Variáveis de ambiente (POWERUP_NAME, POWERUP_ID, POWERUP_APP_KEY)
vite.config.ts                # Configuração do Vite (multi-entry)

```

---

## 🔑 Pré-requisitos para começar a desenvolver

1. Criar o Power-Up no [Trello Power-Ups Admin](https://trello.com/power-ups/admin).
2. Obter o **App Key** em [trello.com/app-key](https://trello.com/app-key).
3. Anotar o **Power-Up ID** (aparece na URL da página de configuração, ex: `trello.com/power-ups/abc001/edit`).
4. Definir, na aba "Capabilities" do admin, quais capacidades serão habilitadas (deve bater com o que for implementado no código).
5. Durante o desenvolvimento, apontar o campo **"Iframe Connector URL"** para a URL local/túnel (ex: gerada pelo ngrok).

---

## 🎯 Descrição do Produto

### Nome do Power-Up

**Calculadora de Tempo de Task**

### Problema que resolve

Times que trabalham com prazos (ex: SGV, visitas acompanhadas, relatórios) precisam saber rapidamente, olhando o card, quantos dias uma tarefa deve durar, quantos dias faltam para o prazo e se ela já está atrasada — sem precisar calcular isso manualmente a partir das datas.

### Público-alvo

Times/áreas que gerenciam tarefas com prazo definido dentro de boards do Trello (ex: times comerciais, operacionais, de suporte).

### Funcionalidades principais

- [x] Dois campos de data personalizados no card (**Data Inicial** e **Data Final**) — Capability: **Card Back Section**
- [x] Painel "Calculadora de tempo de task" dentro do card aberto, com título + 4 badges coloridos — Capability: **Card Back Section**
- [x] Repetição resumida dos mesmos badges na frente do card (mini card no board) — Capability: **Card Badges**
- [x] Cálculo automático a partir das datas informadas + data real de conclusão do card no Trello

### Regra de negócio

O usuário define dois campos de data no card: **Data Inicial** e **Data Final**. A partir deles (e da data atual / data real de conclusão do card), o Power-Up calcula e exibe 4 indicadores, sempre nesta ordem:


| Ordem | Badge                  | Cor                  | Cálculo                                                                                                                                                                                                 |
| ----- | ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | **Tempo de task**      | 🔵 Azul (primary)    | `Data Final − Data Inicial` → total de dias do intervalo planejado                                                                                                                                      |
| 2     | **Dias até finalizar** | 🟡 Amarelo (warning) | `Data Final − Data de hoje` → quantos dias faltam para o prazo (se já passou, tratar junto com o item 3)                                                                                                |
| 3     | **Atrasos (dias)**     | 🔴 Vermelho (danger) | Se `Data de hoje > Data Final` **e** o card ainda não foi concluído → `Data de hoje − Data Final`. Caso contrário → `0`                                                                                 |
| 4     | **Total de dias**      | 🟢 Verde (success)   | `Data Final − Data Inicial` (igual ao item 1); se a conclusão real do card (data em que o Trello marca o card/checklist como concluído) ultrapassar a Data Final, somar os dias excedentes a este total |


> ℹ️ A "data real de conclusão" deve vir de um evento do próprio Trello (ex: card marcado como completo / movido para a lista de "Concluído" / `dueComplete`), não de um campo digitado manualmente — conforme pedido, ela precisa refletir a conclusão real da task.

### UI — mapeamento com as imagens de referência

**1) Dentro do card aberto ("quadro da task" —** `img-quadro-aberto.jpg`**)** Seção abaixo da Descrição (Card Back Section), contendo:

- Título: `Calculadora de tempo de task`
- Dois inputs de data lado a lado: `Data inicial` e `Data final`
- Logo abaixo, os 4 badges na ordem da tabela acima, cada um com um rótulo em cima e o número dentro de um bloco colorido (azul, amarelo, vermelho, verde).

**2) Frente do card no board (mini card —** `img-card.png`**)** Mesmo conjunto de badges (título + 4 blocos coloridos), exibido de forma resumida junto às labels/data de início já existentes no card.

> ⚠️ **Nota técnica importante:** a capability **Card Badges** (frente do card) é renderizada pelo próprio Trello com um layout fixo — pequenos "pills" com ícone + texto curto, um por linha/badge, sem suporte a título de seção nem a blocos grandes com rótulo + número como no mockup. Dá para chegar bastante perto do visual (4 badges coloridos com o número, ex: `🔵 10` `🟡 5` `🔴 10` `🟢 30`), mas o layout "caixa grande com rótulo em cima", como na imagem, só é 100% fiel dentro do **Card Detail Badges** (expandido) ou do **Card Back Section** — onde o Power-Up controla o HTML/CSS livremente. Vale alinhar expectativa sobre isso antes de começar a implementação visual da frente do card.

### Dados que o Power-Up precisa ler/escrever

- Escrever: duas datas customizadas por card (Data Inicial, Data Final) — via `t.set('card', 'shared', ...)` do Power-Up SDK.
- Ler: data atual do dispositivo/servidor; status de conclusão do card (`dueComplete` ou lista atual do card) para saber a data real de finalização.

### Integrações externas

Não identificada necessidade de backend externo até o momento — os cálculos podem ser feitos client-side com os dados do próprio card via Power-Up SDK. A confirmar conforme o desenvolvimento avançar.

### Monetização

*(a definir)*

### Referências visuais

- `img-quadro-aberto.jpg` — card aberto, mostrando os 2 campos de data + os 4 badges.
- `img-card.png` — mini card no board, mostrando o título + os 4 badges resumidos.

---

## 🧭 Mapeamento de Funcionalidades → Capabilities do Trello

Cada funcionalidade do "Calculadora de Tempo de Task" mapeada para a capability oficial do Trello que a implementa, com o método/gatilho do Power-Up SDK envolvido.

### 1. `card-back-section` — Campos de data + painel de badges (dentro do card aberto)


| Item                 | Detalhe                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **O que exibe**      | Título "Calculadora de tempo de task" + inputs `Data inicial`/`Data final` + os 4 badges (igual `img-quadro-aberto.jpg`) |
| **Quando é chamada** | Sempre que o card é aberto (Trello chama a função registrada)                                                            |
| **Retorno esperado** | `{ title, icon, content: { type: 'iframe', url: t.signUrl('./card-back-section.html') } }`                               |
| **Componente Vue**   | `CalculadoraTempo.vue` (monta `DateRangeFields.vue` + os 4 badges)                                                       |
| **Leitura de dados** | `t.get('card', 'shared', 'dataInicial')`, `t.get('card', 'shared', 'dataFinal')`                                         |
| **Escrita de dados** | `t.set('card', 'shared', 'dataInicial', valor)` / `dataFinal` a cada alteração dos inputs                                |
| **Cálculo**          | Roda o composable `useTaskTimeCalc` sempre que as datas ou o card mudam                                                  |


### 2. `card-badges` — Badges resumidos na frente do card (mini card no board)


| Item                 | Detalhe                                                                                                                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **O que exibe**      | Versão compacta dos 4 indicadores (igual `img-card.png`), como badges nativos do Trello                                                                                                                                                                           |
| **Quando é chamada** | Toda vez que o Trello renderiza a frente de um card no board                                                                                                                                                                                                      |
| **Retorno esperado** | Array de badges, ex.: `[{ text: '10', color: 'blue' }, { text: '5', color: 'yellow' }, { text: '10', color: 'red' }, { text: '30', color: 'green' }]` (mapeando: Tempo de task → `blue`, Dias até finalizar → `yellow`, Atrasos → `red`, Total de dias → `green`) |
| **Leitura de dados** | Mesmos `t.get('card', 'shared', ...)` usados na seção anterior — reaproveitar o composable `useTaskTimeCalc`                                                                                                                                                      |
| **Limitação**        | Layout fixo do Trello (pill com ícone+texto); não há título de seção nem blocos com rótulo em cima — ver nota técnica acima                                                                                                                                       |


### 3. `card-detail-badges` (opcional, recomendado) — Badges expandidos com rótulo


| Item                 | Detalhe                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **O que exibe**      | Mesmos 4 indicadores, mas clicáveis e com texto mais descritivo (ex: "Atrasos: 10 dias") — mais próximo do mockup do que o `card-badges` puro |
| **Quando é chamada** | Ao abrir o card, na área de badges de detalhe                                                                                                 |
| **Retorno esperado** | Array de badges com `title` (rótulo) + `text` (valor) + `color`                                                                               |
| **Uso sugerido**     | Complementa o `card-badges` da frente do card, dando o rótulo que a capability de frente não permite mostrar                                  |


### 4. Evento de conclusão real da task (para o cálculo de "Total de dias"/"Atrasos")


| Item                     | Detalhe                                                                                                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fonte do dado**        | REST API do Trello: campo `dueComplete` do card, ou timestamp de quando o card entrou na lista "Concluído"/"Done" (via `GET /1/cards/{id}/actions?filter=updateCard:idList`) |
| **Onde é consumido**     | Dentro do composable `useTaskTimeCalc`, para decidir se ainda soma atraso ou se já "trava" o cálculo na data real de conclusão                                               |
| **Capability envolvida** | Não é uma capability de UI — é uma chamada à REST API feita a partir do `card-back-section` e do `card-badges`                                                               |


### Resumo — tabela geral


| Funcionalidade                     | Capability                                   | Arquivo/entry sugerido                                        |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| Inputs de Data Inicial/Final       | `card-back-section`                          | `card-back-section.html` + `CalculadoraTempo.vue`             |
| Painel de 4 badges no card aberto  | `card-back-section`                          | mesmo componente acima                                        |
| Badges resumidos na frente do card | `card-badges`                                | `pages/card-badges.ts` (sem UI Vue — apenas retorno de dados) |
| Badges com rótulo (opcional)       | `card-detail-badges`                         | `pages/card-detail-badges.ts`                                 |
| Data real de conclusão             | REST API do Trello (`dueComplete` / actions) | `api/trello.ts`                                               |


---

## 📚 Referências úteis

- [Guia oficial: Your First Power-Up](https://developer.atlassian.com/cloud/trello/guides/power-ups/your-first-power-up/)
- [Referência de Capabilities](https://developer.atlassian.com/cloud/trello/power-ups/capabilities/)
- [Referência da REST API do Trello](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/)
- [Repositório de exemplo (trello-powerup-full-sample)](https://github.com/optro-cloud/trello-powerup-full-sample)
- [Gerador de projeto (create-trello-powerup)](https://github.com/optro-cloud/create-trello-powerup)
- [Comunidade de desenvolvedores Atlassian](https://community.developer.atlassian.com/)

---

