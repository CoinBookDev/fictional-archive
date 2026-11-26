
/* =========================================
   FICTIONAL ARCHIVE
   TIMELINE OVERVIEW
========================================= */

const timelineGrid = document.getElementById("timelineGrid");
const timelineTotal = document.getElementById("timelineTotal");
const timelineSearch = document.getElementById("timelineSearch");

let allTimelines = [];


/* =========================================
   LOAD TIMELINES
========================================= */

async function loadTimelines() {

    try {

        if (!window.TimelineEngine) {
            throw new Error("Timeline Engine unavailable.");
        }

        allTimelines = await TimelineEngine.getAllTimelines();

        timelineTotal.textContent = allTimelines.length;

        renderTimelines(allTimelines);

    } catch (error) {

        console.error("Timeline loading failed:", error);

        timelineGrid.innerHTML = `
            <div class="timeline-error">
                Unable to load timelines.
                <br>
                ${error.message}
            </div>
        `;

    }

}


/* =========================================
   RENDER TIMELINES
========================================= */

function renderTimelines(timelines) {

    if (!timelines.length) {

        timelineGrid.innerHTML = `
            <div class="timeline-empty">
                No timelines found.
            </div>
        `;

        return;
    }


    timelineGrid.innerHTML = timelines.map(timeline => {

        const name =
            timeline.name ||
            timeline.title ||
            timeline.slug;

        const description =
            timeline.description ||
            "Explore this fictional universe's chronology.";

        const category =
            timeline.category ||
            "FICTIONAL UNIVERSE";

        return `

            <a
                href="${encodeURIComponent(timeline.slug)}/index.html"
                class="timeline-card"
            >

                <div class="timeline-card-top">

                    <span class="timeline-card-category">
                        ${escapeHTML(category)}
                    </span>

                    <span class="timeline-card-status">
                        AVAILABLE
                    </span>

                </div>


                <div>

                    <h3>${escapeHTML(name)}</h3>

                    <p>${escapeHTML(description)}</p>

                </div>


                <div class="timeline-card-footer">

                    <span>Explore timeline</span>

                    <span class="timeline-card-arrow">→</span>

                </div>

            </a>

        `;

    }).join("");

}


/* =========================================
   SEARCH
========================================= */

timelineSearch.addEventListener("input", () => {

    const search = timelineSearch.value
        .trim()
        .toLowerCase();

    const filtered = allTimelines.filter(timeline => {

        const name =
            timeline.name ||
            timeline.title ||
            timeline.slug ||
            "";

        const description = timeline.description || "";

        return (
            name.toLowerCase().includes(search) ||
            description.toLowerCase().includes(search) ||
            (timeline.slug || "").toLowerCase().includes(search)
        );

    });

    renderTimelines(filtered);

});


/* =========================================
   HTML ESCAPING
========================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", loadTimelines);
