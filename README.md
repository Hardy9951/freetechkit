# FreeTechKit — static website starter

A no-build static website containing:
- QR code generator (uses qrcode.js from cdnjs; requires internet access)
- Text toolkit (word/character/line count, case conversion, trim, unique lines, copy)
- IPv4 CIDR subnet calculator
- Placeholder ad and affiliate sections
- Starter privacy and terms pages

## Files
- `index.html` — page structure and SEO metadata
- `styles.css` — responsive styling
- `script.js` — tool behavior
- `privacy.html`, `terms.html` — starter pages; review and replace before launch

## Before publishing
1. Replace `YOUR-DOMAIN.example` in `index.html` and `mailto:hello@YOUR-DOMAIN.example` with your real domain/contact.
2. Replace the example canonical URL with the final HTTPS homepage URL.
3. Test every tool on desktop and mobile.
4. Replace affiliate placeholders only with real, approved links. Add a clear disclosure and comply with each affiliate program's rules.
5. Add ad code only after approval by an ad network. Do not click your own ads.
6. Update privacy and terms pages to describe your actual analytics, hosting logs, affiliate tracking, ads, cookies, and consent practices. These pages are starter text, not legal advice.
7. Add a sitemap and robots.txt after choosing the final domain. Submit the sitemap in Google Search Console.

## Free hosting options

### GitHub Pages
1. Create/sign in to a GitHub account.
2. Create a new public repository, e.g. `freetechkit`.
3. Upload `index.html`, `styles.css`, `script.js`, `privacy.html`, and `terms.html` to the repository root.
4. Open **Settings → Pages**. Under Build and deployment, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish the site. It will show the published URL in Settings → Pages.
6. For a custom domain, enter the domain in the Pages custom-domain field and follow GitHub's current DNS instructions exactly. Add the required DNS records at Porkbun. Enable HTTPS after DNS is verified.
7. Keep any existing email DNS records (MX/TXT) if you use domain email.

### Cloudflare Pages (alternative)
1. Create a Cloudflare account and open Workers & Pages / Pages.
2. Create a project by uploading the static assets or connecting a Git repository.
3. Deploy without a build command; use the folder containing `index.html` as the output directory.
4. Add your custom domain in the project settings and follow the DNS instructions shown by Cloudflare.

Both options have free tiers, but provider limits and terms can change. A custom domain is optional for the first test. Your domain registration may already be a paid cost.

## Important
This is a static site, so it does not have accounts, a backend, a payment system, or a database. Do not claim that it provides professional advice or guaranteed results. The QR library is loaded from a third-party CDN; for an offline/self-contained deployment, vendor the library locally and check its license.
