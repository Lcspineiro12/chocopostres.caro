// =================== CONFIG ===================
const WHATSAPP_NUMBER = "5491157474821"; // +54 9 11 5747-4821
const PHONE_PRETTY = "+54 9 11 5747-4821";
const CATEGORIES = ["Todos","Postres","Shots","Tartas","Combos"];

// Lista de productos (editá a gusto)
const productos = [
  {
    id:"frutillas", categoria:"Postres", nombre:"Frutillas con crema", desc:"Crema chantilly y frutillas frescas.",
    tamanos:{"Chico 250cc":2500,"Grande 430cc":4200}
  },
  {
    id:"duraznos", categoria:"Postres", nombre:"Duraznos con crema", desc:"Duraznos en almíbar + crema.",
    tamanos:{"Chico 250cc":2300,"Grande 430cc":4000}
  },
  {
    id:"chocotorta", categoria:"Postres", nombre:"Chocotorta", desc:"Clásica con chocolinas y dulce de leche.",
    tamanos:{"Chico 250cc":2600,"Grande 430cc":4500}
  },
  {
    id:"oreo-shots", categoria:"Shots", nombre:"Shots de Oreo", desc:"Base de oreo + crema.",
    tamanos:{"Unidad":1500, "Pack x4":5500}
  },
  {
    id:"cupcakes", categoria:"Shots", nombre:"Cupcakes Vainilla", desc:"Topping a elección.",
    tamanos:{"Unidad":1500, "Pack x6":8000}
  },
  {
    id:"tarta-frutilla", categoria:"Tartas", nombre:"Mini tarta de frutilla", desc:"Masa sablé, crema y frutillas.",
    tamanos:{"Mini":4500}
  },
  {
    id:"tarta-n14", categoria:"Tartas", nombre:"Tarta N°14", desc:"Ideal 6-8 porciones.",
    tamanos:{"N°14":9800}
  },
  {
    id:"box-dulce", categoria:"Combos", nombre:"Box Dulce", desc:"1 tarta mini + 2 shots + 1 cupcake.",
    tamanos:{"Box":9800}
  }
];

// =================== STATE ===================
const state = {
  filtro:"Todos",
  q:"",
  cart: JSON.parse(localStorage.getItem("caro.cart")||"[]")
};

// =================== HELPERS ===================
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const money = n => n.toLocaleString('es-AR',{style:'currency', currency:'ARS', maximumFractionDigits:0});

function calcTotal(){
  return state.cart.reduce((a,i)=> a + i.precio * i.cantidad, 0);
}

function saveCart(){
  localStorage.setItem("caro.cart", JSON.stringify(state.cart));
  renderCartBadge();
}

function renderCartBadge(){
  $("#cartCount").textContent = state.cart.reduce((a,i)=>a + i.cantidad, 0);
  $("#cartTotal").textContent = money(calcTotal());
}

// =================== RENDER: Chips & Grid ===================
function renderChips(){
  const wrap = $("#chips");
  wrap.innerHTML = CATEGORIES.map(c=>`<button class="chip ${state.filtro===c? 'active':''}" data-c="${c}">${c}</button>`).join("");
  wrap.addEventListener('click', e=>{
    const c = e.target.dataset.c; if(!c) return; state.filtro=c; renderGrid(); renderChips();
  });
}

