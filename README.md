# AEFO Express Logistics — website

Static website (HTML + CSS + vanilla JS). No build step, no dependencies.

## Structure
```
index.html        Page markup (gate screen, Ship view, Buy view, footer)
css/styles.css    All styles (light + dark mode)
js/products.js    Pre-order catalogue — edit this to add/remove items
js/app.js         Navigation, catalogue filter/search, product sheet, WhatsApp forms
img/              Product photos
```

## Run locally
Open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Add a product
1. Drop the photo into `img/` (JPG, roughly 800px wide is plenty).
2. In `js/products.js`, copy an entry and change `code`, `cat`, `name`, `img`, `desc`
   and `options` (e.g. `{ Size:["S","M","L"] }`). Add `contain:true` for product shots
   on a white background so they aren't cropped.
3. New categories appear in the filter chips automatically.

## Change contact details
- WhatsApp number used by forms and the pre-order button: `WA` at the top of `js/app.js`.
- Phone numbers, email and address in `index.html` (search for `0903 661 4110`).

## Deploy
Upload the whole folder to any static host — Netlify (drag & drop), Vercel,
GitHub Pages, Cloudflare Pages, or cPanel `public_html`.
