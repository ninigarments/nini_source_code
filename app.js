/* =========================================================
   NINI GARMENTS — FRONTEND SHOPPING SYSTEM
   LIVE D1 / API PRODUCT VERSION
   ========================================================= */

const API_URL = "https://nini-api.msninigarments7368.workers.dev";

let products = [];


/* ---------- CART ---------- */

let cart = JSON.parse(localStorage.getItem("niniCart")) || [];


/* ---------- WISHLIST ---------- */

let wishlist = JSON.parse(localStorage.getItem("niniWishlist")) || [];

function saveWishlist() {
  localStorage.setItem("niniWishlist", JSON.stringify(wishlist));
}

function isWishlisted(productId) {
  return wishlist.some(id => Number(id) === Number(productId));
}

function updateWishlistCount() {
  const countElement = document.getElementById("wishlistCount");
  if (countElement) countElement.textContent = wishlist.length;
}

function toggleWishlist(productId) {
  const id = Number(productId);
  if (!Number.isFinite(id)) return;

  if (isWishlisted(id)) {
    wishlist = wishlist.filter(item => Number(item) !== id);
  } else {
    wishlist.push(id);
  }

  saveWishlist();
  updateWishlistCount();
  updateWishlistButtons(id);

  if (document.getElementById("wishlistModal")?.style.display === "flex") {
    renderWishlist();
  }
}

function updateWishlistButtons(productId) {
  document.querySelectorAll(`[data-wishlist-id="${productId}"]`).forEach(button => {
    const active = isWishlisted(productId);

    button.textContent = active ? "♥" : "♡";
    button.setAttribute(
      "aria-label",
      active ? "Remove from wishlist" : "Add to wishlist"
    );
    button.title = active ? "Remove from wishlist" : "Add to wishlist";
    button.style.color = active ? "#e11d48" : "#475569";
  });
}

function ensureWishlistUI() {
  const desktopActions = document.querySelector(".desktop-actions");

  if (
    desktopActions &&
    !document.getElementById("wishlistHeaderAction")
  ) {
    const button = document.createElement("button");

    button.id = "wishlistHeaderAction";
    button.className = "header-action";
    button.type = "button";
    button.onclick = openWishlist;

    button.innerHTML = `
      <span style="position:relative">
        ♡
        <b
          id="wishlistCount"
          style="
            position:absolute;
            top:-9px;
            right:-14px;
            min-width:16px;
            height:16px;
            padding:0 3px;
            border-radius:999px;
            background:#e11d48;
            color:#fff;
            font-size:10px;
            line-height:16px;
            text-align:center
          "
        >${wishlist.length}</b>
      </span>
      <small>Wishlist</small>
    `;

    const cartAction =
      desktopActions.querySelector(".cart-action");

    desktopActions.insertBefore(
      button,
      cartAction || null
    );
  }

  const mobileNav =
    document.getElementById("mobileNav");

  if (
    mobileNav &&
    !mobileNav.querySelector("[data-nini-wishlist-link]")
  ) {
    const link = document.createElement("a");

    link.href = "#wishlist";
    link.textContent = "Wishlist ♡";
    link.setAttribute(
      "data-nini-wishlist-link",
      "1"
    );

    link.onclick = function(event) {
      event.preventDefault();
      openWishlist();
    };

    mobileNav.appendChild(link);
  }

  ensureWishlistModal();
}

