---
name: setup-new-project
description: Full new project setup — creates a test-environment branch, adds GitHub Actions preview deploy workflows, and adds WCAG 2.1 accessibility improvements, a privacy policy, an accessibility statement, and a cookie consent banner to a static HTML website.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, mcp__github__create_branch, mcp__github__push_files, mcp__github__list_branches, mcp__github__get_file_contents
---

You are setting up a brand new project repo with a preview deployment pipeline and baseline legal/accessibility compliance. Complete every phase below in order.

---

# PHASE 1 — Understand the repo

Run the following to identify the GitHub remote:

```bash
git remote get-url origin
```

Parse the owner and repo name from the URL (handles both HTTPS and SSH formats).

Identify the default branch:

```bash
git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@'
```

If this fails, assume `main`.

Then explore the repo to identify:
- All `.html` files (find the main page, typically `index.html` at root)
- The CSS color scheme (primary background, accent/brand color, text color, font family)
- The footer structure — find the navigation/company column where links are listed
- Any existing live chat or analytics scripts (Tawk.to, Intercom, Drift, Google Analytics, etc.) and their embed codes
- The business name, address, phone number, and email from the existing HTML
- Whether `privacy-policy.html`, `accessibility-statement.html`, or `cookie-consent.js` already exist (skip creating any that do)

Use `mcp__github__list_branches` to check if `test-environment` already exists.
Use `mcp__github__get_file_contents` to check if `.github/workflows/deploy-main.yml` and `.github/workflows/branch-preview.yml` already exist.

---

# PHASE 2 — Create the test-environment branch

Use `mcp__github__create_branch` with:
- `branch`: `test-environment`
- `from_branch`: the default branch

Skip if the branch already exists.

---

# PHASE 3 — Add GitHub Actions workflow

Use `mcp__github__push_files` targeting the **default branch** with path `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - '**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy main site to gh-pages root
        if: github.ref_name == 'main'
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          keep_files: true

      - name: Deploy branch preview to gh-pages
        if: github.ref_name != 'main'
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          keep_files: true
          destination_dir: previews/${{ github.ref_name }}
```

Commit message: `Add GitHub Actions deploy workflow for main site and branch previews`

---

# PHASE 4 — Create `cookie-consent.js` at the repo root

This script must:
- Show a consent banner on first visit using vanilla JS (no libraries)
- Only load any third-party live chat/analytics script AFTER the visitor clicks "Accept Cookies"
- On "Decline", store the preference without loading those scripts
- Store the preference in `localStorage` with key `<slug>_cookie_consent` (derive slug from business name)
- Inject its own CSS via `document.createElement('style')` — no external stylesheet
- Match the site's color scheme (use the accent/brand color for the Accept button)
- Be accessible: `role="dialog"`, `aria-label="Cookie consent"`, `aria-live="polite"`, `:focus-visible` on buttons
- If no live chat/analytics scripts are found, the banner still appears and states no tracking cookies are used

Structure:

```javascript
(function () {
  'use strict';
  var CONSENT_KEY = '<slug>_cookie_consent';
  // inject styles matching site color scheme
  // loadThirdParty() — loads any chat/analytics scripts found in the repo
  // check localStorage: if 'accepted' call loadThirdParty(); if 'declined' return; else show banner
  // Accept: store 'accepted', remove banner, call loadThirdParty()
  // Decline: store 'declined', remove banner
})();
```

Remove any existing inline third-party embed scripts from all HTML files — they will be loaded conditionally by this script instead.

---

# PHASE 5 — Create `privacy-policy.html` at the repo root

Style it to match the site's visual design (same fonts, colors, nav bar, footer).

Include these sections:
1. **Who We Are** — business name, address, phone, email
2. **Information We Collect** — form fields, live chat data, automatic log data
3. **How We Use Your Information** — only to respond to requests; no selling or marketing automation
4. **How We Share Your Information** — only with named third-party service providers; no selling
5. **Cookies and Third-Party Services** — list each service found in the repo with a link to their privacy policy and what data they collect
6. **Cookie Consent** — explain the banner, Accept/Decline behavior, how to reset (clear localStorage)
7. **Data Retention** — form submissions, chat logs, email inquiries
8. **Your Privacy Rights** — access, correction, deletion, opt-out; CCPA section for California residents
9. **Children's Privacy** — not directed to under-13
10. **Security** — HTTPS, reasonable precautions
11. **Changes to This Policy** — last updated date at top
12. **Contact Us** — business contact info in a styled callout box

Include a skip link, ARIA landmarks (`role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"`), and a link back to the home page in the nav.
Set `<meta name="robots" content="noindex">`.
Set "Last updated: [today's date]" near the top.

---

# PHASE 6 — Create `accessibility-statement.html` at the repo root

Style it to match the site's visual design.

Include these sections:
1. **Our Commitment** — WCAG 2.1 Level AA target, ADA/Section 508 reference
2. **Conformance Status** — "Partially Conformant" with explanation
3. **Accessibility Features Implemented** — list only what is actually added by this skill:
   - Skip to content link
   - ARIA landmark roles (nav, main, footer)
   - Keyboard-accessible FAQ accordion with `aria-expanded`
   - Visible `:focus-visible` focus indicators
   - Form `<label for>` / `<input id>` associations with `autocomplete`
   - `aria-hidden` on decorative emoji
   - Cookie consent banner with ARIA dialog role
