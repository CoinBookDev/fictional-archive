
const directory = document.getElementById("franchiseDirectory");
const searchInput = document.getElementById("franchiseSearch");
const franchiseCount = document.getElementById("franchiseCount");

let franchises = [];

async function loadFranchises() {

    directory.innerHTML = "<p>Loading franchises...</p>";

    try {

        const { data, error } = await supabase
            .from("franchises")
            .select("id, name, abbreviation, owner, description")
            .order("name");

        if (error) {
            throw error;
        }

        franchises = data;

        renderFranchises();

    } catch (error) {

        directory.innerHTML =
            `<p>DATABASE ERROR: ${error.message}</p>`;

        franchiseCount.textContent = "DATABASE ERROR";

        console.error("FRANCHISE ERROR:", error);

    }

}

function renderFranchises() {

    const search = searchInput.value.toLowerCase();

    const filteredFranchises = franchises.filter(franchise => {

        return (
            franchise.name.toLowerCase().includes(search) ||
            (franchise.owner || "").toLowerCase().includes(search)
        );

    });

    franchiseCount.textContent =
        `${filteredFranchises.length} FRANCHISES FOUND`;

    directory.innerHTML = "";

    filteredFranchises.forEach(franchise => {

        const card = document.createElement("a");

        card.className = "directory-card";
        card.href = `franchise.html?id=${franchise.id}`;

        const type = document.createElement("div");
        type.className = "card-type";
        type.textContent =
            `FRANCHISE / ${franchise.abbreviation || "N/A"}`;

        const title = document.createElement("h3");
        title.textContent = franchise.name;

        const description = document.createElement("p");
        description.textContent =
            franchise.description || "No description available.";

        const owner = document.createElement("div");
        owner.className = "card-franchise";
        owner.textContent =
            (franchise.owner || "UNKNOWN").toUpperCase();

        card.append(type, title, description, owner);

        directory.appendChild(card);

    });

    if (filteredFranchises.length === 0) {
        directory.innerHTML = "<p>No franchises found.</p>";
    }

}

searchInput.addEventListener("input", renderFranchises);

loadFranchises();
