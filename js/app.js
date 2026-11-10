// FICTIONAL ARCHIVE
// Application logic

const dashboard = document.querySelector(".welcome").parentElement;
const universesPage = document.getElementById("universesPage");

const directory = document.getElementById("universeDirectory");
const searchInput = document.getElementById("universeSearch");
const genreFilter = document.getElementById("genreFilter");
const universeCount = document.getElementById("universeCount");

// Navigation

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();

        navItems.forEach(link => link.classList.remove("active"));
        item.classList.add("active");

        const selectedPage = item.textContent.trim();

        if (selectedPage === "Universes") {
            dashboard.querySelector(".welcome").hidden = true;
            dashboard.querySelector(".stats-grid").hidden = true;
            dashboard.querySelector(".section").hidden = true;

            universesPage.hidden = false;

            renderUniverses();
        } else if (selectedPage === "Overview") {
            dashboard.querySelector(".welcome").hidden = false;
            dashboard.querySelector(".stats-grid").hidden = false;
            dashboard.querySelector(".section").hidden = false;

            universesPage.hidden = true;
        }
    });
});

// Render universes

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

        const card = document.createElement("article");

        card.className = "directory-card";

        card.innerHTML = `
            <div class="card-type">${universe.genre.toUpperCase()}</div>

            <h3>${universe.name}</h3>

            <p>${universe.description}</p>

            <div class="card-franchise">
                ${universe.franchise.toUpperCase()} · ${universe.type.toUpperCase()}
            </div>
        `;

        directory.appendChild(card);
    });

    if (filteredUniverses.length === 0) {
        directory.innerHTML =
            "<p>No universes found.</p>";
    }
}

// Search and filters

searchInput.addEventListener("input", renderUniverses);
genreFilter.addEventListener("change", renderUniverses);
