const KEY = "niniStoreV1";

const demo = [
  {
    name: "Dino Hoodie",
    cat: "Hoodies",
    price: 699,
    cost: 350,
    sizes: ["0-1Y", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    stock: 25,
    image: ""
  },
  {
    name: "Bunny Hoodie",
    cat: "Hoodies",
    price: 699,
    cost: 350,
    sizes: ["0-1Y", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    stock: 20,
    image: ""
  },
  {
    name: "Bear Hoodie",
    cat: "Hoodies",
    price: 699,
    cost: 360,
    sizes: ["0-1Y", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    stock: 18,
    image: ""
  },
  {
    name: "Cool Hoodie",
    cat: "Hoodies",
    price: 699,
    cost: 340,
    sizes: ["0-1Y", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    stock: 16,
    image: ""
  }
];

let db = JSON.parse(localStorage.getItem(KEY) || "null") || {
  products: demo,
  orders: [],
  purchases: []
};


/* =========================================================
   UPDATE EXISTING PRODUCTS
   ========================================================= */

db.products.forEach(product => {
  if (!Array.isArray(product.sizes)) {
    product.sizes = [];
  }

  // Add 5-6Y if it does not already exist
  if (!product.sizes.includes("5-6Y")) {
    product.sizes.push("5-6Y");
  }
});

save();


/* =========================================================
   SAVE DATABASE
   ========================================================= */

function save() {
  localStorage.setItem(KEY, JSON.stringify(db));
}


/* =========================================================
   MONEY FORMAT
   ========================================================= */

function money(n) {
  return Number(n || 0).toLocaleString("en-IN");
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(list = db.products) {
  const el = document.getElementById("products");

  if (!el) return;

  el.innerHTML = list.map((p, i) => `
    <article class="product">

      <img 
        src="${p.image || 'assets/nini-logo.png'}" 
        alt="${p.name}"
      >

      <div class="product-info">

        <h3>${p.name}</h3>

        <div class="price">
          ₹${money(p.price)}
        </div>

        <div class="stock">
          ${p.stock > 0
            ? p.stock + " pcs available"
            : "Out of Stock"}
        </div>

        <select id="size${i}">
          ${p.sizes.map(size => `
            <option value="${size}">
              ${size}
            </option>
          `).join("")}
        </select>

        <button
          ${p.stock <= 0 ? "disabled" : ""}
          onclick="addCart(
            ${i},
            document.getElementById('size${i}').value
          )"
        >
          ADD TO CART
        </button>

      </div>

    </article>
  `).join("");
}


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

function filterCat(cat) {

  renderProducts(
    db.products.filter(p => p.cat === cat)
  );

  const shop = document.getElementById("shop");

  if (shop) {
    shop.scrollIntoView({
      behavior: "smooth"
    });
  }
}


/* =========================================================
   CART
   ========================================================= */

let cart = [];


/* =========================================================
   ADD TO CART
   ========================================================= */

function addCart(i, size) {

  const p = db.products[i];

  if (!p || p.stock <= 0) {
    return;
  }

  cart.push({
    product: i,
    size: size,
    price: p.price,
    name: p.name
  });

  const count = document.getElementById("cartCount");

  if (count) {
    count.textContent = cart.length;
  }

  alert("Added to cart!");
}


/* =========================================================
   OPEN CART
   ========================================================= */

function openCart() {

  const modal = document.getElementById("cartModal");

  if (!modal) return;

  modal.style.display = "flex";

  const el = document.getElementById("cartItems");

  if (!el) return;

  el.innerHTML = cart.length
    ? cart.map((item, i) => `
        <div class="cart-line">

          <span>
            ${item.name} (${item.size})
          </span>

          <b>
            ₹${money(item.price)}
          </b>

        </div>
      `).join("")
    : "Your cart is empty.";

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  document.getElementById("cartTotal").textContent =
    money(total);
}


/* =========================================================
   CLOSE CART
   ========================================================= */

function closeCart() {

  const modal = document.getElementById("cartModal");

  if (modal) {
    modal.style.display = "none";
  }
}


/* =========================================================
   PLACE ORDER
   ========================================================= */

function placeOrder() {

  if (!cart.length) {
    return alert("Cart is empty");
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  cart.forEach(item => {

    const product = db.products[item.product];

    if (product && product.stock > 0) {
      product.stock--;
    }

  });

  db.orders.push({

    id: "NG" + Date.now().toString().slice(-6),

    date: new Date().toLocaleString(),

    items: cart,

    total: total,

    status: "New"

  });

  save();

  cart = [];

  const count = document.getElementById("cartCount");

  if (count) {
    count.textContent = 0;
  }

  closeCart();

  renderProducts();

  alert("Demo order created successfully!");
}


/* =========================================================
   ADMIN INITIALIZATION
   ========================================================= */

function initAdmin() {

  if (!document.getElementById("adminProducts")) {
    return;
  }

  const form = document.getElementById("productForm");


  /* ---------------------------------------------------------
     ADD PRODUCT
     --------------------------------------------------------- */

  form.onsubmit = async e => {

    e.preventDefault();

    let image = pImage.value.trim();

    const file =
      document.getElementById("pImageFile").files[0];

    if (file) {
      image = await fileToDataUrl(file);
    }


    let sizes = pSizes.value
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);


    /*
       Automatically add 5-6Y
       if it is not entered manually.
    */

    if (!sizes.includes("5-6Y")) {
      sizes.push("5-6Y");
    }


    const product = {

      name: pName.value,

      cat: pCat.value,

      price: +pPrice.value,

      mrp: +pMrp.value || +pPrice.value,

      cost: +pCost.value,

      sizes: sizes,

      stock: +pStock.value,

      image: image,

      desc: pDesc.value.trim()

    };


    db.products.push(product);

    save();

    form.reset();

    renderAdmin();

    alert("Product listing added successfully.");
  };


  /* ---------------------------------------------------------
     PURCHASE / STOCK
     --------------------------------------------------------- */

  document.getElementById("purchaseForm").onsubmit = e => {

    e.preventDefault();

    const i = +purchaseProduct.value;

    const q = +purchaseQty.value;

    const c = +purchaseCost.value;

    if (!db.products[i]) {
      return alert("Product not found.");
    }

    db.products[i].stock += q;

    db.products[i].cost = c;

    db.purchases.push({

      product: db.products[i].name,

      qty: q,

      cost: c,

      date: new Date().toLocaleString()

    });

    save();

    e.target.reset();

    renderAdmin();

    alert("Stock added.");
  };


  renderAdmin();
}


/* =========================================================
   FILE TO DATA URL
   ========================================================= */

function fileToDataUrl(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}


/* =========================================================
   EDIT PRODUCT
   ========================================================= */

function editProduct(i) {

  const p = db.products[i];

  if (!p) return;

  pName.value = p.name;

  pCat.value = p.cat;

  pPrice.value = p.price;

  pMrp.value = p.mrp || p.price;

  pCost.value = p.cost;

  pSizes.value = p.sizes.join(", ");

  pStock.value = p.stock;

  pImage.value =
    (p.image && p.image.startsWith("http"))
      ? p.image
      : "";

  pDesc.value = p.desc || "";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

function deleteProduct(i) {

  if (
    confirm("Delete this product listing?")
  ) {

    db.products.splice(i, 1);

    save();

    renderAdmin();

  }

}


/* =========================================================
   RENDER ADMIN
   ========================================================= */

function renderAdmin() {

  const sProducts =
    document.getElementById("sProducts");

  const sStock =
    document.getElementById("sStock");

  const sOrders =
    document.getElementById("sOrders");

  const sSales =
    document.getElementById("sSales");

  const sProfit =
    document.getElementById("sProfit");


  if (sProducts) {
    sProducts.textContent =
      db.products.length;
  }


  if (sStock) {
    sStock.textContent =
      db.products.reduce(
        (total, product) =>
          total + product.stock,
        0
      );
  }


  if (sOrders) {
    sOrders.textContent =
      db.orders.length;
  }


  const sales =
    db.orders.reduce(
      (total, order) =>
        total + order.total,
      0
    );


  const profit =
    db.orders.reduce(
      (total, order) => {

        return total +
          order.items.reduce(
            (itemTotal, item) => {

              const product =
                db.products[item.product];

              const cost =
                product?.cost || 0;

              return itemTotal +
                (item.price - cost);

            },
            0
          );

      },
      0
    );


  if (sSales) {
    sSales.textContent =
      money(sales);
  }


  if (sProfit) {
    sProfit.textContent =
      money(profit);
  }


  /* ---------------------------------------------------------
     PURCHASE PRODUCT DROPDOWN
     --------------------------------------------------------- */

  const purchaseProduct =
    document.getElementById("purchaseProduct");

  if (purchaseProduct) {

    purchaseProduct.innerHTML =
      db.products.map(
        (p, i) => `
          <option value="${i}">
            ${p.name} — ${p.stock} pcs
          </option>
        `
      ).join("");

  }


  /* ---------------------------------------------------------
     ADMIN PRODUCT LIST
     --------------------------------------------------------- */

  const adminProducts =
    document.getElementById("adminProducts");

  if (adminProducts) {

    adminProducts.innerHTML =
      db.products.map(
        (p, i) => `

          <div class="admin-product">

            <span>

              <b>
                ${p.name}
              </b>

              <br>

              <small>
                ${p.cat}
                • ₹${money(p.price)}
                • MRP ₹${money(p.mrp || p.price)}
                • Cost ₹${money(p.cost)}
                • Sizes: ${p.sizes.join(", ")}
              </small>

            </span>


            <span class="${p.stock <= 5 ? "low" : ""}">
              ${p.stock} pcs
            </span>


            <span class="edit-actions">

              <button
                onclick="editProduct(${i})"
              >
                Edit
              </button>

              <button
                onclick="deleteProduct(${i})"
              >
                Delete
              </button>

            </span>

          </div>

        `
      ).join("");

  }


  /* ---------------------------------------------------------
     ADMIN ORDERS
     --------------------------------------------------------- */

  const adminOrders =
    document.getElementById("adminOrders");

  if (adminOrders) {

    adminOrders.innerHTML =
      db.orders.length

        ? db.orders
            .slice()
            .reverse()
            .map(
              order => `

                <div class="order">

                  <b>
                    ${order.id}
                  </b>

                  • ${order.date}

                  <br>

                  Items:
                  ${order.items
                    .map(
                      item =>
                        item.name +
                        " (" +
                        item.size +
                        ")"
                    )
                    .join(", ")
                  }

                  <br>

                  <b>
                    ₹${money(order.total)}
                  </b>

                  —
                  ${order.status}

                </div>

              `
            )
            .join("")

        : "No orders yet.";

  }

}


/* =========================================================
   START APPLICATION
   ========================================================= */

renderProducts();

initAdmin();