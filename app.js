const API_URL = "https://nini-api.msninigarments7368.workers.dev";

let products = [];
let cart = [];


// =========================
// LOAD PRODUCTS FROM D1 API
// =========================

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);

    if (!response.ok) {
      throw new Error("Products load nahi ho rahe");
    }

    const data = await response.json();

    products = data.products || [];

    renderProducts(products);
    updateCartCount();

  } catch (error) {
    console.error(error);

    const el = document.getElementById("products");

    if (el) {
      el.innerHTML = `
        <p>Products load nahi ho rahe. Please refresh.</p>
      `;
    }
  }
}


// =========================
// MONEY
// =========================

function money(value) {
  return Number(value || 0).toLocaleString("en-IN");
}


// =========================
// RENDER PRODUCTS
// =========================

function renderProducts(list = products) {

  const el = document.getElementById("products");

  if (!el) return;

  if (!list.length) {
    el.innerHTML = "<p>No products available.</p>";
    return;
  }

  el.innerHTML = list.map((product, index) => {

    const sizes = Array.isArray(product.sizes)
      ? product.sizes
      : [];

    const availableSizes = sizes.filter(
      item => Number(item.stock || 0) > 0
    );

    const totalStock = sizes.reduce(
      (total, item) =>
        total + Number(item.stock || 0),
      0
    );

    return `
      <article class="product">

        <img
          src="${product.image || "assets/nini-logo.png"}"
          alt="${product.name || "Nini Garments"}"
        >

        <div class="product-info">

          <h3>${product.name || ""}</h3>

          <div class="price">
            ₹${money(product.price)}
          </div>

          <div class="stock">
            ${
              totalStock > 0
                ? `${totalStock} pcs available`
                : "Out of Stock"
            }
          </div>

          ${
            availableSizes.length
              ? `
                <select id="size-${index}">
                  ${availableSizes.map(item => `
                    <option value="${item.size}">
                      ${item.size}
                    </option>
                  `).join("")}
                </select>

                <button
                  onclick="
                    addCart(
                      ${index},
                      document.getElementById('size-${index}').value
                    )
                  "
                >
                  ADD TO CART
                </button>
              `
              : `
                <button disabled>
                  OUT OF STOCK
                </button>
              `
          }

        </div>

      </article>
    `;
  }).join("");
}


// =========================
// CATEGORY FILTER
// =========================

function filterCat(category) {

  const filtered = products.filter(product =>
    product.category === category ||
    product.cat === category
  );

  renderProducts(filtered);

  const shop = document.getElementById("shop");

  if (shop) {
    shop.scrollIntoView({
      behavior: "smooth"
    });
  }
}


// =========================
// CART
// =========================

function addCart(index, size) {

  const product = products[index];

  if (!product) return;

  const sizeData = (product.sizes || []).find(
    item => item.size === size
  );

  if (!sizeData || Number(sizeData.stock) <= 0) {
    alert("This size is out of stock.");
    return;
  }

  const existing = cart.find(
    item =>
      item.product_id === product.id &&
      item.size === size
  );

  if (existing) {

    if (
      existing.quantity >=
      Number(sizeData.stock)
    ) {
      alert("Maximum available stock reached.");
      return;
    }

    existing.quantity++;

  } else {

    cart.push({
      product_id: product.id,
      name: product.name,
      size: size,
      price: Number(product.price || 0),
      quantity: 1
    });

  }

  updateCartCount();

  alert("Added to cart!");
}


// =========================
// CART COUNT
// =========================

function updateCartCount() {

  const count =
    document.getElementById("cartCount");

  if (!count) return;

  count.textContent =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
}


// =========================
// OPEN CART
// =========================

function openCart() {

  const modal =
    document.getElementById("cartModal");

  if (!modal) return;

  modal.style.display = "flex";

  const el =
    document.getElementById("cartItems");

  if (!el) return;

  if (!cart.length) {

    el.innerHTML =
      "Your cart is empty.";

    const total =
      document.getElementById("cartTotal");

    if (total) {
      total.textContent = "0";
    }

    return;
  }

  el.innerHTML =
    cart.map((item, index) => `
      <div class="cart-line">

        <span>
          ${item.name}
          (${item.size})
          × ${item.quantity}
        </span>

        <b>
          ₹${money(
            item.price * item.quantity
          )}
        </b>

        <button
          onclick="removeCart(${index})"
        >
          Remove
        </button>

      </div>
    `).join("");

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );

  const totalElement =
    document.getElementById("cartTotal");

  if (totalElement) {
    totalElement.textContent =
      money(total);
  }
}


// =========================
// REMOVE CART
// =========================

function removeCart(index) {

  cart.splice(index, 1);

  updateCartCount();

  openCart();
}


// =========================
// CLOSE CART
// =========================

function closeCart() {

  const modal =
    document.getElementById("cartModal");

  if (modal) {
    modal.style.display = "none";
  }
}


// =========================
// CUSTOMER LOGIN
// =========================

async function loginUser(email, password) {

  const response =
    await fetch(`${API_URL}/api/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        password
      })
    });

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Login failed"
    );
  }

  localStorage.setItem(
    "niniUser",
    JSON.stringify(data.user)
  );

  return data.user;
}


// =========================
// CUSTOMER REGISTER
// =========================

async function registerUser(
  name,
  email,
  password
) {

  const response =
    await fetch(`${API_URL}/api/register`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name,
        email,
        password
      })
    });

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Registration failed"
    );
  }

  return data;
}


// =========================
// LOGOUT
// =========================

function logoutUser() {

  localStorage.removeItem("niniUser");

  location.reload();
}


// =========================
// PLACE ORDER
// =========================

async function placeOrder() {

  if (!cart.length) {
    alert("Cart is empty.");
    return;
  }

  const user =
    JSON.parse(
      localStorage.getItem("niniUser") || "null"
    );

  if (!user || !user.id) {

    alert(
      "Please login before placing an order."
    );

    return;
  }

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price * item.quantity,
      0
    );

  try {

    const response =
      await fetch(`${API_URL}/api/orders`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          user_id: user.id,

          total_amount: total,

          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            size: item.size,
            price: item.price
          }))

        })
      });

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Order failed"
      );
    }

    alert(
      `Order placed successfully!\nOrder ID: ${data.order_id}`
    );

    cart = [];

    updateCartCount();

    closeCart();

    await loadProducts();

  } catch (error) {

    console.error(error);

    alert(error.message);

  }
}


// =========================
// START
// =========================

loadProducts();
