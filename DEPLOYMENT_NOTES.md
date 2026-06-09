# THE AWAKE CLUB — Deployment Notes
# theawakeclub.com

## FOLDER STRUCTURE

```
theawakeclub/
├── index.html              ← Home page
├── start-here.html         ← Start Here
├── find-your-4am.html      ← Find Your 4AM (quiz + origin)
├── tools.html              ← Tools hub (timer, checklist, downloads)
├── daily-growth.html       ← Blog / article landing
├── style.css               ← Shared stylesheet
├── script.js               ← Shared JS (nav, quiz, timer, checklist)
├── _headers                ← Cloudflare Pages headers config
├── _redirects              ← Cloudflare Pages / Netlify redirect rules
└── assets/
    └── images/
        ├── gym-real.jpg        → Hero (homepage), Start Here inset
        ├── gym-anime.jpg       → Gym Philosophy panel, Daily Growth feature
        ├── gym-cyberpunk.jpg   → Daily Growth hero accent
        └── gym-neon.jpg        → Find Your 4AM hero
```

---

## IMAGE USAGE MAP

| File             | Used On                                          | Treatment                          |
|------------------|--------------------------------------------------|------------------------------------|
| gym-real.jpg     | index.html hero (full bg), start-here.html inset | Brightness 0.38, gradient overlay  |
| gym-anime.jpg    | index.html gym section, daily-growth.html feature | Brightness 0.72, side panel       |
| gym-cyberpunk.jpg| daily-growth.html hero accent (right side)       | Brightness 0.30, heavy overlay     |
| gym-neon.jpg     | find-your-4am.html hero (right panel)            | Brightness 0.55, left gradient     |

---

## CLOUDFLARE PAGES DEPLOYMENT

1. Push the `theawakeclub/` folder to a GitHub/GitLab repo
2. Log into Cloudflare Pages → Create application → Connect to Git
3. Build settings:
   - Framework preset: None (static HTML)
   - Build command: (leave blank)
   - Build output directory: / (or your repo root)
4. Set custom domain: theawakeclub.com
5. For go4amclub.com redirect: add it as a custom domain OR use the _redirects file

---

## VERCEL DEPLOYMENT

1. Push folder to GitHub
2. Import project in Vercel
3. Framework: Other (no framework)
4. Output directory: . (root)
5. No build command needed
6. Add theawakeclub.com as custom domain in Vercel settings
7. For go4amclub.com: add as additional domain in Vercel, vercel.json handles the redirect

---

## EMAIL PROVIDER INTEGRATION

Find all `<!-- TODO:` comments in the HTML files.
Three forms total:
- index.html — homepage email capture
- find-your-4am.html — post-quiz capture
- start-here.html — onboarding capture
- tools.html — starter plan download
- daily-growth.html — blog subscriber

Recommended providers:
- Buttondown.email (simple, no-code, $0 to start)
- ConvertKit (free up to 1,000 subs, good tagging)
- Mailchimp (free up to 500 contacts)

For Buttondown: replace `action="#"` with `action="https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME"`

For ConvertKit: use their embed form URL or their JS embed snippet.

---

## SEO NOTES

Each page has:
- Unique <title> and <meta name="description">
- <link rel="canonical">
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter card tags
- Semantic HTML structure (nav, section, article, footer, h1/h2/h3)
- Alt text on all images
- aria-label on all interactive elements

Add to index.html <head> when ready:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Awake Club",
  "url": "https://theawakeclub.com",
  "description": "A discipline-first lifestyle movement for people who are done drifting.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://theawakeclub.com/daily-growth.html?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

## NEXT BUILD PRIORITIES

1. Connect email forms to provider
2. Create downloadable PDF versions of 7-Day Plan and Checklist
3. Add individual article pages (slug: /daily-growth/why-you-keep-starting-over.html)
4. Add sitemap.xml
5. Add robots.txt
6. Add favicon (suggest: stylized orange clock or bold "A" in orange)
7. Add Google Analytics or Plausible tracking snippet
8. Add go4amclub.com redirect configuration
