/**
 * KPB Construction – Cookie Consent & Tawk.to Loader
 * Displays a consent banner; only loads Tawk.to if the visitor accepts.
 * Preference is stored in localStorage so the banner only shows once.
 */
(function () {
  'use strict';

  var CONSENT_KEY = 'kpb_cookie_consent';
  var TAWKTO_URL  = 'https://embed.tawk.to/69c980ac7da9c31c352046da/1jktht8a1';

  /* --- Inject banner styles --- */
  var style = document.createElement('style');
  style.textContent = [
    '#kpb-cookie-banner{',
    '  position:fixed;bottom:0;left:0;right:0;z-index:9999;',
    '  background:#1C1C18;color:rgba(245,240,232,0.85);',
    '  padding:16px 24px;',
    '  display:flex;align-items:center;justify-content:space-between;',
    '  flex-wrap:wrap;gap:12px;',
    '  border-top:3px solid #C4873A;',
    '  font-family:"DM Sans",sans-serif;font-size:0.85rem;',
    '}',
    '#kpb-cookie-banner p{margin:0;flex:1;min-width:220px;line-height:1.6;}',
    '#kpb-cookie-banner a{color:#C4873A;text-decoration:underline;}',
    '#kpb-cookie-banner a:hover{color:#e0a44a;}',
    '.kpb-cc-btns{display:flex;gap:10px;flex-shrink:0;}',
    '.kpb-cc-btn{',
    '  padding:9px 20px;border-radius:4px;border:none;cursor:pointer;',
    '  font-family:"DM Sans",sans-serif;font-size:0.85rem;font-weight:600;',
    '  transition:background 0.2s,color 0.2s;',
    '}',
    '.kpb-cc-btn:focus-visible{outline:3px solid #C4873A;outline-offset:2px;}',
    '#kpb-cc-accept{background:#C4873A;color:#fff;}',
    '#kpb-cc-accept:hover{background:#8B6F47;}',
    '#kpb-cc-decline{background:transparent;color:rgba(245,240,232,0.6);border:1px solid rgba(245,240,232,0.2);}',
    '#kpb-cc-decline:hover{color:rgba(245,240,232,0.9);border-color:rgba(245,240,232,0.5);}'
  ].join('');
  document.head.appendChild(style);

  /* --- Load Tawk.to chat --- */
  function loadTawkTo() {
    if (window._tawktoLoaded) return;
    window._tawktoLoaded = true;
    var Tawk_API = window.Tawk_API || {};
    var Tawk_LoadStart = new Date();
    var s1 = document.createElement('script');
    var s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = TAWKTO_URL;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  }

  /* --- If already decided, act immediately and exit --- */
  var saved = localStorage.getItem(CONSENT_KEY);
  if (saved === 'accepted') { loadTawkTo(); return; }
  if (saved === 'declined') { return; }

  /* --- Build the banner --- */
  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'kpb-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML =
      '<p>We use cookies to power our live chat (Tawk.to) and improve your browsing experience.' +
      ' See our <a href="privacy-policy.html">Privacy Policy</a> for details.</p>' +
      '<div class="kpb-cc-btns">' +
      '  <button class="kpb-cc-btn" id="kpb-cc-accept">Accept Cookies</button>' +
      '  <button class="kpb-cc-btn" id="kpb-cc-decline">Decline</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('kpb-cc-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
      loadTawkTo();
    });

    document.getElementById('kpb-cc-decline').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'declined');
      banner.remove();
    });
  }

  /* --- Show banner after DOM is ready --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
