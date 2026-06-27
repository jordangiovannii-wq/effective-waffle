/* Reservoir Pet Care — front-end interactions
   No backend, no payments, no GPS, no chatbot. Everything here is client-side. */

(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var primaryNav = document.getElementById("primary-nav");
  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    primaryNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- FAQ accordion ---------- */
  var triggers = document.querySelectorAll(".accordion-trigger");
  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  /* ---------- Pricing → booking prefill ---------- */
  var serviceLabelMap = {
    "Single walk": "Single walk — $30",
    "Regular walks (2+/week)": "Regular walks (2+/week) — $25 each",
    "Mobile grooming": "Mobile grooming — from $60",
    "Overnight care": "Overnight care — $80/night"
  };
  document.querySelectorAll("[data-prefill-service]").forEach(function (link) {
    link.addEventListener("click", function () {
      var wanted = serviceLabelMap[link.getAttribute("data-prefill-service")];
      var radio = document.querySelector('input[name="service"][value="' + wanted + '"]');
      if (radio) radio.checked = true;
      goToStep(1);
    });
  });

  /* ---------- Booking multi-step flow ---------- */
  var form = document.getElementById("booking-form");
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll(".booking-panel"));
  var indicators = Array.prototype.slice.call(document.querySelectorAll(".booking-step"));
  var current = 1;
  var totalSteps = panels.length;

  function showError(key, show) {
    var el = form.querySelector('[data-error-for="' + key + '"]');
    if (el) el.hidden = !show;
  }

  function goToStep(step) {
    current = Math.min(Math.max(step, 1), totalSteps);
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", Number(panel.dataset.step) === current);
    });
    indicators.forEach(function (ind) {
      var n = Number(ind.dataset.stepIndicator);
      ind.classList.toggle("is-active", n === current);
      ind.classList.toggle("is-done", n < current);
    });
    if (current === totalSteps) buildSummary();
  }

  function validateStep(step) {
    if (step === 1) {
      var picked = form.querySelector('input[name="service"]:checked');
      showError("service", !picked);
      return !!picked;
    }
    if (step === 2) {
      var date = form.date.value;
      var time = form.time.value;
      var ok = !!date && !!time;
      showError("datetime", !ok);
      return ok;
    }
    if (step === 3) {
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var suburb = form.suburb.value;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var ok = !!name && emailOk && !!suburb;
      showError("details", !ok);
      return ok;
    }
    return true;
  }

  form.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (validateStep(current)) goToStep(current + 1);
    });
  });
  form.querySelectorAll("[data-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      goToStep(current - 1);
    });
  });

  function gatherData() {
    var picked = form.querySelector('input[name="service"]:checked');
    return {
      Service: picked ? picked.value : "—",
      Date: form.date.value || "—",
      Time: form.time.value || "—",
      Name: form.name.value.trim() || "—",
      Email: form.email.value.trim() || "—",
      Suburb: form.suburb.value || "—",
      Pet: form.pet.value.trim() || "—"
    };
  }

  function buildSummary() {
    var data = gatherData();
    var dl = document.getElementById("confirm-summary");
    if (!dl) return;
    dl.innerHTML = "";
    Object.keys(data).forEach(function (key) {
      var row = document.createElement("div");
      var dt = document.createElement("dt");
      var dd = document.createElement("dd");
      dt.textContent = key;
      dd.textContent = data[key];
      row.appendChild(dt);
      row.appendChild(dd);
      dl.appendChild(row);
    });
  }

  /* ---------- Confirmation → mailto (no payment, no server) ---------- */
  var sendBtn = document.getElementById("confirm-send");
  if (sendBtn) {
    sendBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var data = gatherData();
      var subject = "Booking request — " + data.Service;
      var bodyLines = [
        "Hi Leighton,",
        "",
        "I'd like to request a booking:",
        "",
        "Service: " + data.Service,
        "Preferred date: " + data.Date,
        "Preferred time: " + data.Time,
        "Suburb: " + data.Suburb,
        "Name: " + data.Name,
        "Email: " + data.Email,
        "About my pet: " + data.Pet,
        "",
        "Thanks!"
      ];
      var href =
        "mailto:Leightoncunn@pm.me" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));
      window.location.href = href;
    });
  }

  /* ---------- Walk report builder (client-side preview only) ---------- */
  var reportBtn = document.getElementById("report-preview-btn");
  var reportPreview = document.getElementById("report-preview");
  var reportForm = document.getElementById("report-form");

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (reportBtn && reportPreview && reportForm) {
    reportBtn.addEventListener("click", function () {
      var dog = reportForm.dog.value.trim() || "Your dog";
      var route = reportForm.route.value.trim() || "—";
      var notes = reportForm.notes.value.trim() || "—";
      var files = reportForm.photos.files;

      var html =
        '<article class="report-card">' +
          '<header class="report-card-head">' +
            "<div><h3>Walk report &mdash; " + escapeHtml(dog) + "</h3>" +
            '<p class="report-meta">Preview</p></div>' +
            '<span class="report-stamp">Draft</span>' +
          "</header>" +
          '<dl class="report-stats">' +
            "<div><dt>Route</dt><dd>" + escapeHtml(route) + "</dd></div>" +
          "</dl>" +
          '<div class="report-preview-photos" id="report-preview-photos"></div>' +
          '<p class="report-notes"><strong>Notes:</strong> ' + escapeHtml(notes) + "</p>" +
        "</article>";

      reportPreview.innerHTML = html;
      reportPreview.hidden = false;

      var photoWrap = document.getElementById("report-preview-photos");
      if (files && files.length) {
        Array.prototype.slice.call(files).forEach(function (file) {
          if (!file.type || file.type.indexOf("image/") !== 0) return;
          var img = document.createElement("img");
          img.alt = "Walk photo";
          img.src = URL.createObjectURL(file);
          img.onload = function () { URL.revokeObjectURL(img.src); };
          photoWrap.appendChild(img);
        });
      }
    });
  }
})();
