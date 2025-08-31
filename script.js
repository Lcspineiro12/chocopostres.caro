
// =================== CONFIG ===================
const WHATSAPP_NUMBER = "5491157474821"; // formato wa.me (sin +)
const BRAND = "Chocopostres Caro";
const CATEGORIES = ["Todos","Postres","Shots","Tartas","Tortas","Boxes","Cookies"];

// =================== DATA ===================
const productos = [
  { id:"chocotorta-250", nombre:"Chocotorta 250cc", desc:"Clásica con queso crema + dulce de leche.", categoria:"Postres", precio:2900, img:"images/chocotorta chico" },
  { id:"chocotorta-430", nombre:"Chocotorta 430cc", desc:"Más grande y super cremosa.", categoria:"Postres", precio:3900, img:"images/chocotorta grande" },
  { id:"oreo-250", nombre:"Oreo 250cc", desc:"Base de galleta y crema de oreo.", categoria:"Postres", precio:2900, img:"images/oreo chico" },
  { id:"oreo-430", nombre:"Oreo 430cc", desc:"Base de galleta y crema de oreo.", categoria:"Postres", precio:3900, img:"images/oreo grande" },
  { id:"frutillas-250", nombre:"Frutillas con crema 250cc", desc:"Crema chantilly + frutillas.", categoria:"Postres", precio:2900, img:"images/frutillas chico" },
  { id:"frutillas-430", nombre:"Frutillas con crema 430cc", desc:"Crema chantilly + frutillas.", categoria:"Postres", precio:3900, img:"images/frutillas grande" },
  { id:"duraznos-250", nombre:"Duraznos con crema 250cc", desc:"Duraznos en almíbar + crema.", categoria:"Postres", precio:2900, img:"images/duraznos chico" },
  { id:"duraznos-430", nombre:"Duraznos con crema 430cc", desc:"Duraznos en almíbar + crema.", categoria:"Postres", precio:3900, img:"images/duraznos grande" },
  { id: "tiramisu-250", nombre: "Tiramisú 250cc", desc: "Postre clásico con café, crema y cacao.", categoria: "Postres", precio: 2900, img: "images/tiramisu chico" },
  { id: "tiramisu-430", nombre: "Tiramisú 430cc", desc: "Postre clásico con café, crema y cacao.", categoria: "Postres", precio: 4000, img: "images/tiramisu grande" },
  { id:"tarta-frutilla-mini", nombre:"Mini Tarta de Frutilla", desc:"Base sablée + dulce de leche + crema chantilly + frutillas.", categoria:"Tartas", precio:7500, img:"images/Mini Tarta Frutilla" },
  { id:"torta-chocolate", nombre:"Mini Tarta de Chocolate", desc:"Base sablée + dulce de leche + ganache de chocolate.", categoria:"Tartas", precio:7500, img:"images/Mini Tarta Chocolate" },
  { id:"box-3", nombre:"Box", desc:"Armá tu box con materiales a elección", categoria:"Boxes", precio:14800, img:"images/Box" },
];

// =================== STATE ===================
let state = {
  category: "Todos",
  cart: {} // {id: {qty, subtotal}}
};

// =================== HELPERS ===================
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const fmt = n => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function filterProducts() {
  const grid = $(".grid");
  grid.innerHTML = "";
  const list = state.category === "Todos" ? productos : productos.filter(p => p.categoria === state.category);
  for (const p of list) {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb">${p.img ? `<img src="${p.img}" alt="${p.nombre}" onerror="this.parentElement.textContent='Sin foto'">` : "Sin foto"}</div>
      <div class="info">
        <div class="name">${p.nombre}</div>
        <div class="desc">${p.desc || ""}</div>
        <div class="price-row">
          <div class="price">${fmt(p.precio)}</div>
          <button class="add" data-id="${p.id}">Agregar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  }
}

function renderFilters() {
  const wrap = $(".filters .wrap");
  wrap.innerHTML = "";
  for (const c of CATEGORIES) {
    const b = document.createElement("button");
    b.className = "filter-btn" + (state.category === c ? " active" : "");
    b.textContent = c;
    b.addEventListener("click", () => {
      state.category = c;
      $$(".filter-btn").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      filterProducts();
    });
    wrap.appendChild(b);
  }
}

