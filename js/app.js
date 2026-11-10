
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

            const card = document.createElement("article");

            card.className = "directory-card";

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
