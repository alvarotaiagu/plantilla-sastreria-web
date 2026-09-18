/* ==========================================================================
   Sastrería Arume — sitio de demostración (taller ficticio)
   Concepto: «El revés». La chaqueta se gira y enseña lo de dentro.

   Reglas de la casa:
   - El movimiento solo se promete si GSAP + ScrollTrigger cargaron de verdad
     (html.has-motion). Sin ellos, todo está pintado y usable.
   - prefers-reduced-motion apaga el MOVIMIENTO, no el CONTENIDO: la chaqueta
     sigue girando de cara con los botones y los cuadrados de las horas siguen
     estando.
   - Nada de tuitear `scale` con GSAP sobre un elemento SVG: GSAP mide el
     transformOrigin sobre el bbox y se lleva la pieza fuera del lienzo. Los
     gestos sobre SVG van con clases y CSS.
   ========================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var hayGsap = !!(window.gsap && window.ScrollTrigger);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var movimiento = hayGsap && !reduce;

  if (hayGsap) {
    raiz.classList.add('has-motion');
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- 0 · tareas largas (anotadas en el README) ---------- */
  window.__tareasLargas = [];
  if (window.PerformanceObserver) {
    try {
      var po = new PerformanceObserver(function (l) {
        l.getEntries().forEach(function (e) { window.__tareasLargas.push(Math.round(e.duration)); });
      });
      po.observe({ entryTypes: ['longtask'] });
      setTimeout(function () {
        var t = window.__tareasLargas;
        console.log('[Arume] tareas largas (>50 ms) en los primeros 10 s: ' +
          (t.length ? t.join(', ') + ' ms · la peor ' + Math.max.apply(null, t) + ' ms' : 'ninguna'));
      }, 10000);
    } catch (e) { /* navegador sin longtask */ }
  }

  /* ---------- 1 · scroll suave ---------- */
  var lenis = null;
  if (movimiento && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function irA(destino) {
    if (lenis) lenis.scrollTo(destino, { duration: 1.1 });
    else if (destino && destino.scrollIntoView) destino.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- 2 · cortina de entrada ----------
     Gesto propio del concepto: se cose una puntada de arriba abajo, la aguja
     la remata, una costura de hilván recorre el borde de abajo y la cortina
     se levanta POR esa costura, con el borde curvado.
     Retirada garantizada: sin GSAP y con movimiento reducido se quita de
     inmediato, y aun con GSAP hay una red de seguridad a los 4,2 s. */
  var cortina = document.getElementById('cortina');
  var animHero = [];
  function arrancarHero() { animHero.splice(0).forEach(function (f) { f(); }); }

  function quitarCortina() {
    if (!cortina) return;
    cortina.style.display = 'none';
    arrancarHero();
  }
  if (!movimiento) {
    quitarCortina();
  } else {
    var tlCortina = gsap.timeline();
    tlCortina
      .to('.cortina__hilo', { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, 0)
      .call(function () { cortina.classList.add('enhebrada'); }, null, .85)
      .call(function () { cortina.classList.add('cosida'); }, null, 1.05)
      .to('.cortina__palabra', { opacity: 0, y: -12, duration: .45, ease: 'power2.in' }, 1.6)
      .to('.cortina__caja', { opacity: 0, duration: .4, ease: 'power2.in' }, 1.6)
      .to(cortina, { '--curva-cortina': 1, duration: .5, ease: 'power2.inOut' }, 1.7)
      .to(cortina, {
        yPercent: -102, duration: 1.2, ease: 'expo.inOut',
        onComplete: quitarCortina
      }, 1.95)
      .add(arrancarHero, 2.25);
    setTimeout(quitarCortina, 4200);   // red de seguridad
  }

  /* ---------- 3 · aviso de cookies ---------- */
  var banner = document.getElementById('cookieBanner');
  var aceptar = document.getElementById('cookieAceptar');
  var CLAVE = 'arume-cookies';
  var visto = false;
  try { visto = localStorage.getItem(CLAVE) === 'si'; } catch (e) { visto = false; }
  if (banner && !visto) setTimeout(function () { banner.hidden = false; }, movimiento ? 4600 : 600);
  if (aceptar) {
    aceptar.addEventListener('click', function () {
      banner.hidden = true;
      try { localStorage.setItem(CLAVE, 'si'); } catch (e) { /* modo privado */ }
    });
  }

  /* ---------- 4 · menú y cabecera ---------- */
  var hamburguesa = document.getElementById('hamburguesa');
  var nav = document.getElementById('nav');
  if (hamburguesa && nav) {
    hamburguesa.addEventListener('click', function () {
      var abierta = nav.classList.toggle('abierta');
      hamburguesa.setAttribute('aria-expanded', abierta ? 'true' : 'false');
      hamburguesa.setAttribute('aria-label', abierta ? 'Cerrar el menú' : 'Abrir el menú');
    });
    nav.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) {
        nav.classList.remove('abierta');
        hamburguesa.setAttribute('aria-expanded', 'false');
        hamburguesa.setAttribute('aria-label', 'Abrir el menú');
      }
    });
  }

  var cabecera = document.getElementById('cabecera');
  function pintarCabecera() { if (cabecera) cabecera.classList.toggle('encogida', window.scrollY > 40); }
  window.addEventListener('scroll', pintarCabecera, { passive: true });
  pintarCabecera();

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      ev.preventDefault();
      irA(destino);
    });
  });

  /* ---------- 5 · titulares partidos en letras ---------- */
  function partir(el) {
    var texto = el.textContent;
    el.setAttribute('aria-label', texto);
    el.textContent = '';
    texto.split(' ').forEach(function (palabra, i, todas) {
      var p = document.createElement('span');
      p.className = 'palabra';
      p.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (c) {
        var l = document.createElement('span');
        l.className = 'letra';
        l.textContent = c;
        p.appendChild(l);
      });
      el.appendChild(p);
      if (i < todas.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.letra');
  }

  if (movimiento) {
    document.querySelectorAll('[data-reveal]').forEach(function (el, idx) {
      var letras = partir(el);
      var lanzar = function () {
        var conf = { y: 0, duration: .9, ease: 'power3.out', stagger: .016 };
        if (idx !== 0) conf.scrollTrigger = { trigger: el, start: 'top 88%', once: true };
        gsap.to(letras, conf);
      };
      if (idx === 0) animHero.push(lanzar); else lanzar();
    });
  }

  /* ---------- 6 · contadores ---------- */
  document.querySelectorAll('.contador').forEach(function (el, i) {
    var hasta = parseInt(el.getAttribute('data-hasta'), 10);
    if (!movimiento || isNaN(hasta)) return;
    var obj = { v: 0 };
    var correr = function () {
      gsap.to(obj, {
        v: hasta, duration: 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(obj.v); }
      });
    };
    // los tres del hero los arranca la cortina; el del total de horas, el scroll
    if (el.closest('.hero')) {
      el.textContent = '0';
      animHero.push(correr);
    } else {
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () { el.textContent = '0'; correr(); }
      });
    }
  });

  /* ---------- 7 · cinta ---------- */
  var pista = document.getElementById('cintaPista');
  if (pista && movimiento) {
    pista.innerHTML = pista.innerHTML + pista.innerHTML;
    gsap.to(pista, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
  }

  /* ---------- 8 · EL REVÉS: girar la chaqueta ---------- */
  var giro = document.getElementById('chaquetaGiro');
  var btnDerecho = document.getElementById('verDerecho');
  var btnReves = document.getElementById('verReves');
  var estadoReves = document.getElementById('revesEstado');
  var caraReves = document.querySelector('.chaqueta--reves');
  var listaPiezas = document.getElementById('piezas');

  function pintarCara(alReves) {
    if (!giro) return;
    giro.classList.toggle('volteada', alReves);
    btnDerecho.setAttribute('aria-pressed', alReves ? 'false' : 'true');
    btnReves.setAttribute('aria-pressed', alReves ? 'true' : 'false');
    estadoReves.innerHTML = alReves
      ? 'Estás viendo <b>el revés</b>. Los seis números son los de la lista.'
      : 'Estás viendo <b>el derecho</b>. Gírala para ver por dónde se sostiene.';
    // el lado que no se ve no debe ser accesible ni con tabulador ni con lector
    document.querySelector('.chaqueta--derecho').setAttribute('aria-hidden', alReves ? 'true' : 'false');
    if (caraReves) caraReves.setAttribute('aria-hidden', alReves ? 'false' : 'true');
  }

  if (giro) {
    pintarCara(false);
    btnDerecho.addEventListener('click', function () { pintarCara(false); });
    btnReves.addEventListener('click', function () { pintarCara(true); });

    // Se gira sola la primera vez que entra en pantalla: es el gesto de la
    // plantilla. A partir de ahí mandan los botones.
    if ('IntersectionObserver' in window) {
      var yaGirada = false;
      var obsGiro = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting || yaGirada) return;
          yaGirada = true;
          obsGiro.disconnect();
          setTimeout(function () { pintarCara(true); }, reduce ? 0 : 900);
        });
      }, { threshold: 0.45 });
      obsGiro.observe(giro);
    }
  }

  /* ---------- 9 · resaltado cruzado lista ←→ dibujo ---------- */
  if (listaPiezas && caraReves) {
    var filas = Array.prototype.slice.call(listaPiezas.querySelectorAll('li'));
    function marcar(n) {
      filas.forEach(function (f) { f.classList.toggle('activa', f.getAttribute('data-pieza') === n); });
      if (n) caraReves.setAttribute('data-activa', n);
      else caraReves.removeAttribute('data-activa');
    }
    filas.forEach(function (f) {
      var n = f.getAttribute('data-pieza');
      // Cada pieza es una parada de tabulador para que quien navega con teclado
      // pueda recorrer las seis y ver cuál se está señalando en el dibujo. No
      // es un control (no hace nada al pulsar), solo un destino de foco.
      f.tabIndex = 0;
      f.addEventListener('mouseenter', function () { marcar(n); });
      f.addEventListener('mouseleave', function () { marcar(null); });
      f.addEventListener('focusin', function () {
        marcar(n);
        if (giro) pintarCara(true);   // si señala una pieza, que se vea la pieza
      });
      f.addEventListener('focusout', function () { marcar(null); });
    });
  }

  /* ---------- 10 · los cuadrados de las horas ---------- */
  // Un cuadrado por hora. Son decorativos (aria-hidden) porque el número va
  // escrito al lado: si no se pintan, no se pierde ningún dato.
  document.querySelectorAll('.cuadros').forEach(function (caja) {
    var horas = parseInt(caja.parentNode.style.getPropertyValue('--horas'), 10) || 0;
    var trozos = '';
    for (var i = 0; i < horas; i++) trozos += '<i style="transition-delay:' + (reduce ? 0 : i * 0.045) + 's"></i>';
    caja.innerHTML = trozos;
  });

  /* ---------- 11 · apariciones ---------- */
  var aRevelar = document.querySelectorAll('.tareas li, figure[data-mascara]');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    aRevelar.forEach(function (el) { obs.observe(el); });
  } else {
    aRevelar.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 12 · cursor y botones magnéticos ---------- */
  var cursor = document.getElementById('cursor');
  var cursorTexto = document.getElementById('cursorTexto');
  var finoPuntero = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && finoPuntero && movimiento) {
    var cx = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var destino = { x: cx.x, y: cx.y };
    window.addEventListener('mousemove', function (ev) {
      destino.x = ev.clientX; destino.y = ev.clientY;
      cursor.classList.add('activo');
    }, { passive: true });
    gsap.ticker.add(function () {
      cx.x += (destino.x - cx.x) * .18;
      cx.y += (destino.y - cx.y) * .18;
      cursor.style.transform = 'translate(' + cx.x + 'px,' + cx.y + 'px) translate(-50%,-50%)';
    });
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursorTexto.textContent = el.getAttribute('data-cursor');
        cursor.classList.add('etiqueta');
      });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('etiqueta'); });
    });
  }

  if (movimiento && finoPuntero) {
    document.querySelectorAll('.magnetico').forEach(function (el) {
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (ev.clientX - (r.left + r.width / 2)) * .28,
          y: (ev.clientY - (r.top + r.height / 2)) * .34,
          duration: .5, ease: 'power3.out'
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, .45)' });
      });
    });
  }

  /* ---------- 13 · abierto / cerrado, con el día de hoy marcado ---------- */
  // Martes a viernes 10:00–14:00 y 16:30–20:00; sábado 10:00–13:30.
  var TRAMOS = {
    0: [], 1: [],
    2: [[600, 840], [990, 1200]],
    3: [[600, 840], [990, 1200]],
    4: [[600, 840], [990, 1200]],
    5: [[600, 840], [990, 1200]],
    6: [[600, 810]]
  };
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function hhmm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ':' + (m < 10 ? '0' + m : m);
  }
  function pintarEstado() {
    var estado = document.getElementById('estado');
    var texto = document.getElementById('estadoTexto');
    if (!estado || !texto) return;
    var ahora = new Date();
    var dia = ahora.getDay();
    var min = ahora.getHours() * 60 + ahora.getMinutes();
    var tramos = TRAMOS[dia] || [];
    var abierto = tramos.filter(function (t) { return min >= t[0] && min < t[1]; })[0];

    estado.classList.toggle('abierto', !!abierto);
    estado.classList.toggle('cerrado', !abierto);

    if (abierto) {
      texto.textContent = 'Abierto ahora, hasta las ' + hhmm(abierto[1]) + ' · siempre con cita';
    } else {
      var siguiente = tramos.filter(function (t) { return min < t[0]; })[0];
      if (siguiente) {
        texto.textContent = 'Cerrado ahora · abre hoy a las ' + hhmm(siguiente[0]);
      } else {
        var d = dia, vueltas = 0;
        do { d = (d + 1) % 7; vueltas++; } while (!(TRAMOS[d] || []).length && vueltas < 8);
        texto.textContent = 'Cerrado ahora · abre el ' + DIAS[d] + ' a las ' + hhmm(TRAMOS[d][0][0]);
      }
    }

    var filas2 = document.querySelectorAll('#horarioCuerpo tr');
    var indiceHoy = (dia + 6) % 7;   // la tabla empieza en lunes
    filas2.forEach(function (f, i) { f.classList.toggle('hoy', i === indiceHoy); });
  }
  pintarEstado();
  setInterval(pintarEstado, 60000);

  /* ---------- 14 · el mapa solo si lo pides ---------- */
  var mapaBoton = document.getElementById('mapaBoton');
  if (mapaBoton) {
    mapaBoton.addEventListener('click', function () {
      var hueco = document.getElementById('mapaConsent');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Betanzos, A Coruña') + '&output=embed';
      iframe.title = 'Mapa de Betanzos (A Coruña), donde estaría el taller';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      hueco.replaceWith(iframe);
    });
  }

  /* ---------- 15 · refresco final ---------- */
  if (hayGsap) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
