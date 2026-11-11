
/* =========================================
   FICTIONAL ARCHIVE - ADMIN NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const navigationButtons = document.querySelectorAll(
        ".admin-nav-item, .quick-access-item"
    );

    const sections = document.querySelectorAll(".admin-section");

    const breadcrumb = document.getElementById("admin-breadcrumb");


    // SECTION NAMES

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


    // OPEN A SECTION

    function openSection(sectionName) {

        // Check whether the requested section exists
        const targetSection = document.getElementById(
            `section-${sectionName}`
        );

        if (!targetSection) {
            console.error("Section not found:", sectionName);
            return;
        }


        // Hide all sections
        sections.forEach(section => {
            section.classList.remove("active");
            section.hidden = true;
        });


        // Show selected section
        targetSection.hidden = false;
        targetSection.classList.add("active");


        // Update active sidebar item
        document.querySelectorAll(".admin-nav-item").forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


        // Update breadcrumb
        if (breadcrumb) {
            breadcrumb.textContent =
                `ADMIN / ${sectionNames[sectionName] || sectionName.toUpperCase()}`;
        }

    }


    // NAVIGATION BUTTONS

    navigationButtons.forEach(button => {

        button.addEventListener("click", () => {

            const sectionName = button.dataset.section;

            if (sectionName) {
                openSection(sectionName);
            }

        });

    });


    // OPEN DASHBOARD ON INITIAL LOAD

    openSection("dashboard");


    // MAKE FUNCTION AVAILABLE FOR FUTURE FEATURES

    window.openAdminSection = openSection;

});
