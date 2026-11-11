/* =========================================
   CHARACTER DIRECTORY
========================================= */

const directory = document.getElementById("characterDirectory");
const searchInput = document.getElementById("characterSearch");
const characterCount = document.getElementById("characterCount");
const pagination = document.getElementById("characterPagination");

let currentPage = 1;
const pageSize = 50;
let searchTerm = "";


/* =========================================
   LOAD CHARACTERS
========================================= */

async function loadCharacters() {

    directory.innerHTML = "<p>Loading characters...</p>";
    pagination.innerHTML = "";

    try {

        let query = window.supabaseClient
            .from("characters")
            .select("*", { count: "exact" });

        // Search by name or alias
        if (searchTerm) {

            const safeSearch = searchTerm
                .replace(/[,%()\\]/g, " ")
                .trim();

            if (safeSearch) {
                query = query.or(
                    `name.ilike.%${safeSearch}%,Alias.ilike.%${safeSearch}%`
                );
            }
        }

        // Alphabetical sorting and pagination
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await query
            .order("name", { ascending: true })
            .range(from, to);

        if (error) {
            throw error;
        }

        characterCount.textContent =
            `${count} CHARACTERS FOUND`;

        renderCharacters(data);

        renderPagination(count);

    } catch (error) {

        directory.innerHTML =
            `<p>DATABASE ERROR: ${error.message}</p>`;

        characterCount.textContent = "DATABASE ERROR";

        console.error("CHARACTER ERROR:", error);
    }
}


/* =========================================
   RENDER CHARACTERS
========================================= */

function renderCharacters(characters) {

    directory.innerHTML = "";

    if (!characters || characters.length === 0) {
        directory.innerHTML = "<p>No characters found.</p>";
        return;
    }

    characters.forEach(character => {

        const card = document.createElement("div");
        card.className = "directory-card";
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            window.location.href =
                `character.html?id=${character.id}`;
        });

        const type = document.createElement("div");
        type.className = "card-type";
        type.textContent = "CHARACTER";

        const title = document.createElement("h3");
        title.textContent = character.name;

        const description = document.createElement("p");
        description.textContent =
            character.description || "No description available.";

        const species = document.createElement("div");
        species.className = "card-franchise";
        species.textContent =
            (character.species || "UNKNOWN").toUpperCase();

        card.append(type, title, description, species);

        directory.appendChild(card);

    });
}


/* =========================================
   PAGINATION
========================================= */

function renderPagination(totalCharacters) {

    pagination.innerHTML = "";

    const totalPages = Math.ceil(totalCharacters / pageSize);

    if (totalPages <= 1) {
        return;
    }

    function createButton(label, page, disabled = false, active = false) {

        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.className = "directory-page-button";

        if (active) {
            button.classList.add("active");
        }

        button.disabled = disabled;

        button.addEventListener("click", () => {

            currentPage = page;
            loadCharacters();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        pagination.appendChild(button);
    }

    // Previous button
    createButton(
        "Previous",
        currentPage - 1,
        currentPage === 1
    );

    // Numbered buttons
    for (let page = 1; page <= totalPages; page++) {

        createButton(
            page,
            page,
            false,
            page === currentPage
        );

    }

    // Next button
    createButton(
        "Next",
        currentPage + 1,
        currentPage === totalPages
    );
}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener("input", () => {

    searchTerm = searchInput.value.trim();

    // Always return to first page after searching
    currentPage = 1;

    loadCharacters();

});


/* =========================================
   INITIAL LOAD
========================================= */

loadCharacters();