function ensureWishlistModal() {
  if (document.getElementById("wishlistModal")) return;

  const modal = document.createElement("div");

  modal.id = "wishlistModal";
  modal.className = "cart-modal";

  modal.onclick = function(event) {
    if (event.target === modal) {
      closeWishlist();
    }
  };

  modal.innerHTML = `
    <div
      class="cart-panel"
      style="
        width:min(720px,calc(100vw - 32px));
        max-width:720px;
        max-height:90vh;
        overflow:auto
      "
    >
      <div class="cart-header">
        <div>
          <span class="section-kicker">
            SAVED FOR LATER
          </span>

          <h2>
            My Wishlist
            <span
              id="wishlistModalCount"
              style="
                font-size:14px;
                color:#68748b;
                font-weight:600
              "
            ></span>
          </h2>
        </div>

        <button
          class="close-cart"
          type="button"
          onclick="closeWishlist()"
        >
          ×
        </button>
      </div>

      <div id="wishlistItems"></div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openWishlist() {
  ensureWishlistUI();
  renderWishlist();

  const modal =
    document.getElementById("wishlistModal");

  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeWishlist() {
  const modal =
    document.getElementById("wishlistModal");

  if (!modal) return;

  modal.style.display = "none";
  document.body.style.overflow = "";
}

function renderWishlist() {
  ensureWishlistModal();

  const container =
    document.getElementById("wishlistItems");

  const count =
    document.getElementById("wishlistModalCount");

  if (!container) return;

  const items = wishlist
    .map(id =>
      products.find(
        product =>
          Number(product.id) === Number(id)
      )
    )
    .filter(Boolean);

  if (count) {
    count.textContent = `(${items.length})`;
  }

  if (!items.length) {
    container.innerHTML = `
      <div
        class="loading-state"
        style="
          text-align:center;
          padding:35px 15px
        "
      >
        <div
          style="
            font-size:42px;
            margin-bottom:10px
          "
        >
          ♡
        </div>

        <strong>
          Your wishlist is empty.
        </strong>

        <br><br>

        Save products you love and find them here later.
      </div>
    `;

    return;
  }

  container.innerHTML = items.map(product => {
    const image =
      product.image || "nini-logo.jpeg";

    const price =
      getLowestSellingPrice(product);

    const mrps =
      Array.isArray(product.sizes)
        ? product.sizes
            .filter(
              s =>
                Number(s.stock || 0) > 0 &&
                Number(s.mrp || 0) > 0
            )
            .map(s => Number(s.mrp))
        : [];

    const mrp =
      mrps.length
        ? Math.min(...mrps)
        : Number(product.mrp || 0);

    const sizes =
      Array.isArray(product.sizes)
        ? product.sizes.filter(
            s => Number(s.stock || 0) > 0
          )
        : [];

    return `
      <div
        style="
          display:grid;
          grid-template-columns:90px 1fr auto;
          gap:14px;
          align-items:center;
          padding:14px 0;
          border-bottom:1px solid #edf0f5
        "
      >
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
          onerror="this.src='nini-logo.jpeg'"
          style="
            width:90px;
            height:90px;
            object-fit:cover;
            border-radius:9px;
            background:#f7f8fb
          "
        >

        <div>
          <strong style="font-size:16px">
            ${escapeHTML(product.name)}
          </strong>

          <div
            style="
              margin-top:6px;
              font-weight:800
            "
          >
            From ₹${price.toLocaleString("en-IN")}

            ${
              mrp > price
                ? `
                  <del
                    style="
                      font-size:12px;
                      color:#68748b;
                      font-weight:500;
                      margin-left:5px
                    "
                  >
                    ₹${mrp.toLocaleString("en-IN")}
                  </del>
                `
                : ""
            }
          </div>

          <div
            style="
              margin-top:5px;
              color:#68748b;
              font-size:13px
            "
          >
            ${
              sizes.length
                ? `${sizes.length} size${sizes.length > 1 ? "s" : ""} available`
                : "Out of stock"
            }
          </div>
        </div>

        <div
          style="
            display:flex;
            flex-direction:column;
            gap:7px;
            align-items:flex-end
          "
        >
          <button
            type="button"
            class="market-btn primary"
            style="
              padding:9px 12px;
              white-space:nowrap
            "
            onclick="
              openProductDetail(${Number(product.id)});
              closeWishlist()
            "
          >
            View Product
          </button>

          <button
            type="button"
            style="
              border:0;
              background:none;
              color:#e11d48;
              font-weight:700;
              cursor:pointer
            "
            onclick="toggleWishlist(${Number(product.id)})"
          >
            Remove ♥
          </button>
        </div>
      </div>
    `;
  }).join("");
}


/* ---------- INITIAL LOAD ---------- */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    await loadProducts();

    updateCartCount();
    ensureWishlistUI();
    updateWishlistCount();

  }
);


async function loadProducts() {

  const container =
    document.getElementById("products");

  if (container) {
    container.innerHTML = `
      <div class="loading-state">
        Loading Nini Garments products...
      </div>
    `;
  }

  try {

    const response =
      await fetch(
        `${API_URL}/api/products`,
        {
          method: "GET"
        }
      );

    if (!response.ok) {
      throw new Error(
        "Product API request failed"
      );
    }

    const data =
      await response.json();

    products =
      Array.isArray(data.products)
        ? data.products
        : [];

    repairStoredCartPrices();

    renderProducts(products);

  } catch (error) {

    console.error(
      "Nini product loading error:",
      error
    );

    if (container) {
      container.innerHTML = `
        <div class="loading-state">

          <strong>
            Unable to load products.
          </strong>

          <br>

          Please refresh the page and try again.

        </div>
      `;
    }
  }
}


/* ---------- PRODUCT RENDER ---------- */

function renderProducts(list) {

  const container =
    document.getElementById("products");

  if (!container) return;

  if (!list || list.length === 0) {

    container.innerHTML = `
      <div class="loading-state">

        <strong>
          No products found.
        </strong>

        <br>

        Try another search or category.

      </div>
    `;

    return;
  }

  container.innerHTML =
    list.map(product => {

      const sizes =
        Array.isArray(product.sizes)
          ? product.sizes.filter(
              size =>
                Number(size.stock) > 0
            )
          : [];

      const image =
        product.image ||
        "nini-logo.jpeg";

      const sizeOptions =
        sizes.length

          ? sizes.map(size => `
              <option
                value="${escapeHTML(size.size)}"
              >
                ${escapeHTML(size.size)}
              </option>
            `).join("")

          : `
              <option value="">
                Out of stock
              </option>
            `;

      const totalStock =
        sizes.reduce(
          (sum, size) =>
            sum +
            Number(size.stock || 0),
          0
        );

      return `
        <article
          class="product"
          style="position:relative"
        >

          <button
            type="button"
            data-wishlist-id="${product.id}"
            onclick="toggleWishlist(${product.id})"
            aria-label="${
              isWishlisted(product.id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }"
            title="${
              isWishlisted(product.id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }"
            style="
              position:absolute;
              top:10px;
              right:10px;
              z-index:2;
              width:38px;
              height:38px;
              border:0;
              border-radius:50%;
              background:rgba(255,255,255,.95);
              box-shadow:0 2px 8px rgba(0,0,0,.12);
              font-size:25px;
              line-height:38px;
              cursor:pointer;
              color:${
                isWishlisted(product.id)
                  ? "#e11d48"
                  : "#475569"
              }
            "
          >
            ${
              isWishlisted(product.id)
                ? "♥"
                : "♡"
            }
          </button>

          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.name)}"
            onerror="this.src='nini-logo.jpeg'"
          >

          <div class="product-info">

            <h3>
              ${escapeHTML(product.name)}
            </h3>

            <div
              class="price"
              id="price-${product.id}"
            >
              ${
                getLowestSellingPrice(product) > 0
                  ? `From ₹${getLowestSellingPrice(product).toLocaleString("en-IN")}`
                  : "Select size for price"
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
              onchange="updateSizePrice(${product.id})"
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


/* ---------- SHOP FILTER STATE ---------- */

const marketFilters = {
  search: "",
  category: "",
  age: "",
  price: "",
  sort: ""
};

function normalizeMarketText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function getProductAge(product) {
  return String(
    product?.age_group ||
    product?.age ||
    ""
  ).trim();
}

function getProductFilterPrice(product) {
  return getLowestSellingPrice(product);
}

function matchesAgeFilter(
  product,
  selectedAge
) {

  if (!selectedAge) return true;

  const age =
    normalizeMarketText(
      getProductAge(product)
    );

  const selected =
    normalizeMarketText(
      selectedAge
    );

  if (!age) return false;

  if (age === selected) return true;

  return (
    age.includes(selected) ||
    selected.includes(age)
  );
}

function matchesPriceFilter(
  product,
  selectedPrice
) {

  if (!selectedPrice) return true;

  const price =
    Number(
      getProductFilterPrice(product) || 0
    );

  const value =
    normalizeMarketText(
      selectedPrice
    );

  if (
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return false;
  }

  if (
    value === "under299" ||
    value === "under-299" ||
    value === "0-299" ||
    value === "299"
  ) {
    return price < 299;
  }

  if (
    value === "under499" ||
    value === "under-499" ||
    value === "299-499" ||
    value === "499"
  ) {
    return price < 499;
  }

  if (
    value === "under999" ||
    value === "under-999" ||
    value === "499-999" ||
    value === "999"
  ) {
    return price < 999;
  }

  if (
    value === "999plus" ||
    value === "999-plus" ||
    value === "999+" ||
    value === "999 & above" ||
    value === "999-and-above" ||
    value === "above999"
  ) {
    return price >= 999;
  }

  const numeric =
    Number(
      String(selectedPrice)
        .replace(/[^0-9.]/g, "")
    );

  if (
    Number.isFinite(numeric) &&
    numeric > 0
  ) {
    return price < numeric;
  }

  return true;
}

function getMarketFilteredProducts() {

  const search =
    normalizeMarketText(
      marketFilters.search
    );

  const category =
    normalizeMarketText(
      marketFilters.category
    );

  const age =
    marketFilters.age;

  const price =
    marketFilters.price;

  let list =
    products.filter(product => {

      const name =
        normalizeMarketText(
          product?.name
        );

      const productCategory =
        normalizeMarketText(
          product?.category ||
          product?.cat
        );

      const productAge =
        normalizeMarketText(
          getProductAge(product)
        );

      const tags =
        normalizeMarketText(
          product?.tags
        );

      const sku =
        normalizeMarketText(
          product?.sku
        );

      const searchMatch =
        !search ||
        name.includes(search) ||
        productCategory.includes(search) ||
        productAge.includes(search) ||
        tags.includes(search) ||
        sku.includes(search);

      let categoryMatch = true;

      if (category) {

        categoryMatch =
          category === "clothing"
            ? productCategory === "clothing"
            : productCategory === category;

      }

      return (
        searchMatch &&
        categoryMatch &&
        matchesAgeFilter(
          product,
          age
        ) &&
        matchesPriceFilter(
          product,
          price
        )
      );

    });

  switch (marketFilters.sort) {

    case "low":

      list.sort(
        (a, b) =>
          getLowestSellingPrice(a) -
          getLowestSellingPrice(b)
      );

      break;

    case "high":

      list.sort(
        (a, b) =>
          getLowestSellingPrice(b) -
          getLowestSellingPrice(a)
      );

      break;

    case "name":

      list.sort(
        (a, b) =>
          String(a?.name || "")
            .localeCompare(
              String(b?.name || "")
            )
      );

      break;
  }

  return list;
}

function updateMarketResultsLabel(list) {

  const label =
    document.getElementById(
      "resultLabel"
    );

  if (!label) return;

  const parts = [];

  if (marketFilters.search) {
    parts.push(
      `Search: "${marketFilters.search}"`
    );
  }

  if (marketFilters.category) {
    parts.push(
      marketFilters.category
    );
  }

  if (marketFilters.age) {
    parts.push(
      marketFilters.age
    );
  }

  if (marketFilters.price) {

    const priceLabels = {

      under299: "Under ₹299",
      "under-299": "Under ₹299",
      "0-299": "Under ₹299",

      under499: "Under ₹499",
      "under-499": "Under ₹499",
      "299-499": "Under ₹499",

      under999: "Under ₹999",
      "under-999": "Under ₹999",
      "499-999": "Under ₹999",

      "999plus": "₹999 & Above",
      "999-plus": "₹999 & Above",
      "999+": "₹999 & Above",
      "999 & above": "₹999 & Above",
      "999-and-above": "₹999 & Above",
      above999: "₹999 & Above"

    };

    parts.push(
      priceLabels[
        normalizeMarketText(
          marketFilters.price
        )
      ] ||
      marketFilters.price
    );
  }

  label.textContent =
    parts.length
      ? `${list.length} result${list.length !== 1 ? "s" : ""} • ${parts.join(" • ")}`
      : "All products";
}

function applyMarketFilters(
  shouldScroll = false
) {

  const filtered =
    getMarketFilteredProducts();

  renderProducts(filtered);

  updateMarketResultsLabel(
    filtered
  );

  if (shouldScroll) {

    const shop =
      document.getElementById(
        "shop"
      );

    if (shop) {

      shop.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }
  }

  return filtered;
}


/* ---------- SEARCH ---------- */

function marketSearchProducts(query) {

  marketFilters.search =
    String(query || "").trim();

  return applyMarketFilters(true);
}


/* ---------- CATEGORY FILTER ---------- */

function filterCat(category) {

  marketFilters.category =
    String(category || "").trim();

  return applyMarketFilters(true);
}


/* ---------- AGE FILTER ---------- */

function filterAge(age) {

  marketFilters.age =
    String(age || "").trim();

  return applyMarketFilters(true);
}


/* ---------- PRICE FILTER ---------- */

function filterPrice(price) {

  marketFilters.price =
    String(price || "").trim();

  return applyMarketFilters(true);
}


/* ---------- CLEAR FILTERS ---------- */

function clearMarketFilters() {

  marketFilters.search = "";
  marketFilters.category = "";
  marketFilters.age = "";
  marketFilters.price = "";
  marketFilters.sort = "";

  [
    "ageFilter",
    "priceFilter",
    "marketAgeFilter",
    "marketPriceFilter"
  ].forEach(id => {

    const el =
      document.getElementById(id);

    if (el) {
      el.value = "";
    }

  });

  const searchInput =
    document.getElementById(
      "marketSearch"
    );

  if (searchInput) {
    searchInput.value = "";
  }

  const sortSelect =
    document.getElementById(
      "marketSort"
    );

  if (sortSelect) {
    sortSelect.value = "";
  }

  return applyMarketFilters(true);
}


/* ---------- SIZE-WISE PRICING HELPERS ---------- */

function getSizeSellingPrice(
  product,
  size
) {
  if (!product) return 0;

  const selectedSize =
    Array.isArray(product.sizes)
      ? product.sizes.find(
          s => String(s.size) === String(size)
        )
      : null;

  const sizePrice = Number(selectedSize?.price || 0);
  if (sizePrice > 0) return sizePrice;

  const productPrice = Number(product?.price || 0);
  return productPrice > 0 ? productPrice : 0;
}

function getSizeMRP(
  product,
  size
) {

  if (!product) return 0;

  const selectedSize =
    Array.isArray(product.sizes)
      ? product.sizes.find(
          s =>
            String(s.size) ===
            String(size)
        )
      : null;

  const price =
    getSizeSellingPrice(
      product,
      size
    );

  return Number(
    selectedSize?.mrp ??
    product.mrp ??
    price
  );
}

function getSizeDiscount(
  product,
  size
) {

  const price =
    getSizeSellingPrice(
      product,
      size
    );

  const mrp =
    getSizeMRP(
      product,
      size
    );

  if (
    mrp <= 0 ||
    price >= mrp
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(
      ((mrp - price) / mrp) * 100
    )
  );
}

function getLowestSellingPrice(product) {

  const prices =
    Array.isArray(product?.sizes)

      ? product.sizes
          .filter(
            s =>
              Number(s.stock || 0) > 0
          )
          .map(
            s =>
              Number(s.price || 0)
          )
          .filter(
            p => p > 0
          )

      : [];

  return prices.length
    ? Math.min(...prices)
    : Number(
        product?.price || 0
      );
}


/* ---------- SORT ---------- */

function sortMarketProducts(type) {

  marketFilters.sort =
    String(type || "")
      .trim()
      .toLowerCase();

  return applyMarketFilters(false);
}


/* ---------- SIZE-WISE PRICE ---------- */

function updateSizePrice(productId) {

  const product =
    products.find(
      p =>
        Number(p.id) ===
        Number(productId)
    );

  const priceElement =
    document.getElementById(
      `price-${productId}`
    );

  if (
    !product ||
    !priceElement
  ) {
    return;
  }

  const sizeElement =
    document.getElementById(
      `size-${productId}`
    );

  const selectedSizeValue =
    sizeElement
      ? sizeElement.value
      : "";

  if (!selectedSizeValue) {

    const startingPrice =
      getLowestSellingPrice(
        product
      );

    priceElement.textContent =
      startingPrice > 0
        ? `From ₹${startingPrice.toLocaleString("en-IN")}`
        : "Select size for price";

    return;
  }

  const selectedSize =
    Array.isArray(product.sizes)
      ? product.sizes.find(
          s =>
            String(s.size) ===
            String(selectedSizeValue)
        )
      : null;

  if (!selectedSize) {

    priceElement.textContent =
      "Price unavailable";

    return;
  }

  const price =
    getSizeSellingPrice(
      product,
      selectedSizeValue
    );

  const mrp =
    getSizeMRP(
      product,
      selectedSizeValue
    );

  const discount =
    getSizeDiscount(
      product,
      selectedSizeValue
    );

  priceElement.innerHTML = `
    ₹${price.toLocaleString("en-IN")}

    ${
      mrp > price
        ? `
          <del
            style="
              margin-left:8px;
              color:#68748b;
              font-size:0.9em;
            "
          >
            ₹${mrp.toLocaleString("en-IN")}
          </del>

          <span
            style="
              margin-left:8px;
              font-size:0.85em;
            "
          >
            ${discount}% OFF
          </span>
        `
        : ""
    }
  `;
}


/* ---------- ADD TO CART ---------- */

function addToCart(productId) {

  const product =
    products.find(
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

    alert(
      "Please select a size first."
    );

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

    alert(
      "This size is out of stock."
    );

    return;
  }

  const existing =
    cart.find(
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

      alert(
        "No more stock available for this size."
      );

      return;
    }

    existing.quantity += 1;

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      category:
        product.category,

      price:
        getSizeSellingPrice(
          product,
          size
        ),

      mrp:
        getSizeMRP(
          product,
          size
        ),

      discount:
        getSizeDiscount(
          product,
          size
        ),

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

  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

  countElement.textContent =
    total;
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



/* ---------- LIVE CART PRICE HELPERS ---------- */

function getLiveCartPrice(item) {
  const liveProduct = products.find(
    p => Number(p.id) === Number(item.id)
  );

  const liveSize = Array.isArray(liveProduct?.sizes)
    ? liveProduct.sizes.find(
        s => String(s.size) === String(item.size)
      )
    : null;

  const sizePrice = Number(liveSize?.price || 0);
  if (sizePrice > 0) return sizePrice;

  const productPrice = Number(liveProduct?.price || 0);
  if (productPrice > 0) return productPrice;

  const savedPrice = Number(item?.price || 0);
  return savedPrice > 0 ? savedPrice : 0;
}

function getLiveCartMRP(item) {
  const liveProduct = products.find(
    p => Number(p.id) === Number(item.id)
  );

  const liveSize = Array.isArray(liveProduct?.sizes)
    ? liveProduct.sizes.find(
        s => String(s.size) === String(item.size)
      )
    : null;

  const sizeMrp = Number(liveSize?.mrp || 0);
  if (sizeMrp > 0) return sizeMrp;

  const productMrp = Number(liveProduct?.mrp || 0);
  if (productMrp > 0) return productMrp;

  const savedMrp = Number(item?.mrp || 0);
  if (savedMrp > 0) return savedMrp;

  return getLiveCartPrice(item);
}

function repairStoredCartPrices() {
  let changed = false;

  cart = cart.map(item => {
    const price = getLiveCartPrice(item);
    const mrp = getLiveCartMRP(item);

    if (
      Number(item?.price || 0) !== price ||
      Number(item?.mrp || 0) !== mrp
    ) {
      changed = true;

      return {
        ...item,
        price,
        mrp,
        discount:
          mrp > price && mrp > 0
            ? Math.round(((mrp - price) / mrp) * 100)
            : 0
      };
    }

    return item;
  });

  if (changed) saveCart();
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
    cart.map(
      (item, index) => {

        const liveProduct =
          products.find(
            p =>
              Number(p.id) ===
              Number(item.id)
          );

        const liveSize =
          Array.isArray(
            liveProduct?.sizes
          )
            ? liveProduct.sizes.find(
                s =>
                  String(s.size) ===
                  String(item.size)
              )
            : null;

        const itemPrice = getLiveCartPrice(item);

        const itemMrp = getLiveCartMRP(item);

        const itemDiscount =
          itemMrp > 0
            ? Math.max(
                0,
                Math.round(
                  (
                    (itemMrp -
                      itemPrice) /
                    itemMrp
                  ) * 100
                )
              )
            : 0;

        const itemQuantity =
          Number(
            item.quantity || 0
          );

        const itemTotal =
          itemPrice *
          itemQuantity;

        const itemSavings =
          Math.max(
            0,
            itemMrp -
              itemPrice
          ) *
          itemQuantity;

        const itemImage =
          item.image ||
          liveProduct?.image ||
          "nini-logo.jpeg";

        return `

          <div
            class="cart-line"
            style="
              display:grid;
              grid-template-columns:64px 1fr auto;
              gap:12px;
              align-items:center
            "
          >

            <img
              src="${escapeHTML(itemImage)}"
              alt="${escapeHTML(item.name)}"
              onerror="this.src='nini-logo.jpeg'"
              style="
                width:64px;
                height:64px;
                object-fit:cover;
                border-radius:8px;
                border:1px solid #eee
              "
            >

            <div>

              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <div
                style="
                  color:#68748b;
                  margin-top:5px
                "
              >
                Size:
                ${escapeHTML(item.size)}
              </div>

              <div
                style="
                  margin-top:5px;
                  font-weight:700
                "
              >

                ₹${itemPrice.toLocaleString("en-IN")}

                ${
                  itemMrp > itemPrice
                    ? `
                      <del
                        style="
                          color:#68748b;
                          font-size:13px;
                          font-weight:500;
                          margin-left:6px
                        "
                      >
                        ₹${itemMrp.toLocaleString("en-IN")}
                      </del>

                      <span
                        style="
                          color:#16a34a;
                          font-size:12px;
                          font-weight:700;
                          margin-left:6px
                        "
                      >
                        ${itemDiscount}% OFF
                      </span>
                    `
                    : ""
                }

              </div>

              ${
                itemSavings > 0
                  ? `
                    <div
                      style="
                        color:#16a34a;
                        font-size:12px;
                        margin-top:3px
                      "
                    >
                      You save
                      ₹${itemSavings.toLocaleString("en-IN")}
                    </div>
                  `
                  : ""
              }

            </div>

            <div
              style="
                text-align:right
              "
            >

              <strong>
                ₹${itemTotal.toLocaleString("en-IN")}
              </strong>

              <div
                style="
                  display:flex;
                  gap:8px;
                  align-items:center
                "
              >

                <button
                  onclick="changeCartQuantity(${index}, -1)"
                  style="
                    border:1px solid #ddd;
                    background:#fff;
                    color:#111;
                    padding:5px 10px;
                    border-radius:4px
                  "
                >
                  −
                </button>

                <span>
                  ${item.quantity}
                </span>

                <button
                  onclick="changeCartQuantity(${index}, 1)"
                  style="
                    border:1px solid #ddd;
                    background:#fff;
                    color:#111;
                    padding:5px 10px;
                    border-radius:4px
                  "
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

          </div>

        `;

      }
    ).join("");

  const total =
    cart.reduce(
      (sum, item) => {

        const liveProduct =
          products.find(
            p =>
              Number(p.id) ===
              Number(item.id)
          );

        const price =
          liveProduct
            ? getSizeSellingPrice(
                liveProduct,
                item.size
              )
            : Number(
                item.price || 0
              );

        return (
          sum +
          price *
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );

  const savings =
    cart.reduce(
      (sum, item) => {

        const liveProduct =
          products.find(
            p =>
              Number(p.id) ===
              Number(item.id)
          );

        const liveSize =
          Array.isArray(
            liveProduct?.sizes
          )
            ? liveProduct.sizes.find(
                s =>
                  String(s.size) ===
                  String(item.size)
              )
            : null;

        const price =
          Number(
            item.price ??
            liveSize?.price ??
            liveProduct?.price ??
            0
          );

        const mrp =
          Number(
            item.mrp ??
            liveSize?.mrp ??
            liveProduct?.mrp ??
            price
          );

        return (
          sum +
          Math.max(
            0,
            mrp - price
          ) *
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );

  if (totalElement) {

    totalElement.textContent =
      total.toLocaleString(
        "en-IN"
      );

  }

  const summary =
    totalElement
      ? totalElement.closest(
          ".cart-summary"
        )
      : null;

  if (summary) {

    let savingsElement =
      summary.querySelector(
        ".cart-savings"
      );

    if (!savingsElement) {

      savingsElement =
        document.createElement(
          "div"
        );

      savingsElement.className =
        "cart-savings";

      savingsElement.style.cssText =
        "color:#16a34a;font-size:13px;font-weight:700;margin-top:6px";

      summary.appendChild(
        savingsElement
      );
    }

    savingsElement.textContent =
      savings > 0
        ? `You save ₹${savings.toLocaleString("en-IN")}`
        : "";
  }
}


/* ---------- CHANGE QUANTITY ---------- */

function changeCartQuantity(
  index,
  change
) {

  if (!cart[index]) return;

  if (change > 0) {

    const liveProduct =
      products.find(
        p =>
          Number(p.id) ===
          Number(cart[index].id)
      );

    const liveSize =
      Array.isArray(
        liveProduct?.sizes
      )
        ? liveProduct.sizes.find(
            s =>
              String(s.size) ===
              String(cart[index].size)
          )
        : null;

    if (
      liveSize &&
      cart[index].quantity >=
        Number(liveSize.stock)
    ) {

      alert(
        "No more stock available for this size."
      );

      return;
    }
  }

  cart[index].quantity +=
    change;

  if (
    cart[index].quantity <= 0
  ) {
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

let checkoutPaymentMethod = "cod";


/* ---------- SAVED CUSTOMER ADDRESS ---------- */

async function loadSavedCheckoutAddress() {
  const user = JSON.parse(
    localStorage.getItem("nini_user") || "null"
  );

  if (!user || !user.id) return;

  const fields = {
    full_name: document.getElementById("checkoutName"),
    mobile: document.getElementById("checkoutMobile"),
    address: document.getElementById("checkoutAddress"),
    city: document.getElementById("checkoutCity"),
    state: document.getElementById("checkoutState"),
    pin_code: document.getElementById("checkoutPin")
  };

  if (Object.values(fields).some(field => !field)) return;

  try {
    const response = await fetch(
      `${API_URL}/api/addresses/user/${encodeURIComponent(user.id)}`
    );
    const data = await response.json();

    if (
      !response.ok ||
      !data.success ||
      !Array.isArray(data.addresses) ||
      !data.addresses.length
    ) {
      return;
    }

    const saved =
      data.addresses.find(
        address => Number(address.is_default) === 1
      ) || data.addresses[0];

    if (!saved) return;

    fields.full_name.value =
      saved.full_name || user.name || "";
    fields.mobile.value =
      saved.mobile || "";
    fields.address.value =
      saved.address || "";
    fields.city.value =
      saved.city || "";
    fields.state.value =
      saved.state || "";
    fields.pin_code.value =
      saved.pin_code || "";

    let note =
      document.getElementById("savedAddressNote");

    if (!note) {
      note = document.createElement("div");
      note.id = "savedAddressNote";
      note.style.cssText =
        "padding:10px 12px;background:#ecfdf5;color:#166534;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;font-weight:600;";
      note.textContent =
        "✓ Saved address loaded. You can edit it before placing the order.";

      const form = document.getElementById("checkoutForm");
      if (form) {
        form.insertBefore(note, form.firstElementChild);
      }
    }
  } catch (error) {
    console.warn("Could not load saved address:", error);
  }
}

async function saveCheckoutAddress() {
  const user = JSON.parse(
    localStorage.getItem("nini_user") || "null"
  );

  if (!user || !user.id) return;

  const payload = {
    user_id: Number(user.id),
    label: "Home",
    full_name:
      document.getElementById("checkoutName")?.value.trim() || "",
    mobile:
      document.getElementById("checkoutMobile")?.value.trim() || "",
    address:
      document.getElementById("checkoutAddress")?.value.trim() || "",
    city:
      document.getElementById("checkoutCity")?.value.trim() || "",
    state:
      document.getElementById("checkoutState")?.value.trim() || "",
    pin_code:
      document.getElementById("checkoutPin")?.value.trim() || "",
    is_default: true
  };

  if (
    !payload.full_name ||
    !payload.mobile ||
    !payload.address ||
    !payload.city ||
    !payload.state ||
    !payload.pin_code
  ) {
    return;
  }

  try {
    await fetch(`${API_URL}/api/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn("Could not save checkout address:", error);
  }
}

async function placeOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  ensureCheckoutModal();
  renderCheckout();

  const modal = document.getElementById("checkoutModal");
  if (!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  await loadSavedCheckoutAddress();
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
    <div
      class="cart-panel"
      style="
        width:min(560px,calc(100vw - 32px));
        max-width:560px;
        max-height:90vh;
        overflow:auto
      "
    >
      <div class="cart-header">
        <div>
          <span class="section-kicker">CHECKOUT</span>
          <h2>Delivery Details</h2>
        </div>

        <button
          class="close-cart"
          type="button"
          onclick="closeCheckout()"
        >
          ×
        </button>
      </div>

      <form
        id="checkoutForm"
        onsubmit="submitCheckout(event)"
        style="display:grid;gap:14px"
      >
        <label style="display:flex;flex-direction:column;gap:6px;font-weight:700">
          Full Name *
          <input
            id="checkoutName"
            required
            type="text"
            autocomplete="name"
            placeholder="Enter your full name"
            style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dce5;border-radius:7px;font:inherit;font-weight:400"
          >
        </label>

        <label style="display:flex;flex-direction:column;gap:6px;font-weight:700">
          Mobile Number *
          <input
            id="checkoutMobile"
            required
            type="tel"
            inputmode="numeric"
            maxlength="10"
            pattern="[6-9][0-9]{9}"
            autocomplete="tel"
            placeholder="10-digit mobile number"
            style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dce5;border-radius:7px;font:inherit;font-weight:400"
          >
        </label>

        <label style="display:flex;flex-direction:column;gap:6px;font-weight:700">
          Full Address *
          <textarea
            id="checkoutAddress"
            required
            rows="3"
            autocomplete="street-address"
            placeholder="House no., street, locality"
            style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dce5;border-radius:7px;font:inherit;font-weight:400;resize:vertical"
          ></textarea>
        </label>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <label style="display:flex;flex-direction:column;gap:6px;font-weight:700">
            City *
            <input
              id="checkoutCity"
              required
              type="text"
              autocomplete="address-level2"
              placeholder="City"
              style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dce5;border-radius:7px;font:inherit;font-weight:400"
            >
          </label>

          <label style="display:flex;flex-direction:column;gap:6px;font-weight:700">
            State *
            <input
              id="checkoutState"
              required
              type="text"
              autocomplete="address-level1"
              placeholder="State"
              style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dce5;border-radius:7px;font:inherit;font-weight:400"
            >
          </label>
        </div>

        <label style="display:flex;flex-direction:column;gap:6px;font-weight:700">
          PIN Code *
          <input
            id="checkoutPin"
            required
            type="text"
            inputmode="numeric"
            maxlength="6"
            pattern="[0-9]{6}"
            autocomplete="postal-code"
            placeholder="6-digit PIN code"
            style="width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dce5;border-radius:7px;font:inherit;font-weight:400"
          >
        </label>

        <div style="border:1px solid #e1e6ef;border-radius:10px;padding:14px">
          <strong>Payment Method</strong>

          <label
            style="display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding:12px;border:1px solid #d7dce5;border-radius:8px;cursor:pointer"
          >
            <input
              type="radio"
              name="checkoutPaymentMethod"
              value="cod"
              checked
              onchange="selectCheckoutPaymentMethod('cod')"
              style="margin-top:4px"
            >
            <span>
              <strong>Cash on Delivery</strong>
              <small style="display:block;color:#68748b;margin-top:3px">
                Pay when your order is delivered.
              </small>
            </span>
          </label>

          <label
            style="display:flex;align-items:flex-start;gap:10px;margin-top:10px;padding:12px;border:1px solid #d7dce5;border-radius:8px;cursor:pointer"
          >
            <input
              type="radio"
              name="checkoutPaymentMethod"
              value="online"
              onchange="selectCheckoutPaymentMethod('online')"
              style="margin-top:4px"
            >
            <span>
              <strong>Online Payment</strong>
              <small style="display:block;color:#68748b;margin-top:3px">
                Pay securely using Razorpay.
              </small>
            </span>
          </label>
        </div>

        <div style="background:#f7f8fa;border-radius:10px;padding:14px">
          <strong>Order Summary</strong>
          <div id="checkoutSummary" style="margin-top:10px"></div>
        </div>

        <button type="submit" class="market-btn primary">
          Continue to Payment →
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const style = document.createElement("style");
  style.textContent = `
    @media (max-width:600px){
      #checkoutForm > div[style*="grid-template-columns"]{
        grid-template-columns:1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function selectCheckoutPaymentMethod(method) {
  checkoutPaymentMethod = method === "online" ? "online" : "cod";

  const button = document.querySelector(
    '#checkoutForm button[type="submit"]'
  );

  if (button) {
    button.textContent =
      checkoutPaymentMethod === "online"
        ? "Continue to Online Payment →"
        : "Place COD Order →";
  }
}

function getCheckoutCartItems() {
  return cart.map(item => {
    const liveProduct = products.find(
      p => Number(p.id) === Number(item.id)
    );

    const price = liveProduct
      ? getSizeSellingPrice(liveProduct, item.size)
      : Number(item.price || 0);

    return {
      product_id: Number(item.id),
      size: String(item.size || "").trim(),
      quantity: Number(item.quantity || 0),
      price
    };
  });
}

function renderCheckout() {
  const summary = document.getElementById("checkoutSummary");
  if (!summary) return;

  const items = getCheckoutCartItems();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  summary.innerHTML =
    cart.map((item, index) => {
      const current = items[index];

      return `
        <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:8px">
          <span>
            ${escapeHTML(item.name)} × ${item.quantity}
            <small style="display:block;color:#68748b">
              Size: ${escapeHTML(item.size)}
            </small>
          </span>
          <strong>
            ₹${(current.price * current.quantity).toLocaleString("en-IN")}
          </strong>
        </div>
      `;
    }).join("") +
    `
      <hr>
      <div style="display:flex;justify-content:space-between;font-size:18px">
        <strong>Total</strong>
        <strong>₹${total.toLocaleString("en-IN")}</strong>
      </div>
    `;

  const selected = document.querySelector(
    'input[name="checkoutPaymentMethod"]:checked'
  );

  checkoutPaymentMethod = selected?.value === "online" ? "online" : "cod";
  selectCheckoutPaymentMethod(checkoutPaymentMethod);
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[data-nini-razorpay="1"]'
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Razorpay script failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.niniRazorpay = "1";

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay script failed to load"));

    document.head.appendChild(script);
  });
}

async function submitCheckout(event) {
  event.preventDefault();

  const form = document.getElementById("checkoutForm");

  if (!form || !form.reportValidity()) return;

  if (!cart.length) {
    alert("Your cart is empty.");
    closeCheckout();
    return;
  }

  const user = JSON.parse(
    localStorage.getItem("nini_user") || "null"
  );

  if (!user || !user.id) {
    alert("Please login before placing your order.");
    closeCheckout();

    if (typeof openAccount === "function") {
      openAccount();
    }

    return;
  }

  const mobile = document.getElementById("checkoutMobile").value.trim();
  const pin = document.getElementById("checkoutPin").value.trim();
  const fullName = document.getElementById("checkoutName").value.trim();
  const address = document.getElementById("checkoutAddress").value.trim();
  const city = document.getElementById("checkoutCity").value.trim();
  const state = document.getElementById("checkoutState").value.trim();

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  if (!/^\d{6}$/.test(pin)) {
    alert("Please enter a valid 6-digit PIN code.");
    return;
  }

  const items = getCheckoutCartItems();

  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent =
      checkoutPaymentMethod === "online"
        ? "Creating Payment..."
        : "Placing COD Order...";
  }

  try {
    const response = await fetch(`${API_URL}/api/orders/v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: Number(user.id),
        full_name: fullName,
        mobile,
        address,
        city,
        state,
        pin_code: pin,
        payment_method: checkoutPaymentMethod,
        items
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(
        data.error ||
        "Unable to create order. Please try again."
      );
      return;
    }

    if (checkoutPaymentMethod === "cod") {
      await saveCheckoutAddress();
      cart = [];
      saveCart();
      updateCartCount();
      closeCheckout();
      closeCart();

      alert(
        `COD order placed successfully!\\n\\nOrder ID: #${data.order_id}`
      );
      return;
    }

    await loadRazorpayScript();

    if (
      !data.razorpay_order_id ||
      !data.razorpay_key_id ||
      !window.Razorpay
    ) {
      throw new Error("Online payment details are missing.");
    }

    const razorpayOptions = {
      key: data.razorpay_key_id,
      amount: Math.round(Number(data.total_amount || 0) * 100),
      currency: "INR",
      name: "Nini Garments",
      description: `Order #${data.order_id}`,
      order_id: data.razorpay_order_id,
      prefill: {
        name: fullName,
        contact: mobile
      },
      notes: {
        nini_order_id: String(data.order_id)
      },
      theme: {
        color: "#111827"
      },
      handler: async function(paymentResponse) {
        try {
          const verifyResponse = await fetch(
            `${API_URL}/api/payments/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                order_id: Number(data.order_id),
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            }
          );

          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyData.success) {
            alert(
              verifyData.error ||
              "Payment verification failed. Please contact support."
            );
            return;
          }

                    await saveCheckoutAddress();

          cart = [];
          saveCart();
          updateCartCount();
          closeCheckout();
          closeCart();

          alert(
            `Payment successful!\\n\\nOrder ID: #${data.order_id}`
          );
        } catch (error) {
          console.error("Nini payment verification error:", error);
          alert(
            "Payment completed, but verification could not be confirmed. Please contact support with your payment ID."
          );
        }
      },
      modal: {
        ondismiss: function() {
          alert(
            "Payment window closed. Your order is still pending payment."
          );
        }
      }
    };

    const razorpay = new window.Razorpay(razorpayOptions);

    razorpay.on("payment.failed", function() {
      alert("Payment failed. Please try again.");
    });

    razorpay.open();

  } catch (error) {
    console.error("Nini order/payment error:", error);

    alert(
      error?.message ||
      "Unable to connect to the server. Please try again."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      selectCheckoutPaymentMethod(checkoutPaymentMethod);
    }
  }
}

/* ---------- ESCAPE HTML ---------- */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* ---------- CLOSE CART WITH ESC ---------- */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape"
    ) {

      closeCart();

      closeWishlist();

      closeCheckout();

    }

  }
);
(function () {
  "use strict";

  let niniSavedAddresses = [];
  let niniSelectedAddressId = null;
  let niniOriginalEnsureCheckoutModal =
    typeof ensureCheckoutModal === "function"
      ? ensureCheckoutModal
      : null;
  let niniOriginalSubmitCheckout =
    typeof submitCheckout === "function"
      ? submitCheckout
      : null;

  function niniGetUser() {
    try {
      return JSON.parse(
        localStorage.getItem("nini_user") || "null"
      );
    } catch {
      return null;
    }
  }

  function niniEscape(value) {
    if (typeof escapeHTML === "function") {
      return escapeHTML(value);
    }
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function niniSetField(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  function niniGetField(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function niniFillAddress(address) {
    if (!address) return;

    niniSelectedAddressId = Number(address.id) || null;

    niniSetField("checkoutName", address.full_name);
    niniSetField("checkoutMobile", address.mobile);
    niniSetField("checkoutAddress", address.address);
    niniSetField("checkoutCity", address.city);
    niniSetField("checkoutState", address.state);
    niniSetField("checkoutPin", address.pin_code);

    const select = document.getElementById("niniSavedAddressSelect");
    if (select) {
      select.value = String(address.id);
    }

    document.querySelectorAll(".nini-address-card").forEach(card => {
      card.style.borderColor =
        String(card.dataset.addressId) === String(address.id)
          ? "#2167ed"
          : "#d7dce5";
      card.style.background =
        String(card.dataset.addressId) === String(address.id)
          ? "#f5f8ff"
          : "#fff";
    });
  }

  function niniRenderAddressUI() {
    const box = document.getElementById("niniSavedAddressBox");
    if (!box) return;

    if (!niniSavedAddresses.length) {
      box.innerHTML = `
        <div style="
          border:1px dashed #cbd5e1;
          border-radius:10px;
          padding:14px;
          background:#fafafa;
          color:#64748b;
          font-size:13px
        ">
          No saved address yet. Fill the delivery details below.
        </div>
      `;
      return;
    }

    const defaultAddress =
      niniSavedAddresses.find(a => Number(a.is_default) === 1) ||
      niniSavedAddresses[0];

    box.innerHTML = `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:10px
      ">
        <strong>Saved Delivery Addresses</strong>
        <button
          type="button"
          id="niniAddNewAddressBtn"
          style="
            border:0;
            background:#eef4ff;
            color:#2167ed;
            padding:7px 10px;
            border-radius:7px;
            font-weight:700;
            cursor:pointer
          "
        >
          + Add New
        </button>
      </div>

      <div style="display:grid;gap:9px">
        ${niniSavedAddresses.map(a => `
          <div
            class="nini-address-card"
            data-address-id="${Number(a.id)}"
            style="
              border:1px solid #d7dce5;
              border-radius:10px;
              padding:12px;
              cursor:pointer;
              background:#fff
            "
          >
            <div style="
              display:flex;
              justify-content:space-between;
              gap:8px;
              align-items:flex-start
            ">
              <div>
                <strong>${niniEscape(a.label || "Address")}</strong>
                ${
                  Number(a.is_default) === 1
                    ? `<span style="
                        margin-left:6px;
                        color:#16a34a;
                        font-size:11px;
                        font-weight:700
                      ">DEFAULT</span>`
                    : ""
                }
              </div>
              <button
                type="button"
                class="nini-use-address"
                data-address-id="${Number(a.id)}"
                style="
                  border:0;
                  background:#2167ed;
                  color:#fff;
                  padding:6px 10px;
                  border-radius:6px;
                  font-weight:700;
                  cursor:pointer
                "
              >
                Use
              </button>
            </div>

            <div style="
              margin-top:7px;
              font-size:13px;
              line-height:1.5;
              color:#475569
            ">
              <strong>${niniEscape(a.full_name || "")}</strong><br>
              ${niniEscape(a.address || "")}<br>
              ${niniEscape(a.city || "")},
              ${niniEscape(a.state || "")} -
              ${niniEscape(a.pin_code || "")}<br>
              📱 ${niniEscape(a.mobile || "")}
            </div>

            <div style="
              display:flex;
              gap:8px;
              margin-top:9px
            ">
              <button
                type="button"
                class="nini-edit-address"
                data-address-id="${Number(a.id)}"
                style="
                  border:1px solid #d7dce5;
                  background:#fff;
                  padding:6px 10px;
                  border-radius:6px;
                  cursor:pointer
                "
              >
                Edit
              </button>

              <button
                type="button"
                class="nini-delete-address"
                data-address-id="${Number(a.id)}"
                style="
                  border:1px solid #fecaca;
                  background:#fff;
                  color:#dc2626;
                  padding:6px 10px;
                  border-radius:6px;
                  cursor:pointer
                "
              >
                Delete
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    const selected =
      niniSavedAddresses.find(
        a => Number(a.id) === Number(niniSelectedAddressId)
      ) || defaultAddress;

    if (selected) {
      niniFillAddress(selected);
    }

    document
      .querySelectorAll(".nini-address-card")
      .forEach(card => {
        card.addEventListener("click", function (event) {
          if (
            event.target.closest("button")
          ) return;

          const id = Number(card.dataset.addressId);
          const address = niniSavedAddresses.find(
            a => Number(a.id) === id
          );
          if (address) niniFillAddress(address);
        });
      });

    document
      .querySelectorAll(".nini-use-address")
      .forEach(button => {
        button.addEventListener("click", function () {
          const id = Number(button.dataset.addressId);
          const address = niniSavedAddresses.find(
            a => Number(a.id) === id
          );
          if (address) niniFillAddress(address);
        });
      });

    document
      .querySelectorAll(".nini-edit-address")
      .forEach(button => {
        button.addEventListener("click", async function () {
          const id = Number(button.dataset.addressId);
          const address = niniSavedAddresses.find(
            a => Number(a.id) === id
          );
          if (!address) return;

          niniFillAddress(address);

          const label = prompt(
            "Address label (Home / Work / Other):",
            address.label || "Home"
          );

          if (label === null) return;

          await niniSaveAddress({
            id,
            label: label.trim() || "Home",
            is_default: Number(address.is_default) === 1
          });
        });
      });

    document
      .querySelectorAll(".nini-delete-address")
      .forEach(button => {
        button.addEventListener("click", async function () {
          const id = Number(button.dataset.addressId);
          const address = niniSavedAddresses.find(
            a => Number(a.id) === id
          );
          if (!address) return;

          if (
            !confirm(
              `Delete ${address.label || "this address"}?`
            )
          ) return;

          const user = niniGetUser();
          if (!user?.id) return;

          try {
            const response = await fetch(
              `${API_URL}/api/addresses/${id}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  user_id: Number(user.id)
                })
              }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
              throw new Error(
                data.error || "Unable to delete address"
              );
            }

            await niniLoadAddresses();
          } catch (error) {
            console.error(
              "Nini delete address error:",
              error
            );
            alert(
              error.message ||
              "Unable to delete address."
            );
          }
        });
      });

    const addButton =
      document.getElementById("niniAddNewAddressBtn");

    if (addButton) {
      addButton.onclick = function () {
        niniSelectedAddressId = null;
        niniSetField("checkoutName", "");
        niniSetField("checkoutMobile", "");
        niniSetField("checkoutAddress", "");
        niniSetField("checkoutCity", "");
        niniSetField("checkoutState", "");
        niniSetField("checkoutPin", "");

        const select =
          document.getElementById(
            "niniSavedAddressSelect"
          );

        if (select) select.value = "";
      };
    }
  }

  async function niniLoadAddresses() {
    const user = niniGetUser();

    if (!user?.id) {
      niniSavedAddresses = [];
      niniSelectedAddressId = null;
      niniRenderAddressUI();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/user/${Number(user.id)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load saved addresses"
        );
      }

      niniSavedAddresses =
        Array.isArray(data.addresses)
          ? data.addresses
          : [];

      const defaultAddress =
        niniSavedAddresses.find(
          a => Number(a.is_default) === 1
        ) || niniSavedAddresses[0] || null;

      if (defaultAddress) {
        niniFillAddress(defaultAddress);
      } else {
        niniSelectedAddressId = null;
      }

      niniRenderAddressUI();
    } catch (error) {
      console.error(
        "Nini saved address loading error:",
        error
      );
    }
  }

  async function niniSaveAddress(extra = {}) {
    const user = niniGetUser();

    if (!user?.id) {
      alert("Please login before saving an address.");
      return false;
    }

    const payload = {
      user_id: Number(user.id),
      full_name: niniGetField("checkoutName"),
      mobile: niniGetField("checkoutMobile"),
      address: niniGetField("checkoutAddress"),
      city: niniGetField("checkoutCity"),
      state: niniGetField("checkoutState"),
      pin_code: niniGetField("checkoutPin"),
      label: extra.label || "Home",
      is_default: Boolean(extra.is_default)
    };

    if (
      !payload.full_name ||
      !payload.mobile ||
      !payload.address ||
      !payload.city ||
      !payload.state ||
      !payload.pin_code
    ) {
      return false;
    }

    /*
      Current Worker exposes POST /api/addresses and DELETE.
      It does not expose an edit PUT route in the current code,
      so editing is intentionally not sent as PUT here.
      A new address can be saved safely without touching orders.
    */

    try {
      const response = await fetch(
        `${API_URL}/api/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to save address"
        );
      }

      await niniLoadAddresses();
      return true;
    } catch (error) {
      console.error(
        "Nini save address error:",
        error
      );
      alert(
        error.message ||
        "Unable to save address."
      );
      return false;
    }
  }

  function niniInjectAddressBox() {
    const form =
      document.getElementById("checkoutForm");

    if (!form) return;

    if (
      document.getElementById(
        "niniSavedAddressBox"
      )
    ) return;

    const box =
      document.createElement("div");

    box.id = "niniSavedAddressBox";

    box.style.cssText =
      "margin-bottom:2px";

    const firstField =
      document.getElementById("checkoutName");

    if (firstField) {
      const label =
        firstField.closest("label");

      if (label) {
        label.parentNode.insertBefore(
          box,
          label
        );
      } else {
        form.insertBefore(
          box,
          form.firstChild
        );
      }
    } else {
      form.insertBefore(
        box,
        form.firstChild
      );
    }

    niniRenderAddressUI();
  }

  /*
    Override only the modal creation wrapper.
    All existing checkout/payment/order functionality stays intact.
  */
  if (niniOriginalEnsureCheckoutModal) {
    window.ensureCheckoutModal = function () {
      niniOriginalEnsureCheckoutModal();
      niniInjectAddressBox();
    };
  }

  /*
    Open checkout and immediately load the customer's saved addresses.
  */
  const niniOriginalPlaceOrder =
    typeof placeOrder === "function"
      ? placeOrder
      : null;

  if (niniOriginalPlaceOrder) {
    window.placeOrder = function () {
      if (
        typeof cart !== "undefined" &&
        Array.isArray(cart) &&
        cart.length === 0
      ) {
        alert("Your cart is empty.");
        return;
      }

      ensureCheckoutModal();

      if (typeof renderCheckout === "function") {
        renderCheckout();
      }

      const modal =
        document.getElementById("checkoutModal");

      if (modal) {
        modal.style.display = "flex";
      }

      document.body.style.overflow = "hidden";

      niniInjectAddressBox();
      niniLoadAddresses();
    };
  }

  /*
    IMPORTANT:
    Save the address after a successful order.
    We do not save an address before order success,
    preventing abandoned checkouts from filling the address book.
  */
  if (niniOriginalSubmitCheckout) {
    window.submitCheckout = async function (event) {
      event.preventDefault();

      const form =
        document.getElementById("checkoutForm");

      if (!form || !form.reportValidity()) {
        return;
      }

      const beforeOrder = {
        full_name: niniGetField("checkoutName"),
        mobile: niniGetField("checkoutMobile"),
        address: niniGetField("checkoutAddress"),
        city: niniGetField("checkoutCity"),
        state: niniGetField("checkoutState"),
        pin_code: niniGetField("checkoutPin")
      };

      /*
        Run the existing checkout implementation.
        It keeps the current price, coupon, payment,
        stock and order logic untouched.
      */
      await niniOriginalSubmitCheckout(event);

      /*
        Existing implementation clears cart after a successful
        order. If cart is now empty, treat that as success.
      */
      const orderSucceeded =
        typeof cart !== "undefined" &&
        Array.isArray(cart) &&
        cart.length === 0;

      if (!orderSucceeded) {
        return;
      }

      const user = niniGetUser();
      if (!user?.id) return;

      if (
        !beforeOrder.full_name ||
        !beforeOrder.mobile ||
        !beforeOrder.address ||
        !beforeOrder.city ||
        !beforeOrder.state ||
        !beforeOrder.pin_code
      ) {
        return;
      }

      /*
        Do not create a duplicate copy if the selected saved
        address already matches the checkout address.
      */
      const duplicate =
        niniSavedAddresses.some(a =>
          String(a.full_name || "").trim() === beforeOrder.full_name &&
          String(a.mobile || "").trim() === beforeOrder.mobile &&
          String(a.address || "").trim() === beforeOrder.address &&
          String(a.city || "").trim() === beforeOrder.city &&
          String(a.state || "").trim() === beforeOrder.state &&
          String(a.pin_code || "").trim() === beforeOrder.pin_code
        );

      if (!duplicate) {
        try {
          await fetch(
            `${API_URL}/api/addresses`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                user_id: Number(user.id),
                full_name: beforeOrder.full_name,
                mobile: beforeOrder.mobile,
                address: beforeOrder.address,
                city: beforeOrder.city,
                state: beforeOrder.state,
                pin_code: beforeOrder.pin_code,
                label: "Home",
                is_default: niniSavedAddresses.length === 0
              })
            }
          );
        } catch (error) {
          console.warn(
            "Nini automatic address save failed:",
            error
          );
        }
      }
    };
  }

  /*
    If an already-created checkout modal exists,
    inject the saved-address box after app.js loads.
  */
  document.addEventListener(
    "DOMContentLoaded",
    function () {
      setTimeout(() => {
        niniInjectAddressBox();
      }, 300);
    }
  );

  /*
    Expose a small manual helper for testing.
    Browser console:
      niniReloadSavedAddresses()
  */
  window.niniReloadSavedAddresses =
    niniLoadAddresses;

})();
/* =========================================================
   NINI CUSTOMER MY ORDERS
   - Connects the header Orders link to the real customer order API.
   - Shows only the logged-in customer's orders.
   - Uses the existing /api/orders/user/:userId endpoint.
   ========================================================= */
(function initNiniCustomerOrders() {
  function niniOrdersEscape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function niniOrdersUser() {
    try {
      return JSON.parse(localStorage.getItem("nini_user") || "null");
    } catch (error) {
      return null;
    }
  }

  function niniOrderStatusLabel(status) {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    return labels[String(status || "").toLowerCase()] || "Pending";
  }

  function niniOrderStatusClass(status) {
    const value = String(status || "pending").toLowerCase();
    if (value === "delivered") return "delivered";
    if (value === "cancelled") return "cancelled";
    if (value === "shipped" || value === "out_for_delivery") return "shipping";
    if (value === "confirmed" || value === "packed") return "processing";
    return "pending";
  }

  function ensureNiniOrdersModal() {
    let modal = document.getElementById("niniCustomerOrdersModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "niniCustomerOrdersModal";
    modal.innerHTML = `
      <div class="nini-orders-backdrop" data-nini-orders-close="1"></div>
      <section class="nini-orders-panel" role="dialog" aria-modal="true" aria-labelledby="niniOrdersTitle">
        <div class="nini-orders-head">
          <div>
            <div class="nini-orders-kicker">NINI GARMENTS</div>
            <h2 id="niniOrdersTitle">My Orders</h2>
          </div>
          <button type="button" class="nini-orders-close" aria-label="Close" data-nini-orders-close="1">×</button>
        </div>
        <div id="niniOrdersContent" class="nini-orders-content">
          <div class="nini-orders-loading">Loading your orders...</div>
        </div>
      </section>
    `;

    const style = document.createElement("style");
    style.id = "niniCustomerOrdersStyles";
    style.textContent = `
      #niniCustomerOrdersModal{
        position:fixed;inset:0;z-index:100000;display:none;
        font-family:inherit;
      }
      #niniCustomerOrdersModal.is-open{display:block}
      .nini-orders-backdrop{
        position:absolute;inset:0;background:rgba(15,23,42,.58);
        backdrop-filter:blur(2px)
      }
      .nini-orders-panel{
        position:absolute;top:0;right:0;height:100%;width:min(620px,100%);
        background:#fff;box-shadow:-10px 0 35px rgba(0,0,0,.18);
        display:flex;flex-direction:column;overflow:hidden
      }
      .nini-orders-head{
        display:flex;justify-content:space-between;align-items:flex-start;
        gap:16px;padding:22px 22px 16px;border-bottom:1px solid #e5e7eb
      }
      .nini-orders-kicker{font-size:12px;font-weight:800;letter-spacing:2px;color:#ff2d68;margin-bottom:5px}
      .nini-orders-head h2{margin:0;font-size:25px;color:#111827}
      .nini-orders-close{
        border:0;background:#f3f4f6;border-radius:50%;width:38px;height:38px;
        font-size:26px;line-height:1;cursor:pointer;color:#111827
      }
      .nini-orders-content{overflow:auto;padding:18px 22px 28px;flex:1;background:#f8fafc}
      .nini-orders-loading,.nini-orders-empty,.nini-orders-error{
        background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:22px;
        text-align:center;color:#64748b
      }
      .nini-order-card{
        background:#fff;border:1px solid #e2e8f0;border-radius:13px;
        padding:16px;margin-bottom:13px;box-shadow:0 2px 8px rgba(15,23,42,.04)
      }
      .nini-order-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .nini-order-id{font-weight:800;color:#111827;font-size:16px}
      .nini-order-date{font-size:12px;color:#64748b;margin-top:4px}
      .nini-order-status{font-size:12px;font-weight:800;padding:6px 9px;border-radius:999px;white-space:nowrap}
      .nini-order-status.pending{background:#fff7ed;color:#c2410c}
      .nini-order-status.processing{background:#eff6ff;color:#1d4ed8}
      .nini-order-status.shipping{background:#f5f3ff;color:#6d28d9}
      .nini-order-status.delivered{background:#ecfdf5;color:#15803d}
      .nini-order-status.cancelled{background:#fef2f2;color:#b91c1c}
      .nini-order-items{margin-top:13px;border-top:1px solid #eef2f7;padding-top:10px}
      .nini-order-item{display:flex;justify-content:space-between;gap:12px;padding:8px 0}
      .nini-order-item-name{font-weight:650;color:#334155}
      .nini-order-item-meta{font-size:12px;color:#64748b;margin-top:3px}
      .nini-order-total{display:flex;justify-content:space-between;align-items:center;
        border-top:1px solid #eef2f7;margin-top:9px;padding-top:12px;font-weight:800;color:#111827}
      .nini-order-track{margin-top:12px;font-size:13px;color:#2167ed;font-weight:700}
      @media(max-width:600px){
        .nini-orders-head{padding:17px 16px 13px}
        .nini-orders-content{padding:13px 12px 22px}
        .nini-orders-panel{width:100%}
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);

    modal.querySelectorAll("[data-nini-orders-close]").forEach(el => {
      el.addEventListener("click", closeNiniCustomerOrders);
    });

    return modal;
  }

  function closeNiniCustomerOrders() {
    const modal = document.getElementById("niniCustomerOrdersModal");
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  async function openNiniCustomerOrders() {
    const user = niniOrdersUser();

    if (!user || !user.id) {
      if (typeof openAccount === "function") {
        openAccount();
      } else {
        alert("Please login to view your orders.");
      }
      return;
    }

    const modal = ensureNiniOrdersModal();
    const content = document.getElementById("niniOrdersContent");
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    content.innerHTML = `<div class="nini-orders-loading">Loading your orders...</div>`;

    try {
      const response = await fetch(
        `${API_URL}/api/orders/user/${encodeURIComponent(Number(user.id))}`,
        { headers: { "Accept": "application/json" } }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to load orders.");
      }

      const orders = Array.isArray(data.orders) ? data.orders : [];

      if (!orders.length) {
        content.innerHTML = `
          <div class="nini-orders-empty">
            <div style="font-size:38px;margin-bottom:8px">📦</div>
            <strong style="display:block;color:#111827;margin-bottom:5px">No orders yet</strong>
            <span>Your placed orders will appear here.</span>
          </div>
        `;
        return;
      }

      content.innerHTML = orders.map(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        const status = String(order.status || "pending").toLowerCase();
        const statusLabel = niniOrderStatusLabel(status);
        const statusClass = niniOrderStatusClass(status);
        const date = order.created_at
          ? new Date(order.created_at).toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit"
            })
          : "—";

        const itemsHtml = items.length
          ? items.map(item => `
              <div class="nini-order-item">
                <div>
                  <div class="nini-order-item-name">${niniOrdersEscape(item.name || "Product")}</div>
                  <div class="nini-order-item-meta">
                    ${item.size ? `Size: ${niniOrdersEscape(item.size)} · ` : ""}
                    Qty: ${Number(item.quantity || 0)}
                  </div>
                </div>
                <strong>₹${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString("en-IN")}</strong>
              </div>
            `).join("")
          : `<div class="nini-order-item-meta">Order items unavailable.</div>`;

        return `
          <article class="nini-order-card">
            <div class="nini-order-top">
              <div>
                <div class="nini-order-id">Order #${Number(order.id)}</div>
                <div class="nini-order-date">Placed ${niniOrdersEscape(date)}</div>
              </div>
              <span class="nini-order-status ${statusClass}">${niniOrdersEscape(statusLabel)}</span>
            </div>
            <div class="nini-order-items">${itemsHtml}</div>
            <div class="nini-order-total">
              <span>Total</span>
              <strong>₹${Number(order.total_amount || 0).toLocaleString("en-IN")}</strong>
            </div>
            <div class="nini-order-track">📦 ${niniOrdersEscape(statusLabel)}</div>
          </article>
        `;
      }).join("");
    } catch (error) {
      console.error("Nini customer orders error:", error);
      content.innerHTML = `
        <div class="nini-orders-error">
          <strong style="display:block;color:#111827;margin-bottom:7px">Could not load orders</strong>
          <div style="margin-bottom:14px">${niniOrdersEscape(error.message || "Please try again.")}</div>
          <button type="button" id="niniOrdersRetry" style="border:0;background:#2167ed;color:#fff;padding:9px 14px;border-radius:8px;font-weight:700;cursor:pointer">Try Again</button>
        </div>
      `;
      const retry = document.getElementById("niniOrdersRetry");
      if (retry) retry.addEventListener("click", openNiniCustomerOrders);
    }
  }

  function handleNiniOrdersClick(event) {
    const link = event.target.closest('a[href="#orders"], a[href="index.html#orders"]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    openNiniCustomerOrders();
  }

  function init() {
    document.addEventListener("click", handleNiniOrdersClick, true);

    if (location.hash === "#orders") {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.openNiniCustomerOrders = openNiniCustomerOrders;
  window.closeNiniCustomerOrders = closeNiniCustomerOrders;
})();
