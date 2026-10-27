// ShopEase - script.js

/* ============================================================
   Product data (matched with the product cards by name)
   ============================================================ */
const products = [
  { name: "Wireless Headphones", price: 1999, category: "Electronics", image: "images/p1.jpg", info: "Over-ear wireless headphones with deep bass and long battery life." },
  { name: "Smart Watch",         price: 2499, category: "Electronics", image: "images/p2.jpg", info: "Fitness smart watch that tracks your steps, heart rate and sleep." },
  { name: "Bluetooth Speaker",   price: 1499, category: "Electronics", image: "images/p3.jpg", info: "Portable speaker with clear sound and easy Bluetooth connection." },
  { name: "Cotton T-Shirt",      price: 499,  category: "Clothing",    image: "images/p4.jpg", info: "Soft round-neck t-shirt made from 100% cotton." },
  { name: "Blue Jeans",          price: 1199, category: "Clothing",    image: "images/p5.jpg", info: "Slim fit denim jeans, comfortable for everyday wear." },
  { name: "Winter Jacket",       price: 2199, category: "Clothing",    image: "images/p6.jpg", info: "Warm padded jacket to keep you cosy in cold weather." },
  { name: "School Backpack",     price: 899,  category: "Accessories", image: "images/p7.jpg", info: "Spacious backpack with multiple pockets for books and more." },
  { name: "Sunglasses",          price: 599,  category: "Accessories", image: "images/p8.jpg", info: "UV protected sunglasses with a stylish look." }
];

function findProduct(name) {
  return products.find(function (p) { return p.name === name; });
}

/* ---------- localStorage helpers ---------- */
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ============================================================
   3. Cart count (shown on the Cart link in every page)
   ============================================================ */
function updateCartCount() {
  const total = getData("cart").reduce(function (sum, item) { return sum + item.qty; }, 0);
  document.getElementById("cart").textContent = "Cart (" + total + ")";
}

/* ============================================================
   5. Dark mode
   ============================================================ */
const themeBtn = document.createElement("button");
themeBtn.id = "theme-btn";
document.getElementById("nav").appendChild(themeBtn);

function applyTheme(mode) {
  document.body.classList.toggle("dark", mode === "dark");
  themeBtn.textContent = mode === "dark" ? "Light Mode" : "Dark Mode";
  localStorage.setItem("theme", mode);
}

themeBtn.addEventListener("click", function () {
  applyTheme(document.body.classList.contains("dark") ? "light" : "dark");
});

applyTheme(localStorage.getItem("theme") || "light");

/* ============================================================
   7. Product details popup
   ============================================================ */
const modal = document.createElement("div");
modal.id = "modal";
modal.innerHTML =
  '<div class="modal-box">' +
  '<button class="close-btn">&times;</button>' +
  '<img id="modal-img" src="" alt="">' +
  '<h3 id="modal-name"></h3>' +
  '<p class="price" id="modal-price"></p>' +
  '<p id="modal-category"></p>' +
  '<p id="modal-info"></p>' +
  '</div>';
document.body.appendChild(modal);

function openModal(p) {
  document.getElementById("modal-img").src = p.image;
  document.getElementById("modal-img").alt = p.name;
  document.getElementById("modal-name").textContent = p.name;
  document.getElementById("modal-price").textContent = "\u20B9" + p.price;
  document.getElementById("modal-category").textContent = "Category: " + p.category;
  document.getElementById("modal-info").textContent = p.info;
  modal.classList.add("open");
}

function closeModal() {
  modal.classList.remove("open");
}

modal.querySelector(".close-btn").addEventListener("click", closeModal);
modal.addEventListener("click", function (e) {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeModal();
});

/* ============================================================
   3, 7, 8. Product cards: Add to Cart, View Details, Wishlist
   ============================================================ */
