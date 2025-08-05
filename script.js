document.addEventListener("DOMContentLoaded", function () {
  const phoneNumber = "972506718263";
  const grid = document.getElementById("products-grid");
  const searchInput = document.getElementById("search-input");
  const sizeFilter = document.getElementById("size-filter");
  const priceFilter = document.getElementById("price-filter");

  let allProducts = [];

  fetch("products.json")
    .then((res) => res.json())
    .then((data) => {
      allProducts = data;
      renderProducts(allProducts);
    });

  function renderProducts(products) {
    grid.innerHTML = "";
    products.forEach((p, index) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <div class="product-details">
            <span class="product-size">מידה: ${p.size}</span>
            <span class="product-price">₪${p.price}</span>
          </div>
          <a href="#" class="whatsapp-btn" data-product="${p.name}" data-image="${p.image}">
            <svg class="whatsapp-icon"><use href="#whatsapp-icon-symbol"></use></svg>
            לפרטים נוספים
          </a>
        </div>`;
      grid.appendChild(card);
      setTimeout(() => card.classList.add("show"), index * 100);
    });
  }

  function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();
    const sizeValue = sizeFilter.value;
    const priceValue = priceFilter.value;

    const filtered = allProducts.filter((p) => {
      const matchName = p.name.toLowerCase().includes(searchValue);
      const matchSize = sizeValue ? p.size.includes(sizeValue) : true;
      const matchPrice = priceValue
        ? (() => {
            const [min, max] = priceValue.split("-").map(Number);
            return p.price >= min && p.price <= max;
          })()
        : true;
      return matchName && matchSize && matchPrice;
    });

    renderProducts(filtered);
  }

  [searchInput, sizeFilter, priceFilter].forEach((el) =>
    el.addEventListener("input", applyFilters)
  );

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".whatsapp-btn");
    if (!btn) return;
    e.preventDefault();
    const name = btn.dataset.product;
    const img = btn.dataset.image;
    const message = `שלום! אני מעוניינ/ת בפרטים על "${name}".\n\nתמונה: ${img}\n\nתודה! 🌟`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  });
});

document.addEventListener("click", (e) => {
  const img = e.target.closest(".product-image");
  if (!img) return;

  // אם כבר בזום – נחזיר למצב רגיל
  if (img.classList.contains("zoomed")) {
    img.classList.remove("zoomed");
  } else {
    // נוודא שרק תמונה אחת תהיה בזום
    document.querySelectorAll(".product-image.zoomed").forEach(el => el.classList.remove("zoomed"));
    img.classList.add("zoomed");
  }
});
