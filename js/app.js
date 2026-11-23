/* AEFO Express Logistics — site logic (gate, Ship / Pre-order sea shipping views, catalogue, WhatsApp forms) */
const PRODUCTS = window.PRODUCTS || [];
const WA = "2349036614110";
const gate = document.getElementById("gate");
const site = document.getElementById("site");
const views = { ship: document.getElementById("view-ship"), buy: document.getElementById("view-buy") };

function show(view, push = true){
  if (view === "ship" || view === "buy"){
    gate.hidden = true; site.hidden = false;
    Object.entries(views).forEach(([k, el]) => el.hidden = k !== view);
    document.querySelectorAll(".mode-switch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.go === view));
  } else {
    site.hidden = true; gate.hidden = false;
  }
  if (push) history.pushState({ view }, "", view === "gate" ? location.pathname : "#" + view);
  window.scrollTo(0, 0);
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-go]");
  if (!t) return;
  e.preventDefault();
  show(t.dataset.go);
});
window.addEventListener("popstate", () => route(false));
function route(push){
  const h = location.hash.replace("#", "");
  if (h === "ship" || h === "buy") show(h, push);
  else if (h === "quote"){ show("ship", false); document.getElementById("quote").scrollIntoView(); }
  else show("gate", false);
}
route(false);

/* In-page anchors inside the site shouldn't reset view */
document.querySelectorAll('a[href="#quote"]').forEach(a => a.addEventListener("click", e => {
  e.preventDefault(); document.getElementById("quote").scrollIntoView();
}));

function waLink(text){ return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }
function openWA(text){
  const a = document.createElement("a");
  a.href = waLink(text); a.target = "_blank"; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
}

/* Catalogue */
const cat = document.getElementById("catalogue");
const chipsEl = document.getElementById("chips");
const searchEl = document.getElementById("search");
const CATS = ["All", ...new Set(PRODUCTS.map(p => p.cat))];
let activeCat = "All";

CATS.forEach(c => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip";
  const n = c === "All" ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c).length;
  b.innerHTML = `${c}<small>${n}</small>`;
  b.setAttribute("aria-pressed", c === activeCat);
  b.onclick = () => { activeCat = c; chipsEl.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); };
  chipsEl.appendChild(b);
});
searchEl.addEventListener("input", render);

function render(){
  const q = searchEl.value.trim().toLowerCase();
  const list = PRODUCTS.filter(p => (activeCat === "All" || p.cat === activeCat) &&
    (!q || (p.name + " " + p.code + " " + p.cat + " " + p.desc).toLowerCase().includes(q)));
  cat.innerHTML = "";
  if (!list.length){ cat.innerHTML = `<p class="no-results">No items match “${q.replace(/[<>&]/g,"")}”. Try another word, or request it below.</p>`; return; }
  list.forEach(p => {
    const card = document.createElement("button");
    card.type = "button"; card.className = "product";
    card.innerHTML = `<div class="pic"><img loading="lazy" src="${p.img}" alt="${p.name}" class="${p.contain ? "contain" : ""}">
        <span class="tag-code">${p.code}</span><span class="tag-pre">Pre-order</span></div>
      <div class="body"><div class="cat">${p.cat}</div><h3>${p.name}</h3>
        <div class="dm"><b>DM for price</b><span>View details</span></div></div>`;
    card.onclick = () => openSheet(p);
    cat.appendChild(card);
  });
}
render();

/* Product sheet */
const sheet = document.getElementById("sheet");
let current = null, picks = {}, deliverTo = "Nigeria";
function openSheet(p){
  current = p; picks = {};
  const img = document.getElementById("sh-img");
  img.src = p.img; img.alt = p.name; img.className = p.contain ? "contain" : "";
  document.getElementById("sh-code").textContent = "Item code: " + p.code;
  document.getElementById("sh-name").textContent = p.name;
  document.getElementById("sh-desc").textContent = p.desc;
  const box = document.getElementById("sh-opts"); box.innerHTML = "";
  Object.entries(p.options || {}).forEach(([label, vals]) => {
    const l = document.createElement("div"); l.className = "opt-label"; l.textContent = label; box.appendChild(l);
    const row = document.createElement("div"); row.className = "opts";
    vals.forEach(v => {
      const b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = v;
      b.setAttribute("aria-pressed", "false");
      b.onclick = () => { picks[label] = v; row.querySelectorAll(".opt").forEach(x => x.setAttribute("aria-pressed", x === b)); updateOrder(); };
      row.appendChild(b);
    });
    box.appendChild(row);
  });
  updateOrder();
  sheet.showModal ? sheet.showModal() : sheet.setAttribute("open", "");
}
document.querySelectorAll("#sh-deliver .opt").forEach(b => b.onclick = () => {
  deliverTo = b.dataset.v;
  document.querySelectorAll("#sh-deliver .opt").forEach(x => x.setAttribute("aria-pressed", x === b));
  updateOrder();
});
document.getElementById("sheet-close").onclick = () => sheet.close();
sheet.addEventListener("click", e => { if (e.target === sheet) sheet.close(); });
function updateOrder(){
  const p = current; if (!p) return;
  const chosen = Object.entries(picks).map(([k, v]) => `${k}: ${v}`).join("\n");
  document.getElementById("sh-order").href = waLink(`Hello AEFO, I'd like to pre-order (sea shipping).
Item: ${p.name}
Code: ${p.code}${chosen ? "\n" + chosen : ""}
Deliver to: ${deliverTo}
Please send me the price.`);
}

