const BASE_URL = "https://v2.api.noroff.dev/rainy-days";
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

  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  if (existingProduct) {
    existingProduct.quantity =
      (existingProduct.quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart(cart);

  const toast = document.createElement("div");
  toast.textContent = "Added to cart";
  toast.classList.add("toast");

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}

function removeFromCart(id) {
  const cart = getCart().filter(
    (item) => item.id !== id
  );

  saveCart(cart);
}

function updateCartBadge() {
  if (!cartIcon) return;

  const existingBadge =
    document.querySelector(".cart-badge");

  if (existingBadge) {
    existingBadge.remove();
  }

  const cart = getCart();

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  if (totalItems === 0) return;

  const badge = document.createElement("span");

  badge.classList.add("cart-badge");
  badge.textContent = totalItems;

  cartIcon.parentElement.classList.add(
    "cart-icon-wrapper"
  );

  cartIcon.parentElement.appendChild(badge);
}

/* =========================
   FETCH PRODUCTS
========================= */

async function fetchProducts() {
  try {
    if (loader) {
      loader.style.display = "block";
    }

    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    if (loader) {
      loader.style.display = "none";
    }

    return data.data;
  } catch (error) {
    if (loader) {
      loader.style.display = "none";
    }

    if (productsContainer) {
      productsContainer.innerHTML =
        "<p>Something went wrong. Please try again later.</p>";
    }

    console.error(error);
  }
}

/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {
  if (!productsContainer) return;

  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const image =
      product.image?.url ||
      product.images?.[0]?.url ||
      "";

    productsContainer.innerHTML += `
      <div class="shop-product-card">

        <a href="product/index.html?id=${product.id}">
          <div class="shop-image-wrapper">
            <img src="${image}" alt="${product.title}">
          </div>
        </a>

        <div class="shop-product-info">
          <h3>${product.title}</h3>
          <p>$${product.price}</p>

          <a class="view-product-btn"
             href="product/index.html?id=${product.id}">
             View Product
          </a>

          <button
            class="shop-action-btn add-to-cart"
            data-id="${product.id}">
            Add to Cart
          </button>
        </div>

      </div>
    `;
  });

  document
    .querySelectorAll(".add-to-cart")
    .forEach((button) => {
      button.addEventListener("click", (event) => {
        const id =
          event.currentTarget.dataset.id;

        const product = products.find(
          (p) => p.id === id
        );

        addToCart(product);
      });
    });
}

/* =========================
   FILTERS
========================= */

function setupFilters(products) {
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      const filterValue =
        button.dataset.filter;

      if (filterValue === "all") {
        displayProducts(products);
        return;
      }

      const filtered = products.filter(
        (product) =>
          product.gender === filterValue
      );

      displayProducts(filtered);
    });
  });
}

/* =========================
   INIT
========================= */

async function init() {
  updateCartBadge();

  if (productsContainer) {
    const products =
      await fetchProducts();

    if (products) {
      displayProducts(products);
      setupFilters(products);
    }
  }
}

init();

/* =========================
   CHECKOUT
========================= */

const checkoutContainer =
  document.querySelector(
    "#checkout-container"
  );

const checkoutSummary =
  document.querySelector(
    "#checkout-summary"
  );

function renderCheckout() {
  if (!checkoutContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    checkoutContainer.innerHTML =
      "<p>Your basket is empty.</p>";

    if (checkoutSummary) {
      checkoutSummary.innerHTML = "";
    }

    return;
  }

  checkoutContainer.innerHTML = "";

  let total = 0;

  cart.forEach((product) => {
    const quantity =
      product.quantity || 1;

    total += product.price * quantity;

    checkoutContainer.innerHTML += `
      <div class="checkout-item">
        <h3>${product.title}</h3>
        <p>Quantity: ${quantity}</p>
        <p>$${product.price}</p>

        <button
          class="remove-btn"
          data-id="${product.id}">
          Remove
        </button>
      </div>
    `;
  });

  checkoutSummary.innerHTML = `
    <h2>Total: $${total.toFixed(2)}</h2>
    <button id="checkout-btn">
      Complete Purchase
    </button>
  `;

  document
    .querySelectorAll(".remove-btn")
    .forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          const id =
            event.target.dataset.id;

          removeFromCart(id);

          renderCheckout();
        }
      );
    });

  const checkoutBtn =
    document.querySelector(
      "#checkout-btn"
    );

  checkoutBtn?.addEventListener(
    "click",
    () => {
      localStorage.removeItem(
        CART_KEY
      );

      window.location.href =
        "../confirmation/index.html";
    }
  );
}

renderCheckout();
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");

if (menuToggle && mobileMenu && closeMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("active");
  });

  closeMenu.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
}