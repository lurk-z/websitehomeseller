/* eslint-disable */
(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════════════
   *  UX Analytics Tracker v4.1 — "ติดตั้งครั้งเดียว เก็บทุกหน้า"
   *  ──────────────────────────────────────────────────────────
   *  เมื่อเจ้าของเว็บวาง <script> นี้ครั้งเดียวในทุกหน้า script
   *  จะ auto-detect ทุกหน้าที่ผู้เข้าชมเปิดโดยอัตโนมัติ ทั้ง:
   *    • Multi-page apps (MPA) — script โหลดใหม่ทุกหน้า
   *    • Single-page apps (SPA) — pushState/replaceState/popstate/hashchange
   *    • Hybrid — ผสม MPA+SPA
   *
   *  Events ที่เก็บ:
   *    pageview, click, scroll, viewport (heartbeat), form,
   *    page_height, page_discover, rage_click, dead_click,
   *    js_error, web_vital
   * ═══════════════════════════════════════════════════════════════ */

  var script = document.currentScript;
  if (!script) { console.warn("[analytics] currentScript not found"); return; }

  // ── DNT / GPC privacy ──
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) {
    console.info("[analytics] Tracking disabled (DNT/GPC)");
    return;
  }

  /* ──────────────────────────────────────────────────────────
   *  CONSENT FLAG — respect window.__analyticsConsent
   *
   *  If a site sets window.__analyticsConsent = false before
   *  this script runs, tracking will be paused automatically.
   *  The site can also call window.__analytics.setConsent(true/false)
   *  at any time (e.g. after cookie-consent banner interaction).
   * ────────────────────────────────────────────────────────── */
  var CONSENT_STORAGE_KEY = "__analytics_consent";
  var FORM_CONSENT_KEY = "__analytics_form_consent";
  var CONSENT_VERSION_KEY = "__analytics_consent_version";
  var CONSENT_VERSION = script.dataset.consentVersion || "2026-05-form-consent-v2";
  var _consentGranted = true;
  var _formConsentGranted = false;

  function getStoredConsent() {
    try {
      if (localStorage.getItem(CONSENT_VERSION_KEY) !== CONSENT_VERSION) return null;
      var stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      return stored === "granted" || stored === "denied" ? stored : null;
    } catch (e) {
      return null;
    }
  }

  function getStoredFormConsent() {
    try {
      var stored = localStorage.getItem(FORM_CONSENT_KEY);
      return stored === "true";
    } catch (e) {
      return false;
    }
  }

  function removeConsentStatus() {
    var existing = document.getElementById("__anlx-consent-status");
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }

  function showConsentStatus(decision) {
    if (script.dataset.consentStatus === "false") return;
    if (decision !== "granted" && decision !== "denied") return;
    if (!document.body) return;

    removeConsentStatus();

    var accepted = decision === "granted";
    var box = document.createElement("button");
    box.id = "__anlx-consent-status";
    box.type = "button";
    box.setAttribute("data-anlx-ui", "true");
    box.setAttribute("aria-label", "Analytics consent status");
    box.style.cssText = [
      "all:initial",
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:2147483645",
      "display:flex",
      "align-items:center",
      "gap:8px",
      "padding:9px 12px",
      "border-radius:999px",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
      "font-size:12px",
      "font-weight:700",
      "line-height:1",
      "cursor:pointer",
      "box-shadow:0 12px 30px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.08)",
      accepted ? "background:#ecfdf5;color:#047857" : "background:#fff7ed;color:#9a3412"
    ].join(";");
    box.innerHTML = [
      '<span style="display:inline-flex;width:8px;height:8px;border-radius:999px;background:',
      accepted ? '#10b981' : '#f97316',
      '"></span>',
      '<span>',
      accepted ? (script.dataset.consentStatusAccepted || 'ยอมรับ Analytics') : (script.dataset.consentStatusDenied || 'ปฏิเสธ Analytics'),
      '</span>',
      '<span style="font-weight:600;opacity:.7">',
      script.dataset.consentStatusChange || 'เปลี่ยน',
      '</span>'
    ].join("");
    box.addEventListener("click", function () {
      try { localStorage.removeItem(CONSENT_STORAGE_KEY); } catch (e) {}
      try { localStorage.removeItem(CONSENT_VERSION_KEY); } catch (e) {}
      window.location.reload();
    });
    document.body.appendChild(box);
  }

  /* ── Check pre-init flag ── */
  if (typeof window.__analyticsConsent !== "undefined" && window.__analyticsConsent === false) {
    _consentGranted = false;
    console.info("[analytics] Tracking paused (consent not granted)");
  }

  /* ── Built-in consent banner ──────────────────────────────────────────────
   *  Enabled by default. Add data-consent-banner="false" on the <script> tag
   *  if the tracked site already has its own consent flow.
   *  Optional customisation attributes:
   *    data-consent-title="…"       Banner heading text
   *    data-consent-message="…"     Body text
   *    data-consent-accept="…"      Accept button label
   *    data-consent-decline="…"     Decline button label
   *    data-consent-position="…"    "bottom" (default) | "top"
   *
   *  Example:
   *    <script src="tracker.js"
   *      data-project="YOUR_KEY"
   *      data-consent-banner="true"
   *      data-consent-message="เราเก็บข้อมูลการใช้งานเพื่อปรับปรุงประสบการณ์">
   *    </script>
   * ─────────────────────────────────────────────────────────────────────── */
  (function initConsentBanner() {
    var useBanner = script.dataset.consentBanner !== "false";
    if (!useBanner) return;

    /* Read stored decision */
    var stored = getStoredConsent();
    if (stored === "granted") {
      _consentGranted = true;
      _formConsentGranted = getStoredFormConsent();
      if (document.body) showConsentStatus("granted");
      else document.addEventListener("DOMContentLoaded", function () { showConsentStatus("granted"); });
      return;
    }
    if (stored === "denied") {
      _consentGranted = false;
      if (document.body) showConsentStatus("denied");
      else document.addEventListener("DOMContentLoaded", function () { showConsentStatus("denied"); });
      return;
    }

    /* No stored decision → pause tracking until user decides */
    _consentGranted = false;

    /* Customisable text */
    var title        = script.dataset.consentTitle    || "เว็บไซต์นี้ใช้คุกกี้และเก็บข้อมูลการใช้งาน";
    var message      = script.dataset.consentMessage  || "เราเก็บข้อมูลพฤติกรรมการใช้งาน เพื่อวิเคราะห์และปรับปรุงประสบการณ์ของคุณให้ดียิ่งขึ้น";
    var acceptLabel  = script.dataset.consentAccept   || "ยอมรับทั้งหมด";
    var declineLabel = script.dataset.consentDecline  || "ปฏิเสธ";

    function _escHtml(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    /* Inject styles */
    var style = document.createElement("style");
    style.setAttribute("data-anlx-ui", "true");
    style.textContent = [
      /* Overlay */
      "#__anlx-overlay{all:initial;position:fixed;inset:0;z-index:2147483646;",
      "background:rgba(0,0,0,0.55);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);}",
      /* Modal card */
      "#__anlx-consent{all:initial;position:fixed;z-index:2147483647;",
      "top:50%;left:50%;transform:translate(-50%,-50%);",
      "width:min(520px,calc(100vw - 32px));",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;",
      "background:#fff;border-radius:20px;",
      "box-shadow:0 24px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06);}",
      "#__anlx-consent *{all:unset;box-sizing:border-box;}",
      /* Header strip */
      "#__anlx-c-head{display:block;padding:20px 24px 0;border-radius:20px 20px 0 0;}",
      "#__anlx-c-icon{display:flex;align-items:center;justify-content:center;",
      "width:44px;height:44px;border-radius:12px;background:#FFF3E0;margin-bottom:12px;}",
      "#__anlx-c-icon svg{display:block;}",
      "#__anlx-c-title{display:block;font-size:17px;font-weight:700;color:#111827;line-height:1.3;margin-bottom:6px;}",
      "#__anlx-c-subtitle{display:block;font-size:13px;color:#6b7280;line-height:1.6;}",
      /* Data list */
      "#__anlx-c-list{display:block;margin:16px 24px;padding:14px 16px;",
      "background:#f9fafb;border:1px solid #f0f0f0;border-radius:12px;}",
      "#__anlx-c-list-title{display:block;font-size:11px;font-weight:700;",
      "text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:10px;}",
      "#__anlx-consent .anlx-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;}",
      "#__anlx-consent .anlx-item:last-child{margin-bottom:0;}",
      "#__anlx-consent .anlx-item-icon{display:flex;align-items:center;justify-content:center;",
      "width:28px;height:28px;border-radius:8px;flex-shrink:0;margin-top:1px;}",
      "#__anlx-consent .anlx-item-text{display:flex;flex-direction:column;gap:1px;}",
      "#__anlx-consent .anlx-item-label{display:block;font-size:13px;font-weight:600;color:#374151;}",
      "#__anlx-consent .anlx-item-desc{display:block;font-size:12px;color:#6b7280;line-height:1.5;}",
      /* Privacy note */
      "#__anlx-c-note{display:flex;align-items:flex-start;gap:8px;",
      "margin:0 24px 16px;padding:10px 12px;",
      "background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;}",
      "#__anlx-c-note svg{flex-shrink:0;margin-top:1px;}",
      "#__anlx-c-note span{display:block;font-size:12px;color:#166534;line-height:1.55;}",
      /* Actions */
      "#__anlx-c-actions{display:flex;gap:10px;padding:0 24px 20px;flex-wrap:wrap;}",
      "#__anlx-btn-accept{display:inline-flex;align-items:center;justify-content:center;flex:1;",
      "padding:11px 20px;background:#FF9500;color:#fff;",
      "font-size:14px;font-weight:700;border-radius:10px;cursor:pointer;min-width:140px;}",
      "#__anlx-btn-accept:hover{background:#e68600;}",
      "#__anlx-btn-decline{display:inline-flex;align-items:center;justify-content:center;flex:1;",
      "padding:11px 20px;color:#374151;background:#fff;",
      "font-size:14px;font-weight:600;border-radius:10px;cursor:pointer;",
      "border:1.5px solid #e5e7eb;min-width:120px;}",
      "#__anlx-btn-decline:hover{background:#f9fafb;}",
      /* Dark mode */
      "@media(prefers-color-scheme:dark){",
      "#__anlx-consent{background:#1e1e2e;box-shadow:0 24px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.08);}",
      "#__anlx-c-title{color:#f9fafb;}",
      "#__anlx-c-subtitle{color:#9ca3af;}",
      "#__anlx-c-list{background:#2a2a3e;border-color:#3f3f5a;}",
      "#__anlx-c-list-title{color:#6b7280;}",
      "#__anlx-consent .anlx-item-label{color:#e5e7eb;}",
      "#__anlx-consent .anlx-item-desc{color:#9ca3af;}",
      "#__anlx-c-note{background:#052e16;border-color:#166534;}",
      "#__anlx-c-note span{color:#86efac;}",
      "#__anlx-btn-decline{color:#e5e7eb;background:#2a2a3e;border-color:#3f3f5a;}",
      "#__anlx-btn-decline:hover{background:#3f3f5a;}}",
      /* Mobile */
      "@media(max-width:480px){",
      "#__anlx-c-actions{flex-direction:column;}",
      "#__anlx-btn-accept,#__anlx-btn-decline{min-width:unset;}}",
    ].join("");
    document.head.appendChild(style);

    /* Overlay */
    var overlay = document.createElement("div");
    overlay.id = "__anlx-overlay";
    overlay.setAttribute("data-anlx-ui", "true");

    /* Build modal DOM */
    var modal = document.createElement("div");
    modal.id = "__anlx-consent";
    modal.setAttribute("data-anlx-ui", "true");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Cookie consent");
    modal.innerHTML = [
      '<div id="__anlx-c-head">',
        '<div id="__anlx-c-icon">',
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#FF9500"/>',
          '</svg>',
        '</div>',
        '<span id="__anlx-c-title">', _escHtml(title), '</span>',
        '<span id="__anlx-c-subtitle">', _escHtml(message), '</span>',
      '</div>',
      '<div id="__anlx-c-list">',
        '<span id="__anlx-c-list-title">ข้อมูลที่เราเก็บรวบรวม</span>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#EFF6FF">',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
          '</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">หน้าที่เยี่ยมชม & เส้นทางการนำทาง</span>',
            '<span class="anlx-item-desc">URL ของหน้า, ชื่อหน้า, หน้าก่อนหน้า และระยะเวลาที่อยู่บนแต่ละหน้า</span>',
          '</div>',
        '</div>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#FFF7ED">',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="#f97316"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>',
          '</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">การคลิกและการเลื่อนหน้า</span>',
            '<span class="anlx-item-desc">ตำแหน่งที่คลิก, ปุ่มที่กด, ระยะที่เลื่อน และพื้นที่ที่ผู้ใช้ให้ความสนใจ</span>',
          '</div>',
        '</div>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#F0FDF4">',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8H7v8h2V8zm4 3h-2v5h2v-5zm4-5h-2v10h2V6z"/></svg>',
          '</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">ข้อมูลอุปกรณ์และเบราว์เซอร์</span>',
            '<span class="anlx-item-desc">ขนาดหน้าจอ, ระบบปฏิบัติการ, ประเภทเบราว์เซอร์</span>',
          '</div>',
        '</div>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#ECFDF5">',
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="#059669"><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 15.5-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z"/></svg>',
          '</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">การใช้งานฟอร์มโดยไม่เก็บข้อมูลจริง</span>',
            '<span class="anlx-item-desc">เก็บเฉพาะเหตุการณ์ เช่น focus, blur, submit และชื่อช่องฟอร์มเท่านั้น ไม่เก็บค่าที่พิมพ์จริง เช่น รหัสผ่าน อีเมล เบอร์โทร หรือข้อความ</span>',
          '</div>',
        '</div>',
      '</div>',
      /* Form data consent toggle */
      '<div id="__anlx-c-form-toggle" style="all:initial;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 24px 16px;padding:12px 14px;background:#fef9f3;border:1px solid #fed7aa;border-radius:12px;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;">',
        '<div style="all:initial;display:flex;flex-direction:column;gap:2px;">',
          '<span style="all:initial;display:block;font-size:13px;font-weight:600;color:#92400e;">อนุญาตเก็บข้อมูลฟอร์มจริง</span>',
          '<span style="all:initial;display:block;font-size:11px;color:#b45309;line-height:1.5;">เปิด = เก็บค่าที่กรอก &nbsp;|&nbsp; ปิด = mask เป็น ****</span>',
        '</div>',
        '<label id="__anlx-form-switch" style="all:initial;position:relative;display:inline-flex;cursor:pointer;width:42px;height:24px;flex-shrink:0;">',
          '<input type="checkbox" id="__anlx-form-check" style="all:initial;position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);" />',
          '<span id="__anlx-form-track" style="all:initial;position:absolute;inset:0;border-radius:999px;background:#e5e7eb;transition:background .2s;"></span>',
          '<span id="__anlx-form-thumb" style="all:initial;position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.15);transition:transform .2s;"></span>',
        '</label>',
      '</div>',
      '<div id="__anlx-c-note">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" style="flex-shrink:0;margin-top:2px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>',
        '<span>ข้อมูลทั้งหมดใช้เพื่อวิเคราะห์ประสบการณ์การใช้งานเท่านั้น <strong>ไม่ขายข้อมูล</strong>, <strong>ไม่แชร์กับบุคคลที่สาม</strong></span>',
      '</div>',
      '<div id="__anlx-c-actions">',
        '<button id="__anlx-btn-accept" type="button">', _escHtml(acceptLabel), '</button>',
        '<button id="__anlx-btn-decline" type="button">', _escHtml(declineLabel), '</button>',
      '</div>',
    ].join("");

    overlay.style.cssText = [
      "all:initial",
      "position:fixed",
      "inset:0",
      "z-index:2147483646",
      "background:rgba(15,23,42,0.46)",
      "backdrop-filter:blur(5px)",
      "-webkit-backdrop-filter:blur(5px)"
    ].join(";");
    modal.style.cssText = [
      "all:initial",
      "position:fixed",
      "right:20px",
      "bottom:20px",
      "z-index:2147483647",
      "width:min(560px,calc(100vw - 32px))",
      "max-height:calc(100vh - 40px)",
      "overflow:auto",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
      "background:#fffdf8",
      "border:1px solid rgba(120,113,108,0.18)",
      "border-radius:18px",
      "box-shadow:0 22px 70px rgba(15,23,42,0.24),0 1px 0 rgba(255,255,255,0.8) inset"
    ].join(";");

    var _dataList = modal.querySelector("#__anlx-c-list");
    if (_dataList) {
      _dataList.innerHTML = [
        '<span id="__anlx-c-list-title">ข้อมูลที่ระบบวิเคราะห์</span>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#e0f2fe;color:#0369a1;font-weight:800;font-size:12px;">01</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">หน้าเว็บและเส้นทางการใช้งาน</span>',
            '<span class="anlx-item-desc">URL, ชื่อหน้า, หน้าก่อนหน้า และเวลาที่อยู่บนหน้า เพื่อดูว่าผู้ใช้หลุดตรงไหน</span>',
          '</div>',
        '</div>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#fef3c7;color:#92400e;font-weight:800;font-size:12px;">02</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">คลิก การเลื่อน และปัญหาการใช้งาน</span>',
            '<span class="anlx-item-desc">เก็บตำแหน่งปุ่มที่กด ระยะการเลื่อน และเหตุการณ์ที่ช่วยวิเคราะห์ UX</span>',
          '</div>',
        '</div>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#dcfce7;color:#166534;font-weight:800;font-size:12px;">03</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">อุปกรณ์และเบราว์เซอร์</span>',
            '<span class="anlx-item-desc">ประเภทอุปกรณ์ ขนาดหน้าจอ และเบราว์เซอร์ เพื่อแก้ปัญหาการแสดงผล</span>',
          '</div>',
        '</div>',
        '<div class="anlx-item">',
          '<div class="anlx-item-icon" style="background:#ede9fe;color:#6d28d9;font-weight:800;font-size:12px;">04</div>',
          '<div class="anlx-item-text">',
            '<span class="anlx-item-label">ฟอร์ม: ค่าเริ่มต้นไม่อ่านข้อมูลที่กรอก</span>',
            '<span class="anlx-item-desc">ระบบดูเฉพาะ focus, blur, submit และชื่อช่องฟอร์ม หากเปิดสวิตช์ด้านล่างจะเก็บค่าจริงเฉพาะช่อง message/ข้อความเท่านั้น</span>',
          '</div>',
        '</div>'
      ].join("");
    }

    var _formToggle = modal.querySelector("#__anlx-c-form-toggle");
    if (_formToggle) {
      _formToggle.style.cssText = [
        "all:initial",
        "display:flex",
        "align-items:center",
        "justify-content:space-between",
        "gap:14px",
        "margin:0 24px 16px",
        "padding:14px 16px",
        "background:linear-gradient(135deg,#fff7ed,#fefce8)",
        "border:1px solid #fdba74",
        "border-radius:14px",
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
      ].join(";");
      var _formText = _formToggle.querySelector("div");
      if (_formText) {
        _formText.innerHTML = [
          '<span style="all:initial;display:block;font-size:13px;font-weight:800;color:#7c2d12;">อนุญาตเก็บเฉพาะข้อความในฟอร์ม</span>',
          '<span style="all:initial;display:block;margin-top:3px;font-size:11px;color:#9a3412;line-height:1.55;">เปิดแล้วเก็บค่าจริงเฉพาะช่อง message/ข้อความ เพื่ออ่านความต้องการของผู้ใช้ ไม่เก็บชื่อ อีเมล เบอร์โทร รหัสผ่าน หรือข้อมูลส่วนตัวอื่น ๆ</span>'
        ].join("");
      }
    }

    function removeBanner() {
      try { overlay.parentNode && overlay.parentNode.removeChild(overlay); } catch(e) {}
      try { modal.parentNode && modal.parentNode.removeChild(modal); } catch(e) {}
    }

    /* Wire form data toggle */
    var _formCheckbox = modal.querySelector("#__anlx-form-check");
    var _formTrack = modal.querySelector("#__anlx-form-track");
    var _formThumb = modal.querySelector("#__anlx-form-thumb");
    if (_formCheckbox) {
      _formCheckbox.addEventListener("change", function () {
        var on = _formCheckbox.checked;
        if (_formTrack) _formTrack.style.background = on ? "#FF9500" : "#e5e7eb";
        if (_formThumb) _formThumb.style.transform = on ? "translateX(18px)" : "none";
      });
    }

    modal.querySelector("#__anlx-btn-accept").addEventListener("click", function () {
      try { localStorage.setItem(CONSENT_STORAGE_KEY, "granted"); } catch(e) {}
      try { localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_VERSION); } catch(e) {}
      var formChecked = _formCheckbox ? _formCheckbox.checked : false;
      try { localStorage.setItem(FORM_CONSENT_KEY, formChecked ? "true" : "false"); } catch(e) {}
      _consentGranted = true;
      _formConsentGranted = formChecked;
      console.info("[analytics] Tracking resumed (consent granted, form data: " + (formChecked ? "message only" : "masked") + ")");
      removeBanner();
      showConsentStatus("granted");
      flush(true); // send initial events that were held back
    });

    modal.querySelector("#__anlx-btn-decline").addEventListener("click", function () {
      try { localStorage.setItem(CONSENT_STORAGE_KEY, "denied"); } catch(e) {}
      try { localStorage.setItem(CONSENT_VERSION_KEY, CONSENT_VERSION); } catch(e) {}
      _consentGranted = false;
      console.info("[analytics] Tracking paused (consent denied)");
      removeBanner();
      showConsentStatus("denied");
    });

    /* Show modal after DOM ready */
    function appendBanner() {
      document.body.appendChild(overlay);
      document.body.appendChild(modal);
    }

    if (document.body) {
      appendBanner();
    } else {
      document.addEventListener("DOMContentLoaded", appendBanner);
    }
  })();

  var endpoint = script.dataset.endpoint || "/api/collect";
  var projectKey = script.dataset.project || "";
  if (!projectKey) { console.warn("[analytics] missing data-project"); return; }

  /* ────────────────── Event type toggles (fetched from server) ────────────────── */
  var _eventToggles = {
    track_clicks: true, track_scroll: true, track_forms: true, track_viewport: true,
    track_rage_clicks: true, track_dead_clicks: true, track_js_errors: true, track_web_vitals: true,
    form_value_allowlist: [], form_masking_rules: {},
  };
  var TOGGLE_CACHE_KEY = "__analytics_toggles_" + projectKey;
  // Load cached toggles from sessionStorage
  try {
    var cached = sessionStorage.getItem(TOGGLE_CACHE_KEY);
    if (cached) { var parsed = JSON.parse(cached); if (parsed && typeof parsed === "object") _eventToggles = parsed; }
  } catch (e) {}
  // Fetch fresh toggles in background (non-blocking)
  (function fetchToggles() {
    try {
      var settingsUrl = endpoint.replace(/\/api\/collect\/?$/, "/api/settings/tracker") + "?projectKey=" + encodeURIComponent(projectKey);
      fetch(settingsUrl, { cache: "default" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          if (data && typeof data === "object") {
            _eventToggles = data;
            try { sessionStorage.setItem(TOGGLE_CACHE_KEY, JSON.stringify(data)); } catch (e) {}
          }
        })
        .catch(function () {});
    } catch (e) {}
  })();

  /* ────────────────── Session management ────────────────── */
  var SESSION_KEY = "__analytics_session";
  var SESSION_TTL = 30 * 60 * 1000;

  function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function ssGet() { try { var r = sessionStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function ssSet(v) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(v)); } catch (e) {} }

  function getSession() {
    var now = Date.now(), s = ssGet();
    if (s && s.id && s.expiresAt > now) { s.expiresAt = now + SESSION_TTL; ssSet(s); return s; }
    var n = { id: uid(), startedAt: new Date().toISOString(), expiresAt: now + SESSION_TTL };
    ssSet(n); return n;
  }

  var session = getSession();

  /* ────────────────── Browser & OS detection ────────────────── */
  function parseBrowserOS() {
    var ua = navigator.userAgent || "";
    var browser = "Unknown", browserVersion = "", os = "Unknown", osVersion = "";
    // Browser
    if (/Edg\/(\d[\d.]*)/i.test(ua))          { browser = "Edge";    browserVersion = RegExp.$1; }
    else if (/OPR\/(\d[\d.]*)/i.test(ua))     { browser = "Opera";   browserVersion = RegExp.$1; }
    else if (/Chrome\/(\d[\d.]*)/i.test(ua))   { browser = "Chrome";  browserVersion = RegExp.$1; }
    else if (/Firefox\/(\d[\d.]*)/i.test(ua))  { browser = "Firefox"; browserVersion = RegExp.$1; }
    else if (/Version\/(\d[\d.]*).*Safari/i.test(ua)) { browser = "Safari"; browserVersion = RegExp.$1; }
    else if (/MSIE (\d[\d.]*)/i.test(ua) || /Trident.*rv:(\d[\d.]*)/i.test(ua)) { browser = "IE"; browserVersion = RegExp.$1; }
    // OS
    if (/Windows NT (\d[\d.]*)/i.test(ua))       { os = "Windows"; osVersion = RegExp.$1; }
    else if (/Mac OS X (\d[_\d.]*)/i.test(ua))   { os = "macOS"; osVersion = RegExp.$1.replace(/_/g, "."); }
    else if (/Android (\d[\d.]*)/i.test(ua))      { os = "Android"; osVersion = RegExp.$1; }
    else if (/iPhone OS (\d[_\d.]*)/i.test(ua) || /iPad.*OS (\d[_\d.]*)/i.test(ua)) { os = "iOS"; osVersion = (RegExp.$1 || "").replace(/_/g, "."); }
    else if (/Linux/i.test(ua))                    { os = "Linux"; }
    else if (/CrOS/i.test(ua))                     { os = "ChromeOS"; }
    return { browser: browser, browserVersion: browserVersion, os: os, osVersion: osVersion };
  }

  var browserInfo = parseBrowserOS();

  /* ────────────────── Helpers ────────────────── */
  function deviceType() {
    var ua = navigator.userAgent || "";
    if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) return "tablet";
    if (/mobile|iphone|ipod|android/i.test(ua)) return "mobile";
    // iPadOS 13+ sends a desktop-like UA; detect via touch + Mac platform
    if (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) return "tablet";
    return "desktop";
  }

  function elPath(el) {
    var parts = [], cur = el;
    while (cur && parts.length < 5 && cur !== document.body) {
      var f = cur.tagName ? cur.tagName.toLowerCase() : "element";
      if (cur.id) { parts.unshift(f + "#" + cur.id); break; }
      if (cur.className && typeof cur.className === "string") {
        var c = cur.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(".");
        if (c) f += "." + c;
      }
      parts.unshift(f); cur = cur.parentElement;
    }
    return parts.join(" > ");
  }

  /**
   * contentBottom — หาตำแหน่ง bottom ของ element สุดท้ายที่อยู่ใน flow
   * เช่น <footer> หรือ child ตัวสุดท้ายของ <body> ที่ไม่ใช่ absolute/fixed
   * ใช้ค่านี้แทน scrollHeight เพื่อไม่ให้ decorative elements (blobs, parallax)
   * ทำให้ canvas สูงเกินหน้าจริง
   */
  function contentBottom() {
    var body = document.body;
    if (!body) return 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;

    // Strategy 1: look for a <footer> or role="contentinfo"
    var footer = document.querySelector('footer, [role="contentinfo"]');
    if (footer) {
      var fr = footer.getBoundingClientRect();
      if (fr.height > 0) return Math.round(fr.bottom + scrollY);
    }

    // Strategy 2: find the last in-flow direct child of <body>
    var children = body.children;
    var maxBottom = 0;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      try {
        var style = window.getComputedStyle(child);
        var pos = style.position;
        // Skip out-of-flow elements (decorative blobs, fixed headers, etc.)
        if (pos === "absolute" || pos === "fixed") continue;
        // Skip invisible
        if (style.display === "none") continue;
        if (child.offsetHeight === 0) continue;

        var rect = child.getBoundingClientRect();
        var bottom = rect.bottom + scrollY;
        if (bottom > maxBottom) maxBottom = bottom;
      } catch (e) { /* skip */ }
    }
    return Math.round(maxBottom);
  }

  function metrics() {
    var d = document.documentElement, b = document.body;
    var vw = window.innerWidth, vh = window.innerHeight;
    var scrollW = Math.max(d ? d.scrollWidth : 0, b ? b.scrollWidth : 0, vw);
    var scrollH = Math.max(d ? d.scrollHeight : 0, b ? b.scrollHeight : 0, vh);
    var offsetW = Math.max(d ? d.offsetWidth : 0, b ? b.offsetWidth : 0);
    var offsetH = Math.max(d ? d.offsetHeight : 0, b ? b.offsetHeight : 0);
    var pw = (offsetW > 0 && offsetW <= scrollW * 2) ? Math.max(scrollW, offsetW) : scrollW;

    // Prefer content-bottom (footer) measurement over raw scrollHeight
    var cb = contentBottom();
    var rawH = (offsetH > 0 && offsetH <= scrollH * 2) ? Math.max(scrollH, offsetH) : scrollH;
    // Prefer the full scrollable height so the 90%-100% canvas zone is not clipped.
    // Only shrink when raw height is clearly inflated by decorative positioned elements.
    var ph = Math.max(rawH, cb, vh);
    if (cb >= vh && rawH > cb * 1.8 && rawH > vh * 10) {
      ph = cb;
    }
    return { viewportWidth: vw, viewportHeight: vh, pageWidth: pw, pageHeight: ph };
  }

  function ts() { return new Date().toISOString(); }

  /**
   * normalizeUrl — ทำให้ URL มาตรฐานก่อนเก็บใน DB
   *  1. strip query params ที่มีค่าว่าง (e.g. ?name=&email= → /)
   *  2. strip trailing slash (ยกเว้น root /)
   *  3. lowercase scheme+host
   *  NOTE: ไม่ strip hash — เพราะ hash routing (/#/contact) ใช้ # เป็น route
   */
  function normalizeUrl(href) {
    try {
      var u = new URL(href);
      // strip empty-value params
      var keep = new URLSearchParams();
      u.searchParams.forEach(function (val, key) { if (val) keep.append(key, val); });
      u.search = keep.toString() ? "?" + keep.toString() : "";
      // strip trailing slash (not root, not hash-route)
      if (u.pathname !== "/" && u.pathname.slice(-1) === "/" && !u.hash) {
        u.pathname = u.pathname.slice(0, -1);
      }
      return u.href;
    } catch (e) { return href; }
  }

  function pageUrl() { return normalizeUrl(window.location.href); }

  /* ────────────────── Web Worker — off-main-thread queue & network ────────────────── */
  var _worker = null;

  var WORKER_SRC = [
    '"use strict";',
    'var Q=[],MQ=10,FD=2000,ft=null,ep="",pk="",sd=null,pvSent=false,pv=null;',
    'function send(p){var j=JSON.stringify(p);var ka=j.length<60000;fetch(ep,{method:"POST",headers:{"Content-Type":"text/plain"},body:j,keepalive:ka}).catch(function(){});}',
    'function base(){return{projectKey:pk,session:sd,events:Q.splice(0,Q.length)};}',
    'function flush(incPV){if(!incPV&&Q.length===0)return;var p=base();if((incPV||!pvSent)&&pv){p.pageview=pv;pvSent=true;}send(p);if(ft){clearTimeout(ft);ft=null;}}',
    'function sched(){if(ft)return;ft=setTimeout(function(){flush(false);},FD);}',
    'self.onmessage=function(e){var m=e.data;switch(m.cmd){',
    'case"init":ep=m.endpoint;pk=m.projectKey;sd=m.sessionData;break;',
    'case"enqueue":Q.push(m.event);if(Q.length>=MQ){flush(false);return;}sched();break;',
    'case"flush":flush(m.includePageview||false);break;',
    'case"pageview":pv=m.pageview;pvSent=false;break;',
    'case"resetPage":pvSent=false;pv=m.pageview||null;break;',
    'case"snapshot":var p=base();p.snapshot=m.snapshot;if(!pvSent&&pv){p.pageview=pv;pvSent=true;}send(p);break;',
    'case"updateSession":sd=m.sessionData;break;}};',
  ].join('\n');

  function initWorker() {
    if (typeof Worker === 'undefined') return false;
    try {
      var blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
      var blobUrl = URL.createObjectURL(blob);
      _worker = new Worker(blobUrl);
      URL.revokeObjectURL(blobUrl);
      _worker.onerror = function () { _worker = null; };
      _worker.postMessage({
        cmd: 'init',
        endpoint: endpoint,
        projectKey: projectKey,
        sessionData: buildSessionData(),
      });
      return true;
    } catch (e) { _worker = null; return false; }
  }

  var _useWorker = initWorker();

  /* ────────────────── Event batching & network ────────────────── */
  var queue = [];
  var MAX_QUEUE = 10;
  var FLUSH_DELAY = 2000;
  var flushTimer = null;
  var pageviewSent = false;

  function buildPageview() {
    return { url: pageUrl(), title: document.title || undefined, referrer: document.referrer || undefined, enterAt: ts() };
  }

  function sendPayload(payload) {
    var json = JSON.stringify(payload);
    var useKeepalive = json.length < 60000;
    if (typeof fetch !== "undefined") {
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain" }, body: json, keepalive: useKeepalive }).catch(function () {
        if (navigator.sendBeacon && useKeepalive) navigator.sendBeacon(endpoint, new Blob([json], { type: "text/plain" }));
      });
    } else if (navigator.sendBeacon && useKeepalive) {
      navigator.sendBeacon(endpoint, new Blob([json], { type: "text/plain" }));
    }
  }

  function buildSessionData() {
    return {
      id: session.id,
      userAgent: navigator.userAgent,
      deviceType: deviceType(),
      startedAt: session.startedAt,
      browser: browserInfo.browser,
      browserVersion: browserInfo.browserVersion,
      os: browserInfo.os,
      osVersion: browserInfo.osVersion,
      language: navigator.language || (navigator.languages && navigator.languages[0]) || undefined,
      timezone: (typeof Intl !== "undefined" && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
      screenWidth: typeof window.screen !== 'undefined' ? window.screen.width : undefined,
      screenHeight: typeof window.screen !== 'undefined' ? window.screen.height : undefined,
    };
  }

  function flush(includePageview) {
    if (_worker) {
      // Refresh session data (deviceType may have changed e.g. DevTools switch)
      _worker.postMessage({ cmd: 'updateSession', sessionData: buildSessionData() });
      if (includePageview || !pageviewSent) {
        _worker.postMessage({ cmd: 'pageview', pageview: buildPageview() });
        pageviewSent = true;
      }
      _worker.postMessage({ cmd: 'flush', includePageview: !!includePageview });
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      return;
    }
    if (!includePageview && queue.length === 0) return;
    var payload = {
      projectKey: projectKey,
      session: {
        id: session.id,
        userAgent: navigator.userAgent,
        deviceType: deviceType(),
        startedAt: session.startedAt,
        browser: browserInfo.browser,
        browserVersion: browserInfo.browserVersion,
        os: browserInfo.os,
        osVersion: browserInfo.osVersion,
        language: navigator.language || (navigator.languages && navigator.languages[0]) || undefined,
        timezone: (typeof Intl !== "undefined" && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
        screenWidth: typeof window.screen !== "undefined" ? window.screen.width : undefined,
        screenHeight: typeof window.screen !== "undefined" ? window.screen.height : undefined,
      },
      events: queue.splice(0, queue.length),
    };
    if (includePageview || !pageviewSent) { payload.pageview = buildPageview(); pageviewSent = true; }
    sendPayload(payload);
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  }

  function scheduleFlush() { if (flushTimer) return; flushTimer = setTimeout(function () { flush(false); }, FLUSH_DELAY); }

  function enqueue(ev) {
    if (!_consentGranted) return; // respect consent
    if (_worker) {
      _worker.postMessage({ cmd: 'enqueue', event: ev });
      return;
    }
    queue.push(ev);
    if (queue.length >= MAX_QUEUE) { flush(false); return; }
    scheduleFlush();
  }

  /* ══════════════════════════════════════════════════════════
   *  PAGE DISCOVERY ALGORITHM 🧠
   *  ──────────────────────────────────────────────────────
   *  ปัญหา: เราจะรู้ได้ยังไงว่าเว็บที่ติด script มีกี่หน้า?
   *  วิธี: ทุกครั้งที่มี pageview (ทั้ง MPA load ใหม่ / SPA route)
   *  เราจะส่ง "page_discover" event ที่เก็บข้อมูลหน้านั้นๆ ไปด้วย
   *  DB ฝั่ง server aggregate URL ทั้งหมด → ได้รายชื่อหน้าอัตโนมัติ
   *
   *  สำหรับ Traditional multi-page sites:
   *    Script โหลดใหม่ทุกหน้า → page_discover ส่งทุกครั้ง
   *
   *  สำหรับ SPA (React/Vue/Next/Nuxt):
   *    pushState/replaceState/popstate/hashchange → page_discover
   *
   *  สำหรับ iframe preview (heatmap canvas):
   *    postMessage ส่ง height ไปให้ parent
   * ══════════════════════════════════════════════════════════ */
  var currentPageUrl = pageUrl();
  var bestPageHeight = 0; // ความสูงที่ดีที่สุดที่วัดได้สำหรับหน้าปัจจุบัน

  function sendPageDiscover(trigger) {
    var m = metrics();
    // จำความสูงที่ดีที่สุด (เพราะ lazy-loaded content อาจทำให้สูงขึ้นทีหลัง)
    if (m.pageHeight > bestPageHeight) bestPageHeight = m.pageHeight;

    enqueue({
      type: "page_discover",
      payload: {
        url: currentPageUrl,
        title: (document.title || "").slice(0, 300),
        pageHeight: bestPageHeight,
        pageWidth: m.pageWidth,
        viewportHeight: m.viewportHeight,
        viewportWidth: m.viewportWidth,
        deviceType: deviceType(),
        trigger: trigger,
      },
      timestamp: ts(),
    });
  }

  function sendPageHeight(trigger) {
    var m = metrics();
    if (Math.abs(m.pageHeight - bestPageHeight) < 50) return; // ไม่ส่งถ้าเปลี่ยนน้อยมาก
    if (m.pageHeight > bestPageHeight) bestPageHeight = m.pageHeight;

    enqueue({
      type: "page_height",
      payload: {
        url: currentPageUrl,
        pageHeight: bestPageHeight,
        pageWidth: m.pageWidth,
        viewportHeight: m.viewportHeight,
        viewportWidth: m.viewportWidth,
        trigger: trigger,
      },
      timestamp: ts(),
    });

    reportToParentFrame();
  }

  /* ────────────────── iframe ↔ parent communication ────────────────── */
  function reportToParentFrame() {
    if (window.self === window.top) return;
    try {
      var m = metrics();
      if (m.pageHeight > 200) {
        window.parent.postMessage({ type: "__analytics_page_metrics", pageHeight: m.pageHeight, pageWidth: m.pageWidth }, "*");
      }
    } catch (e) {}
  }

  /* ────────────────── Smart height measurement ────────────────── */
  // วัดความสูงหลายรอบเพื่อจับ lazy-loaded content, images, async DOM
  var heightDebounce = null;

  function checkHeight() {
    var m = metrics();
    if (m.pageHeight > bestPageHeight + 50) {
      bestPageHeight = m.pageHeight;
      enqueue({
        type: "page_height",
        payload: {
          url: currentPageUrl,
          pageHeight: bestPageHeight,
          pageWidth: m.pageWidth,
          viewportHeight: m.viewportHeight,
          viewportWidth: m.viewportWidth,
          trigger: "mutation",
        },
        timestamp: ts(),
      });
      reportToParentFrame();
    }
  }

  // MutationObserver จับ DOM changes → วัดความสูงใหม่
  if (typeof MutationObserver !== "undefined") {
    var heightObserver = new MutationObserver(function () {
      if (heightDebounce) clearTimeout(heightDebounce);
      heightDebounce = setTimeout(checkHeight, 300);
    });
    heightObserver.observe(document.documentElement, { childList: true, subtree: true });
  }

  // จับ image/resource load → ความสูงอาจเปลี่ยนหลัง image โหลดเสร็จ
  window.addEventListener("load", function () {
    // วัดหลายรอบ: 0.5s, 1.5s, 3s, 6s, 10s เพื่อจับ lazy content ทุกประเภท
    [500, 1500, 3000, 6000, 10000].forEach(function (delay) {
      setTimeout(function () {
        var m = metrics();
        if (m.pageHeight > bestPageHeight + 50) {
          bestPageHeight = m.pageHeight;
          sendPageHeight("load_settle_" + delay);
        }
        reportToParentFrame();
      }, delay);
    });
  });

  // resize อาจ trigger reflow ทำให้ content สูงขึ้น/ลง
  var resizeDebounce = null;
  window.addEventListener("resize", function () {
    if (resizeDebounce) clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(function () {
      checkHeight();
      reportToParentFrame();
    }, 500);
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════
   *  DOM SNAPSHOT — capture sanitized HTML for heatmap canvas
   *  ──────────────────────────────────────────────────────
   *  Capture document once per URL per session.
   *  Hotjar-style: heatmap uses this snapshot instead of live iframe
   *  so SPA pages, CSP-blocked sites, etc. all work correctly.
   * ══════════════════════════════════════════════════════════ */
  var snapshotSentUrls = {}; // url → true (already sent this session)
  var pendingSnapshot = null; // { url, html, viewportWidth, ... } waiting to be sent

  // Inline all <link rel="stylesheet"> in the cloned DOM as <style> blocks so CSS works in the
  // snapshot iframe (which loads from the analytics dashboard origin, not the tracked site).
  // Strategy: use document.styleSheets (browser already resolved + cached them, no CORS) first;
  // fall back to fetch() for any sheets not found; leave unchanged if both fail.
  function inlineCssStylesheets(clone, onDone) {
    // Build href→cssText map from the browser's live CSSOM (avoids CORS issues).
    var sheetMap = {};
    var sheets = document.styleSheets;
    for (var s = 0; s < sheets.length; s++) {
      try {
        var sheet = sheets[s];
        if (!sheet.href) continue; // skip inline <style> blocks
        var rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        var cssText = '';
        for (var r = 0; r < rules.length; r++) cssText += rules[r].cssText + '\n';
        sheetMap[sheet.href] = cssText;
      } catch (secErr) { /* cross-origin SecurityError — will try fetch fallback */ }
    }

    var styleLinks = [];
    var allLinks = clone.querySelectorAll('link[href]');
    for (var i = 0; i < allLinks.length; i++) {
      var rel = (allLinks[i].getAttribute('rel') || '').toLowerCase();
      if (rel.indexOf('stylesheet') !== -1) {
        styleLinks.push({ el: allLinks[i], href: allLinks[i].getAttribute('href') });
      }
    }
    if (!styleLinks.length) { onDone(); return; }

    function absolutizeCssUrls(css, cssBase) {
      // Absolutize url() references
      css = css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, function(m, u) {
        if (/^(https?:|data:|blob:|#)/i.test(u)) return m;
        try { return 'url("' + new URL(u, cssBase).href + '")'; } catch (e2) { return m; }
      });
      // Absolutize @import "..." and @import url(...)
      css = css.replace(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"](?:\s*\))?/gi, function(m, u) {
        if (/^(https?:|data:|blob:)/i.test(u)) return m;
        try { return m.replace(u, new URL(u, cssBase).href); } catch (e3) { return m; }
      });
      return css;
    }

    function inlineStyle(item, css, href) {
      var cssBase = href.replace(/[^/]*$/, '');
      css = absolutizeCssUrls(css, cssBase);
      var style = document.createElement('style');
      style.setAttribute('data-src', href);
      style.textContent = css;
      if (item.el.parentNode) item.el.parentNode.replaceChild(style, item.el);
    }

    var completed = 0;
    var total = styleLinks.length;
    var finished = false;
    function checkDone() {
      if (finished) return;
      completed++;
      if (completed >= total) { finished = true; clearTimeout(timer); onDone(); }
    }
    var timer = setTimeout(function() { if (!finished) { finished = true; onDone(); } }, 5000);

    for (var si = 0; si < styleLinks.length; si++) {
      (function(item) {
        var href = item.href;
        // Ensure absolute URL
        if (!href.match(/^https?:/i)) {
          try { href = new URL(href, window.location.href).href; } catch (e) { checkDone(); return; }
        }
        // 1) Use browser CSSOM (already loaded, no CORS)
        if (sheetMap[href]) {
          inlineStyle(item, sheetMap[href], href);
          checkDone();
          return;
        }
        // 2) Fall back to fetch (works for same-origin and CORS-enabled CDNs)
        if (typeof fetch === 'undefined') { checkDone(); return; }
        fetch(href, { cache: 'force-cache' })
          .then(function(resp) { return resp.ok ? resp.text() : Promise.reject(); })
          .then(function(css) { inlineStyle(item, css, href); checkDone(); })
          .catch(function() {
            // 3) Leave link tag as-is; CDN CSS may still load in iframe if CORS-enabled
            checkDone();
          });
      })(styleLinks[si]);
    }
  }

  function captureSnapshot() {
    var url = currentPageUrl;
    if (snapshotSentUrls[url]) return;
    snapshotSentUrls[url] = true; // mark before async step to prevent double-capture

    try {
      var clone = document.documentElement.cloneNode(true);

      // Remove all <script> tags
      var scripts = clone.querySelectorAll("script");
      for (var i = scripts.length - 1; i >= 0; i--) scripts[i].parentNode.removeChild(scripts[i]);

      // Remove noscript
      var noscripts = clone.querySelectorAll("noscript");
      for (var j = noscripts.length - 1; j >= 0; j--) noscripts[j].parentNode.removeChild(noscripts[j]);

      // Remove analytics UI (consent modal/status badge) from the static heatmap snapshot.
      var analyticsUi = clone.querySelectorAll('[data-anlx-ui], #__anlx-overlay, #__anlx-consent, #__anlx-consent-status');
      for (var au = analyticsUi.length - 1; au >= 0; au--) {
        if (analyticsUi[au].parentNode) analyticsUi[au].parentNode.removeChild(analyticsUi[au]);
      }

      // Convert relative URLs to absolute for images, links, stylesheets
      // Use full page URL (not just origin) so relative paths on sub-pages resolve correctly.
      // e.g. page at /about/ with href="style.css" → /about/style.css, not /style.css
      var base = window.location.href;

      var imgs = clone.querySelectorAll("img[src]");
      for (var ii = 0; ii < imgs.length; ii++) {
        var src = imgs[ii].getAttribute("src");
        if (src && !src.match(/^(https?:|data:|blob:)/i)) {
          try { imgs[ii].setAttribute("src", new URL(src, base).href); } catch (e) {}
        }
      }

      var links = clone.querySelectorAll("link[href]");
      for (var li = 0; li < links.length; li++) {
        var href = links[li].getAttribute("href");
        if (href && !href.match(/^(https?:|data:|blob:)/i)) {
          try { links[li].setAttribute("href", new URL(href, base).href); } catch (e) {}
        }
      }

      // Add <base> tag so any remaining relative URLs resolve correctly
      var head = clone.querySelector("head");
      if (head) {
        var baseTag = document.createElement("base");
        baseTag.setAttribute("href", base);
        head.insertBefore(baseTag, head.firstChild);
      }

      // Inject style to force-reveal all content in the snapshot.
      // Many sites use JS-driven scroll-reveal (AOS, GSAP, IntersectionObserver)
      // that set opacity:0 / visibility:hidden / transform:translateY initially.
      // Since the snapshot iframe runs with scripts blocked, we must override.
      var freezeStyle = document.createElement("style");
      freezeStyle.textContent = (
        /* Global: only override animation/transition properties.
           Do NOT touch max-height, height, overflow, clip-path globally —
           those are used legitimately for layout, sections, and shaped elements. */
        "*, *::before, *::after {" +
        " opacity: 1 !important; visibility: visible !important;" +
        " animation-duration: 0s !important; animation-delay: -1s !important;" +
        " animation-fill-mode: both !important; transition-duration: 0s !important;" +
        " transition-delay: 0s !important; scroll-behavior: auto !important; }" +
        /* Scroll-reveal / animation frameworks: only reset transform.
           Do NOT reset max-height/overflow here — carousels and sliders
           use overflow:hidden + data-aos and removing it causes massive blank areas. */
        "[data-aos], [data-sr], [data-sr-id], [data-scroll], [data-animate]," +
        "[data-wow-delay], [data-wow-duration], [data-wow-offset], .wow," +
        ".gsap-reveal, [data-sal], [data-rellax-speed] {" +
        " transform: none !important; }"
      );
      if (head) head.appendChild(freezeStyle);

      // Fix inline styles that hide elements — only opacity/visibility/transform,
      // never touch display or height (those are used by legitimate layout elements)
      var hiddenEls = clone.querySelectorAll('[style]');
      for (var hi = 0; hi < hiddenEls.length; hi++) {
        var elStyle = hiddenEls[hi].style;
        if (elStyle.opacity === '0' || elStyle.opacity === '0.0') elStyle.opacity = '1';
        if (elStyle.visibility === 'hidden') elStyle.visibility = 'visible';
        var t = elStyle.transform;
        if (t && t !== 'none' && /translate|scaleY\(0|scaleX\(0|scale\(0/.test(t)) elStyle.transform = 'none';
      }

      // ── Handle scroll-reveal libraries (AOS, GSAP, wow.js, ScrollReveal) ──
      // These libraries set elements to opacity:0 / translateY(50px) initially
      // and reveal them via JS on scroll. Since our iframe blocks scripts,
      // we must force-reveal them at capture time.
      var revealEls = clone.querySelectorAll(
        "[data-aos], [data-sr], [data-sr-id], [data-scroll], " +
        "[data-animate], [data-wow-delay], [data-wow-duration], " +
        "[data-wow-offset], .wow, .gsap-reveal, " +
        "[data-sal], [data-rellax-speed], [data-jarallax]"
      );
      for (var ri = 0; ri < revealEls.length; ri++) {
        revealEls[ri].style.opacity = "1";
        revealEls[ri].style.visibility = "visible";
        revealEls[ri].style.transform = "none";
      }
      // Fix AOS state: mark all as animated so AOS styles resolve to final state
      var aosInits = clone.querySelectorAll(".aos-init");
      for (var aoi = 0; aoi < aosInits.length; aoi++) {
        aosInits[aoi].classList.remove("aos-init");
        aosInits[aoi].classList.add("aos-animate");
      }

      // ── Advanced blank-space collapse ──
      // At capture time we can compare the LIVE DOM (with JS) vs the clone (without JS).
      // Elements that are tall but visually empty in the live DOM, or that rely on JS
      // to populate content (carousels, tab panels, lazy modules), will appear as blank
      // space in the snapshot. We detect and collapse them.
      (function collapseBlankSpace() {
        try {
          var body = clone.querySelector('body');
          if (!body) return;

          // Build a tag→index map so we can find corresponding live elements
          // Walk clone's body descendants and live body descendants in parallel
          var liveBody = document.body;
          if (!liveBody) return;

          // Strategy 1: Detect elements with large explicit height in inline styles
          // but very little text content (JS-populated containers)
          var allEls = body.querySelectorAll('*');
          for (var ci = 0; ci < allEls.length; ci++) {
            var el = allEls[ci];
            var tag = (el.tagName || '').toLowerCase();
            // Skip structural elements
            if (tag === 'html' || tag === 'body' || tag === 'head' || tag === 'header'
                || tag === 'nav' || tag === 'main' || tag === 'article' || tag === 'section'
                || tag === 'footer' || tag === 'style' || tag === 'link' || tag === 'meta'
                || tag === 'img' || tag === 'video' || tag === 'svg' || tag === 'picture'
                || tag === 'canvas' || tag === 'iframe' || tag === 'table') continue;

            var inlineH = el.style.height || '';
            var inlineMinH = el.style.minHeight || '';
            var hasExplicitHeight = false;
            var explicitPx = 0;

            // Check for large explicit height in inline style
            if (inlineH && /^\d+/.test(inlineH)) {
              explicitPx = parseFloat(inlineH);
              if (explicitPx > 300) hasExplicitHeight = true;
            }
            if (inlineMinH && /^\d+/.test(inlineMinH)) {
              var minPx = parseFloat(inlineMinH);
              if (minPx > 300) { hasExplicitHeight = true; explicitPx = Math.max(explicitPx, minPx); }
            }

            if (!hasExplicitHeight) continue;

            // Check if this tall element has very little visible content
            var textLen = (el.textContent || '').replace(/\s+/g, '').length;
            var imgs = el.querySelectorAll('img, svg, video, canvas, picture');
            if (textLen < 30 && imgs.length === 0) {
              // This is a tall, content-empty container — collapse it
              el.style.height = 'auto';
              el.style.minHeight = '0';
              el.setAttribute('data-ux-collapsed', 'empty-tall');
            }
          }

          // Strategy 2: Find containers that are Swiper/Carousel/Slider wrappers
          // (they often have overflow:hidden + huge height from JS-managed slides)
          var carouselSelectors = [
            '.swiper', '.swiper-container', '.slick-slider', '.slick-list',
            '.owl-carousel', '.carousel', '.glide', '.flickity-viewport',
            '[data-carousel]', '[data-slider]', '[data-slick]',
            '.splide', '.keen-slider'
          ].join(',');
          var carousels = body.querySelectorAll(carouselSelectors);
          for (var ci2 = 0; ci2 < carousels.length; ci2++) {
            var cEl = carousels[ci2];
            // Only collapse if it's reasonably tall (> 400px in inline style)
            var ch = cEl.style.height || cEl.style.minHeight || '';
            if (ch && parseFloat(ch) > 400) {
              cEl.style.height = 'auto';
              cEl.style.minHeight = '0';
              cEl.style.overflow = 'visible';
              cEl.setAttribute('data-ux-collapsed', 'carousel');
            }
          }

          // Strategy 3: Bake live DOM heights into the clone.
          // This prevents CSS-class-based heights (min-height:100vh, Tailwind
          // min-h-screen, framework presets) from inflating sections in the
          // static snapshot. We measure each element in the LIVE DOM (where JS
          // has run, layout is final) and write that as the cap on the clone.
          var STRUCT_TAGS = {HEADER:1,NAV:1,FOOTER:1,STYLE:1,LINK:1,SCRIPT:1,HEAD:1,META:1,BR:1,HR:1};
          function bakeChildHeights(liveParent, cloneParent) {
            var liveC = liveParent.children;
            var cloneC = cloneParent.children;
            // Build a tag-matched pair list (scripts were removed from clone)
            var li = 0, ci = 0;
            while (li < liveC.length && ci < cloneC.length) {
              var le = liveC[li], ce = cloneC[ci];
              if (!le || !ce) { li++; ci++; continue; }
              var lt = (le.tagName || '').toUpperCase();
              var ct = (ce.tagName || '').toUpperCase();
              // Skip removed tags in live (script/noscript not in clone)
              if (lt === 'SCRIPT' || lt === 'NOSCRIPT') { li++; continue; }
              if (lt !== ct) { li++; ci++; continue; }
              try {
                if (STRUCT_TAGS[ct]) { li++; ci++; continue; }
                var rect = le.getBoundingClientRect();
                if (rect.height < 5) {
                  ce.style.display = 'none';
                  ce.setAttribute('data-ux-collapsed', 'invisible-live');
                  li++; ci++; continue;
                }
                var h = Math.round(rect.height);
                if (h > 5 && h < 15000) {
                  ce.style.setProperty('max-height', h + 'px', 'important');
                  ce.style.setProperty('min-height', '0px', 'important');
                  ce.style.overflow = 'hidden';
                  ce.setAttribute('data-ux-collapsed', 'height-baked');
                }
              } catch (e6) { /* skip */ }
              li++; ci++;
            }
          }
          bakeChildHeights(liveBody, body);
          // SPA wrappers: if body has few children, also process their children
          // (handles #root, #app, #__next, etc.)
          var topCloneKids = body.children;
          var topLiveKids = liveBody.children;
          for (var wi = 0; wi < topCloneKids.length && wi < topLiveKids.length; wi++) {
            try {
              var cw = topCloneKids[wi], lw = topLiveKids[wi];
              if (!cw || !lw) continue;
              if ((cw.tagName||'') !== (lw.tagName||'')) continue;
              var cwTag = (cw.tagName||'').toUpperCase();
              if (cwTag === 'DIV' || cwTag === 'MAIN' || cwTag === 'SECTION') {
                bakeChildHeights(lw, cw);
              }
            } catch (e6b) { /* skip */ }
          }

        } catch (e7) { /* blank-space collapse failed silently */ }
      })();

      // ── Inline background-image URLs → absolute ──
      var bgEls = clone.querySelectorAll('[style*="background"]');
      for (var bi = 0; bi < bgEls.length; bi++) {
        var bgStyle = bgEls[bi].getAttribute("style");
        if (bgStyle && /url\s*\(/i.test(bgStyle)) {
          bgEls[bi].setAttribute("style", bgStyle.replace(
            /url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/gi,
            function (m, u) {
              if (/^(https?:|data:|blob:)/i.test(u)) return m;
              try { return 'url("' + new URL(u, base).href + '")'; } catch (e) { return m; }
            }
          ));
        }
      }

      // Convert lazy-loaded images to eager so they render in srcDoc iframe
      var lazyImgs = clone.querySelectorAll('img[loading="lazy"]');
      for (var li2 = 0; li2 < lazyImgs.length; li2++) {
        lazyImgs[li2].setAttribute("loading", "eager");
      }

      // Convert srcset URLs to absolute
      var srcsetEls = clone.querySelectorAll("img[srcset], source[srcset]");
      for (var si2 = 0; si2 < srcsetEls.length; si2++) {
        var srcsetVal = srcsetEls[si2].getAttribute("srcset");
        if (srcsetVal) {
          try {
            srcsetEls[si2].setAttribute("srcset", srcsetVal.replace(/(\S+)/g, function (match, p1) {
              if (/^\d/.test(p1) || /^\d+[wx]$/.test(p1)) return p1;
              if (/^(https?:|data:|blob:)/i.test(p1)) return p1;
              try { return new URL(p1, base).href; } catch (e2) { return p1; }
            }));
          } catch (e3) { /* skip */ }
        }
      }

      // Fix <video poster=...> and <source src=...> URLs
      var vidPosters = clone.querySelectorAll("video[poster]");
      for (var vp = 0; vp < vidPosters.length; vp++) {
        var poster = vidPosters[vp].getAttribute("poster");
        if (poster && !poster.match(/^(https?:|data:|blob:)/i)) {
          try { vidPosters[vp].setAttribute("poster", new URL(poster, base).href); } catch (e) {}
        }
      }
      var sourceSrcs = clone.querySelectorAll("source[src]");
      for (var ss = 0; ss < sourceSrcs.length; ss++) {
        var sSrc = sourceSrcs[ss].getAttribute("src");
        if (sSrc && !sSrc.match(/^(https?:|data:|blob:)/i)) {
          try { sourceSrcs[ss].setAttribute("src", new URL(sSrc, base).href); } catch (e) {}
        }
      }

      // Absolutize url() inside existing inline <style> tags (CSS-in-JS, framework styles)
      var inlineStyles = clone.querySelectorAll('style');
      for (var sti = 0; sti < inlineStyles.length; sti++) {
        var stContent = inlineStyles[sti].textContent || '';
        if (/url\s*\(|@import/i.test(stContent)) {
          var replaced = stContent;
          replaced = replaced.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, function(m, u) {
            if (/^(https?:|data:|blob:|#)/i.test(u)) return m;
            try { return 'url("' + new URL(u, base).href + '")'; } catch (e4) { return m; }
          });
          replaced = replaced.replace(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"](?:\s*\))?/gi, function(m, u) {
            if (/^(https?:|data:|blob:)/i.test(u)) return m;
            try { return m.replace(u, new URL(u, base).href); } catch (e5) { return m; }
          });
          inlineStyles[sti].textContent = replaced;
        }
      }

      // Async: inline all <link rel="stylesheet"> so CSS works in the cross-origin snapshot iframe
      inlineCssStylesheets(clone, function() {
        try {
          var html = "<!DOCTYPE html>" + clone.outerHTML;

          // Cap at ~1.5MB to avoid huge payloads
          if (html.length > 1500000) {
            var svgs = clone.querySelectorAll("svg");
            for (var si = svgs.length - 1; si >= 0; si--) {
              if (svgs[si].outerHTML.length > 5000) svgs[si].parentNode.removeChild(svgs[si]);
            }
            html = "<!DOCTYPE html>" + clone.outerHTML;
          }

          if (html.length > 1500000) return; // still too large, skip

          var m = metrics();
          pendingSnapshot = {
            url: url,
            html: html,
            viewportWidth: m.viewportWidth,
            viewportHeight: m.viewportHeight,
            pageWidth: m.pageWidth,
            pageHeight: m.pageHeight,
          };

          sendSnapshotPayload();
        } catch (e2) { /* silently fail */ }
      });
    } catch (e) {
      // snapshot capture failed silently
    }
  }

  function sendSnapshotPayload() {
    if (!pendingSnapshot) return;
    var snap = pendingSnapshot;
    pendingSnapshot = null;

    if (_worker) {
      if (!pageviewSent) {
        _worker.postMessage({ cmd: 'pageview', pageview: buildPageview() });
        pageviewSent = true;
      }
      _worker.postMessage({ cmd: 'snapshot', snapshot: snap });
      return;
    }

    var payload = {
      projectKey: projectKey,
      session: {
        id: session.id,
        userAgent: navigator.userAgent,
        deviceType: deviceType(),
        startedAt: session.startedAt,
      },
      events: [],
      snapshot: snap,
    };
    if (!pageviewSent) { payload.pageview = buildPageview(); pageviewSent = true; }
    sendPayload(payload);
  }

  /* ══════════════════════════════════════════════════════════
   *  SPA ROUTE DETECTION — จับทุก navigation method
   * ══════════════════════════════════════════════════════════ */

  // Smart snapshot: wait for DOM mutations to settle before capturing
  var snapSettleTimer = null;
  var snapSettleObs = null;
  function captureSnapshotWhenReady(expectedUrl) {
    if (snapshotSentUrls[expectedUrl]) return;
    // Clean up previous observer if still running
    if (snapSettleObs) { try { snapSettleObs.disconnect(); } catch (e) {} snapSettleObs = null; }
    if (snapSettleTimer) { clearTimeout(snapSettleTimer); snapSettleTimer = null; }

    if (typeof MutationObserver === "undefined") {
      snapSettleTimer = setTimeout(function () { if (pageUrl() === expectedUrl) captureSnapshot(); }, 3000);
      return;
    }
    // Watch for DOM mutations; capture once mutations stop for 800ms
    snapSettleObs = new MutationObserver(function () {
      if (snapSettleTimer) clearTimeout(snapSettleTimer);
      snapSettleTimer = setTimeout(function () {
        if (snapSettleObs) { snapSettleObs.disconnect(); snapSettleObs = null; }
        if (pageUrl() === expectedUrl && !snapshotSentUrls[expectedUrl]) captureSnapshot();
      }, 800);
    });
    snapSettleObs.observe(document.documentElement, { childList: true, subtree: true });
    // Baseline: capture after 5s even if mutations haven't settled
    snapSettleTimer = setTimeout(function () {
      if (snapSettleObs) { snapSettleObs.disconnect(); snapSettleObs = null; }
      if (pageUrl() === expectedUrl && !snapshotSentUrls[expectedUrl]) captureSnapshot();
    }, 5000);
  }

  function onRouteChange(trigger) {
    var newUrl = pageUrl();
    if (newUrl === currentPageUrl) return;

    // ส่ง final height ของหน้าเดิมก่อนออก
    sendPageHeight("page_leave");

    // reset ค่าสำหรับหน้าใหม่
    currentPageUrl = newUrl;
    bestPageHeight = 0;
    pageviewSent = false;
    lastVisibleZonesKey = "";
    hbCount = 0;

    // flush events ของหน้าเดิม + ส่ง pageview ใหม่
    flush(true);

    // discover หน้าใหม่
    setTimeout(function () { sendPageDiscover("spa_" + trigger); }, 300);

    // Capture DOM snapshot for new SPA page after DOM settles
    captureSnapshotWhenReady(currentPageUrl);

    // วัดความสูงหน้าใหม่ซ้ำหลายรอบ
    [800, 2000, 4000, 8000].forEach(function (delay) {
      setTimeout(function () {
        if (pageUrl() === currentPageUrl) {
          var m = metrics();
          if (m.pageHeight > bestPageHeight + 50) {
            bestPageHeight = m.pageHeight;
            sendPageHeight("spa_settle_" + delay);
          }
          reportToParentFrame();
        }
      }, delay);
    });
  }

  // Monkey-patch pushState & replaceState
  var origPush = history.pushState;
  var origReplace = history.replaceState;
  history.pushState = function () { origPush.apply(this, arguments); onRouteChange("pushState"); };
  // Debounce replaceState — frameworks like Next.js call it frequently for state
  // updates (scroll restore, URL params) that aren't real navigations
  var replaceStateDebounce = null;
  history.replaceState = function () {
    origReplace.apply(this, arguments);
    if (replaceStateDebounce) clearTimeout(replaceStateDebounce);
    replaceStateDebounce = setTimeout(function () { onRouteChange("replaceState"); }, 80);
  };
  window.addEventListener("popstate", function () { onRouteChange("popstate"); });
  window.addEventListener("hashchange", function () { onRouteChange("hashchange"); });

  /* ────────────────── iframe height → parent (for canvas) ────────────────── */
  if (window.self !== window.top) {
    // ส่งทันที + หลัง load + ซ้ำ 15 ครั้ง (ทุก 2 วินาที = 30 วินาที)
    reportToParentFrame();
    window.addEventListener("load", function () {
      [300, 1000, 2500, 5000].forEach(function (d) { setTimeout(reportToParentFrame, d); });
    });
    var iframeCount = 0;
    var iframeInterval = setInterval(function () {
      iframeCount++;
      reportToParentFrame();
      if (iframeCount >= 15) clearInterval(iframeInterval);
    }, 2000);
  }

  /* ══════════════════════════════════════════════════════════
   *  CLICK TRACKING
   * ══════════════════════════════════════════════════════════ */
  document.addEventListener("click", function (ev) {
    if (!_eventToggles.track_clicks) return;
    var t = ev.target;
    if (!(t instanceof Element)) return;
    var m = metrics();
    enqueue({
      type: "click",
      element: elPath(t),
      x: Math.round(ev.pageX),
      y: Math.round(ev.pageY),
      payload: {
        url: pageUrl(),
        viewportWidth: m.viewportWidth, viewportHeight: m.viewportHeight,
        scrollX: window.scrollX, scrollY: window.scrollY,
        pageWidth: m.pageWidth, pageHeight: m.pageHeight,
        devicePixelRatio: typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 1,
        deviceType: deviceType(),
        screenWidth: typeof window.screen !== "undefined" ? window.screen.width : undefined,
        screenHeight: typeof window.screen !== "undefined" ? window.screen.height : undefined,
      },
      timestamp: ts(),
    });
  }, true);

  /* ══════════════════════════════════════════════════════════
   *  FORM TRACKING
   * ══════════════════════════════════════════════════════════ */
  function fieldName(el) {
    if (!(el instanceof Element)) return undefined;
    return el.getAttribute("name") || (el.id ? "#" + el.id : (el.tagName || "").toLowerCase()) || undefined;
  }

  function formFieldKeys(el) {
    if (!(el instanceof Element)) return [];
    var keys = [];
    var name = el.getAttribute("name");
    var id = el.id;
    var field = fieldName(el);
    if (field) keys.push(field);
    if (name) keys.push(name);
    if (id) {
      keys.push(id);
      keys.push("#" + id);
    }
    return keys.map(function (item) { return String(item).trim().toLowerCase(); }).filter(Boolean);
  }

  function getFormMaskForField(el) {
    var rules = _eventToggles.form_masking_rules || {};
    var keys = formFieldKeys(el);
    for (var i = 0; i < keys.length; i++) {
      for (var ruleKey in rules) {
        if (Object.prototype.hasOwnProperty.call(rules, ruleKey) && ruleKey.trim().toLowerCase() === keys[i]) {
          return String(rules[ruleKey] || "*");
        }
      }
    }
    return "*";
  }

  function isMessageFormField(el) {
    var keys = formFieldKeys(el);
    return keys.some(function (key) {
      return key === "message" ||
        key === "msg" ||
        key === "comment" ||
        key === "comments" ||
        key === "note" ||
        key === "notes" ||
        key.indexOf("message") !== -1 ||
        key.indexOf("comment") !== -1 ||
        key.indexOf("ข้อความ") !== -1 ||
        key.indexOf("รายละเอียด") !== -1;
    });
  }

  function isFormValueAllowed(el) {
    return isMessageFormField(el);
  }

  function maskedFormValuePayload(el) {
    // If user has not consented to form data collection, always mask
    if (!_formConsentGranted) {
      var val = typeof el.value === "string" ? el.value : "";
      return { allowlisted: false, valueLength: val.length, maskedValue: new Array(val.length + 1).join("*") };
    }
    if (!isFormValueAllowed(el)) return {};
    var value = typeof el.value === "string" ? el.value : "";
    return {
      allowlisted: true,
      valueLength: value.length,
      storedField: "message",
      messageValue: value.slice(0, 2000),
    };
  }

  function isTrackableInput(t) {
    if (t instanceof HTMLInputElement) {
      var type = (t.type || "").toLowerCase();
      return type !== "password" && type !== "hidden" && type !== "submit" && type !== "button" && type !== "reset";
    }
    return t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
  }

  function formIdentity(form) {
    if (!(form instanceof HTMLFormElement)) return {};
    var forms = Array.prototype.slice.call(document.forms || []);
    var index = Math.max(0, forms.indexOf(form));
    var id = form.id || "";
    var name = form.getAttribute("data-analytics-form") ||
      form.getAttribute("data-form-name") ||
      form.getAttribute("aria-label") ||
      form.getAttribute("name") ||
      id ||
      "";
    var action = form.getAttribute("action") || "";
    var selector = elPath(form);
    var key = "";
    if (id) key = "id:" + id;
    else if (name) key = "name:" + name;
    else if (action) key = "action:" + action;
    else key = "index:" + pageUrl().split("#")[0].split("?")[0] + ":" + index;
    return {
      formId: id || undefined,
      formName: name || undefined,
      formAction: action || undefined,
      formSelector: selector || undefined,
      formIndex: index,
      formKey: key,
    };
  }

  // Per-field focus timing & correction (Backspace/Delete) counting
  var _formFocusTime = null;
  var _formCorrectionCount = 0;

  function formHandler(action) {
    return function (ev) {
      var t = ev.target;
      if (!(t instanceof Element) || !isTrackableInput(t)) return;
      var extra = {};
      if (action === "focus") {
        _formFocusTime = Date.now();
        _formCorrectionCount = 0;
      } else if (action === "blur") {
        extra.focusAt = _formFocusTime ? new Date(_formFocusTime).toISOString() : undefined;
        extra.correctionCount = _formCorrectionCount;
        Object.assign(extra, maskedFormValuePayload(t));
        _formFocusTime = null;
        _formCorrectionCount = 0;
      }
      enqueue({ type: "form", element: elPath(t), payload: Object.assign({ action: action, url: pageUrl(), field: fieldName(t) }, formIdentity(t.form), extra), timestamp: ts() });
    };
  }
  // Count backspace/delete keystrokes as corrections
  document.addEventListener("keydown", function (ev) {
    if (!_eventToggles.track_forms) return;
    if (_formFocusTime !== null && (ev.key === "Backspace" || ev.key === "Delete")) {
      _formCorrectionCount++;
    }
  }, true);
  document.addEventListener("focusin", function (ev) { if (_eventToggles.track_forms) formHandler("focus")(ev); }, true);
  document.addEventListener("focusout", function (ev) { if (_eventToggles.track_forms) formHandler("blur")(ev); }, true);
  document.addEventListener("submit", function (ev) {
    if (!_eventToggles.track_forms) return;
    var t = ev.target;
    if (!(t instanceof HTMLFormElement)) return;
    enqueue({ type: "form", element: elPath(t), payload: Object.assign({ action: "submit", url: pageUrl() }, formIdentity(t)), timestamp: ts() });
  }, true);

  /* ══════════════════════════════════════════════════════════
   *  SCROLL TRACKING
   * ══════════════════════════════════════════════════════════ */
  var lastScrollSent = 0;
  window.addEventListener("scroll", function () {
    if (!_eventToggles.track_scroll) return;
    var now = Date.now();
    if (now - lastScrollSent < 1000) return;
    lastScrollSent = now;
    var m = metrics();
    var bottom = window.scrollY + m.viewportHeight;
    var depth = Math.round((bottom / Math.max(m.pageHeight, 1)) * 100);
    enqueue({
      type: "scroll",
      depthPercent: Math.max(0, Math.min(depth, 100)),
      payload: { url: pageUrl(), viewportWidth: m.viewportWidth, viewportHeight: m.viewportHeight, pageWidth: m.pageWidth, pageHeight: m.pageHeight, scrollY: Math.round(window.scrollY), bottomY: Math.round(bottom) },
      timestamp: ts(),
    });
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════
   *  VIEWPORT HEARTBEAT — dwell time per zone (every 3s)
   * ══════════════════════════════════════════════════════════ */
  var hbInterval = null, hbStartTimer = null, lastVisibleZonesKey = "", hbCount = 0;

  function clampPercent(value) {
    return Math.max(0, Math.min(Math.round(value), 100));
  }

  function visibleViewportZones(scrollY, m) {
    var pageHeight = Math.max(m.pageHeight || 1, 1);
    var topPct = clampPercent((scrollY / pageHeight) * 100);
    var bottomPct = clampPercent(((scrollY + m.viewportHeight) / pageHeight) * 100);
    var startZone = Math.max(0, Math.min(Math.floor(topPct / 10) * 10, 90));
    var endZone = Math.max(0, Math.min(Math.floor(bottomPct / 10) * 10, 90));
    var zones = [];
    for (var zone = startZone; zone <= endZone; zone += 10) zones.push(zone);
    return {
      zones: zones.length ? zones : [startZone],
      topPct: topPct,
      bottomPct: bottomPct,
    };
  }

  function sendHeartbeat() {
    if (!_eventToggles.track_viewport) return;
    if (document.visibilityState === "hidden") return;
    var sy = window.scrollY || 0, m = metrics();
    var bottom = sy + m.viewportHeight;
    var pct = clampPercent((bottom / Math.max(m.pageHeight, 1)) * 100);
    var visible = visibleViewportZones(sy, m);
    var zonesKey = visible.zones.join(",");
    hbCount++;
    if (zonesKey !== lastVisibleZonesKey || hbCount % 3 === 0) {
      lastVisibleZonesKey = zonesKey;
      visible.zones.forEach(function (zone) {
        enqueue({
          type: "viewport",
          depthPercent: pct,
          payload: {
            url: pageUrl(),
            scrollY: Math.round(sy),
            viewportWidth: m.viewportWidth,
            viewportHeight: m.viewportHeight,
            pageWidth: m.pageWidth,
            pageHeight: m.pageHeight,
            zone: zone,
            zoneStartPercent: zone,
            zoneEndPercent: Math.min(zone + 10, 100),
            visibleTopPercent: visible.topPct,
            visibleBottomPercent: visible.bottomPct,
            foldY: m.viewportHeight,
            deviceType: deviceType()
          },
          timestamp: ts(),
        });
      });
    }
  }

  function startHB() {
    if (hbInterval) return;
    hbInterval = setInterval(sendHeartbeat, 3000);
    hbStartTimer = setTimeout(function () {
      hbStartTimer = null;
      sendHeartbeat();
    }, 800);
  }
  function stopHB() {
    if (hbInterval) { clearInterval(hbInterval); hbInterval = null; }
    if (hbStartTimer) { clearTimeout(hbStartTimer); hbStartTimer = null; }
  }
  if (document.visibilityState !== "hidden") startHB();

  window.addEventListener("beforeunload", function () { stopHB(); sendPageHeight("unload"); flush(false); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { stopHB(); flush(false); }
    else { startHB(); }
  });

  /* ══════════════════════════════════════════════════════════
   *  RAGE CLICK DETECTION
   * ══════════════════════════════════════════════════════════ */
  var rClicks = [], R_THRESH = 3, R_WIN = 1500, R_RAD = 100;
  document.addEventListener("click", function (ev) {
    if (!_eventToggles.track_rage_clicks) return;
    var now = Date.now();
    rClicks.push({ x: ev.pageX, y: ev.pageY, t: now });
    rClicks = rClicks.filter(function (c) { return now - c.t < R_WIN; });
    if (rClicks.length >= R_THRESH) {
      var f = rClicks[0];
      var near = rClicks.every(function (c) { return Math.abs(c.x - f.x) < R_RAD && Math.abs(c.y - f.y) < R_RAD; });
      if (near) {
        var t = ev.target instanceof Element ? ev.target : null;
        enqueue({ type: "rage_click", element: t ? elPath(t) : "unknown", x: Math.round(ev.pageX), y: Math.round(ev.pageY), payload: { url: pageUrl(), clickCount: rClicks.length, windowMs: R_WIN }, timestamp: ts() });
        rClicks = [];
      }
    }
  }, true);

  /* ══════════════════════════════════════════════════════════
   *  DEAD CLICK DETECTION
   * ══════════════════════════════════════════════════════════ */
  (function () {
    if (typeof MutationObserver === "undefined") return;
    var pending = null, obs = null;
    document.addEventListener("click", function (ev) {
      if (!_eventToggles.track_dead_clicks) return;
      var t = ev.target;
      if (!(t instanceof Element)) return;
      var tag = t.tagName.toLowerCase();
      if (tag === "a" || tag === "button" || tag === "input" || tag === "select") return;
      if (t.closest("a, button")) return;
      pending = { el: elPath(t), x: Math.round(ev.pageX), y: Math.round(ev.pageY), url: pageUrl(), t: Date.now() };
      var seen = false;
      if (obs) obs.disconnect();
      obs = new MutationObserver(function () { seen = true; });
      obs.observe(document.body, { childList: true, subtree: true, attributes: true });
      setTimeout(function () {
        if (obs) obs.disconnect();
        if (!seen && pending && Date.now() - pending.t < 1500) {
          enqueue({ type: "dead_click", element: pending.el, x: pending.x, y: pending.y, payload: { url: pending.url }, timestamp: ts() });
        }
        pending = null;
      }, 1000);
    }, true);
  })();

  /* ══════════════════════════════════════════════════════════
   *  JS ERROR TRACKING
   * ══════════════════════════════════════════════════════════ */
  window.addEventListener("error", function (ev) {
    if (!_eventToggles.track_js_errors) return;
    if (!ev.message) return;
    enqueue({ type: "js_error", payload: { url: pageUrl(), message: (ev.message || "").slice(0, 500), source: (ev.filename || "").slice(0, 200), line: ev.lineno, col: ev.colno }, timestamp: ts() });
  });
  window.addEventListener("unhandledrejection", function (ev) {
    if (!_eventToggles.track_js_errors) return;
    var r = ev.reason, msg = r instanceof Error ? r.message : typeof r === "string" ? r : "Unhandled promise rejection";
    enqueue({ type: "js_error", payload: { url: pageUrl(), message: msg.slice(0, 500), source: "unhandledrejection" }, timestamp: ts() });
  });

  /* ══════════════════════════════════════════════════════════
   *  WEB VITALS — LCP, CLS
   * ══════════════════════════════════════════════════════════ */
  (function () {
    if (typeof PerformanceObserver === "undefined") return;
    if (!_eventToggles.track_web_vitals) return;
    // LCP
    try {
      var lcpVal = 0;
      var lcpObs = new PerformanceObserver(function (list) {
        var e = list.getEntries(); if (e.length) lcpVal = Math.round(e[e.length - 1].startTime);
      });
      lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
      var lcpSent = false;
      function sendLCP() {
        if (lcpSent || lcpVal <= 0) return; lcpSent = true; lcpObs.disconnect();
        enqueue({ type: "web_vital", payload: { url: pageUrl(), metric: "LCP", value: lcpVal, rating: lcpVal <= 2500 ? "good" : lcpVal <= 4000 ? "needs-improvement" : "poor" }, timestamp: ts() });
      }
      ["keydown", "click", "scroll"].forEach(function (e) { document.addEventListener(e, sendLCP, { once: true, passive: true }); });
      setTimeout(sendLCP, 10000);
    } catch (e) {}
    // CLS
    try {
      var clsVal = 0;
      var clsObs = new PerformanceObserver(function (list) {
        for (var entry of list.getEntries()) { if (!entry.hadRecentInput) clsVal += entry.value; }
      });
      clsObs.observe({ type: "layout-shift", buffered: true });
      window.addEventListener("beforeunload", function () {
        if (clsVal > 0) { clsObs.disconnect(); enqueue({ type: "web_vital", payload: { url: pageUrl(), metric: "CLS", value: Math.round(clsVal * 1000) / 1000, rating: clsVal <= 0.1 ? "good" : clsVal <= 0.25 ? "needs-improvement" : "poor" }, timestamp: ts() }); }
      });
    } catch (e) {}
  })();

  /* ══════════════════════════════════════════════════════════
   *  INITIAL FLUSH — ส่ง pageview + page_discover ทันที
   * ══════════════════════════════════════════════════════════ */
  flush(true);

  // ส่ง page_discover พร้อม title & metrics หลัง DOM พร้อม
  if (document.readyState === "complete") {
    setTimeout(function () { sendPageDiscover("load"); }, 200);
  } else {
    window.addEventListener("load", function () {
      setTimeout(function () { sendPageDiscover("load"); }, 200);
    });
  }

  // วัดความสูงครั้งแรกหลัง DOM settle
  window.addEventListener("load", function () {
    setTimeout(function () {
      var m = metrics();
      bestPageHeight = m.pageHeight;
      sendPageHeight("initial_load");
    }, 800);

    // Capture DOM snapshot after page has settled
    captureSnapshotWhenReady(currentPageUrl);
  });

  /* ══════════════════════════════════════════════════════════
   *  PUBLIC API — window.__analytics
   *  ──────────────────────────────────────────────────────
   *  identify(userId, traits) — link session to a known user
   *  track(eventName, properties) — send custom events
   *  getSessionId() — return current session ID
   * ══════════════════════════════════════════════════════════ */

  /**
   * identify(userId, traits?)
   * Links the current session to a known user identity.
   * @param {string} userId  - External user ID (email, DB ID, etc.)
   * @param {object} [traits] - Optional user traits { name, email, plan, ... }
   */
  function identify(userId, traits) {
    if (typeof userId !== "string" || !userId.trim()) {
      console.warn("[analytics] identify() requires a non-empty userId string");
      return;
    }
    var cleanTraits = {};
    if (traits && typeof traits === "object" && !Array.isArray(traits)) {
      // Sanitize: only keep string/number/boolean values
      for (var k in traits) {
        if (Object.prototype.hasOwnProperty.call(traits, k)) {
          var v = traits[k];
          if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            cleanTraits[k] = v;
          }
        }
      }
    }
    enqueue({
      type: "identify",
      payload: {
        userId: userId.trim().slice(0, 500),
        traits: cleanTraits,
        url: pageUrl(),
      },
      timestamp: ts(),
    });
    scheduleFlush();
  }

  /**
   * track(eventName, properties?)
   * Send a custom event with optional properties.
   * @param {string} eventName   - Name of the custom event (e.g. "purchase", "signup")
   * @param {object} [properties] - Optional event properties
   */
  function track(eventName, properties) {
    if (typeof eventName !== "string" || !eventName.trim()) {
      console.warn("[analytics] track() requires a non-empty eventName string");
      return;
    }
    var cleanProps = {};
    if (properties && typeof properties === "object" && !Array.isArray(properties)) {
      for (var k in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, k)) {
          var v = properties[k];
          if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            cleanProps[k] = v;
          }
        }
      }
    }
    enqueue({
      type: "custom",
      payload: {
        eventName: eventName.trim().slice(0, 200),
        properties: cleanProps,
        url: pageUrl(),
      },
      timestamp: ts(),
    });
    scheduleFlush();
  }

  // Expose global API
  window.__analytics = {
    identify: identify,
    track: track,
    getSessionId: function () { return session.id; },
    /** Grant or revoke analytics consent at runtime.
     *  Call this from your cookie-consent banner callback.
     *  @example
     *  // User accepts cookies:
     *  window.__analytics.setConsent(true);
     *  // User rejects:
     *  window.__analytics.setConsent(false);
     */
    setConsent: function (granted) {
      _consentGranted = !!granted;
      try { localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "granted" : "denied"); } catch(e) {}
      if (granted) {
        console.info("[analytics] Tracking resumed (consent granted)");
        showConsentStatus("granted");
      } else {
        console.info("[analytics] Tracking paused (consent revoked)");
        showConsentStatus("denied");
      }
    },
    _version: "5.0",
  };
})();