document.querySelectorAll(".product").forEach(function (card) {
  const name = card.querySelector("h3").textContent;
  const product = findProduct(name);
  const buttons = card.querySelectorAll("button");
  const detailsBtn = buttons[0];
  const cartBtn = buttons[1];

  // View Details
  detailsBtn.addEventListener("click", function () {
    openModal(product);
  });

  // Add to Cart
  cartBtn.addEventListener("click", function () {
    const cart = getData("cart");
    const item = cart.find(function (i) { return i.name === name; });
    if (item) {
      item.qty++;
    } else {
      cart.push({ name: name, qty: 1 });
    }
    saveData("cart", cart);
    updateCartCount();

    cartBtn.textContent = "Added!";
    setTimeout(function () { cartBtn.textContent = "Add to Cart"; }, 1000);
  });

  // Wishlist heart
  const wishBtn = document.createElement("button");
  wishBtn.className = "wish-btn";
  card.appendChild(wishBtn);

  function drawHeart() {
    const inList = getData("wishlist").includes(name);
    wishBtn.textContent = inList ? "\u2665" : "\u2661";
    wishBtn.title = inList ? "Remove from wishlist" : "Add to wishlist";
  }

  wishBtn.addEventListener("click", function () {
    let list = getData("wishlist");
    if (list.includes(name)) {
      list = list.filter(function (n) { return n !== name; });
    } else {
      list.push(name);
    }
    saveData("wishlist", list);
    drawHeart();
  });

  drawHeart();
});

/* ============================================================
   1 & 2. Product search and category filter (products page)
   ============================================================ */
if (location.pathname.endsWith("products.html")) {
  const list = document.querySelector(".product-list");

  const bar = document.createElement("div");
  bar.id = "filter-bar";
  bar.innerHTML =
    '<input type="text" id="search" placeholder="Search products by name...">' +
    '<select id="category-select">' +
    '<option value="All">All Categories</option>' +
    '<option value="Electronics">Electronics</option>' +
    '<option value="Clothing">Clothing</option>' +
    '<option value="Accessories">Accessories</option>' +
    '</select>';
  list.before(bar);

  const noResult = document.createElement("p");
  noResult.id = "no-result";
  noResult.textContent = "No products found.";
  list.after(noResult);

  const searchBox = document.getElementById("search");
  const select = document.getElementById("category-select");

  function filterProducts() {
    const text = searchBox.value.toLowerCase().trim();
    const category = select.value;
    let shown = 0;

    document.querySelectorAll(".product").forEach(function (card) {
      const p = findProduct(card.querySelector("h3").textContent);
      const nameMatch = p.name.toLowerCase().includes(text);
      const catMatch = category === "All" || p.category === category;

      if (nameMatch && catMatch) {
        card.style.display = "";
        shown++;
      } else {
        card.style.display = "none";
      }
    });

    noResult.style.display = shown === 0 ? "block" : "none";
  }

  searchBox.addEventListener("input", filterProducts);
  select.addEventListener("change", filterProducts);

  // Open with a category selected when coming from the home page
  const wanted = new URLSearchParams(location.search).get("category");
  if (wanted) {
    select.value = wanted;
    filterProducts();
  }
}

// Home page category cards open the products page with that category
document.querySelectorAll(".category").forEach(function (link) {
  const cat = link.querySelector("h3").textContent;
  link.href = "products.html?category=" + cat;
});

/* ============================================================
   4. Cart management (cart page)
   ============================================================ */
const cartTable = document.querySelector(".cart-table");

if (cartTable) {
  const buyBtn = document.querySelector(".link-btn");

  const totalBox = document.createElement("p");
  totalBox.id = "total";
  buyBtn.before(totalBox);

  function showCart() {
    const cart = getData("cart");
    let total = 0;

    // remove old rows (keep the header row)
    while (cartTable.rows.length > 1) {
      cartTable.deleteRow(1);
    }

    if (cart.length === 0) {
      const row = cartTable.insertRow();
      row.innerHTML = '<td colspan="5">Your cart is empty.</td>';
    }

    cart.forEach(function (item, index) {
      const p = findProduct(item.name);
      const subtotal = p.price * item.qty;
      total += subtotal;

      const row = cartTable.insertRow();
      row.innerHTML =
        '<td><img src="' + p.image + '" alt="' + p.name + '">' + p.name + '</td>' +
        '<td>\u20B9' + p.price + '</td>' +
        '<td>' +
        '<button data-action="minus" data-index="' + index + '">-</button>' +
        '<span>' + item.qty + '</span>' +
        '<button data-action="plus" data-index="' + index + '">+</button>' +
        '</td>' +
        '<td>\u20B9' + subtotal + '</td>' +
        '<td><button data-action="remove" data-index="' + index + '">Remove</button></td>';
    });

    totalBox.textContent = "Total: \u20B9" + total;
    updateCartCount();
  }

  cartTable.addEventListener("click", function (e) {
    const action = e.target.dataset.action;
    if (!action) return;

    const cart = getData("cart");
    const index = Number(e.target.dataset.index);

    if (action === "plus") {
      cart[index].qty++;
    } else if (action === "minus" && cart[index].qty > 1) {
      cart[index].qty--;
    } else if (action === "remove") {
      cart.splice(index, 1);
    }

    saveData("cart", cart);
    showCart();
  });

  // Buy Now: needs items in the cart, then clears it
  buyBtn.addEventListener("click", function (e) {
    if (getData("cart").length === 0) {
      e.preventDefault();
      alert("Your cart is empty.");
    } else {
      localStorage.removeItem("cart");
    }
  });

  showCart();
}