function renderGrid(){
  const grid = $("#grid");
  let items = productos.filter(p=> state.filtro==="Todos" || p.categoria===state.filtro);
  if(state.q){
    const q = state.q.toLowerCase();
    items = items.filter(p=> p.nombre.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }
  if(!items.length){
    grid.innerHTML = `<div class="card" style="padding:22px">No encontramos resultados para <strong>${state.q}</strong>.</div>`;return;
  }

  grid.innerHTML = items.map(p=>{
    const firstSize = Object.keys(p.tamanos)[0];
    const firstPrice = p.tamanos[firstSize];
    return `
    <article class="card" data-id="${p.id}">
      <div class="thumb" aria-hidden="true">${p.nombre.split(' ')[0]}</div>
      <div class="card-body">
        <h3>${p.nombre}</h3>
        <div class="muted">${p.desc}</div>
        <div class="row">
          <select class="selTam">
            ${Object.entries(p.tamanos).map(([t,pr])=>`<option value="${t}" data-price="${pr}">${t} — ${money(pr)}</option>`).join('')}
          </select>
          <input class="qty" type="number" min="1" value="1" />
          <div class="price">${money(firstPrice)}</div>
        </div>
        <div class="add">
          <button class="btn addcart">Agregar</button>
        </div>
      </div>
    </article>`
  }).join('');

  // events per card
  $$(".card").forEach(card=>{
    const sel = card.querySelector('.selTam');
    const priceEl = card.querySelector('.price');
    sel.addEventListener('change',()=>{
      const pr = +sel.selectedOptions[0].dataset.price; priceEl.textContent = money(pr);
    });
    card.querySelector('.addcart').addEventListener('click',()=>{
      const id = card.dataset.id;
      const prod = productos.find(x=>x.id===id);
      const tam = sel.value;
      const precio = +sel.selectedOptions[0].dataset.price;
      const cantidad = Math.max(1, parseInt(card.querySelector('.qty').value||'1'));
      const key = id+"|"+tam;
      const existing = state.cart.find(x=>x.key===key);
      if(existing){ existing.cantidad += cantidad; }
      else { state.cart.push({key,id,nombre:prod.nombre,tamano:tam,precio,cantidad}); }
      saveCart();
      // simple feedback
      card.querySelector('.addcart').textContent = 'Agregado ✓';
      setTimeout(()=> card.querySelector('.addcart').textContent='Agregar', 900);
    });
  });
}

// =================== CART MODAL ===================
const modal = $("#modal");
$("#openCart").onclick = ()=> modal.classList.add('open');
$("#closeModal").onclick = $("#closeX").onclick = ()=> modal.classList.remove('open');

function renderCart(){
  const list = $("#cartList");
  if(!state.cart.length){
    list.innerHTML = '<div class="muted">Tu carrito está vacío. Agregá algo rico 😋</div>';
    $("#cartSum").textContent = money(0);
    return;
  }
  list.innerHTML = state.cart.map((i,idx)=>`
    <div class="cart-item" data-k="${i.key}">
      <div><strong>${i.nombre}</strong><div class="muted">${i.tamano}</div></div>
      <div>${money(i.precio)}</div>
      <div><input class="qcart" type="number" min="1" value="${i.cantidad}" style="width:80px"/></div>
      <div>${money(i.precio * i.cantidad)}</div>
      <button class="btn ghost rm">✕</button>
    </div>
  `).join('');
  $("#cartSum").textContent = money(calcTotal());

  // qty & remove
  $$(".qcart").forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const row = inp.closest('.cart-item');
      const it = state.cart.find(x=>x.key===row.dataset.k);
      it.cantidad = Math.max(1, parseInt(inp.value||'1'));
      saveCart(); renderCart();
    })
  })
  $$(".rm").forEach(btn=> btn.addEventListener('click',()=>{
    const k = btn.closest('.cart-item").dataset.k;
    state.cart = state.cart.filter(x=>x.key!==k); saveCart(); renderCart();
  }));
}

$("#openCart").addEventListener('click', renderCart);
$("#clearCart").addEventListener('click', ()=>{ state.cart=[]; saveCart(); renderCart(); });

// =================== WHATSAPP FLOW ===================
function buildWhatsMessage(){
  const name = $("#buyerName").value.trim();
  const delivery = $("#delivery").value;
  const time = $("#timePref").value.trim();
  let lines = [];
  lines.push("¡Hola! Quiero hacer un pedido en *Chocopostres.Caro*:\n");
  if(!state.cart.length){ lines.push("(aún no agregué productos, te consulto precios/stock)\n"); }
  state.cart.forEach(i=> lines.push(`• ${i.nombre} (${i.tamano}) x${i.cantidad} — ${money(i.precio * i.cantidad)}`));
  lines.push(`\n*Total:* ${money(calcTotal())}`);
  if(name) lines.push(`\n*Nombre:* ${name}`);
  lines.push(`\n*Entrega:* ${delivery}`);
  if(time) lines.push(`\n*Horario:* ${time}`);
  lines.push("\nGracias!");
  return lines.join("\n");
}

function goWhats(){
  const msg = encodeURIComponent(buildWhatsMessage());
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  window.open(url, '_blank');
}

$("#ctaWhats").onclick = goWhats;
$("#waQuick").href = `https://wa.me/${WHATSAPP_NUMBER}`;
$("#goWhats").onclick = goWhats;
$("#phoneLink").textContent = PHONE_PRETTY;
$("#phoneLink").href = `https://wa.me/${WHATSAPP_NUMBER}`;

// =================== INIT ===================
$("#search").addEventListener('input', e=>{ state.q = e.target.value; renderGrid(); });

renderChips();
renderGrid();
renderCartBadge();
