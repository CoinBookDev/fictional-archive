
// UNIVERSE PROFILE

const parameters = new URLSearchParams(window.location.search);
const universeId = Number(parameters.get("id"));

const universe = universes.find(item => item.id === universeId);

if (!universe) {

    document.getElementById("universeName").textContent =
        "Universe not found";

    document.getElementById("universeDescription").textContent =
        "The requested universe does not exist in the archive.";

} else {

    // Basic information

    document.title = `${universe.name} | Fictional Archive`;

    document.getElementById("universeName").textContent =
        universe.name;

    document.getElementById("universeGenre").textContent =
        `UNIVERSE PROFILE / ${universe.genre.toUpperCase()}`;

    document.getElementById("universeDescription").textContent =
        universe.description;

    document.getElementById("universeFranchise").textContent =
        `FRANCHISE: ${universe.franchise}`;

    document.getElementById("universeType").textContent =
        `FORMAT: ${universe.type}`;

    document.getElementById("universeStatus").textContent =
        `STATUS: ${universe.status}`;

    // Statistics

    document.getElementById("continuityCount").textContent =
        universe.continuities.length;

    document.getElementById("realityCount").textContent =
        universe.realities.length;

    document.getElementById("mediaCount").textContent =
        universe.media.length;

    // Render lists

    function renderList(elementId, items) {

        const container = document.getElementById(elementId);

        items.forEach(item => {

            const entry = document.createElement("div");

            entry.className = "profile-list-item";
            entry.textContent = item;

            container.appendChild(entry);

        });

    }

    renderList("continuityList", universe.continuities);
    renderList("realityList", universe.realities);
    renderList("mediaList", universe.media);

}
