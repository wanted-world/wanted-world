const PRODUCT = {
  name: "WANTED NO. 1",
  price: 15000,
  oldPrice: 20000,
  priceLabel: "₦15,000",
  image: "assets/product-mockup.png"
};

const DELIVERY_FEES = {
  lagos: 0,
  abuad: 0,
  other: 6000
};

let cart = JSON.parse(localStorage.getItem("wantedWorldCart") || "[]");
let selectedSize = null;

const $ = (s) => document.querySelector(s);
const cartDrawer = $("#cartDrawer");
const overlay = $("#overlay");
const modal = $("#productModal");

function money(n) {
  return "₦" + n.toLocaleString("en-NG");
}

// Generates a premium-looking order reference for each checkout attempt.
// Format: WW-YYMMDD-XXXX (example: WW-260927-4821)
function generateOrderNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = (window.crypto && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint32Array(1))[0] % 10000
    : Math.floor(Math.random() * 10000);
  return `WW-${yy}${mm}${dd}-${String(random).padStart(4, "0")}`;
}

function saveCart() {
  localStorage.setItem("wantedWorldCart", JSON.stringify(cart));
  renderCart();
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getDeliveryFee() {
  const location = $("#deliveryLocation").value;
  return Object.prototype.hasOwnProperty.call(DELIVERY_FEES, location) ? DELIVERY_FEES[location] : null;
}

function updateTotals() {
  const subtotal = getSubtotal();
  const delivery = getDeliveryFee();
  $("#cartSubtotal").textContent = money(subtotal);
  $("#deliveryFee").textContent = delivery === null ? "Select location" : (delivery === 0 ? "FREE" : money(delivery));
  $("#cartTotal").textContent = delivery === null ? money(subtotal) : money(subtotal + delivery);
}

function renderCart() {
  $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = '<p class="empty-cart">Your bag is empty.</p>';
    updateTotals();
    return;
  }

  box.innerHTML = cart.map((item, i) => `
    <div class="cart-row">
      <img src="${item.image}" alt="">
      <div>
        <h4>${item.name}</h4>
        <p>SIZE ${item.size} · QTY ${item.qty}</p>
        <button onclick="removeItem(${i})">REMOVE</button>
      </div>
      <strong>${item.priceLabel}</strong>
    </div>
  `).join("");

  updateTotals();
}

window.removeItem = function(i) {
  cart.splice(i, 1);
  saveCart();
};

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("show");
}
function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  selectedSize = null;
  document.querySelectorAll(".sizes button").forEach(b => b.classList.remove("selected"));
}

$("#cartOpen").onclick = openCart;
$("#cartClose").onclick = closeCart;
overlay.onclick = closeCart;
$("#quickView").onclick = openModal;
$("#modalClose").onclick = closeModal;

// Product gallery
const galleryMain = $("#galleryMain");
document.querySelectorAll(".gallery-thumb").forEach(btn => {
  btn.onclick = () => {
    galleryMain.src = btn.dataset.image;
    document.querySelectorAll(".gallery-thumb").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

document.querySelectorAll(".sizes button").forEach(btn => {
  btn.onclick = () => {
    selectedSize = btn.dataset.size;
    document.querySelectorAll(".sizes button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  };
});

$("#sizeGuideToggle").onclick = () => {
  $("#sizeGuide").classList.toggle("open");
};

$("#addToCart").onclick = () => {
  if (!selectedSize) {
    alert("Please select a size.");
    return;
  }
  const existing = cart.find(i => i.name === PRODUCT.name && i.size === selectedSize);
  if (existing) existing.qty++;
  else cart.push({...PRODUCT, size: selectedSize, qty: 1});
  saveCart();
  closeModal();
  openCart();
};

$("#deliveryLocation").addEventListener("change", updateTotals);

$("#checkout").onclick = () => {
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }

  const name = $("#customerName").value.trim();
  const phone = $("#customerPhone").value.trim();
  const whatsapp = $("#customerWhatsApp").value.trim();
  const locationKey = $("#deliveryLocation").value;
  const address = $("#deliveryAddress").value.trim();

  if (!name || !phone || !whatsapp || !locationKey || !address) {
    alert("Please complete all order details before continuing.");
    return;
  }

  const deliveryFee = DELIVERY_FEES[locationKey];
  const locationLabel = locationKey === "lagos" ? "Lagos" : locationKey === "abuad" ? "ABUAD" : "Other location";
  const subtotal = getSubtotal();
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();
  const orderReference = $("#orderReference");
  if (orderReference) {
    orderReference.innerHTML = `<span>ORDER NO.</span><strong>${orderNumber}</strong>`;
    orderReference.classList.add("show");
  }
  const lines = cart.map(i => `• ${i.name} — Size ${i.size} — Qty ${i.qty} — ${i.priceLabel}`);
  const message = [
    "WANTED WORLD — ORDER REQUEST",
    `ORDER NO.: ${orderNumber}`,
    "",
    ...lines,
    "",
    `Customer: ${name}`,
    `Phone: ${phone}`,
    `WhatsApp: ${whatsapp}`,
    `Delivery location: ${locationLabel}`,
    `Delivery address: ${address}`,
    `Delivery fee: ${deliveryFee === 0 ? "FREE" : money(deliveryFee)}`,
    `Total: ${money(total)}`,
    "",
    "Payment: To be confirmed via WhatsApp"
  ].join("\n");

  const whatsappNumber = "2349169980427";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
};

renderCart();

// WANTED NO. 1 campaign intro
const intro = document.getElementById("intro");
const introVideo = document.getElementById("introVideo");
const introSkip = document.getElementById("introSkip");

document.body.classList.add("intro-active");

function closeIntro() {
  if (!intro || intro.classList.contains("hidden")) return;
  intro.classList.add("hidden");
  document.body.classList.remove("intro-active");
  try { sessionStorage.setItem("wwIntroSeen", "1"); } catch(e) {}
  setTimeout(() => { if (intro) intro.remove(); }, 650);
}

introSkip.addEventListener("click", closeIntro);
introVideo.addEventListener("ended", closeIntro);
introVideo.addEventListener("error", closeIntro);

try {
  if (sessionStorage.getItem("wwIntroSeen") === "1") closeIntro();
} catch(e) {}