/* Forms */
function need(form, errEl, ids){
  const missing = ids.filter(id => !form.querySelector("#" + id).value.trim());
  if (missing.length){
    errEl.textContent = "Fill in " + missing.map(id => form.querySelector(`label[for="${id}"]`).textContent.toLowerCase()).join(", ") + " to continue.";
    form.querySelector("#" + missing[0]).focus();
    return false;
  }
  errEl.textContent = ""; return true;
}
document.getElementById("ship-form").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, v = id => f.querySelector("#" + id).value.trim();
  if (!need(f, document.getElementById("ship-err"), ["s-name","s-phone","s-dest","s-type"])) return;
  openWA(`Hello AEFO, I'd like a shipping quote.
Name: ${v("s-name")}
Phone: ${v("s-phone")}
Destination: ${v("s-dest")}
Item: ${v("s-type")}
Weight: ${v("s-weight") || "Not sure"} kg
Pickup: ${v("s-pickup")}
Notes: ${v("s-notes") || "-"}`);
});
document.getElementById("buy-form").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, v = id => f.querySelector("#" + id).value.trim();
  if (!need(f, document.getElementById("buy-err"), ["b-name","b-phone","b-item"])) return;
  openWA(`Hello AEFO, I'd like to add an item to the next sea shipping batch.
Name: ${v("b-name")}
Phone: ${v("b-phone")}
Item: ${v("b-item")}
Deliver to: ${v("b-where") || "-"}`);
});

/* ================= CUSTOMER REVIEWS ================= */
(function(){
  const list = (window.REVIEWS || []).filter(r => r && r.name && r.text);
  const marquee = document.getElementById("rev-marquee");
  const track = document.getElementById("rev-track");
  const empty = document.getElementById("rev-empty");
  const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const initials = n => n.trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase();
  const card = (r, hidden) => {
    const n = Math.max(1, Math.min(5, Number(r.rating) || 5));
    const stars = "★".repeat(n) + `<span class="off">${"★".repeat(5-n)}</span>`;
    const av = r.photo ? `<img src="${esc(r.photo)}" alt="">` : esc(initials(r.name));
    return `<li class="rev-card"${hidden ? ' aria-hidden="true"' : ""}>
      <div class="stars" aria-label="${n} out of 5 stars">${stars}</div>
      <blockquote>“${esc(r.text)}”</blockquote>
      <div class="who"><span class="av">${av}</span>
        <div><b>${esc(r.name)}</b><span>${esc(r.city || "")}${r.date ? " · " + esc(r.date) : ""}</span></div>
        ${r.service ? `<span class="svc">${esc(r.service)}</span>` : ""}
      </div></li>`;
  };
  if (!list.length){ empty.hidden = false; }
  else {
    marquee.hidden = false;
    if (list.length >= 3){
      // repeat the set until it is wide enough, then duplicate it once for a seamless loop
      let set = list.slice(); while (set.length < 6) set = set.concat(list);
      track.innerHTML = set.map(r => card(r)).join("") + set.map(r => card(r, true)).join("");
      track.style.setProperty("--rev-dur", (set.length * 7) + "s");
      marquee.classList.add("moving");
      marquee.addEventListener("touchstart", () => marquee.classList.toggle("paused"), {passive:true});
    } else {
      track.innerHTML = list.map(r => card(r)).join("");
      marquee.style.overflowX = "auto";
    }
  }

  const dlg = document.getElementById("rev-sheet");
  const form = document.getElementById("rev-form");
  const thanks = document.getElementById("rev-thanks");
  const open = () => { form.hidden = false; thanks.hidden = true; dlg.showModal ? dlg.showModal() : dlg.setAttribute("open",""); };
  document.getElementById("rev-open").onclick = open;
  document.querySelectorAll("[data-rev-open]").forEach(b => b.onclick = open);
  document.getElementById("rev-close").onclick = () => dlg.close();
  document.getElementById("rev-done").onclick = () => dlg.close();
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const err = document.getElementById("rev-err"); err.textContent = "";
    const v = id => form.querySelector("#" + id).value.trim();
    if (!need(form, err, ["rv-name","rv-city","rv-service","rv-text"])) return;
    if (!form.querySelector("#rv-ok").checked){ err.textContent = "Tick the box so we can show your review on the website."; return; }
    const rating = form.querySelector('input[name="rating"]:checked').value;
    openWA(`Hello AEFO, here is my review for your website.
Rating: ${"★".repeat(rating)} (${rating}/5)
Name: ${v("rv-name")}
Delivered to: ${v("rv-city")}
Service: ${v("rv-service")}
Review: ${v("rv-text")}
I agree AEFO can show my first name, city and review on the website.`);
    form.hidden = true; thanks.hidden = false;
  });
})();
