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
          s =>
            String(s.size) ===
            String(size)
        )
      : null;

  return Number(
    selectedSize?.price ??
    product.price ??
    0
  );
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

        const itemPrice =
          Number(
            item.price ??
            liveSize?.price ??
            liveProduct?.price ??
            0
          );

        const itemMrp =
          Number(
            item.mrp ??
            liveSize?.mrp ??
            liveProduct?.mrp ??
            itemPrice
          );

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

function placeOrder() {

  if (cart.length === 0) {

    alert(
      "Your cart is empty."
    );

    return;
  }

  ensureCheckoutModal();

  renderCheckout();

  const modal =
    document.getElementById(
      "checkoutModal"
    );

  modal.style.display = "flex";

  document.body.style.overflow =
    "hidden";
}

function closeCheckout() {

  const modal =
    document.getElementById(
      "checkoutModal"
    );

  if (!modal) return;

  modal.style.display = "none";

  document.body.style.overflow = "";
}

function ensureCheckoutModal() {

  if (
    document.getElementById(
      "checkoutModal"
    )
  ) {
    return;
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "checkoutModal";

  modal.className =
    "cart-modal";

  modal.onclick =
    function(event) {

      if (
        event.target ===
        modal
      ) {
        closeCheckout();
      }

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

          <span class="section-kicker">
            CHECKOUT
          </span>

          <h2>
            Delivery Details
          </h2>

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
        style="
          display:grid;
          gap:14px
        "
      >

        <label
          style="
            display:flex;
            flex-direction:column;
            gap:6px;
            font-weight:700
          "
        >
          Full Name *

          <input
            id="checkoutName"
            required
            type="text"
            autocomplete="name"
            placeholder="Enter your full name"
            style="
              width:100%;
              box-sizing:border-box;
              padding:11px 12px;
              border:1px solid #d7dce5;
              border-radius:7px;
              font:inherit;
              font-weight:400
            "
          >
        </label>

        <label
          style="
            display:flex;
            flex-direction:column;
            gap:6px;
            font-weight:700
          "
        >
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
            style="
              width:100%;
              box-sizing:border-box;
              padding:11px 12px;
              border:1px solid #d7dce5;
              border-radius:7px;
              font:inherit;
              font-weight:400
            "
          >
        </label>

        <label
          style="
            display:flex;
            flex-direction:column;
            gap:6px;
            font-weight:700
          "
        >
          Full Address *

          <textarea
            id="checkoutAddress"
            required
            rows="3"
            autocomplete="street-address"
            placeholder="House no., street, locality"
            style="
              width:100%;
              box-sizing:border-box;
              padding:11px 12px;
              border:1px solid #d7dce5;
              border-radius:7px;
              font:inherit;
              font-weight:400;
              resize:vertical
            "
          ></textarea>
        </label>

        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px
          "
        >

          <label
            style="
              display:flex;
              flex-direction:column;
              gap:6px;
              font-weight:700
            "
          >
            City *

            <input
              id="checkoutCity"
              required
              type="text"
              autocomplete="address-level2"
              placeholder="City"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px 12px;
                border:1px solid #d7dce5;
                border-radius:7px;
                font:inherit;
                font-weight:400
              "
            >
          </label>

          <label
            style="
              display:flex;
              flex-direction:column;
              gap:6px;
              font-weight:700
            "
          >
            State *

            <input
              id="checkoutState"
              required
              type="text"
              autocomplete="address-level1"
              placeholder="State"
              style="
                width:100%;
                box-sizing:border-box;
                padding:11px 12px;
                border:1px solid #d7dce5;
                border-radius:7px;
                font:inherit;
                font-weight:400
              "
            >
          </label>

        </div>

        <label
          style="
            display:flex;
            flex-direction:column;
            gap:6px;
            font-weight:700
          "
        >
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
            style="
              width:100%;
              box-sizing:border-box;
              padding:11px 12px;
              border:1px solid #d7dce5;
              border-radius:7px;
              font:inherit;
              font-weight:400
            "
          >
        </label>

        <div
          style="
            background:#f7f8fa;
            border-radius:10px;
            padding:14px
          "
        >

          <strong>
            Order Summary
          </strong>

          <div
            id="checkoutSummary"
            style="
              margin-top:10px
            "
          ></div>

        </div>

        <button
          type="submit"
          class="market-btn primary"
        >
          Confirm Order →
        </button>

      </form>

    </div>

  `;

  document.body.appendChild(
    modal
  );

  const style =
    document.createElement(
      "style"
    );

  style.textContent = `
    @media (max-width:600px){
      #checkoutForm > div[style*="grid-template-columns"]{
        grid-template-columns:1fr !important
      }
    }
  `;

  document.head.appendChild(
    style
  );
}

function renderCheckout() {

  const summary =
    document.getElementById(
      "checkoutSummary"
    );

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

  if (summary) {

    summary.innerHTML =
      cart.map(item => {

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

        return `
          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:10px;
              margin-bottom:8px
            "
          >

            <span>

              ${escapeHTML(item.name)}
              ×
              ${item.quantity}

              <small
                style="
                  display:block;
                  color:#68748b
                "
              >
                Size:
                ${escapeHTML(item.size)}
              </small>

            </span>

            <strong>
              ₹${(
                price *
                Number(
                  item.quantity || 0
                )
              ).toLocaleString("en-IN")}
            </strong>

          </div>
        `;

      }).join("") +

      `
        <hr>

        <div
          style="
            display:flex;
            justify-content:space-between;
            font-size:18px
          "
        >
          <strong>
            Total
          </strong>

          <strong>
            ₹${total.toLocaleString("en-IN")}
          </strong>
        </div>
      `;
  }
}

async function submitCheckout(
  event
) {

  event.preventDefault();

  const form =
    document.getElementById(
      "checkoutForm"
    );

  if (
    !form ||
    !form.reportValidity()
  ) {
    return;
  }

  if (!cart.length) {

    alert(
      "Your cart is empty."
    );

    closeCheckout();

    return;
  }

  const user =
    JSON.parse(
      localStorage.getItem(
        "nini_user"
      ) || "null"
    );

  if (
    !user ||
    !user.id
  ) {

    alert(
      "Please login before placing your order."
    );

    closeCheckout();

    if (
      typeof openAccount ===
      "function"
    ) {
      openAccount();
    }

    return;
  }

  const mobile =
    document.getElementById(
      "checkoutMobile"
    ).value.trim();

  const pin =
    document.getElementById(
      "checkoutPin"
    ).value.trim();

  const fullName =
    document.getElementById(
      "checkoutName"
    ).value.trim();

  const address =
    document.getElementById(
      "checkoutAddress"
    ).value.trim();

  const city =
    document.getElementById(
      "checkoutCity"
    ).value.trim();

  const state =
    document.getElementById(
      "checkoutState"
    ).value.trim();

  if (
    !/^[6-9]\d{9}$/.test(
      mobile
    )
  ) {

    alert(
      "Please enter a valid 10-digit mobile number."
    );

    return;
  }

  if (
    !/^\d{6}$/.test(pin)
  ) {

    alert(
      "Please enter a valid 6-digit PIN code."
    );

    return;
  }

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

  const items =
    cart.map(item => {

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

      return {

        product_id:
          Number(item.id),

        size:
          String(
            item.size || ""
          ).trim(),

        quantity:
          Number(
            item.quantity || 0
          ),

        price

      };

    });

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  if (submitButton) {

    submitButton.disabled = true;

    submitButton.textContent =
      "Placing Order...";

  }

  try {

    const response =
      await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              user_id:
                Number(user.id),

              full_name:
                fullName,

              mobile,

              address,

              city,

              state,

              pin_code:
                pin,

              total_amount:
                total,

              items

            })
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {

      alert(
        data.error ||
        "Unable to place order. Please try again."
      );

      return;
    }

    cart = [];

    saveCart();

    updateCartCount();

    closeCheckout();

    closeCart();

    alert(
      `Order placed successfully!\n\nOrder ID: #${data.order_id}`
    );

  } catch (error) {

    console.error(
      "Nini order submission error:",
      error
    );

    alert(
      "Unable to connect to the server. Please try again."
    );

  } finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Confirm Order →";

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
