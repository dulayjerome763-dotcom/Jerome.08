/* Portfolio effects add-on.
   Add before </body> on every page:  <script src="effects.js" defer></script>
   It does not change your layout or theme colors. */
(function () {
  "use strict";

  /* ===== SETTINGS: edit these ===== */
  const ACCENT = "#38bdf8";
  const ROLES = [
    "BSIT Student | Future Web Developer",
    "Football Player | Right Back",
    "Front-End Enthusiast | HTML, CSS, JavaScript"
  ];

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const make = (tag, cls) => {
    const el = document.createElement(tag);
    el.className = cls;
    document.body.appendChild(el);
    return el;
  };

  /* ===== STYLES ===== */
  const style = document.createElement("style");
  style.textContent = `
  :root { --fx: ${ACCENT}; }
  .fx-bar { position:fixed; top:0; left:0; height:3px; width:100%; transform-origin:left;
    transform:scaleX(0); background:var(--fx); box-shadow:0 0 12px var(--fx); z-index:10000; }
  .fx-canvas { position:fixed; inset:0; pointer-events:none; z-index:9990; opacity:.35; }
  .fx-glow { position:fixed; width:380px; height:380px; left:0; top:0; margin:-190px 0 0 -190px;
    border-radius:50%; pointer-events:none; z-index:9991; opacity:0; transition:opacity .4s;
    background:radial-gradient(circle, color-mix(in srgb, var(--fx) 14%, transparent), transparent 65%); }
  .fx-hidden { opacity:0 !important; }
  .fx-card { transition:transform .18s ease-out, box-shadow .25s, border-color .25s !important; }
  .fx-card:hover { border-color:var(--fx) !important;
    box-shadow:0 14px 34px color-mix(in srgb, var(--fx) 25%, transparent) !important; }
  .fx-name { background-image:linear-gradient(100deg, var(--fx) 30%,
      color-mix(in srgb, var(--fx) 30%, white) 50%, var(--fx) 70%);
    background-size:250% 100%; -webkit-background-clip:text; background-clip:text;
    -webkit-text-fill-color:transparent; animation:fx-shine 4s linear infinite; }
  @keyframes fx-shine { from { background-position:100% 0 } to { background-position:-150% 0 } }
  .fx-photo { animation:fx-float 5s ease-in-out infinite; }
  @keyframes fx-float {
    0%,100% { translate:0 0; box-shadow:0 0 14px color-mix(in srgb, var(--fx) 35%, transparent) }
    50% { translate:0 -10px; box-shadow:0 0 42px color-mix(in srgb, var(--fx) 75%, transparent) } }
  .fx-caret::after { content:"|"; margin-left:2px; color:var(--fx); animation:fx-blink .8s steps(1) infinite; }
  @keyframes fx-blink { 50% { opacity:0 } }
  nav a, header a { transition:text-shadow .25s, color .25s; }
  nav a:hover, header a:hover { text-shadow:0 0 12px var(--fx); }
  .fx-btn:hover { box-shadow:0 0 24px color-mix(in srgb, var(--fx) 70%, transparent) !important; }
  .fx-ripple { position:fixed; width:14px; height:14px; margin:-7px 0 0 -7px; border-radius:50%;
    border:2px solid var(--fx); pointer-events:none; z-index:10001; }
  .fx-zoom { cursor:zoom-in; transition:filter .3s, scale .3s; }
  .fx-zoom:hover { filter:brightness(1.12) saturate(1.15); scale:1.03; }
  .fx-box { position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(8,13,26,.92); z-index:10002; cursor:zoom-out; }
  .fx-box img { max-width:92vw; max-height:90vh; border:3px solid var(--fx); border-radius:14px;
    box-shadow:0 0 50px color-mix(in srgb, var(--fx) 50%, transparent); }
  .fx-top { position:fixed; right:20px; bottom:20px; width:44px; height:44px; border-radius:50%;
    border:1px solid var(--fx); background:#1e293b; color:var(--fx); font-size:20px; cursor:pointer;
    z-index:10000; opacity:0; visibility:hidden; transition:.3s; }
  .fx-top.show { opacity:1; visibility:visible; }
  @media (prefers-reduced-motion: reduce) { .fx-name,.fx-photo,.fx-caret::after { animation:none } }
  `;
  document.head.appendChild(style);

  /* ===== SCROLL BAR + BACK TO TOP ===== */
  const bar = make("div", "fx-bar");
  const top = make("button", "fx-top");
  top.type = "button";
  top.textContent = "↑";
  top.setAttribute("aria-label", "Back to top");
  top.onclick = () => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    top.classList.toggle("show", scrollY > 300);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ===== FIND CARDS (rounded boxes with a background) ===== */
  const cards = [];
  $$("body div, body article, body li, body section").forEach((el) => {
    if (el.closest("header, nav, footer, .fx-card")) return;
    if (/^fx-/.test(el.className)) return;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    const filled = s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent";
    if (filled && parseFloat(s.borderTopLeftRadius) >= 8 &&
        r.width >= 150 && r.width <= 650 && r.height >= 35 && r.height <= 700 &&
        !el.querySelector("h1")) {
      el.classList.add("fx-card");
      cards.push(el);
    }
  });

  /* ===== 3D TILT + SPOTLIGHT ===== */
  if (mouse && !calm) cards.forEach((card) => {
    const plain = getComputedStyle(card).backgroundImage === "none";
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform =
        `perspective(800px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-5px)`;
      if (plain) card.style.backgroundImage =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(56,189,248,.18), transparent 60%)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      if (plain) card.style.backgroundImage = "";
    });
  });

  /* ===== HERO (home page only) ===== */
  const hero = $$("h1").find((h) => /hi,?\s*i/i.test(h.textContent));
  let photo = null;
  if (hero) {
    const name = hero.querySelector("span");
    if (name) name.classList.add("fx-name");

    photo = $$("img").find((i) => !i.closest("header, nav") &&
      i.getBoundingClientRect().height > 220);
    if (photo) {
      const p = photo.parentElement;
      const framed = parseFloat(getComputedStyle(photo).borderTopWidth) === 0 &&
        parseFloat(getComputedStyle(p).borderTopWidth) > 0;
      (framed ? p : photo).classList.add("fx-photo");
    }

    /* typing effect */
    const sub = $$("h1 ~ *, h1 + * > *").find((el) =>
      !el.children.length && /student/i.test(el.textContent) && el.textContent.includes("|"));
    if (sub && !calm) {
      sub.style.minHeight = sub.offsetHeight + "px";
      sub.setAttribute("aria-label", sub.textContent.trim());
      sub.classList.add("fx-caret");
      let role = 0, n = 0, step = 1;
      (function type() {
        n += step;
        sub.textContent = ROLES[role].slice(0, n) || "\u00a0";
        let wait = step > 0 ? 65 : 30;
        if (n >= ROLES[role].length) { step = -1; wait = 1800; }
        else if (n <= 0) { step = 1; role = (role + 1) % ROLES.length; wait = 300; }
        setTimeout(type, wait);
      })();
    }
  }

  /* ===== REVEAL ON SCROLL ===== */
  if (!calm && "IntersectionObserver" in window) {
    const items = Array.from(new Set(
      $$("h1, h2, h3, p, img, .fx-card").filter((el) =>
        !el.closest("header, nav, footer") &&
        !(el.parentElement && el.parentElement.closest(".fx-card")))
    ));
    let queue = 0;
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => {
        io.unobserve(e.target);
        const delay = queue++ * 90;
        const anim = e.target.animate(
          [{ opacity: 0, translate: "0 35px" }, { opacity: 1, translate: "0 0" }],
          { duration: 650, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
        e.target.classList.remove("fx-hidden");
        anim.onfinish = () => { queue = Math.max(0, queue - 1); };
      });
    }, { threshold: 0.08 });
    items.forEach((el) => { el.classList.add("fx-hidden"); io.observe(el); });
  }

  /* ===== BUTTONS: ripple + magnetic pull ===== */
  const buttons = $$("button, a").filter((el) => {
    if (el.classList.contains("fx-top")) return false;
    const s = getComputedStyle(el);
    return el.tagName === "BUTTON" || parseFloat(s.borderTopLeftRadius) >= 15;
  });
  buttons.forEach((b) => {
    b.classList.add("fx-btn");
    if (!mouse || calm) return;
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.15}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = ""; });
  });
  if (!calm) addEventListener("pointerdown", (e) => {
    const dot = make("span", "fx-ripple");
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    dot.animate([{ transform: "scale(.5)", opacity: 1 }, { transform: "scale(5)", opacity: 0 }],
      { duration: 550, easing: "ease-out" }).onfinish = () => dot.remove();
  });

  /* ===== CLICK PHOTOS TO ENLARGE ===== */
  $$("img").filter((i) => i !== photo && !i.closest("header, nav, a, button")).forEach((img) => {
    img.classList.add("fx-zoom");
    img.tabIndex = 0;
    const open = () => {
      const box = make("div", "fx-box");
      const big = document.createElement("img");
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      box.appendChild(big);
      const close = () => { box.remove(); removeEventListener("keydown", esc); };
      const esc = (e) => { if (e.key === "Escape") close(); };
      box.onclick = close;
      addEventListener("keydown", esc);
      if (!calm) box.animate([{ opacity: 0 }, { opacity: 1 }], 250);
    };
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => { if (e.key === "Enter") open(); });
  });

  if (calm) return; /* skip heavy motion for people who turn it off */

  /* ===== CURSOR GLOW ===== */
  let px = -999, py = -999;
  if (mouse) {
    const glow = make("div", "fx-glow");
    addEventListener("pointermove", (e) => {
      px = e.clientX; py = e.clientY;
      glow.style.opacity = 1;
      glow.style.transform = `translate(${px}px, ${py}px)`;
    });
    document.documentElement.addEventListener("pointerleave", () => {
      glow.style.opacity = 0; px = py = -999;
    });
  }

  /* ===== PARTICLE NETWORK ===== */
  const canvas = make("canvas", "fx-canvas");
  const ctx = canvas.getContext("2d");
  let w, h, dots;
  const resize = () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    dots = Array.from({ length: Math.min(70, Math.floor(w / 20)) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45
    }));
  };
  const line = (a, bx, by, reach) => {
    const d = Math.hypot(a.x - bx, a.y - by);
    if (d > reach) return;
    ctx.globalAlpha = 1 - d / reach;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bx, by); ctx.stroke();
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ctx.strokeStyle = ACCENT;
    dots.forEach((a, i) => {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < dots.length; j++) line(a, dots[j].x, dots[j].y, 110);
      line(a, px, py, 170);
    });
    requestAnimationFrame(draw);
  };
  addEventListener("resize", resize);
  resize();
  draw();

  /* ===== SMOOTH PAGE TRANSITIONS ===== */
  const fade = (from, to, ms) =>
    document.body.animate([{ opacity: from }, { opacity: to }], { duration: ms, fill: "forwards" });
  let leaving = null;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey ||
        a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host ||
        url.pathname === location.pathname) return;
    e.preventDefault();
    leaving = fade(1, 0, 220);
    setTimeout(() => { location.href = url.href; }, 220);
  });
  addEventListener("pageshow", () => { if (leaving) { leaving.cancel(); leaving = null; } });
})();