4. **Known Limitations** — lightbox focus trap, portfolio card keyboard support, mobile hamburger `aria-expanded`, third-party chat widget
5. **Assistive Technologies Tested** — NVDA/Chrome, VoiceOver/Safari, keyboard-only
6. **Feedback and Contact** — business contact info, 5-business-day response commitment
7. **Formal Complaints** — U.S. DOJ Civil Rights Division reference

Include skip link, ARIA landmarks, nav back to home.
Set `<meta name="robots" content="noindex">`.

---

# PHASE 7 — Modify every main HTML file

For each `.html` file that is a full page (has `<html>`, `<head>`, `<body>`), excluding `privacy-policy.html` and `accessibility-statement.html`:

### 7a. Add CSS before `</style>`

```css
.skip-link {
  position: absolute; top: -999px; left: -999px;
  background: <accent-color>; color: #fff;
  padding: 10px 18px; border-radius: 4px;
  font-weight: 600; font-size: 0.9rem;
  text-decoration: none; z-index: 9999;
}
.skip-link:focus { top: 12px; left: 12px; }
:focus-visible { outline: 3px solid <accent-color>; outline-offset: 3px; }
:focus:not(:focus-visible) { outline: none; }
button.faq-q {
  width: 100%; background: none; border: none;
  text-align: left; font-family: inherit; cursor: pointer; padding: 0;
}
```

### 7b. After `<body>` opening tag

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### 7c. Navigation

Add `role="navigation" aria-label="Main navigation"` to the `<nav>` tag.

### 7d. Wrap main content

Add `<main id="main-content">` after the closing `</nav>`.
Close it with `</main>` immediately before `<footer>`.

### 7e. Footer

Add `role="contentinfo"` to the `<footer>` tag.

### 7f. FAQ accordion

Convert every FAQ trigger from `<div onclick="...">` to `<button>`:

```html
<button class="faq-q" onclick="toggleFaq(this)" aria-expanded="false">
  Question text <span class="chevron" aria-hidden="true">+</span>
</button>
```

Update `toggleFaq` to sync `aria-expanded`:

```javascript
function toggleFaq(el) {
  var item = el.closest('.faq-item');
  item.classList.toggle('open');
  el.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
}
```

### 7g. Form labels

Add matching `for`/`id` pairs and `autocomplete` to every contact form field:
- First name → `id="f-fname"` `autocomplete="given-name"`
- Last name → `id="f-lname"` `autocomplete="family-name"`
- Phone → `id="f-phone"` `autocomplete="tel"`
- Email → `id="f-email"` `autocomplete="email"`
- Service select → `id="f-service"`
- Description textarea → `id="f-desc"`

### 7h. Footer Company column

Add at the bottom of the Company (or equivalent) navigation column using the exact same element type and classes as the existing links — no inline styles:

```html
<a href="privacy-policy.html">Privacy Policy</a>
<a href="accessibility-statement.html">Accessibility</a>
```

Use `../privacy-policy.html` and `../accessibility-statement.html` if the HTML file is in a subdirectory.

### 7i. Remove inline third-party embed scripts

Remove all inline `<script>` blocks that load third-party chat or analytics. They are now handled by `cookie-consent.js`.

### 7j. Add cookie consent script before `</body>`

```html
<script src="cookie-consent.js"></script>
```

Use `../cookie-consent.js` if the file is in a subdirectory.

---

# PHASE 8 — Commit and push

Stage and commit all new and modified files:

```bash
git add .
git commit -m "Add preview workflows, WCAG 2.1 accessibility improvements, and privacy/cookie compliance

- .github/workflows/deploy.yml: deploys main to gh-pages root; deploys all other branches to /previews/<branch>/
- privacy-policy.html: GDPR/CCPA-aligned policy covering data collection,
  third-party services, cookies, retention, and user rights
- accessibility-statement.html: WCAG 2.1 AA conformance statement
- cookie-consent.js: consent banner gating third-party scripts
- HTML files: skip link, ARIA landmarks, keyboard FAQ (aria-expanded),
  form label associations, focus-visible indicators, footer legal links"
git push -u origin <current-branch>
```

---

# PHASE 9 — Tell the user what to do next

After all steps complete, output this message with the actual owner/repo values filled in:

---

**All done. One manual step required to activate the preview URLs:**

1. Wait ~60 seconds for the **Deploy Main Site** workflow to finish (check the **Actions** tab).
2. Go to **Settings → Pages** in your GitHub repo.
3. Under **Build and deployment → Branch**, change from `main` to **`gh-pages`** and click **Save**.

Your URLs will then be:

| | URL |
|---|---|
| Main site | `https://<owner>.github.io/<repo>/` |
| test-environment | `https://<owner>.github.io/<repo>/previews/test-environment/` |
| Any future branch | `https://<owner>.github.io/<repo>/previews/<branch-name>/` |

Every push to any branch automatically deploys a live preview. Every push to `main` updates the main site.

---

# Quality checks

Before finishing, verify:
- [ ] `test-environment` branch exists on GitHub
- [ ] `.github/workflows/deploy.yml` exists on the default branch
- [ ] `privacy-policy.html` renders correctly and links back to home
- [ ] `accessibility-statement.html` renders correctly and links back to home
- [ ] Cookie consent banner appears on first visit (test by clearing localStorage in devtools)
- [ ] Accepting loads the live chat; declining does not
- [ ] Tab key navigates all interactive elements with a visible focus ring
- [ ] FAQ accordion toggles with Enter/Space and updates `aria-expanded`
- [ ] Privacy Policy and Accessibility appear in the footer Company column
- [ ] No inline third-party embed scripts remain in any HTML file
