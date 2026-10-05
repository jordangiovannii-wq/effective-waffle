/* Reservoir Pet Care — walking-dog intro
   The inline script in <head> decides whether it plays (once per visit, never with
   "reduce motion" on) and adds html.intro. This file animates it and lifts it away. */

(function () {
  "use strict";

  var root = document.documentElement;
  var overlay = document.getElementById("intro");
  if (!overlay || !root.classList.contains("intro")) return;

  var end = window.__endIntro || function () { root.classList.remove("intro"); };
  var gsap = window.gsap;
  if (!gsap) { end(); return; }

  var dog = overlay.querySelector(".intro-dog");
  var dogBody = overlay.querySelector(".dog");
  var head = overlay.querySelector(".head");
  var tail = overlay.querySelector(".tail");
  var legs = [
    { el: overlay.querySelector(".leg-fn"), offset: 0 },
    { el: overlay.querySelector(".leg-bf"), offset: 0 },
    { el: overlay.querySelector(".leg-ff"), offset: Math.PI },
    { el: overlay.querySelector(".leg-bn"), offset: Math.PI }
  ].map(function (l) {
    return { upper: l.el.querySelector(".upper"), lower: l.el.querySelector(".lower"), offset: l.offset };
  });

  /* ---------- Walk cycle, drawn by hand each frame ---------- */
  var gait = { amp: 1, wag: 14, wagSpeed: 9, headTilt: 0 };
  var phase = 0;
  var clock = 0;
  function drawFrame(time, delta) {
    var dt = Math.min(delta, 50) / 1000;
    phase += dt * 11 * gait.amp;           // stride frequency slows with the dog
    clock += dt;
    legs.forEach(function (leg) {
      var t = phase + leg.offset;
      var swing = -26 * Math.sin(t) * gait.amp;            // thigh swings fore/aft
      var knee = 38 * Math.max(0, Math.cos(t)) * gait.amp;  // knee folds on the forward swing
      leg.upper.setAttribute("transform", "rotate(" + swing.toFixed(2) + ")");
      leg.lower.setAttribute("transform", "translate(0 24) rotate(" + knee.toFixed(2) + ")");
    });
    var bob = -2.2 * Math.abs(Math.sin(phase)) * gait.amp;
    dogBody.setAttribute("transform", "translate(0 " + bob.toFixed(2) + ")");
    var wag = gait.wag * Math.sin(clock * gait.wagSpeed);
    tail.setAttribute("transform", "rotate(" + wag.toFixed(2) + " 62 46)");
    head.setAttribute("transform", "rotate(" + gait.headTilt.toFixed(2) + " 160 44)");
  }
  gsap.ticker.add(drawFrame);

  /* ---------- Choreography ---------- */
  var lifted = false;
  function lift(fast) {
    if (lifted) return;
    lifted = true;
    root.classList.add("intro-lifting");   // lets the hero's own entrance start underneath
    gsap.to(overlay, {
      yPercent: -100, duration: fast ? 0.5 : 0.95, ease: "expo.inOut",
      onComplete: function () {
        gsap.ticker.remove(drawFrame);
        end();
        root.classList.remove("intro-lifting");
        overlay.remove();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }
    });
  }

  var tl = gsap.timeline({ onComplete: function () { lift(false); } });
  tl.fromTo(".intro-ground", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 0)
    .fromTo(dog, { x: function () { return -(window.innerWidth * 0.5 + dog.getBoundingClientRect().width); } },
                 { x: 0, duration: 2.3, ease: "sine.out" }, 0.15)
    .to(gait, { amp: 0, duration: 0.6, ease: "power2.out" }, 1.95)
    .to(gait, { wag: 22, wagSpeed: 18, duration: 0.3 }, 2.2)
    .to(gait, { headTilt: -10, duration: 0.35, ease: "back.out(3)" }, 2.25)
    .to(".intro-word", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 2.2)
    .to({}, { duration: 0.55 });            // a beat to look at the dog

  /* ---------- Skip: button, Escape, or a tap anywhere ---------- */
  function skip() { tl.kill(); lift(true); }
  var skipBtn = document.getElementById("intro-skip");
  if (skipBtn) skipBtn.addEventListener("click", function (e) { e.stopPropagation(); skip(); });
  overlay.addEventListener("click", skip);
  document.addEventListener("keydown", function onKey(e) {
    if (e.key === "Escape") { skip(); document.removeEventListener("keydown", onKey); }
  });
})();
