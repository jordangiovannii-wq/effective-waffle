/* Precision Pause — scroll & pointer motion (GSAP + ScrollTrigger)
   Progressive enhancement: without GSAP, or with "reduce motion" on, the page
   keeps the simple CSS reveals from main.js and everything stays readable. */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !window.gsap || !window.ScrollTrigger) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("motion");

  var EASE = "expo.out";
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Scroll progress bar ---------- */
  gsap.to(".scroll-progress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
  });

  /* ---------- Header: hide on scroll down, show on scroll up ---------- */
  var header = document.getElementById("site-header");
  var nav = document.getElementById("primary-nav");
  if (header) {
    var shown = true;
    ScrollTrigger.create({
      start: 120, end: "max",
      onUpdate: function (self) {
        var wantShown = self.direction === -1 || (nav && nav.classList.contains("is-open"));
        if (wantShown !== shown) {
          shown = wantShown;
          gsap.to(header, { yPercent: shown ? 0 : -110, duration: 0.45, ease: "power3.out" });
        }
      },
      onLeaveBack: function () { shown = true; gsap.to(header, { yPercent: 0, duration: 0.45, ease: "power3.out" }); }
    });
    header.addEventListener("focusin", function () { shown = true; gsap.to(header, { yPercent: 0, duration: 0.3 }); });
  }

  /* ---------- Hero: dog drifts back and copy lifts away as you scroll ---------- */
  var heroTl = gsap.timeline({
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  heroTl
    .to(".hero-image", { yPercent: 18, scale: 1.08, ease: "none" }, 0)
    .to(".hero-copy", { yPercent: -35, opacity: 0, ease: "none" }, 0);

  /* ---------- Marquee: always moving, speeds up with scroll velocity ---------- */
  var track = document.querySelector(".marquee-track");
  if (track) {
    var loop = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    var boost = gsap.quickTo(loop, "timeScale", { duration: 0.6, ease: "power2.out" });
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = self.getVelocity() / 300;
        boost(gsap.utils.clamp(-5, 5, (Math.abs(v) < 1 ? 1 : v)));
      },
      onToggle: function (self) { self.isActive ? loop.play() : loop.pause(); }
    });
  }

  /* ---------- Headlines: each line slides up out of a mask ---------- */
  document.querySelectorAll("main h2.display").forEach(function (h) {
    var parts = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = parts.map(function (p) {
      return '<span class="line-mask"><span class="line">' + p.trim() + "</span></span>";
    }).join("");
    gsap.from(h.querySelectorAll(".line"), {
      yPercent: 110, duration: 1.1, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: h, start: "top 88%" }
    });
  });

  /* ---------- Generic reveals (take over from the CSS version) ---------- */
  ScrollTrigger.batch(".reveal:not(.report-card)", {
    start: "top 88%",
    onEnter: function (els) {
      gsap.fromTo(els, { y: 48, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: EASE, stagger: 0.12, overwrite: true,
        clearProps: "transform"
      });
    }
  });

  /* ---------- Philosophy photo: curtain wipe + slow parallax ---------- */
  var philoImg = document.querySelector(".philosophy-photo img");
  if (philoImg) {
    gsap.fromTo(".philosophy-photo", { clipPath: "inset(100% 0 0 0)" }, {
      clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut",
      scrollTrigger: { trigger: ".philosophy", start: "top 80%" }
    });
    gsap.fromTo(philoImg, { yPercent: -8, scale: 1.15 }, {
      yPercent: 8, scale: 1.15, ease: "none",
      scrollTrigger: { trigger: ".philosophy-photo", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* ---------- Service cards: photo wipes in, big numbers drift ---------- */
  document.querySelectorAll(".service-card").forEach(function (card, i) {
    var media = card.querySelector(".service-media");
    var img = media && media.querySelector("img");
    var num = media && media.querySelector(".stroke-number");
    if (!media) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 85%" }, delay: i * 0.12 });
    tl.fromTo(media, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "expo.inOut" });
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: EASE, clearProps: "transform" }, 0);
    if (num) {
      gsap.fromTo(num, { yPercent: 40 }, {
        yPercent: -40, ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true }
      });
    }
  });

  /* ---------- Prices count up ---------- */
  document.querySelectorAll(".price-amount").forEach(function (el) {
    var match = el.textContent.match(/\d+/);
    if (!match) return;
    var target = parseInt(match[0], 10);
    var prefix = el.textContent.slice(0, match.index);
    var counter = { v: 0 };
    el.textContent = prefix + "0";
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: function () {
        gsap.to(counter, {
          v: target, duration: 1.4, ease: "power3.out",
          onUpdate: function () { el.textContent = prefix + Math.round(counter.v); }
        });
      }
    });
  });

  /* ---------- How I work: outlined numbers fill with orange as you read ---------- */
  document.querySelectorAll(".how-list .stroke-number").forEach(function (num) {
    gsap.fromTo(num, { color: "rgba(232,94,36,0)", webkitTextStrokeColor: "rgba(245,241,232,0.35)" }, {
      color: "rgba(232,94,36,1)", webkitTextStrokeColor: "rgba(232,94,36,1)", ease: "none",
      scrollTrigger: { trigger: num, start: "top 80%", end: "top 45%", scrub: true }
    });
  });

  /* ---------- Walk report: card swings in like it's been handed over ---------- */
  var report = document.querySelector(".report-card");
  if (report) {
    gsap.fromTo(report, { rotate: -6, y: 80, opacity: 0, transformOrigin: "20% 100%" }, {
      rotate: 0, y: 0, opacity: 1, duration: 1.3, ease: EASE,
      scrollTrigger: { trigger: report, start: "top 85%" }
    });
    gsap.from(report.querySelectorAll(".report-stats > div, .report-photos img"), {
      y: 24, opacity: 0, duration: 0.8, ease: EASE, stagger: 0.07, delay: 0.35,
      scrollTrigger: { trigger: report, start: "top 85%" }
    });
  }

  /* ---------- Magnetic buttons (mouse/trackpad only) ---------- */
  if (finePointer) {
    document.querySelectorAll(".btn-primary, .btn-lg").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  /* Recalculate once images and fonts have settled */
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  /* If the visitor switches on "reduce motion" mid-visit, stop everything */
  reduce.addEventListener && reduce.addEventListener("change", function (e) {
    if (e.matches) window.location.reload();
  });
})();
