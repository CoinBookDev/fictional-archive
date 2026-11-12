
/* =========================================
   FICTIONAL ARCHIVE - CHARACTER PROFILE
========================================= */

const parameters = new URLSearchParams(window.location.search);
const characterId = parameters.get("id");


/* =========================================
   LOAD CHARACTER
========================================= */

async function loadCharacter() {

    const characterName = document.getElementById("character-name");
    const characterDescription = document.getElementById("character-description");

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

        characterName.textContent =
            character.name || "-";

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
            "character-franchise": character.franchise || "-"
            "character-earth": character.earth || "-"

        };

        Object.entries(characterFields).forEach(([id, value]) => {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = value ?? "-";
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

                console.error(
                    "Could not load character image:",
                    character.image_url
                );

            };

        } else {

            characterImage.hidden = true;

        }


        /* =====================================
           LOAD CHARACTER VERSIONS
        ===================================== */

        const versionContainer =
            document.getElementById("characterVersions");

        const versionCount =
            document.getElementById("versionCount");

        const { data: versions, error: versionError } =
            await window.supabaseClient
                .from("character_versions")
                .select("*")
                .eq("character_id", character.id)
                .order("name");

        if (versionError) {

            versionContainer.textContent =
                "Could not load versions: " + versionError.message;

            console.error("VERSION ERROR:", versionError);

            return;
        }


        /* =====================================
           DISPLAY VERSION COUNT
        ===================================== */

        versionCount.textContent = versions.length;

        versionContainer.innerHTML = "";


        /* =====================================
           DISPLAY CHARACTER VERSIONS
        ===================================== */

        versions.forEach(version => {

            const entry = document.createElement("div");
            entry.className = "profile-list-item";


            const title = document.createElement("h3");

            title.textContent =
                version.name || "Unnamed version";


            const description = document.createElement("p");

            description.textContent =
                version.description || "No description available.";


            const status = document.createElement("span");

            status.textContent =
                (version.status || "Unknown").toUpperCase();


            entry.append(title, description, status);

            versionContainer.appendChild(entry);

        });


        /* =====================================
           EMPTY VERSIONS
        ===================================== */

        if (versions.length === 0) {

            versionContainer.textContent =
                "No character versions found.";

        }

    } catch (error) {

        console.error("CHARACTER PAGE ERROR:", error);

        characterName.textContent = "Something went wrong";

        characterDescription.textContent =
            "Unable to load character information.";

    }

}


/* =========================================
   INITIALIZE
========================================= */

loadCharacter();
