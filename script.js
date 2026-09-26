const PRODUCT = {
  name: "WANTED NO. 1",
  price: 0, // Replace 0 with the real price in naira.
  priceLabel: "₦XX,XXX",
  image: "assets/mugshot-tee.png"
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

function saveCart() {
  localStorage.setItem("wantedWorldCart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = '<p class="empty-cart">Your bag is empty.</p>';
    $("#cartTotal").textContent = "₦0";
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

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  $("#cartTotal").textContent = PRODUCT.price ? money(total) : "₦XX,XXX";
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

document.querySelectorAll(".sizes button").forEach(btn => {
  btn.onclick = () => {
    selectedSize = btn.dataset.size;
    document.querySelectorAll(".sizes button").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  };
});

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

$("#checkout").onclick = () => {
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }
  // Replace this number with the WANTED WORLD WhatsApp number, including country code.
  const whatsappNumber = "234XXXXXXXXXX";
  const lines = cart.map(i => `• ${i.name} — Size ${i.size} — Qty ${i.qty}`);
  const total = PRODUCT.price ? money(cart.reduce((s,i) => s + i.price*i.qty, 0)) : "price to be confirmed";
  const message = `Hello WANTED WORLD, I'd like to order:%0A${encodeURIComponent(lines.join("\n"))}%0A%0ATotal: ${encodeURIComponent(total)}`;
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
};

renderCart();
