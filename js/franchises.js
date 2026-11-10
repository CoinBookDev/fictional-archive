
const directory = document.getElementById("franchiseDirectory");
const searchInput = document.getElementById("franchiseSearch");
const franchiseCount = document.getElementById("franchiseCount");

function renderFranchises() {

    const search = searchInput.value.toLowerCase();

    const filteredFranchises = franchises.filter(franchise => {

        return (
            franchise.name.toLowerCase().includes(search) ||
            franchise.owner.toLowerCase().includes(search)
        );

    });

    franchiseCount.textContent =
        `${filteredFranchises.length} FRANCHISES FOUND`;

    directory.innerHTML = "";

    filteredFranchises.forEach(franchise => {

        const card = document.createElement("article");

        card.className = "directory-card";

        card.innerHTML = `
            <div class="card-type">
                FRANCHISE / ${franchise.abbreviation}
            </div>

            <h3>${franchise.name}</h3>

            <p>${franchise.description}</p>

            <div class="card-franchise">
                ${franchise.owner.toUpperCase()}
            </div>
        `;

        directory.appendChild(card);

    });

    if (filteredFranchises.length === 0) {

        directory.innerHTML = "<p>No franchises found.</p>";

    }

}

searchInput.addEventListener("input", renderFranchises);

renderFranchises();
