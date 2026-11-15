
/* =========================================
   FICTIONAL ARCHIVE - CHARACTER PROFILE
========================================= */

const parameters = new URLSearchParams(window.location.search);
const characterId = parameters.get("id");


/* =========================================
   HELPER FUNCTIONS
========================================= */

function displayValue(value) {

    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "-";
    }

    return value;

}


/* =========================================
   LOAD CHARACTER
========================================= */

async function loadCharacter() {

    const characterName = document.getElementById("character-name");
    const characterDescription = document.getElementById("character-description");

    if (characterId === null || characterId === "") {
        characterName.textContent = "Character not found";
        characterDescription.textContent = "No character ID was provided.";
        return;
    }

    try {

        /* =====================================
           FETCH CHARACTER
        ===================================== */

        const { data: character, error } = await window.supabaseClient
            .from("characters")
            .select("*")
            .eq("id", characterId)
            .single();

        if (error || !character) {

            characterName.textContent = "Character not found";

            characterDescription.textContent =
                error ? error.message : "This character does not exist.";

            console.error("CHARACTER ERROR:", error);

            return;
        }

        console.log("Character loaded:", character);

        document.title = `${character.name} | Fictional Archive`;


        /* =====================================
           CHARACTER HEADER
        ===================================== */

        characterName.textContent = character.name || "-";

        characterDescription.textContent =
            character.description || "No description available.";


        /* =====================================
           CHARACTER INFORMATION
        ===================================== */

        const characterFields = {

            "character-species": character.species,
            "character-first-appearance": character.first_appearence,
            "character-gender": character.Gender,
            "character-status": character.Status,
            "character-alias": character.Alias,
            "character-citizenship": character.Citizenship,
            "character-id": character.id,
            "character-franchise": character.franchise,
            "character-earth": character.earth

        };

        Object.entries(characterFields).forEach(([id, value]) => {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = displayValue(value);
            }

        });


        /* =====================================
           CHARACTER IMAGE
        ===================================== */

        const characterImage =
            document.getElementById("character-image");

        if (character.image_url) {

            characterImage.src = character.image_url;
            characterImage.hidden = false;

            characterImage.onerror = () => {
                characterImage.hidden = true;
            };

        } else {

            characterImage.hidden = true;

        }


        /* =====================================
           LOAD CHARACTER VERSIONS
        ===================================== */

        await loadCharacterVersions(character.id);


    } catch (error) {

        console.error("CHARACTER PAGE ERROR:", error);

        characterName.textContent = "Something went wrong";

        characterDescription.textContent =
            "Unable to load character information.";

    }

}


/* =========================================
   LOAD CHARACTER VERSIONS
========================================= */

async function loadCharacterVersions(characterId) {

    const versionContainer =
        document.getElementById("characterVersions");

    const versionCount =
        document.getElementById("versionCount");

    const { data: versions, error } = await window.supabaseClient
        .from("character_versions")
        .select("*")
        .eq("character_id", characterId)
        .order("name");

    if (error) {

        versionContainer.textContent =
            "Could not load versions: " + error.message;

        console.error("VERSION ERROR:", error);

        return;
    }


    /* =====================================
       VERSION COUNT
    ===================================== */

    versionCount.textContent = versions.length;

    versionContainer.innerHTML = "";


    /* =====================================
       EMPTY VERSIONS
    ===================================== */

    if (versions.length === 0) {

        versionContainer.textContent =
            "No character versions found.";

        return;
    }


    /* =====================================
       DISPLAY VERSIONS
    ===================================== */

    versions.forEach(version => {

        /* MAIN CARD */

        const card = document.createElement("article");

        card.className = "character-version-card";


        /* CARD HEADER BUTTON */

        const toggle = document.createElement("button");

        toggle.type = "button";
        toggle.className = "character-version-toggle";

        toggle.setAttribute("aria-expanded", "false");


        /* IMAGE */

        const imageWrapper = document.createElement("div");

        imageWrapper.className = "version-image-wrapper";

        if (version.image_url) {

            const image = document.createElement("img");

            image.src = version.image_url;
            image.alt = version.name || "Character version";
            image.loading = "lazy";

            image.onerror = () => {
                imageWrapper.classList.add("no-image");
                image.remove();
            };

            imageWrapper.appendChild(image);

        } else {

            imageWrapper.classList.add("no-image");

        }


        /* BASIC INFORMATION */

        const basicInfo = document.createElement("div");

        basicInfo.className = "version-basic-info";


        const name = document.createElement("h3");

        name.textContent = version.name || "Unnamed version";


        const universe = document.createElement("p");

        universe.className = "version-universe";

        universe.textContent =
            version.universe || "Unknown universe";


        const status = document.createElement("span");

        status.className = "version-status";

        status.textContent =
            version.status || "Unknown status";


        basicInfo.append(name, universe, status);


        /* CHEVRON */

        const arrow = document.createElement("span");

        arrow.className = "version-chevron";

        arrow.innerHTML = "&#9662;";

        arrow.setAttribute("aria-hidden", "true");


        toggle.append(imageWrapper, basicInfo, arrow);


        /* =====================================
           EXPANDED INFORMATION
        ===================================== */

        const details = document.createElement("div");

        details.className = "character-version-details";

        details.hidden = true;

        const detailsId = `version-details-${version.id}`;

        details.id = detailsId;

        toggle.setAttribute("aria-controls", detailsId);


        /* DESCRIPTION */

        if (version.description) {

            const description = document.createElement("p");

            description.className = "version-description";

            description.textContent = version.description;

            details.appendChild(description);

        }


        /* INFORMATION GRID */

        const infoGrid = document.createElement("div");

        infoGrid.className = "version-details-grid";


        const fields = [
            ["VERSION ID", version.id],
            ["GENDER", version.gender],
            ["FIRST APPEARANCE", version.first_appearence],
            ["ALIASES", version.aliases]
        ];


        fields.forEach(([label, value]) => {

            if (
                value === null ||
                value === undefined ||
                value === "" ||
                (Array.isArray(value) && value.length === 0)
            ) {
                return;
            }

            const item = document.createElement("div");

            item.className = "version-detail-item";


            const fieldLabel = document.createElement("span");

            fieldLabel.className = "info-label";

            fieldLabel.textContent = label;


            const fieldValue = document.createElement("span");

            fieldValue.className = "info-value";

            fieldValue.textContent = displayValue(value);


            item.append(fieldLabel, fieldValue);

            infoGrid.appendChild(item);

        });


        details.appendChild(infoGrid);


        /* =====================================
           TOGGLE CARD
        ===================================== */

        toggle.addEventListener("click", () => {

            const isExpanded =
                toggle.getAttribute("aria-expanded") === "true";

            toggle.setAttribute(
                "aria-expanded",
                String(!isExpanded)
            );

            details.hidden = isExpanded;

            card.classList.toggle("expanded", !isExpanded);

        });


        /* =====================================
           ADD TO PAGE
        ===================================== */

        card.append(toggle, details);

        versionContainer.appendChild(card);

    });

}


/* =========================================
   INITIALIZE
========================================= */

loadCharacter();
