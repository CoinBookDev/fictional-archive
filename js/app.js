
const directory = document.getElementById("universeDirectory");

if (directory) {

    const searchInput = document.getElementById("universeSearch");
    const genreFilter = document.getElementById("genreFilter");
    const universeCount = document.getElementById("universeCount");

    function renderUniverses() {

        const search = searchInput.value.toLowerCase();
        const genre = genreFilter.value;

        const filteredUniverses = universes.filter(universe => {

            const matchesSearch =
                universe.name.toLowerCase().includes(search) ||
                universe.franchise.toLowerCase().includes(search);

            const matchesGenre =
                genre === "all" || universe.genre === genre;

            return matchesSearch && matchesGenre;
        });

        universeCount.textContent =
            `${filteredUniverses.length} UNIVERSES FOUND`;

        directory.innerHTML = "";

        
filteredUniverses.forEach(universe => {

    const card = document.createElement("a");

    card.className = "directory-card";

    card.href = `universe.html?id=${universe.id}`;

    card.innerHTML = `
        <div class="card-type">
            ${universe.genre.toUpperCase()}
        </div>

        <h3>${universe.name}</h3>

        <p>${universe.description}</p>

        <div class="card-franchise">
            ${universe.franchise.toUpperCase()}
            ·
            ${universe.type.toUpperCase()}
        </div>
    `;

    directory.appendChild(card);
});

        if (filteredUniverses.length === 0) {
            directory.innerHTML = "<p>No universes found.</p>";
        }
    }

    searchInput.addEventListener("input", renderUniverses);
    genreFilter.addEventListener("change", renderUniverses);

    renderUniverses();
}

/* =========================================
   MOBILE SIDEBAR
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("site-sidebar");
    const toggle = document.getElementById("mobile-menu-toggle");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (!sidebar || !toggle || !backdrop) return;

    function openSidebar() {
        sidebar.classList.add("open");
        backdrop.classList.add("visible");

        document.body.classList.add("menu-open");

        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation");
        toggle.textContent = "×";
    }

    function closeSidebar() {
        sidebar.classList.remove("open");
        backdrop.classList.remove("visible");

        document.body.classList.remove("menu-open");

        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        toggle.textContent = "☰";
    }

    toggle.addEventListener("click", () => {

        if (sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }

    });

    backdrop.addEventListener("click", closeSidebar);

    sidebar.querySelectorAll(".nav-item").forEach(link => {
        link.addEventListener("click", closeSidebar);
    });

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeSidebar();
        }

    });

    window.addEventListener("resize", () => {

        if (window.innerWidth > 800) {
            closeSidebar();
        }

    });

});
