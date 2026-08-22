const API_URL =
  "https://nini-api.msninigarments7368.workers.dev";

let products = [];
let cart = [];


// =========================================================
// LOAD PRODUCTS FROM CLOUDFLARE D1
// =========================================================

async function loadProducts() {
  try {
    const response = await fetch(
      `${API_URL}/api/products`
    );

    if (!response.ok) {
      throw new Error("Failed to load products");
    }

    products = await response.json();

    renderProducts();

    updateCartCount();

  } catch (error) {

    console.error("Product API error:", error);

    const el =
      document.getElementById("products");

    if (el) {
      el.innerHTML = `
        <p>
          Unable to load products.
          Please try again.
        </p>
      `;
    }
  }
}


// =========================================================
// MONEY FORMAT
// =========================================================

function money(value) {
  return Number(value || 0).toLocaleString("en-IN");
}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts(list = products) {

  const el =
    document.getElementById("products");

  if (!el) return;


  if (!list.length) {

    el.innerHTML =
      "<p>No products available.</p>";

    return;
  }


  el.innerHTML = list.map((p, i) => {

    const sizes =
      Array.isArray(p.sizes)
        ? p.sizes
        : [];


    const availableSizes =
      sizes.filter(
        s => Number(s.stock || 0) > 0
      );


    return `
      <article class="product">

        <img
          src="${p.image || "assets/nini-logo.png"}"
          alt="${p.name || "Nini Garments"}"
        >

        <div class="product-info">

          <h3>
            ${p.name || ""}
          </h3>

          <div class="price">
            ₹${money(p.price)}
          </div>

          <div class="stock">

            ${
              availableSizes.length
                ? "Available"
                : "Out of Stock"
            }

          </div>


          ${
            availableSizes.length
              ? `
                <select id="size${i}">

                  ${availableSizes
                    .map(size => `
                      <option value="${size.size}">
                        ${size.size}
                      </option>
                    `)
                    .join("")}

                </select>


                <button
                  onclick="
                    addCart(
                      ${i},
                      document.getElementById('size${i}').value
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


// =========================================================
// CATEGORY FILTER
// =========================================================

function filterCat(category) {

  const filtered =
    products.filter(
      p =>
        p.category === category ||
        p.cat === category
    );

  renderProducts(filtered);


  const shop =
    document.getElementById("shop");

  if (shop) {

    shop.scrollIntoView({
      behavior: "smooth"
    });

  }
}


// =========================================================
// ADD TO CART
// =========================================================

function addCart(productIndex, size) {

  const product =
    products[productIndex];

  if (!product) return
