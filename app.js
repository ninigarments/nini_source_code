/* =========================================================
   NINI GARMENTS — FRONTEND SHOPPING SYSTEM
   LIVE D1 / API PRODUCT VERSION
   ========================================================= */


/* ---------- LIVE PRODUCT DATA ---------- */

const API_URL = "https://nini-api.msninigarments7368.workers.dev";

let products = [];


/* ---------- CART ---------- */

let cart = JSON.parse(localStorage.getItem("niniCart")) || [];


/* ---------- INITIAL LOAD ---------- */

document.addEventListener("DOMContentLoaded", async function () {

  await loadProducts();

  updateCartCount();

});


async function loadProducts() {

  const container = document.getElementById("products");

  if (container) {

    container.innerHTML = `
      <div class="loading-state">
        Loading Nini Garments products...
      </div>
    `;

  }


  try {

    const response = await fetch(`${API_URL}/api/products`, {
      method: "GET"
    });


    if (!response.ok) {

      throw new Error("Product API request failed");

    }


    const data = await response.json();


    products = Array.isArray(data.products)
      ? data.products
      : [];


    renderProducts(products);


  } catch (error) {

    console.error("Nini product loading error:", error);


    if (container) {

      container.innerHTML = `
        <div class="loading-state">

          <strong>Unable to load products.</strong>

          <br>

          Please refresh the page and try again.

        </div>
      `;

    }

  }

}


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


    const sizes = Array.isArray(product.sizes)

      ? product.sizes.filter(
          size => Number(size.stock) > 0
        )

      : [];


    const image =
      product.image ||
      "nini-logo.jpeg";


    const sizeOptions = sizes.length

      ? sizes.map(size => `

          <option value="${escapeHTML(size.size)}">

            ${escapeHTML(size.size)}

          </option>

        `).join("")


      : `

          <option value="">

            Out of stock

          </option>

        `;


    const totalStock = sizes.reduce(

      (sum, size) =>

        sum + Number(size.stock || 0),

      0

    );


    return `

      <article class="product">


        <img

          src="${escapeHTML(image)}"

          alt="${escapeHTML(product.name)}"

          onerror="this.src='nini-logo.jpeg'"

        >


        <div class="product-info">


          <h3>

            ${escapeHTML(product.name)}

          </h3>


          <div class="price">

            ₹${Number(product.price || 0).toLocaleString("en-IN")}

            ${
              Number(product.mrp || 0) > Number(product.price || 0)
                ? `
                  <del style="margin-left:8px;color:#68748b;font-size:0.9em;">
                    ₹${Number(product.mrp).toLocaleString("en-IN")}
                  </del>
                  <span style="margin-left:8px;font-size:0.85em;">
                    ${Number(product.discount || 0)}% OFF
                  </span>
                `
                : ""
            }

          </div>


          <div class="stock">

            ${
              totalStock > 0

                ? `✓ ${totalStock} in stock`

                : `Out of stock`
            }

          </div>


          <select

            id="size-${product.id}"

            ${sizes.length ? "" : "disabled"}

          >

            <option value="">

              Select Size

            </option>

            ${sizeOptions}

          </select>


          <button

            onclick="addToCart(${product.id})"

            ${sizes.length ? "" : "disabled"}

          >

            ${
              sizes.length

                ? "Add to Cart 🛒"

                : "Out of Stock"
            }

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


    const label =
      document.getElementById("resultLabel");


    if (label) {

      label.textContent = "All products";

    }


    return;

  }


  const filtered = products.filter(product => {


    const name =
      String(product.name || "")
        .toLowerCase();


    const category =
      String(product.category || "")
        .toLowerCase();


    const age =
      String(product.age || "")
        .toLowerCase();


    return (

      name.includes(search) ||

      category.includes(search) ||

      age.includes(search)

    );

  });


  renderProducts(filtered);


  const label =
    document.getElementById("resultLabel");


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


  const value =
    String(category || "")

      .trim()

      .toLowerCase();


  if (!value) {

    renderProducts(products);

    return;

  }


  const filtered = products.filter(product => {


    const productCategory =

      String(product.category || "")

        .toLowerCase();


    if (value === "clothing") {

      return productCategory === "clothing";

    }


    return productCategory === value;

  });


  renderProducts(filtered);


  const label =
    document.getElementById("resultLabel");


  if (label) {

    label.textContent = category;

  }


  const shop =
    document.getElementById("shop");


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

        (a, b) =>

          Number(a.price) -

          Number(b.price)

      );

      break;


    case "high":

      sorted.sort(

        (a, b) =>

          Number(b.price) -

          Number(a.price)

      );

      break;


    case "name":

      sorted.sort(

        (a, b) =>

          String(a.name)

            .localeCompare(

              String(b.name)

            )

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

    p =>

      Number(p.id) ===

      Number(productId)

  );


  if (!product) return;


  const sizeElement =

    document.getElementById(

      `size-${productId}`

    );


  const size =

    sizeElement

      ? sizeElement.value

      : "";


  if (!size) {


    alert("Please select a size first.");


    if (sizeElement) {

      sizeElement.focus();

    }


    return;

  }


  const selectedSize =

    Array.isArray(product.sizes)

      ? product.sizes.find(

          s =>

            String(s.size) ===

            String(size)

        )

      : null;


  if (

    !selectedSize ||

    Number(selectedSize.stock) <= 0

  ) {

    alert("This size is out of stock.");

    return;

  }


  const existing = cart.find(

    item =>

      Number(item.id) ===

        Number(productId) &&

      item.size === size

  );


  if (existing) {


    if (

      existing.quantity >=

      Number(selectedSize.stock)

    ) {

      alert("No more stock available for this size.");

      return;

    }


    existing.quantity += 1;


  } else {


    cart.push({

      id: product.id,

      name: product.name,

      category: product.category,

      price: Number(product.price),

      mrp: Number(product.mrp || product.price || 0),

      discount: Number(product.discount || 0),

      size: size,

      quantity: 1,

      image: product.image

    });

  }


  saveCart();


  updateCartCount();


  alert(

    `${product.name} added to cart.`

  );

}


/* ---------- CART COUNT ---------- */

function updateCartCount() {


  const countElement =

    document.getElementById(

      "cartCount"

    );


  if (!countElement) return;


  const total = cart.reduce(

    (sum, item) =>

      sum +

      Number(item.quantity || 0),

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

    document.getElementById(

      "cartModal"

    );


  if (!modal) return;


  renderCart();


  modal.style.display = "flex";


  document.body.style.overflow =

    "hidden";

}


/* ---------- CLOSE CART ---------- */

function closeCart() {


  const modal =

    document.getElementById(

      "cartModal"

    );


  if (!modal) return;


  modal.style.display = "none";


  document.body.style.overflow = "";

}


/* ---------- RENDER CART ---------- */

function renderCart() {


  const container =

    document.getElementById(

      "cartItems"

    );


  const totalElement =

    document.getElementById(

      "cartTotal"

    );


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


  container.innerHTML =

    cart.map((item, index) => {


      const liveProduct = products.find(
        p => Number(p.id) === Number(item.id)
      );

      const itemPrice = Number(
        item.price || liveProduct?.price || 0
      );

      const itemMrp = Number(
        item.mrp || liveProduct?.mrp || item.price || 0
      );

      const itemDiscount = Number(
        item.discount || liveProduct?.discount || 0
      );

      const itemQuantity = Number(item.quantity || 0);

      const itemTotal = itemPrice * itemQuantity;

      const itemSavings = Math.max(0, itemMrp - itemPrice) * itemQuantity;

      const itemImage = item.image || liveProduct?.image || "nini-logo.jpeg";


      return `


        <div class="cart-line" style="display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center">

          <img
            src="${escapeHTML(itemImage)}"
            alt="${escapeHTML(item.name)}"
            onerror="this.src='nini-logo.jpeg'"
            style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #eee"
          >

          <div>

            <strong>${escapeHTML(item.name)}</strong>

            <div style="color:#68748b;margin-top:5px">Size: ${escapeHTML(item.size)}</div>

            <div style="margin-top:5px;font-weight:700">
              ₹${itemPrice.toLocaleString("en-IN")}
              ${itemMrp > itemPrice ? `
                <del style="color:#68748b;font-size:13px;font-weight:500;margin-left:6px">₹${itemMrp.toLocaleString("en-IN")}</del>
                <span style="color:#16a34a;font-size:12px;font-weight:700;margin-left:6px">${itemDiscount}% OFF</span>
              ` : ""}
            </div>

            ${itemSavings > 0 ? `<div style="color:#16a34a;font-size:12px;margin-top:3px">You save ₹${itemSavings.toLocaleString("en-IN")}</div>` : ""}

          </div>

          <div style="text-align:right">
            <strong>₹${itemTotal.toLocaleString("en-IN")}</strong>

            <div

            style="display:flex;gap:8px;align-items:center"

          >


            <button

              onclick="changeCartQuantity(${index}, -1)"

              style="border:1px solid #ddd;background:#fff;color:#111;padding:5px 10px;border-radius:4px"

            >

              −

            </button>


            <span>

              ${item.quantity}

            </span>


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

      Number(item.price || 0) *

      Number(item.quantity || 0),

    0

  );


  const savings = cart.reduce(

    (sum, item) =>

      sum +

      Math.max(0, Number(item.mrp || item.price || 0) - Number(item.price || 0)) *

      Number(item.quantity || 0),

    0

  );


  if (totalElement) {

    totalElement.textContent =

      total.toLocaleString("en-IN");

  }

  const summary = totalElement ? totalElement.closest(".cart-summary") : null;

  if (summary) {
    let savingsElement = summary.querySelector(".cart-savings");
    if (!savingsElement) {
      savingsElement = document.createElement("div");
      savingsElement.className = "cart-savings";
      savingsElement.style.cssText = "color:#16a34a;font-size:13px;font-weight:700;margin-top:6px";
      summary.appendChild(savingsElement);
    }
    savingsElement.textContent = savings > 0 ? `You save ₹${savings.toLocaleString("en-IN")}` : "";
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


/* ---------- CHECKOUT ---------- */

function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  ensureCheckoutModal();
  renderCheckout();
  const modal = document.getElementById("checkoutModal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (!modal) return;
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function ensureCheckoutModal() {
  if (document.getElementById("checkoutModal")) return;
  const modal = document.createElement("div");
  modal.id = "checkoutModal";
  modal.className = "cart-modal";
  modal.onclick = function(event) {
    if (event.target === modal) closeCheckout();
  };
  modal.innerHTML = `
    <div class="cart-panel" style="max-width:520px;max-height:90vh;overflow:auto">
      <div class="cart-header">
        <div><span class="section-kicker">CHECKOUT</span><h2>Delivery Details</h2></div>
        <button class="close-cart" type="button" onclick="closeCheckout()">×</button>
      </div>
      <form id="checkoutForm" onsubmit="submitCheckout(event)" style="display:grid;gap:12px">
        <label>Full Name *
          <input id="checkoutName" required type="text" autocomplete="name" placeholder="Enter your full name">
        </label>
        <label>Mobile Number *
          <input id="checkoutMobile" required type="tel" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" autocomplete="tel" placeholder="10-digit mobile number">
        </label>
        <label>Full Address *
          <textarea id="checkoutAddress" required rows="3" autocomplete="street-address" placeholder="House no., street, locality"></textarea>
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label>City *
            <input id="checkoutCity" required type="text" autocomplete="address-level2" placeholder="City">
          </label>
          <label>State *
            <input id="checkoutState" required type="text" autocomplete="address-level1" placeholder="State">
          </label>
        </div>
        <label>PIN Code *
          <input id="checkoutPin" required type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="postal-code" placeholder="6-digit PIN code">
        </label>
        <div style="background:#f7f8fa;border-radius:10px;padding:14px">
          <strong>Order Summary</strong>
          <div id="checkoutSummary" style="margin-top:10px"></div>
        </div>
        <button type="submit" class="market-btn primary">Confirm Order →</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
}

function renderCheckout() {
  const summary = document.getElementById("checkoutSummary");
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  if (summary) {
    summary.innerHTML = cart.map(item => `
      <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px">
        <span>${escapeHTML(item.name)} × ${item.quantity}<small style="display:block;color:#68748b">Size: ${escapeHTML(item.size)}</small></span>
        <strong>₹${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</strong>
      </div>
    `).join("") + `<hr><div style="display:flex;justify-content:space-between;font-size:18px"><strong>Total</strong><strong>₹${total.toLocaleString("en-IN")}</strong></div>`;
  }
}

function submitCheckout(event) {
  event.preventDefault();
  const form = document.getElementById("checkoutForm");
  if (!form || !form.reportValidity()) return;
  const mobile = document.getElementById("checkoutMobile").value.trim();
  const pin = document.getElementById("checkoutPin").value.trim();
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!/^\d{6}$/.test(pin)) {
    alert("Please enter a valid 6-digit PIN code.");
    return;
  }
  alert("Your details are valid. Backend order submission will be connected in the next step.");
}

/* ---------- PLACE ORDER (legacy entry point) ---------- */

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

document.addEventListener(

  "keydown",

  function (event) {


    if (event.key === "Escape") {

      closeCart();

    }

  }

);