updateCartCount();

/* ============================================================
   6. Contact form validation
   ============================================================ */
const form = document.getElementById("contact-form");

if (form) {
  const rules = [
    { id: "fullname", test: function (v) { return /^[A-Za-z ]{3,}$/.test(v); },
      msg: "Enter your full name (letters only, at least 3 characters)." },
    { id: "email", test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
      msg: "Enter a valid email address." },
    { id: "phone", test: function (v) { return /^[0-9]{10}$/.test(v); },
      msg: "Enter a 10-digit phone number." },
    { id: "subject", test: function (v) { return v.length >= 3; },
      msg: "Enter a subject (at least 3 characters)." },
    { id: "msg", test: function (v) { return v.length >= 10; },
      msg: "Message must be at least 10 characters." }
  ];

  const formMsg = document.createElement("p");
  formMsg.id = "form-msg";
  form.appendChild(formMsg);

  function clearErrors() {
    form.querySelectorAll(".error").forEach(function (el) { el.remove(); });
    formMsg.textContent = "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    let valid = true;

    rules.forEach(function (rule) {
      const field = document.getElementById(rule.id);
      if (!rule.test(field.value.trim())) {
        const err = document.createElement("span");
        err.className = "error";
        err.textContent = rule.msg;
        field.after(err);
        valid = false;
      }
    });

    if (valid) {
      formMsg.textContent = "Thank you! Your message has been sent successfully.";
      form.reset();
    }
  });

  form.addEventListener("reset", clearErrors);
}

/* ============================================================
   9. Back to top button
   ============================================================ */
const topBtn = document.createElement("button");
topBtn.id = "top-btn";
topBtn.innerHTML = "&#8593;";
topBtn.title = "Back to top";
document.body.appendChild(topBtn);

window.addEventListener("scroll", function () {
  topBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

topBtn.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================================================
   10. Image slider (home page)
   ============================================================ */
const hero = document.getElementById("hero");

if (hero) {
  const slides = [
    { img: "images/electronics.jpg",  text: "Electronics - Up to 40% off" },
    { img: "images/clothing.jpg",     text: "Clothing - New arrivals are here" },
    { img: "images/accessories.jpg",  text: "Accessories - Grab the best deals" }
  ];

  const slider = document.createElement("div");
  slider.id = "slider";
  slider.innerHTML =
    slides.map(function (s) {
      return '<div class="slide"><img src="' + s.img + '" alt="Promotion">' +
             '<p class="caption">' + s.text + '</p></div>';
    }).join("") +
    '<button class="slider-btn prev">&#10094;</button>' +
    '<button class="slider-btn next">&#10095;</button>';
  hero.after(slider);

  const slideEls = slider.querySelectorAll(".slide");
  let current = 0;

  function showSlide(n) {
    current = (n + slideEls.length) % slideEls.length;
    slideEls.forEach(function (s, i) {
      s.classList.toggle("active", i === current);
    });
  }

  slider.querySelector(".prev").addEventListener("click", function () { showSlide(current - 1); });
  slider.querySelector(".next").addEventListener("click", function () { showSlide(current + 1); });

  showSlide(0);
  setInterval(function () { showSlide(current + 1); }, 4000);
}
