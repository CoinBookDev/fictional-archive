
const parameters = new URLSearchParams(window.location.search);
const characterId = Number(parameters.get("id"));

async function loadCharacter() {

    const { data: character, error } = await window.supabaseClient
        .from("characters")
        .select("*")
        .eq("id", characterId)
        .single();

    if (error || !character) {

        document.getElementById("characterName").textContent =
            "Character not found";

        document.getElementById("characterDescription").textContent =
            error ? error.message : "This character does not exist.";

        return;
    }

    document.title = `${character.name} | Fictional Archive`;

    document.getElementById("characterName").textContent =
        character.name;

    document.getElementById("characterCode").textContent =
        `CHARACTER PROFILE / #${character.id}`;

    document.getElementById("characterDescription").textContent =
        character.description || "No description available.";

    const characterImage = document.getElementById("characterImage");
const imagePlaceholder = document.getElementById("characterImagePlaceholder");

if (character.image_url) {
    characterImage.src = character.image_url;
    characterImage.hidden = false;
    imagePlaceholder.hidden = true;
} else {
    imagePlaceholder.textContent =
        character.name.substring(0, 2).toUpperCase();
}
document.getElementById("characterSpecies").textContent =
    "DEBUG: " + JSON.stringify(character.species);

document.getElementById("characterFirstAppearance").textContent =
    "DEBUG: " + JSON.stringify(character.first_appearence);
    console.log("CHARACTER:", character);

document.getElementById("characterSpecies").textContent =
    JSON.stringify(character.species);

document.getElementById("characterFirstAppearance").textContent =
    JSON.stringify(character.first_appearence);

    const { data: versions, error: versionError } = await window.supabaseClient
        .from("character_versions")
        .select("*")
        .eq("character_id", character.id)
        .order("name");

    if (versionError) {
        document.getElementById("characterVersions").textContent =
            versionError.message;
        return;
    }

    document.getElementById("versionCount").textContent =
        versions.length;

    const versionContainer =
        document.getElementById("characterVersions");

    versionContainer.innerHTML = "";

    versions.forEach(version => {

        const entry = document.createElement("div");
        entry.className = "profile-list-item";

        const title = document.createElement("h3");
        title.textContent = version.name;

        const description = document.createElement("p");
        description.textContent =
            version.description || "No description available.";

        const status = document.createElement("span");
        status.textContent =
            (version.status || "Unknown").toUpperCase();

        entry.append(title, description, status);

        versionContainer.appendChild(entry);

    });

    if (versions.length === 0) {
        versionContainer.textContent =
            "No character versions found.";
    }
}

loadCharacter();
