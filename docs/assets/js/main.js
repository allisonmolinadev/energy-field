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

  /* ---------------------------------------------------------------------
     4) Redirecionamento opcional após o envio (ex.: '/obrigado.html').
        Deixe null para exibir a mensagem de sucesso na própria página.
     --------------------------------------------------------------------- */
  REDIRECT_SUCESSO: null,
};

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
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(el => { el.textContent = el.dataset.count; });
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

        const dur = 1500;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
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
     GALERIA DE PROJETOS: filtros
     ====================================================================== */
  function initGallery() {
    const filters = $$('[data-filter]');
    const shots = $$('.shot[data-cat], .proj[data-cat]');
    if (!filters.length || !shots.length) return;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const cat = btn.dataset.filter;
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

  function initMasks() {
    $$('[data-mask="phone"]').forEach(inp => {
      inp.addEventListener('input', () => { inp.value = maskPhone(inp.value); });
    });
    $$('[data-mask="money"]').forEach(inp => {
      inp.addEventListener('input', () => { inp.value = maskMoney(inp.value); });
    });
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

    const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
    initGallery();
    initMasks();
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
