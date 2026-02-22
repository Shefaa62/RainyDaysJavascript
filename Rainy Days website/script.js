const BASE_URL = "https://api.noroff.dev/api/v1/rainy-days";
const CART_KEY = "rainyDaysCart";

/* =========================
   SELECTORS
========================= */

const productsContainer = document.querySelector("#products");
const loader = document.querySelector("#loader");
const filterButtons = document.querySelectorAll(".shop-filter-btn");
const cartIcon = document.querySelector(".fa-cart-shopping");

/* =========================
   CART FUNCTIONS
========================= */

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  cart.push(product);
  saveCart(cart);
  alert("Added to cart");
}

function removeFromCart(id) {
  const cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
}

function updateCartBadge() {
  if (!cartIcon) return;

  const existingBadge = document.querySelector(".cart-badge");
  if (existingBadge) existingBadge.remove();

  const cart = getCart();
  if (cart.length === 0) return;

  const badge = document.createElement("span");
  badge.classList.add("cart-badge");
  badge.textContent = cart.length;

  cartIcon.parentElement.style.position = "relative";
  badge.style.position = "absolute";
  badge.style.top = "-5px";
  badge.style.right = "-8px";
  badge.style.background = "red";
  badge.style.color = "white";
  badge.style.fontSize = "12px";
  badge.style.padding = "2px 6px";
  badge.style.borderRadius = "50%";

  cartIcon.parentElement.appendChild(badge);
}

/* =========================
   FETCH PRODUCTS
========================= */

async function fetchProducts() {
  try {
    if (loader) loader.style.display = "block";

    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    if (loader) loader.style.display = "none";

    return data;

  } catch (error) {
    if (loader) loader.style.display = "none";
    if (productsContainer) {
      productsContainer.innerHTML = "<p>Something went wrong. Please try again later.</p>";
    }
  }
}

/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {
  if (!productsContainer) return;

  productsContainer.innerHTML = "";

  products.forEach(product => {
    productsContainer.innerHTML += `
      <div class="shop-product-card">
        <div class="shop-image-wrapper">
          <img src="${product.image}" alt="${product.title}">
          <div class="shop-product-actions">
            <button class="shop-action-btn add-to-cart" data-id="${product.id}">
              <i class="fa-solid fa-cart-shopping"></i>
            </button>
          </div>
        </div>
        <div class="shop-product-info">
          <h3>${product.title}</h3>
          <p>$${product.price}</p>
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.id;
      const product = products.find(p => p.id === id);
      addToCart(product);
    });
  });
}

/* =========================
   FILTER LOGIC
========================= */

function setupFilters(products) {
  if (!filterButtons.length) return;

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {

      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const filterValue = button.dataset.filter;

      if (filterValue === "all") {
        displayProducts(products);
      } else {
        const filtered = products.filter(
          product => product.gender === filterValue
        );
        displayProducts(filtered);
      }
    });
  });
}

/* =========================
   INIT
========================= */

async function init() {
  updateCartBadge();

  if (productsContainer) {
    const products = await fetchProducts();
    if (products) {
      displayProducts(products);
      setupFilters(products);
    }
  }
}

init();

/* =========================
   CHECKOUT PAGE
========================= */

const checkoutContainer = document.querySelector("#checkout-container");
const checkoutSummary = document.querySelector("#checkout-summary");

function renderCheckout() {
  if (!checkoutContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    checkoutContainer.innerHTML = "<p>Your basket is empty.</p>";
    checkoutSummary.innerHTML = "";
    return;
  }

  checkoutContainer.innerHTML = "";

  let total = 0;

  cart.forEach(product => {
    total += product.price;

    checkoutContainer.innerHTML += `
      <div style="margin-bottom:20px; border-bottom:1px solid #ccc; padding-bottom:10px;">
        <h3>${product.title}</h3>
        <p>$${product.price}</p>
        <button class="remove-btn" data-id="${product.id}">Remove</button>
      </div>
    `;
  });

  checkoutSummary.innerHTML = `
    <h2>Total: $${total}</h2>
    <button id="checkout-btn">Complete Purchase</button>
  `;

  document.querySelectorAll(".remove-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      removeFromCart(id);
      renderCheckout();
    });
  });

  const checkoutBtn = document.querySelector("#checkout-btn");
  checkoutBtn.addEventListener("click", () => {
    localStorage.removeItem(CART_KEY);
    window.location.href = "confirmation/index.html";
  });
}

renderCheckout();