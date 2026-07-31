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
- **E-mail**: `contato@energyfield.com.br` aparece no rodapé e nos menus. Ajuste se for outro.
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
│   └── img/                       Fotos, logo SVG e favicon
├── fonts/                         Segoe UI Variable (@font-face local)
└── id visual/                     Artes de referência da marca
```

---

## 4. Identidade visual aplicada

Cores amostradas **pixel a pixel do logotipo oficial** (`logotipo-azul.png`), complementadas
pelo azul elétrico das artes da pasta `id visual/`:

| Uso | Cor | Origem |
|---|---|---|
| Índigo institucional | `#302868` | cor exata do logotipo |
| Laranja solar (CTAs e realces) | `#F09028` | cor exata do sol do logotipo |
| Fundos profundos | `#151140` / `#0B0920` | escala derivada do índigo |
| Azul elétrico (destaques) | `#3355F7` / `#2B47DD` | artes de redes sociais |
| Âmbar de apoio | `#FFC46A` | derivado do laranja |

Elementos de linguagem reaproveitados das peças: blocos de canto assimétrico
(`34px 34px 34px 6px`), pílulas de destaque em azul elétrico e laranja sobre as
palavras-chave, e a malha do globo da marca como marca d'água no topo.

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
| `favicon.png` / `apple-touch-icon.png` | ícone do navegador, símbolo sobre o índigo da marca |
| `simbolo-azul.png` / `simbolo-branco.png` | símbolo isolado, gerado a partir do logotipo, para usos futuros |

O favicon e os símbolos foram recortados dos próprios arquivos oficiais. Se o logotipo for
atualizado, basta substituir os dois PNGs e regerar os ícones a partir deles.

---

## 5. Trocar as fotos por fotos reais

As imagens em `assets/img/` são provisórias (bancos gratuitos), exceto
`marca-familia-casa.jpg` e `marca-instalacao-familia.jpg`, que foram recortadas das artes
oficiais da marca.

Para substituir, basta **manter o mesmo nome de arquivo**. Nenhum HTML precisa ser alterado.
Recomendação: JPG, largura de 1400px a 1600px, qualidade ~78, com o texto `alt` atualizado
para descrever a foto real.

---

## 6. Seção rural

Se a atuação rural deixar de ser prioridade, remova:

- em `index.html`: o `<article class="aud">` com a tag "Rural / Produtor" na seção `#para-quem`;
- nos formulários: a opção `Rural / Produtor` (radio no simulador e `<option>` no formulário de contato);
- em `projetos.html`: o botão `data-filter="rural"` e os cards com `data-cat="rural"`.

Nada mais depende dessa seção.
