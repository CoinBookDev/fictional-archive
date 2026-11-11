
/* =========================================
   FICTIONAL ARCHIVE - ADMIN PANEL
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       NAVIGATION
    ===================================== */

    const navigationButtons = document.querySelectorAll(
        ".admin-nav-item, .quick-access-item"
    );

    const sections = document.querySelectorAll(".admin-section");

    const breadcrumb = document.getElementById("admin-breadcrumb");

    const sectionNames = {
        dashboard: "DASHBOARD",
        franchises: "FRANCHISES",
        characters: "CHARACTERS",
        locations: "LOCATIONS",
        films: "FILMS",
        series: "SERIES",
        books: "COMICS & BOOKS",
        events: "EVENTS",
        universes: "ALTERNATE UNIVERSES"
    };


    function openSection(sectionName) {

        const targetSection = document.getElementById(
            `section-${sectionName}`
        );

        if (!targetSection) {
            console.error("Section not found:", sectionName);
            return;
        }

        sections.forEach(section => {
            section.classList.remove("active");
            section.hidden = true;
        });

        targetSection.hidden = false;
        targetSection.classList.add("active");

        document.querySelectorAll(".admin-nav-item").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );
        });

        if (breadcrumb) {
            breadcrumb.textContent =
                `ADMIN / ${sectionNames[sectionName]}`;
        }

        if (sectionName === "franchises") {
            loadFranchises();
        }
    }


    navigationButtons.forEach(button => {
        button.addEventListener("click", () => {
            openSection(button.dataset.section);
        });
    });


    /* =====================================
       SUPABASE
    ===================================== */

    if (typeof supabase === "undefined") {
        console.error("Supabase client not found.");
        return;
    }


    /* =====================================
       FRANCHISE MANAGEMENT
    ===================================== */

    async function loadFranchises() {

        const list = document.getElementById("franchise-list");
        const count = document.getElementById("franchise-count");

        list.textContent = "Loading franchises...";
        count.textContent = "LOADING...";

        const { data, error } = await supabase
            .from("franchises")
            .select("*")
            .order("name");

        if (error) {
            console.error("Franchise loading error:", error);

            list.textContent = "Could not load franchises: " + error.message;
            count.textContent = "ERROR";

            return;
        }

        count.textContent = `${data.length} RECORDS`;

        if (data.length === 0) {
            list.textContent = "No franchises found.";
            return;
        }

        list.innerHTML = "";

        data.forEach(franchise => {

            const row = document.createElement("div");
            row.className = "admin-franchise-row";

            const information = document.createElement("div");
            information.className = "franchise-information";

            const name = document.createElement("strong");
            name.textContent = franchise.name;

            const details = document.createElement("small");

            details.textContent =
                `${franchise.abbreviation || "NO ABBREVIATION"} · ` +
                `${franchise.owner || "UNKNOWN OWNER"}`;

            information.appendChild(name);
            information.appendChild(details);

            const actions = document.createElement("div");
            actions.className = "franchise-actions";

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "admin-edit-button";

            editButton.addEventListener("click", () => {
                openFranchiseForm(franchise);
            });

            actions.appendChild(editButton);

            row.appendChild(information);
            row.appendChild(actions);

            list.appendChild(row);

        });

        // Update dashboard statistics
        const franchiseStat = document.getElementById("stat-franchises");

        if (franchiseStat) {
            franchiseStat.textContent = data.length;
        }

    }


    /* =====================================
       FRANCHISE FORM
       Add/Edit interface
    ===================================== */

    function openFranchiseForm(franchise = null) {

        const isEditing = franchise !== null;

        const modal = document.createElement("div");
        modal.className = "admin-modal";

        modal.innerHTML = `
            <div class="admin-modal-content">

                <div class="admin-modal-header">
                    <h2>${isEditing ? "Edit Franchise" : "Add Franchise"}</h2>
                    <button class="admin-close-button" type="button">
                        ×
                    </button>
                </div>

                <form id="franchise-form">

                    <label>Name</label>
                    <input type="text" name="name" required>

                    <label>Abbreviation</label>
                    <input type="text" name="abbreviation">

                    <label>Owner</label>
                    <input type="text" name="owner">

                    <label>Description</label>
                    <textarea name="description" rows="5"></textarea>

                    <label>Medium (comma-separated)</label>
                    <input type="text" name="medium">

                    <div class="admin-form-actions">
                        <button type="button" class="admin-cancel-button">
                            Cancel
                        </button>

                        <button type="submit" class="admin-save-button">
                            ${isEditing ? "Save Changes" : "Add Franchise"}
                        </button>
                    </div>

                </form>

            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector("#franchise-form");

        if (isEditing) {

            form.elements.name.value = franchise.name || "";
            form.elements.abbreviation.value = franchise.abbreviation || "";
            form.elements.owner.value = franchise.owner || "";
            form.elements.description.value = franchise.description || "";

            form.elements.medium.value =
                (franchise.medium || []).join(", ");

        }

        function closeModal() {
            modal.remove();
        }

        modal.querySelector(".admin-close-button")
            .addEventListener("click", closeModal);

        modal.querySelector(".admin-cancel-button")
            .addEventListener("click", closeModal);


        form.addEventListener("submit", async event => {

            event.preventDefault();

            const formData = new FormData(form);

            const franchiseData = {
                name: formData.get("name").trim(),
                abbreviation: formData.get("abbreviation").trim() || null,
                owner: formData.get("owner").trim() || null,
                description: formData.get("description").trim() || null,
                medium: formData.get("medium")
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean)
            };

            const saveButton = form.querySelector(".admin-save-button");

            saveButton.disabled = true;
            saveButton.textContent = "Saving...";

            let result;

            if (isEditing) {

                result = await supabase
                    .from("franchises")
                    .update(franchiseData)
                    .eq("id", franchise.id);

            } else {

                result = await supabase
                    .from("franchises")
                    .insert([franchiseData]);

            }

            if (result.error) {

                console.error("Franchise save error:", result.error);

                alert("Could not save franchise: " + result.error.message);

                saveButton.disabled = false;
                saveButton.textContent = isEditing
                    ? "Save Changes"
                    : "Add Franchise";

                return;
            }

            closeModal();
            await loadFranchises();

        });

    }


    /* =====================================
       ADD FRANCHISE BUTTON
    ===================================== */

    const addFranchiseButton =
        document.getElementById("add-franchise");

    if (addFranchiseButton) {
        addFranchiseButton.addEventListener("click", () => {
            openFranchiseForm();
        });
    }


    /* =====================================
       INITIALIZATION
    ===================================== */

    openSection("dashboard");

    window.openAdminSection = openSection;

});
