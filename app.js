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


      const itemTotal =

        Number(item.price) *

        Number(item.quantity);


      return `


        <div class="cart-line">


          <div>


            <strong>

              ${escapeHTML(item.name)}

            </strong>


            <div

              style="color:#68748b;margin-top:5px"

            >

              Size:

              ${escapeHTML(item.size)}

            </div>


            <div

              style="margin-top:5px"

            >

              ₹${Number(item.price)

                .toLocaleString("en-IN")}

              × ${item.quantity}

            </div>


          </div>


          <strong>

            ₹${itemTotal

              .toLocaleString("en-IN")}

          </strong>


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

document.addEventListener(

  "keydown",

  function (event) {


    if (event.key === "Escape") {

      closeCart();

    }

  }

);
