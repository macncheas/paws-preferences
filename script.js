const NUM_CATS = 15;
let currentIndex = 0;
let cards = [];
let liked = [];

/* ===============================
   LOAD CATS (Parallel for speed)
   =============================== */
async function loadCats() {
    const loading = document.getElementById("loading");
    const container = document.getElementById("card-container");
    const actions = document.getElementById("card-actions");

    loading.classList.remove("hidden");
    container.classList.add("hidden");
    actions.classList.add("hidden");

    const loadPromises = [];
    for (let i = 0; i < NUM_CATS; i++) {
        const url = `https://cataas.com/cat?width=400&height=400&${Math.random()}`;
        const img = new Image();
        img.src = url;
        cards.push(url);

        loadPromises.push(
            new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            })
        );
    }

    await Promise.all(loadPromises);

    loading.classList.add("hidden");
}

/* ===============================
   SHOW POPUP AFTER LOADING
   =============================== */
async function startAfterLoading() {
    await loadCats();
    document.getElementById("instruction-popup").classList.remove("hidden");
}

/* ===============================
   RENDER CARD
   =============================== */
function renderCard() {
    const container = document.getElementById("card-container");
    container.innerHTML = "";

    if (currentIndex >= cards.length) {
        showSummary();
        return;
    }

    const card = document.createElement("div");
    card.className = "card";
    card.style.backgroundImage = `url(${cards[currentIndex]})`;
    container.appendChild(card);

    let startX = 0;
    let currentX = 0;

    card.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
        card.style.transition = "";
    });

    card.addEventListener("touchmove", e => {
        currentX = e.touches[0].clientX - startX;
        card.style.transform = `translateX(${currentX}px) rotate(${currentX / 20}deg)`;
    });

    card.addEventListener("touchend", () => {
        if (currentX > 120) {
            liked.push(cards[currentIndex]);
            animateSwipe("right");
        } else if (currentX < -120) {
            animateSwipe("left");
        } else {
            card.style.transition = "transform 0.2s ease";
            card.style.transform = "translateX(0)";
        }
        currentX = 0;
    });
}

/* ===============================
   SWIPE ANIMATION
   =============================== */
function animateSwipe(direction) {
    const card = document.querySelector(".card");
    if (!card) return;

    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform =
        direction === "right"
            ? "translateX(300px) rotate(20deg)"
            : "translateX(-300px) rotate(-20deg)";
    card.style.opacity = "0";

    card.addEventListener(
        "transitionend",
        () => {
            nextCard();
        },
        { once: true }
    );
}

/* ===============================
   NEXT CARD
   =============================== */
function nextCard() {
    currentIndex++;
    renderCard();
}

/* ===============================
   SHOW SUMMARY
   =============================== */
function showSummary() {
    document.getElementById("card-container").classList.add("hidden");
    document.getElementById("card-actions").classList.add("hidden");
    document.getElementById("summary").classList.remove("hidden");

    document.body.classList.remove("no-scroll");

    document.getElementById("like-count").textContent = liked.length;

    const likedContainer = document.getElementById("liked-cats");
    likedContainer.innerHTML = "";

    liked.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        likedContainer.appendChild(img);
    });
}

/* ===============================
   DOM READY
   =============================== */
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("instruction-popup");
    const startBtn = document.getElementById("start-btn");

    startAfterLoading();

    startBtn.addEventListener("click", () => {
        popup.classList.add("hidden");

        document.getElementById("card-container").classList.remove("hidden");
        document.getElementById("card-actions").classList.remove("hidden");

        document.body.classList.add("no-scroll");

        renderCard(); // ensure first card shows
    });

    /* ACTION BUTTONS */
    document.getElementById("dislike-btn").addEventListener("click", () => {
        if (currentIndex < cards.length) animateSwipe("left");
    });

    document.getElementById("like-btn").addEventListener("click", () => {
        if (currentIndex < cards.length) {
            liked.push(cards[currentIndex]);
            animateSwipe("right");
        }
    });

    /* KEYBOARD SUPPORT */
    document.addEventListener("keydown", e => {
        if (currentIndex >= cards.length) return;

        if (e.key === "ArrowRight") {
            liked.push(cards[currentIndex]);
            animateSwipe("right");
        }
        if (e.key === "ArrowLeft") {
            animateSwipe("left");
        }
    });
});
