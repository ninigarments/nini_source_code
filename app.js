/* =========================================================
   NINI GARMENTS — FRONTEND SHOPPING SYSTEM
   Works with the current index.html + style.css
   ========================================================= */

/* ---------- PRODUCT DATA ---------- */

const products = [
  {
    id: 1,
    name: "Classic Kids Hoodie",
    category: "Hoodies",
    price: 399,
    mrp: 699,
    discount: 43,
    age: "2–6 Years",
    image: "nini-logo.jpeg"
  },
  {
    id: 2,
    name: "Cute Everyday Kids Set",
    category: "Kids Sets",
    price: 449,
    mrp: 799,
    discount: 44,
    age: "1–5 Years",
    image: "nini-logo.jpeg"
  },
  {
    id: 3,
    name: "Comfort Cotton T-Shirt",
    category: "Clothing",
    price: 299,
    mrp: 499,
    discount: 40,
    age: "2–6 Years",
    image: "nini-logo.jpeg"
  },
  {
    id: 4,
    name: "Premium Kids Hoodie",
    category: "Hoodies",
    price: 499,
    mrp: 899,
    discount: 44,
    age: "3–6 Years",
    image: "nini-logo.jpeg"
  },
  {
    id: 5,
    name: "Little Star Co-ord Set",
    category: "Kids Sets",
    price: 499,
    mrp: 899,
    discount: 44,
    age: "1–6 Years",
    image: "nini-logo.jpeg"
  },
  {
    id: 6,
    name: "Soft Cotton Kids Wear",
    category: "Clothing",
    price: 349,
    mrp: 599,
    discount: 42,
    age: "0–5 Years",
    image: "nini-logo.jpeg"
  }
];


/* ---------- CART ---------- */

let cart = JSON.parse(localStorage.getItem("niniCart")) || [];


/* ---------- INITIAL LOAD ---------- */

document.addEventListener("DOMContentLoaded", function () {
  renderProducts(products);
  updateCartCount();
});


/* ---------- PRODUCT RENDER ---------- */

function renderProducts(list) {

  const container = document.getElementById("products");

  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="loading-state">
        <strong>No products found.</strong>
        <br>
        Try another search or category.
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(product => {

    return `
      <article class="product">

        <img
          src="${product.image}"
          alt="${escapeHTML(product.name)}"
          onerror="this.src='nini-logo.jpeg'"
        >

        <div class="product-info">

          <h3>${escapeHTML(product.name)}</h3>

          <div class="price">
            ₹${Number(product.price).toLocaleString("en-IN")}
          </div>

          <div class="stock">
            <del>₹${Number(product.mrp).toLocaleString("en-IN")}</del>
            &nbsp;
            <span>${product.discount}% off</span>
            &nbsp; • &nbsp;
            ${escapeHTML(product.age)}
          </div>

          <select id="size-${product.id}">
            <option value="">Select Size</option>
            <option value="0–1Y">0–1 Years</option>
            <option value="1–2Y">1–2 Years</option>
            <option value="2–3Y">2–3 Years</option>
            <option value="3–4Y">3–4 Years</option>
            <option value="4–5Y">4–5 Years</option>
            <option value="5–6Y">5–6 Years</option>
          </select>

          <button onclick="addToCart(${product.id})">
            Add to Cart 🛒
          </button>

        </div>

      </article>
    `;

  }).join("");
}


/* ---------- SEARCH ---------- */

function marketSearchProducts(query) {

  const search = String(query || "")
    .trim()
    .toLowerCase();

  if (!search) {

    renderProducts(products);

    const label = document.getElementById("resultLabel");

    if (label) {
      label.textContent = "All products";
    }

    return;
  }

  const filtered = products.filter(product => {

    const name = String(product.name || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();
    const age = String(product.age || "").toLowerCase();

    return (
      name.includes(search) ||
      category.includes(search) ||
      age.includes(search)
    );

  });

  renderProducts(filtered);

  const label = document.getElementById("resultLabel");

  if (label) {
    label.textContent =
      filtered.length +
      " result" +
      (filtered.length !== 1 ? "s" : "") +
      ' for "' +
      search +
      '"';
  }
}


/* ---------- CATEGORY FILTER ---------- */

function filterCat(category) {

  const value = String(category || "")
    .trim()
    .toLowerCase();

  if (!value) {
    renderProducts(products);
    return;
  }

  const filtered = products.filter(product => {

    const productCategory =
      String(product.category || "").toLowerCase();

    if (value === "clothing") {
      return productCategory === "clothing";
    }

    return productCategory === value;

  });

  renderProducts(filtered);

  const label = document.getElementById("resultLabel");

  if (label) {
    label.textContent = category;
  }

  const shop = document.getElementById("shop");

  if (shop) {
    shop.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


/* ---------- SORT ---------- */

function sortMarketProducts(type) {

  const sorted = [...products];

  switch (type) {

    case "low":
      sorted.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
      break;

    case "high":
      sorted.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
      break;

    case "name":
      sorted.sort(
        (a, b) =>
          String(a.name).localeCompare(String(b.name))
      );
      break;

    default:
      break;
  }

  renderProducts(sorted);
}


/* ---------- ADD TO CART ---------- */

function addToCart(productId) {

  const product = products.find(
    p => Number(p.id) === Number(productId)
  );

  if (!product) return;

  const sizeElement =
    document.getElementById(`size-${productId}`);

  const size =
    sizeElement ? sizeElement.value : "";

  if (!size) {

    alert("Please select a size first.");

    if (sizeElement) {
      sizeElement.focus();
    }

    return;
  }

  const existing = cart.find(item =>
    Number(item.id) === Number(productId) &&
    item.size === size
  );

  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      size: size,
      quantity: 1,
      image: product.image
    });

  }

  saveCart();
  updateCartCount();

  alert(`${product.name} added to cart.`);
}


