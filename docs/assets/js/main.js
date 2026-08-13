/* ==========================================================================
   ENERGY FIELD / main.js
   ==========================================================================
   >>> CONFIGURAÇÃO RÁPIDA <<<
   Edite o bloco EF_CONFIG abaixo para colocar o site no ar.
   ========================================================================== */

const EF_CONFIG = {
  /* ---------------------------------------------------------------------
     1) WEBHOOK: cole aqui a URL de integração (Make, n8n, Zapier, CRM...).
        Enquanto estiver com o valor padrão, o formulário funciona em modo
        demonstração: valida, mostra sucesso e registra os dados no console.
     --------------------------------------------------------------------- */
  WEBHOOK_URL: 'INSERIR_WEBHOOK_AQUI',

  /* ---------------------------------------------------------------------
     2) WHATSAPP: número com DDI + DDD, apenas dígitos. Ex.: 5544999999999
     --------------------------------------------------------------------- */
  WHATSAPP_NUMERO: '5517997928023',
  WHATSAPP_MENSAGEM: 'Olá! Vim pelo site da Energy Field e quero simular minha economia com energia solar.',

  /* ---------------------------------------------------------------------
     3) SIMULADOR: percentuais usados na estimativa visual.
        Comunicação sempre em "pode chegar a até", nunca promessa absoluta.
     --------------------------------------------------------------------- */
  ECONOMIA_MAX: 95,   // % máximo comunicado
  ECONOMIA_MIN: 60,   // % mínimo usado na faixa da estimativa
  ECONOMIA_CALCULADORA: 85,   // % usado na calculadora rápida abaixo do Hero

  /* ---------------------------------------------------------------------
     4) Redirecionamento opcional após o envio (ex.: '/obrigado.html').
        Deixe null para exibir a mensagem de sucesso na própria página.
     --------------------------------------------------------------------- */
  REDIRECT_SUCESSO: null,
};

/* Percentual único da calculadora rápida: conta × SAVINGS_PERCENTAGE% */
const SAVINGS_PERCENTAGE = EF_CONFIG.ECONOMIA_CALCULADORA;

