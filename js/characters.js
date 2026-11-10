
const directory = document.getElementById("characterDirectory");
const searchInput = document.getElementById("characterSearch");
const characterCount = document.getElementById("characterCount");

let characters = [];

async function loadCharacters() {

    directory.innerHTML = "<p>Loading characters...</p>";

    try {

        const { data, error } = await window.supabaseClient
            .from("characters")
            .select("*")
            .order("name");
        console.log("CHARACTER DATA:", data);
        console.log("CHARACTER DATABASE ERROR:", error);

        if (error) {
            throw error;
        }

        directory.innerHTML = `
            <pre>${JSON.stringify({ data, error }, null, 2)}</pre>
`;

    } catch (error) {

        directory.innerHTML =
            `<p>DATABASE ERROR: ${error.message}</p>`;

        characterCount.textContent = "DATABASE ERROR";

        console.error("CHARACTER ERROR:", error);
    }
}

function renderCharacters() {

    const search = searchInput.value.toLowerCase();

    const filteredCharacters = characters.filter(character => {

        return (
            character.name.toLowerCase().includes(search) ||
            (character.species || "").toLowerCase().includes(search)
        );

    });

    characterCount.textContent =
        `${filteredCharacters.length} CHARACTERS FOUND`;

    directory.innerHTML = "";

    filteredCharacters.forEach(character => {

        const card = document.createElement("div");
        card.className = "directory-card";

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

    if (filteredCharacters.length === 0) {
        directory.innerHTML = "<p>No characters found.</p>";
    }
}

searchInput.addEventListener("input", renderCharacters);

loadCharacters();