/* ---------- CART COUNT ---------- */

function updateCartCount() {

  const countElement =
    document.getElementById("cartCount");

  if (!countElement) return;

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  countElement.textContent = total;
}


/* ---------- SAVE CART ---------- */

function saveCart() {

  localStorage.setItem(
    "niniCart",
    JSON.stringify(cart)
  );

}


/* ---------- OPEN CART ---------- */

function openCart() {

  const modal =
    document.getElementById("cartModal");

  if (!modal) return;

  renderCart();

  modal.style.display = "flex";

  document.body.style.overflow = "hidden";
}


/* ---------- CLOSE CART ---------- */

function closeCart() {

  const modal =
    document.getElementById("cartModal");

  if (!modal) return;

  modal.style.display = "none";

  document.body.style.overflow = "";
}


/* ---------- RENDER CART ---------- */

function renderCart() {

  const container =
    document.getElementById("cartItems");

  const totalElement =
    document.getElementById("cartTotal");

  if (!container) return;

  if (cart.length === 0) {

    container.innerHTML = `
      <div class="loading-state">
        🛒 Your cart is empty.
        <br><br>
        Add some cute kidswear to continue shopping.
      </div>
    `;

    if (totalElement) {
      totalElement.textContent = "0";
    }

    return;
  }

  container.innerHTML = cart.map((item, index) => {

    const itemTotal =
      Number(item.price) *
      Number(item.quantity);

    return `
      <div class="cart-line">

        <div>
          <strong>${escapeHTML(item.name)}</strong>

          <div style="color:#68748b;margin-top:5px">
            Size: ${escapeHTML(item.size)}
          </div>

          <div style="margin-top:5px">
            ₹${Number(item.price).toLocaleString("en-IN")}
            × ${item.quantity}
          </div>
        </div>

        <strong>
          ₹${itemTotal.toLocaleString("en-IN")}
        </strong>

        <div style="display:flex;gap:8px;align-items:center">

          <button
            onclick="changeCartQuantity(${index}, -1)"
            style="border:1px solid #ddd;background:#fff;color:#111;padding:5px 10px;border-radius:4px"
          >
            −
          </button>

          <span>${item.quantity}</span>

          <button
            onclick="changeCartQuantity(${index}, 1)"
            style="border:1px solid #ddd;background:#fff;color:#111;padding:5px 10px;border-radius:4px"
          >
            +
          </button>

          <button
            onclick="removeFromCart(${index})"
            style="margin-left:8px"
          >
            Remove
          </button>

        </div>

      </div>
    `;

  }).join("");

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
      Number(item.quantity),
    0
  );

  if (totalElement) {

    totalElement.textContent =
      total.toLocaleString("en-IN");

  }
}


/* ---------- CHANGE QUANTITY ---------- */

function changeCartQuantity(index, change) {

  if (!cart[index]) return;

  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {

    cart.splice(index, 1);

  }

  saveCart();
  updateCartCount();
  renderCart();
}


/* ---------- REMOVE CART ITEM ---------- */

function removeFromCart(index) {

  if (!cart[index]) return;

  cart.splice(index, 1);

  saveCart();
  updateCartCount();
  renderCart();
}


/* ---------- PLACE ORDER ---------- */

function placeOrder() {

  if (cart.length === 0) {

    alert("Your cart is empty.");

    return;
  }

  alert(
    "Your cart is ready for checkout.\n\n" +
    "Checkout and payment will be connected in the next step."
  );

}


/* ---------- ESCAPE HTML ---------- */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ---------- CLOSE CART WITH ESC ---------- */

document.addEventListener("keydown", function (event) {

  if (event.key === "Escape") {
    closeCart();
  }

});
