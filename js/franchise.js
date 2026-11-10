
const parameters = new URLSearchParams(window.location.search);

const franchiseId = Number(parameters.get("id"));

const franchise = franchises.find(
    item => item.id === franchiseId
);

if (!franchise) {

    document.getElementById("franchiseName").textContent =
        "Franchise not found";

    document.getElementById("franchiseDescription").textContent =
        "The requested franchise does not exist in the archive.";

} else {

    document.title = `${franchise.name} | Fictional Archive`;

    document.getElementById("franchiseName").textContent =
        franchise.name;

    document.getElementById("franchiseCode").textContent =
        `FRANCHISE PROFILE / ${franchise.abbreviation}`;

    document.getElementById("franchiseDescription").textContent =
        franchise.description;

    document.getElementById("franchiseOwner").textContent =
        `OWNER: ${franchise.owner}`;

    document.getElementById("franchiseMedium").textContent =
        `MEDIA: ${franchise.medium.join(", ")}`;

    document.getElementById("universeCount").textContent =
        franchise.universeIds.length;

    document.getElementById("mediumCount").textContent =
        franchise.medium.length;

    const universeContainer =
        document.getElementById("franchiseUniverses");

    const associatedUniverses = universes.filter(universe =>
        franchise.universeIds.includes(universe.id)
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
