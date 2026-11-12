
const parameters = new URLSearchParams(window.location.search);
const characterId = parameters.get("id");

async function loadCharacter() {

    /* =========================================
       LOAD CHARACTER
    ========================================= */

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

    console.log("CHARACTER:", character); 
    console.log("CHARACTER ID:", character.id);

console.log("FIRST APPEARANCE:", character.first_appearence);
console.log("ALL COLUMN NAMES:", Object.keys(character));

console.log("IMAGE URL:", character.image_url);
console.log("IMAGE:", character);

    document.title = `${character.name} | Fictional Archive`;


    /* =========================================
       CHARACTER HEADER
    ========================================= */

    document.getElementById("character-name").textContent =
        character.name || "-";

    document.getElementById("character-description").textContent =
        character.description || "No description available.";

    document.getElementById("character-species").textContent =
        character.species || "-";

    document.getElementById("character-first-appearence").textContent =
        character.first_appearence || "-";
 document.getElementById("character-id").textContent =
        character.id || "---";

/* CHARACTER DETAILS */

function setCharacterField(ids, value) {

    const element = ids
        .map(id => document.getElementById(id))
        .find(element => element !== null);

    if (element) {
        element.textContent = value || "-";
    } else {
        console.warn("Missing HTML element:", ids);
    }

}

setCharacterField(
    ["character-alias", "characterAlias"],
    character.Alias
);

setCharacterField(
    ["character-status", "CharacterStatus", "characterStatus"],
    character.Status
);

setCharacterField(
    ["character-gender", "characterGender"],
    character.Gender
);

setCharacterField(
    ["character-citizenship", "characterCitizenship"],
    character.Citizenship
);


    /* =========================================
       CHARACTER IMAGE
    ========================================= */

    const characterImage =
        document.getElementById("character-image");

    if (character.image_url) {

        characterImage.src = character.image_url;
        characterImage.hidden = false;

    } else {

        characterImage.hidden = true;

    }


    /* =========================================
       LOAD CHARACTER VERSIONS
    ========================================= */

    const { data: versions, error: versionError } =
        await window.supabaseClient
            .from("character_versions")
            .select("*")
            .eq("character_id", character.id)
            .order("name");

    const versionContainer =
        document.getElementById("characterVersions");

    if (versionError) {

        versionContainer.textContent =
            "Could not load versions: " + versionError.message;

        console.error("VERSION ERROR:", versionError);

        return;
    }

    document.getElementById("versionCount").textContent =
        versions.length;

    versionContainer.innerHTML = "";


    /* =========================================
       DISPLAY VERSIONS
    ========================================= */

    versions.forEach(version => {

        const entry = document.createElement("div");
        entry.className = "profile-list-item";

        const title = document.createElement("h3");
        title.textContent = version.name || "Unnamed version";

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