function addToCart(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  if (!state.cart[id]) state.cart[id] = { qty: 0, subtotal: 0, prod };
  state.cart[id].qty++;
  state.cart[id].subtotal = state.cart[id].qty * prod.precio;
  renderCart();
  showToast(`${prod.nombre} agregado al carrito 🛒`);
}

function changeQty(id, delta) {
  const item = state.cart[id];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) delete state.cart[id];
  else item.subtotal = item.qty * item.prod.precio;
  renderCart();
}

function clearCart() {
  state.cart = {};
  renderCart();
}

function openCart(open = true) {
  const modal = document.querySelector(".modal");
  const backdrop = document.querySelector(".modal-backdrop");

  if (open) {
    modal.style.display = "flex";
    backdrop.style.display = "block";
    document.body.classList.add("modal-open");   // <<--- acá
  } else {
    modal.style.display = "none";
    backdrop.style.display = "none";
    document.body.classList.remove("modal-open"); // <<--- y acá
  }
}


function renderCart() {
  const body = $(".modal .content");
  const totalLbl = $(".cart-total .total");
  const cartBtn = $(".btn-cart .count");
  body.innerHTML = "";
  const entries = Object.values(state.cart);
  let total = 0;
  if (!entries.length) {
    body.innerHTML = `<div class="empty">El carrito está vacío.</div>`;
  } else {
    for (const {qty, subtotal, prod} of entries) {
      total += subtotal;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <div style="font-weight:800">${prod.nombre}</div>
          <div style="color:#6b6b6b; font-size:.92rem">${fmt(prod.precio)} c/u</div>
        </div>
        <div class="qty">
          <button aria-label="menos" data-id="${prod.id}" data-delta="-1">-</button>
          <div><strong>${qty}</strong></div>
          <button aria-label="más" data-id="${prod.id}" data-delta="1">+</button>
          <div style="width:70px; text-align:right; font-weight:800">${fmt(subtotal)}</div>
        </div>
      `;
      body.appendChild(row);
    }
  }
  totalLbl.textContent = fmt(total);
  cartBtn.textContent = entries.length ? `(${entries.reduce((a,x)=>a+x.qty,0)})` : "";
}

function buildWhatsAppMessage() {
  const entries = Object.values(state.cart);
  if (!entries.length) return "";
  const lines = entries.map(({qty, prod}) => `• ${prod.nombre} x${qty} — ${fmt(prod.precio)} c/u`);
  const total = entries.reduce((a,x)=>a + x.qty * x.prod.precio, 0);
  const text = `Hola! Quiero hacer este pedido en *${BRAND}*:%0A%0A${lines.join("%0A")}%0A%0ATotal: *${fmt(total)}*%0A%0A`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500); // se oculta después de 2.5s
}


// =================== INIT ===================
document.addEventListener("click", (e) => {
  const add = e.target.closest(".add");
  if (add) addToCart(add.dataset.id);

  const qbtn = e.target.closest(".qty button");
  if (qbtn) changeQty(qbtn.dataset.id, Number(qbtn.dataset.delta));

  const open = e.target.closest(".btn-cart");
  if (open) openCart(true);

  if (e.target.matches("[data-close]")) openCart(false);

  document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") openCart(false);
});

  if (e.target.matches("[data-clear]")) clearCart();

  if (e.target.matches("[data-wa]")) {
    const url = buildWhatsAppMessage();
    if (url) window.open(url, "_blank");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  filterProducts();
  renderCart();
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("main-menu");

  if (!btn || !menu) return; // seguridad: si no existe, no hace nada

  function toggleMenu() {
    const isOpen = menu.classList.toggle("open");
    btn.classList.toggle("active", isOpen);
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  // Toggle al click
  btn.addEventListener("click", toggleMenu);

  // Cerrar al hacer click en un link
  menu.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      if (menu.classList.contains("open")) toggleMenu();
    })
  );

  // Reset al pasar a desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && menu.classList.contains("open")) {
      menu.classList.remove("open");
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
    }
  });
});
