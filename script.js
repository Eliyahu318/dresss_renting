// ===== טעינת מוצרים ובניית כרטיסים =====
const grid = document.getElementById("products-grid");

async function loadProducts() {
  try {
    const res = await fetch("products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const items = await res.json();
    renderProducts(items);
  } catch (err) {
    console.error("שגיאה בטעינת המוצרים:", err);
    grid.innerHTML = `<div style="padding:16px">לא ניתן לטעון כרגע את המוצרים.</div>`;
  }
}

function renderProducts(items) {
  grid.innerHTML = items.map(toCardHTML).join("");
}

function toCardHTML(p) {
  const name  = p.name ?? "";
  const price = typeof p.price === "number" ? `₪${p.price}` : "";
  const size  = p.size ?? "";
  const image = p.image ?? "";

  // ⇣ עדכן כאן למספר הוואטסאפ שלך (בפורמט בינלאומי ללא +)
  const waText = encodeURIComponent(`שלום! אשמח לפרטים על "${name}" (מידה: ${size}, מחיר: ${price}).`);
  const waLink = `https://wa.me/972000000000?text=${waText}`;

  return `
    <article class="product-card">
      <img class="product-image"
           src="${image}" alt="${name}"
           loading="lazy" draggable="false" />
      <div class="product-content">
        <div class="product-name">${name}</div>
        <div class="product-meta">
          <span class="price">${price}</span>
          <span class="size">${size}</span>
        </div>
        <a class="whatsapp-btn"
           href="${waLink}" target="_blank" rel="noopener"
           aria-label="לפרטים נוספים על ${name} בוואטסאפ">
          פנייה בוואטסאפ
        </a>
      </div>
    </article>
  `;
}

loadProducts();

// ===== זום + פאן (עכבר + מגע) =====
let isPanning = false, startX = 0, startY = 0, transX = 0, transY = 0;
let activeImg = null;

// מניעת גרירת תמונה בדפדפן (חשוב לעכבר)
grid.addEventListener("dragstart", (e) => {
  if (e.target.matches(".product-image")) e.preventDefault();
});

// קליק על תמונה → כניסה/יציאה מזום
grid.addEventListener("click", (e) => {
  const img = e.target.closest(".product-image");
  if (!img) return;

  if (img.classList.contains("zoomed")) {
    resetZoom(img);
  } else {
    // סגירת זום קיים
    document.querySelectorAll(".product-image.zoomed").forEach(resetZoom);
    activeImg = img;
    img.classList.add("zoomed");
    transX = 0; transY = 0;
    setTransform(img, 2, transX, transY); // scale(2)
  }
});

// התחלת פאן
grid.addEventListener("pointerdown", (e) => {
  const img = e.target.closest(".product-image.zoomed");
  if (!img) return;
  e.preventDefault();
  isPanning = true;
  activeImg = img;
  startX = e.clientX - transX;
  startY = e.clientY - transY;
  img.setPointerCapture?.(e.pointerId);
});

// פאן תוך כדי גרירה
grid.addEventListener("pointermove", (e) => {
  if (!isPanning || !activeImg) return;
  e.preventDefault();
  transX = e.clientX - startX;
  transY = e.clientY - startY;
  setTransform(activeImg, 2, transX, transY);
});

// סיום פאן
function endPan() { isPanning = false; }
["pointerup","pointercancel","mouseleave"].forEach(evt=>{
  grid.addEventListener(evt, endPan);
});
document.addEventListener("pointerup", endPan);

// ESC יוצא מזום
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".product-image.zoomed").forEach(resetZoom);
  }
});

function setTransform(img, scale, x, y) {
  img.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
  img.style.transformOrigin = "center center";
}

function resetZoom(img) {
  img.classList.remove("zoomed");
  img.style.transform = "";
  if (activeImg === img) { activeImg = null; transX = transY = 0; }
}
