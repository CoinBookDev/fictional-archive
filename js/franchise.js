
const parameters = new URLSearchParams(window.location.search);
const franchiseId = Number(parameters.get("id"));

async function loadFranchise() {

    const { data: franchise, error } = await window.supabaseClient
        .from("franchises")
        .select("*")
        .eq("id", franchiseId)
        .single();

    if (error || !franchise) {

        document.getElementById("franchiseName").textContent =
            "Franchise not found";

        document.getElementById("franchiseDescription").textContent =
            error ? error.message :
            "The requested franchise does not exist.";

        return;
    }

    document.title = `${franchise.name} | Fictional Archive`;

    document.getElementById("franchiseName").textContent =
        franchise.name;

    document.getElementById("franchiseCode").textContent =
        `FRANCHISE PROFILE / ${franchise.abbreviation || "N/A"}`;

    document.getElementById("franchiseDescription").textContent =
        franchise.description || "No description available.";

    document.getElementById("franchiseOwner").textContent =
        `OWNER: ${franchise.owner || "Unknown"}`;

    document.getElementById("franchiseMedium").textContent =
        `MEDIA: ${franchise.medium.join(", ") || "Not specified"}`;

    document.getElementById("universeCount").textContent =
        franchise.universe_ids.length;

    document.getElementById("mediumCount").textContent =
        franchise.medium.length;

    const universeContainer =
        document.getElementById("franchiseUniverses");

    universeContainer.innerHTML = "";

    const associatedUniverses = universes.filter(universe =>
        franchise.universe_ids.includes(universe.id)
    );

    associatedUniverses.forEach(universe => {

        const entry = document.createElement("a");

        entry.className = "profile-list-item";
        entry.href = `universe.html?id=${universe.id}`;
        entry.textContent = universe.name;

        universeContainer.appendChild(entry);

    });

    if (associatedUniverses.length === 0) {

        universeContainer.textContent =
            "No associated universes found.";

    }
}

loadFranchise();
