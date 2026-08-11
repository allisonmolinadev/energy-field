# Energy Field: site institucional

Site estático (HTML + CSS + JavaScript, sem build) pronto para publicação.
Basta subir o conteúdo desta pasta `docs/` para a hospedagem, ou ativar o GitHub Pages apontando para ela.

---

## 1. O que precisa ser configurado antes de publicar

Tudo o que depende de dado real está reunido em dois lugares.

### a) `assets/js/main.js`, bloco `EF_CONFIG` (primeiras linhas do arquivo)

| Constante | O que fazer |
|---|---|
| `WEBHOOK_URL` | Trocar `'INSERIR_WEBHOOK_AQUI'` pela URL do Make / n8n / Zapier / CRM. Enquanto não for trocada, o formulário funciona em **modo demonstração**: valida, mostra a mensagem de sucesso e imprime o payload no console do navegador. |
| `WHATSAPP_NUMERO` | Número com DDI + DDD, só dígitos. Ex.: `5544999887766`. Ele alimenta **todos** os botões de WhatsApp do site de uma vez. |
| `WHATSAPP_MENSAGEM` | Texto que já vem preenchido na conversa. |
| `ECONOMIA_MAX` / `ECONOMIA_MIN` | Faixa usada na estimativa visual do simulador (padrão 60% a 95%). |
| `REDIRECT_SUCESSO` | Opcional. Se preenchido (ex.: `'/obrigado.html'`), redireciona após o envio em vez de mostrar a mensagem de sucesso na própria página. |

### b) Conteúdo marcado como placeholder no HTML

Procure no `index.html` e `sobre.html` pelo comentário `>>> ATUALIZAR DEPOIS <<<`:

- **Números da empresa** (seção "Resultados que geram confiança"): estão como `+X`.
  Para ativar a animação de contagem, troque `data-count="X"` pelo número real.
  Exemplo: `<span data-count="480">X</span>`. Enquanto for `X`, o contador não anima.
- **Prova social** (seção "Quem já escolheu a Energy Field recomenda"): três cards com
  `[Nome do cliente]` e `[Espaço reservado para a avaliação...]`. Substitua pelas avaliações
  reais do Google. Nenhum depoimento foi inventado.
- **Redes sociais** no rodapé: os links de Instagram e Facebook estão como `href="#"`.
- **E-mail**: `atendimento@energyfield.com.br` aparece no rodapé e nos menus. Ajuste se for outro.
- **Política de Privacidade**: o texto é um modelo base. Revise com o jurídico e acrescente
  razão social, CNPJ, endereço e contato do encarregado de dados.
- **Domínio**: as tags `canonical` e `og:url` apontam para `https://www.energyfield.com.br/`.

---

## 2. Dados enviados pelo formulário

Os dois formulários (o simulador do topo e o da seção de contato) enviam um JSON via `POST`:

```json
{
  "nome": "Maria Souza",
  "telefone": "(44) 99988-7766",
  "telefone_digitos": "44999887766",
  "cidade": "Maringá",
  "tipo_imovel": "Residencial",
  "valor_conta": "R$ 450,00",
  "valor_conta_numero": 450,
  "mensagem": "",
  "formulario": "simulador-topo",

  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "solar_verao",
  "utm_content": "anuncio1",
  "utm_term": "energia solar",

  "pagina_origem": "https://www.energyfield.com.br/?utm_source=google",
  "pagina_titulo": "Energy Field | Energia solar para sua casa ou empresa",
  "referrer": "direto",
  "data_envio": "31/07/2026",
  "hora_envio": "14:32:07",
  "timestamp_iso": "2026-07-31T17:32:07.000Z",
  "dispositivo": "desktop"
}
```

Os UTMs são capturados da URL e **guardados na sessão do navegador**, então continuam sendo
enviados mesmo que a pessoa navegue para outra página antes de preencher o formulário.

Se você já usa GA4 ou Meta Pixel, o site dispara `generate_lead` (gtag) e `Lead` (fbq)
automaticamente quando essas tags existirem na página.

---

## 3. Estrutura de arquivos

```
docs/
├── index.html                     Home (one page com todas as seções)
├── sobre.html                     Sobre nós, missão, visão, valores
├── projetos.html                  Galeria completa com filtros
├── politica-de-privacidade.html   Modelo de política (revisar com o jurídico)
├── LEIA-ME.md                     Este arquivo
├── assets/
│   ├── css/style.css              Design system completo
│   ├── js/main.js                 Interações + formulário + UTMs
│   └── img/                       Fotos, logotipos e ícones
├── fonts/                         Segoe UI Variable (@font-face local)
└── id visual/                     Artes de referência da marca
```

---

## 4. Identidade visual aplicada

**Cores oficiais da marca**, definidas pela Energy Field:

| Uso | Cor | Token |
|---|---|---|
| Azul institucional | `#2a258b` | `--brand-blue`, `--bg` |
| Laranja | `#df9635` | `--brand-sun`, `--sun-500` |
| Azul recuado (card do simulador) | `#241f79` | `--bg-2` |
| Azul de base (rodapé, painéis) | `#1d1963` | `--bg-3` |
| Papel (seções claras) | `#F7F5F1` | `--paper` |

Os dois primeiros são as cores da marca; os demais são a mesma matiz em graus
diferentes, para criar hierarquia entre superfícies. **O azul é sempre chapado, sem
degradê** — não há luz radial nem gradiente de fundo em nenhuma seção.