/* Link de WhatsApp montado a partir da configuração */
const EF_WHATSAPP_LINK =
  'https://wa.me/' + EF_CONFIG.WHATSAPP_NUMERO +
  '?text=' + encodeURIComponent(EF_CONFIG.WHATSAPP_MENSAGEM);

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ======================================================================
     WHATSAPP: aplica o link configurado em todos os pontos do site
     ====================================================================== */
  function initWhatsappLinks() {
    $$('[data-wa]').forEach(el => { el.href = EF_WHATSAPP_LINK; });
  }

  /* ======================================================================
     HEADER: estado "grudado" ao rolar
     ====================================================================== */
  function initHeader() {
    const header = $('.header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ======================================================================
     MENU MOBILE
     ====================================================================== */
  function initMobileNav() {
    const burger = $('.burger');
    const nav = $('.mobile-nav');
    if (!burger || !nav) return;

    const close = () => {
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => {
      const open = !document.body.classList.contains('nav-open');
      document.body.classList.toggle('nav-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', String(open));
    };

    burger.addEventListener('click', toggle);
    $$('a', nav).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) close(); });
  }

  /* ======================================================================
     ANIMAÇÕES DE ENTRADA
     ====================================================================== */
  function initReveal() {
    const els = $$('[data-anim]');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('is-in'), delay * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(el => io.observe(el));
  }

  /* ======================================================================
     PARALLAX DISCRETO NAS FOTOS DE DESTAQUE
     Deslocamento pequeno, só enquanto o elemento está na tela.
     ====================================================================== */
  function initParallax() {
    const els = $$('[data-parallax]');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;

    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const fator = parseFloat(el.dataset.parallax) || 0.04;
        // -1 no topo da tela, +1 embaixo
        const progresso = ((r.top + r.height / 2) - vh / 2) / (vh / 2);
        el.style.transform = 'translate3d(0,' + (progresso * fator * 100).toFixed(2) + 'px,0) scale(1.06)';
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /* ======================================================================
     NAVEGAÇÃO ATIVA POR SEÇÃO
     ====================================================================== */
  function initScrollSpy() {
    const links = $$('.nav__link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const map = new Map();
    links.forEach(link => {
      const sec = document.getElementById(link.getAttribute('href').slice(1));
      if (sec) map.set(sec, link);
    });
    if (!map.size) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(l => l.classList.remove('is-active'));
        map.get(entry.target)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    map.forEach((_, sec) => io.observe(sec));
  }

  /* ======================================================================
     FAQ: accordion
     ====================================================================== */
  function initFaq() {
    const items = $$('.faq__item');
    items.forEach(item => {
      const btn = $('.faq__q', item);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        items.forEach(i => {
          i.classList.remove('is-open');
          $('.faq__q', i)?.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ======================================================================
     CONTADORES DE NÚMEROS
     ====================================================================== */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;

    // data-decimals atende números quebrados, como o 2,5 de "R$ 2,5M"
    const casasDe = (el) => parseInt(el.dataset.decimals || '0', 10);
    const formatar = (n, casas) => n.toLocaleString('pt-BR', {
      minimumFractionDigits: casas, maximumFractionDigits: casas
    });

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => {
        const alvo = parseFloat(el.dataset.count);
        if (!isNaN(alvo)) el.textContent = formatar(alvo, casasDe(el));
      });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);

        const target = parseFloat(el.dataset.count);
        // Placeholders ainda não preenchidos (X) permanecem como estão
        if (isNaN(target)) return;

        const casas = casasDe(el);
        const dur = 1500;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = formatar(target * eased, casas);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  }

  /* ======================================================================
     BARRAS ANIMADAS (comparativo conta x parcela)
     ====================================================================== */
  function initBars() {
    const bars = $$('[data-bar]');
    if (!bars.length) return;
    if (!('IntersectionObserver' in window)) {
      bars.forEach(b => { b.style.width = b.dataset.bar; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        setTimeout(() => { el.style.width = el.dataset.bar; }, 180);
      });
    }, { threshold: 0.35 });
    bars.forEach(b => io.observe(b));
  }

  /* ======================================================================
     FITA: carrossel horizontal com laço infinito, arrasto e setas
     A posição é controlada aqui, e não por animação CSS, porque as setas e
     o arrasto precisam dividir o mesmo valor.
     ====================================================================== */
  function initFitas() {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const VELOCIDADE = 26; // px por segundo do avanço contínuo

    $$('[data-fita]').forEach((caixa) => {
      const pista = $('.fita__pista', caixa);
      if (!pista) return;

      // Guarda os cartões originais: é a partir deles que a pista é remontada
      // quando um filtro muda o conjunto exibido.
      const originais = [...pista.children].map((n) => n.cloneNode(true));

      let ciclo = 0;              // largura de um conjunto completo
      let pos = 0, resta = 0;
      let pausado = false, arrastando = false, ultimoX = 0, andou = 0, anterior = null;

      /* Repete o conjunto até a pista cobrir mais que o dobro da tela. Com
         poucos cartões, uma cópia só deixaria buraco antes da emenda. */
      const montar = (itens) => {
        pista.innerHTML = '';
        pista.style.width = '';
        itens.forEach((n) => pista.appendChild(n.cloneNode(true)));
        ciclo = pista.scrollWidth;
        if (!ciclo) return;

        const alvo = caixa.clientWidth * 2 + ciclo;
        let voltas = 1;
        while (pista.scrollWidth < alvo && voltas < 14) {
          itens.forEach((n) => {
            const copia = n.cloneNode(true);
            copia.setAttribute('aria-hidden', 'true');
            copia.querySelectorAll('img').forEach((el) => { el.alt = ''; });
            pista.appendChild(copia);
          });
          voltas++;
        }
        pista.style.width = pista.scrollWidth + 'px';
        pos = 0; resta = 0;
      };

      montar(originais);

      // usado pelos filtros: refaz a pista só com os cartões da categoria
      caixa.repovoar = (cat) => {
        const vis = (!cat || cat === 'todos')
          ? originais
          : originais.filter((n) => n.dataset.cat === cat);
        atual = vis.length ? vis : originais;
        montar(atual);
      };

      // ao redimensionar, o número de repetições muda: remonta com o conjunto atual
      let t, atual = originais;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => montar(atual), 200); });

      const passo = (agora) => {
        if (anterior === null) anterior = agora;
        const dt = Math.min((agora - anterior) / 1000, 0.05); // trava saltos ao voltar de outra aba
        anterior = agora;

        // avanço contínuo: só para no hover, no arrasto ou com movimento reduzido
        if (!pausado && !arrastando && !reduzido) pos -= VELOCIDADE * dt;

        if (resta !== 0 && !arrastando) {
          const avanco = resta * Math.min(1, dt * 9);
          pos += avanco;
          resta -= avanco;
          if (Math.abs(resta) < 0.5) { pos += resta; resta = 0; }
        }
        if (ciclo > 0) {
          // mantém a posição dentro de um conjunto: o laço fica infinito nos dois sentidos
          while (pos <= -ciclo) pos += ciclo;
          while (pos > 0) pos -= ciclo;
        }
        pista.style.transform = 'translate3d(' + pos.toFixed(2) + 'px,0,0)';
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);

      caixa.addEventListener('pointerenter', () => { pausado = true; });
      caixa.addEventListener('pointerleave', () => { pausado = false; });
      caixa.addEventListener('focusin', () => { pausado = true; });
      caixa.addEventListener('focusout', () => { pausado = false; });

      caixa.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        arrastando = true; andou = 0; ultimoX = e.clientX;
        caixa.setPointerCapture(e.pointerId);
        caixa.classList.add('is-arrastando');
      });
      caixa.addEventListener('pointermove', (e) => {
        if (!arrastando) return;
        const d = e.clientX - ultimoX;
        ultimoX = e.clientX;
        andou += Math.abs(d);
        pos += d;
      });
      const soltar = (e) => {
        if (!arrastando) return;
        arrastando = false;
        caixa.classList.remove('is-arrastando');
        if (caixa.hasPointerCapture?.(e.pointerId)) caixa.releasePointerCapture(e.pointerId);
      };
      caixa.addEventListener('pointerup', soltar);
      caixa.addEventListener('pointercancel', soltar);
      // um arrasto não deve virar clique em algo dentro da fita
      caixa.addEventListener('click', (e) => {
        if (andou > 6) { e.preventDefault(); e.stopPropagation(); }
      }, true);

      // usado pelas setas: um clique anda um cartão
      caixa.avancar = (dir) => {
        const item = pista.children[0];
        if (!item) return;
        const largura = item.getBoundingClientRect().width +
          (parseFloat(getComputedStyle(item).marginRight) || 0);
        if (reduzido) { pos -= dir * largura; return; }
        resta -= dir * largura;
      };

      caixa.classList.add('is-loop');
    });

    // Sem fita montada, o controle some em vez de ficar inerte na tela
    $$('[data-fita-nav]').forEach((botao) => {
      const alvo = document.getElementById(botao.dataset.alvo);
      if (!alvo || typeof alvo.avancar !== 'function') { botao.remove(); return; }
      botao.addEventListener('click', () => alvo.avancar(botao.dataset.fitaNav === 'next' ? 1 : -1));
    });
  }

  /* ======================================================================
     GALERIA DE PROJETOS: filtros
     ====================================================================== */
  function initGallery() {
    const filters = $$('[data-filter]');
    if (!filters.length) return;

    // Quando os cartões estão numa fita, filtrar não é esconder: a pista é
    // remontada só com a categoria escolhida, senão o laço ficaria com buracos.
    const fita = $('[data-fita]');
    const shots = $$('.shot[data-cat], .proj[data-cat]');
    if (!fita && !shots.length) return;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.filter;

        if (fita && typeof fita.repovoar === 'function') {
          fita.repovoar(cat);
          return;
        }
        shots.forEach(shot => {
          const show = cat === 'todos' || shot.dataset.cat === cat;
          shot.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  /* ======================================================================
     MÁSCARAS DE ENTRADA
     ====================================================================== */
  function maskPhone(v) {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function maskMoney(v) {
    const d = v.replace(/\D/g, '');
    if (!d) return '';
    return 'R$ ' + (parseInt(d, 10) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  const moneyToNumber = (v) => {
    const d = String(v).replace(/\D/g, '');
    return d ? parseInt(d, 10) / 100 : 0;
  };

  /* Formata um número no padrão brasileiro: 1.275,5 -> "1.275,50" */
  const numeroBR = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const brl = (n) => 'R$ ' + numeroBR(n);

  /* ----------------------------------------------------------------------
     Leitura de valor digitado livremente, sem máscara.
     Aceita 600 | 600,50 | 600.50 | 1.200,00 | 1,200.00 e devolve 0 para
     entrada vazia, inválida, zero ou negativa.
     ---------------------------------------------------------------------- */
  function parseValorBR(v) {
    const bruto = String(v);
    if (bruto.indexOf('-') > -1) return 0;   // valor negativo não gera economia

    let s = bruto.replace(/[^\d.,]/g, '');
    if (!s) return 0;

    const temVirgula = s.indexOf(',') > -1;
    const temPonto   = s.indexOf('.') > -1;

    if (temVirgula && temPonto) {
      // O separador que aparece por último é o decimal
      s = s.lastIndexOf(',') > s.lastIndexOf('.')
        ? s.replace(/\./g, '').replace(',', '.')
        : s.replace(/,/g, '');
    } else if (temVirgula) {
      // Só a última vírgula é decimal: "1,200,50" -> "1200.50"
      s = s.replace(/,(?=[\s\S]*,)/g, '').replace(',', '.');
    } else if (/\.\d{3}(?!\d)/.test(s)) {
      // Ponto seguido de três dígitos é separador de milhar: "1.200" -> 1200
      s = s.replace(/\./g, '');
    }

    const n = parseFloat(s);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function initMasks() {
    $$('[data-mask="phone"]').forEach(inp => {
      inp.addEventListener('input', () => { inp.value = maskPhone(inp.value); });
    });
    $$('[data-mask="money"]').forEach(inp => {
      inp.addEventListener('input', () => { inp.value = maskMoney(inp.value); });
    });
  }

  /* ======================================================================
     CALCULADORA DE ECONOMIA (bloco logo abaixo do Hero)
     Fluxo: digita o valor -> clica em "Calcular economia" -> breve
     processamento -> resultado (conta × SAVINGS_PERCENTAGE%).
     ====================================================================== */
  const CALC_DELAY = 1100;   // ms de processamento simulado, entre 800 e 1500

  function initCalculator() {
    const input  = $('[data-calc-input]');
    const saida  = $('[data-calc-result]');
    const painel = $('[data-calc-out]');
    const botao  = $('[data-calc-run]');
    if (!input || !saida || !painel || !botao) return;

    const campo  = input.closest('.calc__control');
    const base   = $('[data-calc-base]');
    const erro   = $('[data-calc-error]');
    const cta    = $('[data-calc-cta]');
    const rotulo = $('.btn__label', botao);
    const rotuloPadrao = rotulo ? rotulo.textContent : '';
    let timer = null;

    function marcarErro(ativo) {
      if (erro)  erro.classList.toggle('is-visible', ativo);
      if (campo) campo.classList.toggle('is-invalid', ativo);
    }

    /* Limpa o resultado anterior: ele deixa de valer assim que o valor muda */
    function limparResultado() {
      clearTimeout(timer);
      painel.classList.remove('is-loading', 'is-done');
      encerrarBotao();
    }

    function encerrarBotao() {
      botao.classList.remove('is-loading');
      botao.disabled = false;
      if (rotulo) rotulo.textContent = rotuloPadrao;
    }

    function calculateSavings() {
      const conta = parseValorBR(input.value);

      if (conta <= 0) {
        limparResultado();
        marcarErro(true);
        input.focus();
        return;
      }

      marcarErro(false);
      input.value = numeroBR(conta);

      // Estado de carregamento: bloqueia cliques repetidos enquanto "calcula"
      clearTimeout(timer);
      painel.classList.remove('is-done');
      painel.classList.add('is-loading');
      botao.classList.add('is-loading');
      botao.disabled = true;
      if (rotulo) rotulo.textContent = 'Calculando...';

      timer = setTimeout(() => {
        saida.textContent = brl(conta * (SAVINGS_PERCENTAGE / 100));
        if (base) base.textContent = brl(conta);
        painel.classList.remove('is-loading');
        painel.classList.add('is-done');
        encerrarBotao();
      }, CALC_DELAY);
    }

    botao.addEventListener('click', calculateSavings);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); calculateSavings(); }
    });

    input.addEventListener('input', () => {
      const limpo = input.value.replace(/[^\d.,]/g, '');
      if (limpo !== input.value) input.value = limpo;
      marcarErro(false);
      limparResultado();
    });

    // Ao sair do campo, normaliza o que foi digitado para o padrão brasileiro
    input.addEventListener('blur', () => {
      const conta = parseValorBR(input.value);
      if (conta > 0) input.value = numeroBR(conta);
    });

    // O CTA leva o valor simulado para o formulário de orçamento logo abaixo
    if (cta) {
      cta.addEventListener('click', () => {
        const conta = parseValorBR(input.value);
        const destino = $('#sim-conta');
        if (!destino || conta <= 0) return;
        destino.value = brl(conta);
        destino.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }

  /* ======================================================================
     ESTIMATIVA VISUAL DE ECONOMIA (painel do simulador)
     ====================================================================== */
  function initEstimate() {
    const gauge = $('[data-gauge]');
    if (!gauge) return;

    const barra   = $('[data-gauge-bar]');
    const valor   = $('[data-gauge-value]');
    const legenda = $('[data-gauge-caption]');
    const input   = $('#sim-conta');

    const render = () => {
      const conta = input ? moneyToNumber(input.value) : 0;
      const pct = EF_CONFIG.ECONOMIA_MAX;
      if (barra) barra.style.width = pct + '%';
      if (valor) valor.textContent = 'até ' + pct + '%';

      if (legenda) {
        if (conta > 0) {
          const min = conta * (EF_CONFIG.ECONOMIA_MIN / 100);
          const max = conta * (pct / 100);
          legenda.innerHTML =
            'Com uma conta de <b>' + brl(conta) + '</b>, a economia estimada pode ficar entre <b>' +
            brl(min) + '</b> e <b>' + brl(max) + '</b> por mês. É uma estimativa visual, o valor exato vem na simulação da nossa equipe.';
        } else {
          legenda.innerHTML =
            'Informe o valor médio da sua conta ao lado para ver uma estimativa. A economia pode variar conforme o perfil de consumo, o local de instalação e as condições técnicas do projeto.';
        }
      }
    };

    if (input) input.addEventListener('input', render);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { render(); io.unobserve(e.target); } });
      }, { threshold: 0.3 });
      io.observe(gauge);
    } else {
      render();
    }
  }

  /* ======================================================================
     CAPTURA DE UTMs, ORIGEM E DATA/HORA
     ====================================================================== */
  const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  function capturarUtms() {
    const params = new URLSearchParams(window.location.search);
    const store = {};
    let encontrou = false;

    UTM_KEYS.forEach(k => {
      const v = params.get(k);
      if (v) { store[k] = v; encontrou = true; }
    });

    // Persiste na sessão para não perder os UTMs na navegação entre páginas
    try {
      if (encontrou) {
        sessionStorage.setItem('ef_utms', JSON.stringify(store));
      } else {
        const salvo = sessionStorage.getItem('ef_utms');
        if (salvo) Object.assign(store, JSON.parse(salvo));
      }
    } catch (e) { /* sessionStorage indisponível, segue sem persistir */ }

    UTM_KEYS.forEach(k => { if (!store[k]) store[k] = ''; });
    return store;
  }

  function dadosDeContexto() {
    const agora = new Date();
    return {
      pagina_origem: window.location.href,
      pagina_titulo: document.title,
      referrer: document.referrer || 'direto',
      data_envio: agora.toLocaleDateString('pt-BR'),
      hora_envio: agora.toLocaleTimeString('pt-BR'),
      timestamp_iso: agora.toISOString(),
      dispositivo: window.innerWidth < 768 ? 'mobile' : (window.innerWidth < 1100 ? 'tablet' : 'desktop'),
    };
  }

  /* Preenche campos hidden de UTM presentes nos formulários */
  function preencherHiddens() {
    const utms = capturarUtms();
    Object.entries(utms).forEach(([k, v]) => {
      $$('input[name="' + k + '"]').forEach(inp => { inp.value = v; });
    });
  }

  /* ======================================================================
     FORMULÁRIOS DE SIMULAÇÃO
     ====================================================================== */
  function initForms() {
    const forms = $$('[data-ef-form]');
    if (!forms.length) return;

    forms.forEach(form => {
      const btn      = $('[type="submit"]', form);
      const boxOk    = $('[data-form-success]', form.closest('[data-form-wrap]') || form.parentElement);
      const boxErr   = $('[data-form-error]', form);

      const marcarErro = (field, msg) => {
        field.classList.add('is-invalid');
        const err = $('.field__err', field);
        if (err && msg) err.textContent = msg;
      };
      const limparErro = (field) => field.classList.remove('is-invalid');

      // Limpa o erro assim que o usuário corrige
      $$('.control', form).forEach(ctrl => {
        ctrl.addEventListener('input', () => {
          const field = ctrl.closest('.field');
          if (field) limparErro(field);
        });
      });

      const validar = () => {
        let ok = true;
        let primeiroErro = null;

        $$('.field', form).forEach(field => {
          const ctrl = $('.control', field);
          if (!ctrl || !ctrl.required) return;
          limparErro(field);

          const valor = (ctrl.value || '').trim();
          let msg = '';

          if (!valor) {
            msg = 'Campo obrigatório.';
          } else if (ctrl.dataset.mask === 'phone' && valor.replace(/\D/g, '').length < 10) {
            msg = 'Informe um WhatsApp válido com DDD.';
          } else if (ctrl.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
            msg = 'Informe um e-mail válido.';
          } else if (ctrl.dataset.mask === 'money' && moneyToNumber(valor) <= 0) {
            msg = 'Informe o valor médio da conta.';
          } else if (ctrl.name === 'nome' && valor.length < 3) {
            msg = 'Informe seu nome completo.';
          }

          if (msg) {
            ok = false;
            marcarErro(field, msg);
            if (!primeiroErro) primeiroErro = field;
          }
        });

        // Grupo de opções (tipo de imóvel)
        const grupo = $('[data-required-group]', form);
        if (grupo) {
          const marcado = $$('input[type="radio"]', grupo).some(r => r.checked);
          const field = grupo.closest('.field');
          if (!marcado && field) {
            ok = false;
            marcarErro(field, 'Selecione o tipo de imóvel.');
            if (!primeiroErro) primeiroErro = field;
          } else if (field) {
            limparErro(field);
          }
        }

        if (primeiroErro) {
          primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
          $('.control, input', primeiroErro)?.focus({ preventScroll: true });
        }
        return ok;
      };

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        boxErr?.classList.remove('is-visible');
        if (!validar()) return;

        const fd = new FormData(form);
        const payload = {
          /* --- dados do lead --- */
          nome:        (fd.get('nome') || '').toString().trim(),
          telefone:    (fd.get('telefone') || '').toString().trim(),
          telefone_digitos: (fd.get('telefone') || '').toString().replace(/\D/g, ''),
          cidade:      (fd.get('cidade') || '').toString().trim(),
          tipo_imovel: (fd.get('tipo_imovel') || '').toString(),
          valor_conta: (fd.get('valor_conta') || '').toString().trim(),
          valor_conta_numero: moneyToNumber(fd.get('valor_conta') || ''),
          mensagem:    (fd.get('mensagem') || '').toString().trim(),

          /* --- origem --- */
          formulario:  form.dataset.efForm || 'simulacao',
          ...capturarUtms(),
          ...dadosDeContexto(),
        };

        btn?.classList.add('is-loading');
        btn?.setAttribute('disabled', 'disabled');

        const configurado =
          EF_CONFIG.WEBHOOK_URL &&
          EF_CONFIG.WEBHOOK_URL !== 'INSERIR_WEBHOOK_AQUI' &&
          /^https?:\/\//i.test(EF_CONFIG.WEBHOOK_URL);

        try {
          if (configurado) {
            const resp = await fetch(EF_CONFIG.WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
          } else {
            // Modo demonstração, webhook ainda não configurado
            console.info('[Energy Field] WEBHOOK_URL não configurado. Payload que seria enviado:', payload);
            await new Promise(r => setTimeout(r, 700));
          }

          if (EF_CONFIG.REDIRECT_SUCESSO) {
            window.location.href = EF_CONFIG.REDIRECT_SUCESSO;
            return;
          }

          form.style.display = 'none';
          if (boxOk) {
            boxOk.classList.add('is-visible');
            boxOk.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          form.reset();

          // Ponte para tags de conversão (GA4 / Meta Pixel), quando existirem
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', { form: payload.formulario });
          }
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead');

        } catch (err) {
          console.error('[Energy Field] Falha ao enviar o formulário:', err);
          if (boxErr) {
            boxErr.textContent = 'Não conseguimos enviar agora. Tente novamente ou fale com a gente pelo WhatsApp.';
            boxErr.classList.add('is-visible');
          }
        } finally {
          btn?.classList.remove('is-loading');
          btn?.removeAttribute('disabled');
        }
      });
    });
  }

  /* ======================================================================
     BOTÕES FLUTUANTES
     ====================================================================== */
  function initFloating() {
    const wa = $('.wa');
    const top = $('.to-top');
    const onScroll = () => {
      const passou = window.scrollY > 420;
      wa?.classList.toggle('is-visible', passou);
      top?.classList.toggle('is-visible', window.scrollY > 900);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    top?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ======================================================================
     ANO NO RODAPÉ
     ====================================================================== */
  function initYear() {
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    initWhatsappLinks();
    initHeader();
    initMobileNav();
    initReveal();
    initParallax();
    initScrollSpy();
    initFaq();
    initCounters();
    initBars();
    initFitas();
    initGallery();
    initMasks();
    initCalculator();
    initEstimate();
    preencherHiddens();
    initForms();
    initFloating();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