Os únicos gradientes que restaram têm função e não são decorativos: os véus sobre
fotografia, que garantem a leitura do texto branco por cima da imagem.

A direção visual é de **produto digital**, não de site institucional:

- **Hero em banner de imagem cheia**: a fotografia ocupa toda a primeira dobra, com véu
  horizontal que escurece só o lado do texto (`hero-banner.jpg`, versão leve para telas
  pequenas em `hero-banner-sm.jpg`)
- **Azul da marca** nas demais seções escuras, alternando com papel quente nas claras
- **Superfícies de vidro** (`.pane`, `.tile`, `.step`): branco a 3,5% com borda a 8% e blur
- **Malha fotovoltaica** como textura de fundo (classe `.meshed`), referência ao módulo solar
- **Laranja da marca** nos números de destaque (95%, 120, +X) e em toda ação
- **Bento grid** nos benefícios: blocos de larguras diferentes, um com número grande,
  dois com foto ao fundo
- **Composição assimétrica** em "Para quem é" (colunas 5 / 7 / 12)

Componentes com variação para fundo claro estão na seção 18b do `style.css`.

Para trocar as cores da marca, basta editar `--brand-blue` e `--brand-sun` no topo do
`style.css`: todo o restante da paleta é derivado desses dois tokens.

**Tipografia:** Segoe UI Variable carregada localmente por `@font-face`, sem Google Fonts.
O arquivo entregue é uma instância única da família, então os pesos e o itálico são
sintetizados pelo navegador. Se depois forem entregues os arquivos de cada variação
(semibold, bold, italic), basta acrescentar um `@font-face` por peso no topo do `style.css`.

**Logotipo:** são usados os arquivos oficiais entregues pela Energy Field. As duas versões
ficam sobrepostas no header e alternam sozinhas conforme o fundo:

| Arquivo | Onde aparece |
|---|---|
| `logotipo-branco.png` | header no topo da página (fundo escuro), rodapé |
| `logotipo-azul.png` | header fixo ao rolar (fundo claro), menu mobile aberto |
| `favicon.png` / `apple-touch-icon.png` | ícone do navegador, símbolo sobre o azul da marca |
| `simbolo-azul.png` / `simbolo-branco.png` | símbolo isolado, gerado a partir do logotipo, para usos futuros |

O favicon e os símbolos foram recortados dos próprios arquivos oficiais. Se o logotipo for
atualizado, basta substituir os dois PNGs e regerar os ícones a partir deles.

---

## 5. Trocar as fotos por fotos reais

As fotos em `assets/img/` são provisórias, de banco gratuito, escolhidas com o mesmo
critério: instalação real, luz natural, sem pose. Os logotipos e ícones são os oficiais.

Para substituir, basta **manter o mesmo nome de arquivo**. Nenhum HTML precisa ser alterado.
Recomendação: JPG, largura de 1400px a 1600px, qualidade ~78, com o texto `alt` atualizado
para descrever a foto real.

---

## 6. Projetos reais

Os 27 sistemas exibidos em `projetos.html` (e os 8 em destaque na home) vieram da página
oficial `energyfield.com.br/nossos-projetos`. Cada card traz os dados publicados pela própria
empresa: potência do sistema, quantidade e potência das placas, geração mensal e economia anual.

As fotos ficam em `assets/img/projetos/`, numeradas na mesma ordem da página oficial.

**Filtros:** as faixas (Até 5 kWp / 5 a 10 kWp / Acima de 10 kWp) são calculadas da potência
real de cada sistema, não atribuídas manualmente.

**Etiqueta Residencial / Comercial:** marquei como comercial apenas onde o nome do local deixa
claro (Clínica Médica e Supermercado Sales). O restante ficou como residencial, o que é coerente
com o porte dos sistemas. Se algum projeto for de outro tipo, basta trocar o texto dentro de
`<span class="proj__tag">` no card correspondente.

**Na home** os projetos ficam num carrossel (classe `.fita`): pista com laço
infinito, arrasto pelo ponteiro e setas que avançam um cartão. O JS duplica os
cartões para fechar o laço, então a home não tem filtros — esconder itens
quebraria a emenda. A página de projetos mantém a grade completa com os filtros,
que é onde filtrar faz sentido.

**Para acrescentar um projeto:** copie um bloco `<article class="proj">`, troque a foto, o nome,
a cidade e os três dados da ficha. O `data-cat` deve ser `ate5`, `ate10` ou `acima10` conforme
a potência do sistema.

### Números que dá para preencher

A partir do que está publicado na página oficial:

| Item | Valor |
|---|---|
| Projetos publicados | 27 |
| Placas somadas | 308 |
| Potência somada | 173,53 kWp |

Deixei os `+X` da seção "Resultados que geram confiança" como estão, porque esses números
refletem só os projetos que a empresa escolheu publicar. O total real da Energy Field
provavelmente é maior, e usar esses valores passaria uma imagem menor do que a realidade.

---

## 7. Seção rural

Se a atuação rural deixar de ser prioridade, remova:

- em `index.html`: o `<article class="aud">` com a tag "Rural / Produtor" na seção `#para-quem`;
- nos formulários: a opção `Rural / Produtor` (radio no simulador e `<option>` no formulário de contato);
- em `projetos.html`: os projetos rurais, se houver, ficam identificados pela etiqueta do card.

Nada mais depende dessa seção.
