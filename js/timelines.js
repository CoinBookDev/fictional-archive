
/* =========================================
   FICTIONAL ARCHIVE
   TIMELINE ENGINE
========================================= */


/* =========================================
   SAMPLE TIMELINE DATABASE
========================================= */

const timelineData = [

    {
        id: "mcu-001",
        title: "Captain America: The First Avenger",
        type: "film",
        year: 1943,
        endYear: 1945,
        releaseYear: 2011,
        franchise: "Captain America",
        description:
            "Steve Rogers becomes Captain America during World War II. His involvement in the conflict against HYDRA and the Red Skull establishes the origins of one of the MCU's most important heroes."
    },

    {
        id: "mcu-002",
        title: "Captain Marvel",
        type: "film",
        year: 1995,
        releaseYear: 2019,
        franchise: "Captain Marvel",
        description:
            "Carol Danvers discovers her true identity and becomes Captain Marvel. The events introduce the Skrull conflict and establish important connections to the wider cosmic history of the MCU."
    },

    {
        id: "mcu-003",
        title: "Iron Man",
        type: "film",
        year: 2010,
        releaseYear: 2008,
        franchise: "Iron Man",
        description:
            "Tony Stark builds his first Iron Man suit after being captured. His return marks the beginning of his transformation into a superhero and the emergence of a new era."
    },

    {
        id: "mcu-004",
        title: "Iron Man 2",
        type: "film",
        year: 2011,
        releaseYear: 2010,
        franchise: "Iron Man",
        description:
            "Tony Stark faces the consequences of revealing his identity as Iron Man. The story introduces Natasha Romanoff and expands the early Avengers initiative."
    },

    {
        id: "mcu-005",
        title: "Thor",
        type: "film",
        year: 2011,
        releaseYear: 2011,
        franchise: "Thor",
        description:
            "Thor is banished to Earth by Odin. His journey introduces Asgard, the Nine Realms and the conflict surrounding the royal family."
    },

    {
        id: "mcu-006",
        title: "The Avengers",
        type: "film",
        year: 2012,
        releaseYear: 2012,
        franchise: "Avengers",
        description:
            "Earth's first generation of Avengers assemble to stop Loki and the Chitauri invasion of New York. The Battle of New York changes the world permanently."
    },

    {
        id: "mcu-007",
        title: "Guardians of the Galaxy",
        type: "film",
        year: 2014,
        releaseYear: 2014,
        franchise: "Guardians of the Galaxy",
        description:
            "A group of unlikely individuals unite after discovering the Orb, an Infinity Stone. Their actions introduce the wider cosmic side of the MCU."
    },

    {
        id: "mcu-008",
        title: "Avengers: Age of Ultron",
        type: "film",
        year: 2015,
        releaseYear: 2015,
        franchise: "Avengers",
        description:
            "The Avengers face Ultron, an artificial intelligence created by Tony Stark and Bruce Banner. The conflict leads to the creation of Vision and the destruction of Sokovia."
    },

    {
        id: "mcu-009",
        title: "Captain America: Civil War",
        type: "film",
        year: 2016,
        releaseYear: 2016,
        franchise: "Captain America",
        description:
            "Political pressure divides the Avengers. Steve Rogers and Tony Stark find themselves on opposing sides of the Sokovia Accords."
    },

    {
        id: "mcu-010",
        title: "Doctor Strange",
        type: "film",
        year: 2016,
        releaseYear: 2016,
        franchise: "Doctor Strange",
        description:
            "Stephen Strange discovers the mystic arts and becomes involved in the protection of Earth from supernatural threats."
    },

    {
        id: "mcu-011",
        title: "Avengers: Infinity War",
        type: "film",
        year: 2018,
        releaseYear: 2018,
        franchise: "Avengers",
        description:
            "Thanos begins his campaign to collect all six Infinity Stones. Heroes across the universe attempt to prevent the destruction of half of all life."
    },

    {
        id: "mcu-012",
        title: "The Blip",
        type: "event",
        year: 2018,
        releaseYear: 2018,
        franchise: "Avengers",
        description:
            "Thanos uses the completed Infinity Gauntlet to eliminate half of all life in the universe. The event fundamentally changes the course of countless civilizations."
    },

    {
        id: "mcu-013",
        title: "Avengers: Endgame",
        type: "film",
        year: 2023,
        releaseYear: 2019,
        franchise: "Avengers",
        description:
            "Five years after the Blip, the surviving Avengers attempt to reverse Thanos' actions. Their mission culminates in the Battle of Earth."
    },

    {
        id: "mcu-014",
        title: "WandaVision",
        type: "series",
        year: 2023,
        releaseYear: 2021,
        franchise: "WandaVision",
        description:
            "Wanda Maximoff creates an unusual reality surrounding the town of Westview. The events explore her grief and the development of her powers."
    },

    {
        id: "mcu-015",
        title: "Loki",
        type: "series",
        year: 2012,
        releaseYear: 2021,
        franchise: "Loki",
        description:
            "An alternate version of Loki is taken into custody by the Time Variance Authority. His journey introduces the wider multiverse and the mechanics of branching timelines."
    }

];


/* =========================================
   ELEMENTS
========================================= */

const timelineEvents = document.getElementById("timelineEvents");
const timelineViewport = document.getElementById("timelineViewport");
const timelineCanvas = document.getElementById("timelineCanvas");

const timelineCount = document.getElementById("timelineCount");

const intelligencePanel =
    document.getElementById("intelligencePanel");

const panelOverlay =
    document.getElementById("panelOverlay");

const panelContent =
    document.getElementById("panelContent");

const closePanelButton =
    document.getElementById("closePanel");

const zoomLabel =
    document.getElementById("zoomLabel");


/* =========================================
   STATE
========================================= */

let currentOrder = "chronological";
let currentFilter = "all";
let currentZoom = 1;

let selectedEvent = null;


/* =========================================
   SORTING
========================================= */

function getSortedEvents() {

    const events = [...timelineData];

    if (currentOrder === "chronological") {

        events.sort((a, b) =>
            a.year - b.year ||
            a.title.localeCompare(b.title)
        );

    } else {

        events.sort((a, b) =>
            a.releaseYear - b.releaseYear ||
            a.title.localeCompare(b.title)
        );

    }

    return events;
}


/* =========================================
   FILTERING
========================================= */

function getFilteredEvents() {

    const events = getSortedEvents();

    if (currentFilter === "all") {
        return events;
    }

    return events.filter(event => {

        if (currentFilter === "event") {
            return event.type === "event";
        }

        return event.type === currentFilter;

    });

}


/* =========================================
   FORMAT DATE
========================================= */

function formatYear(year) {
    return year + " CE";
}


/* =========================================
   CREATE TIMELINE NODE
========================================= */

function createTimelineEvent(event, index) {

    const position = index % 2 === 0 ? "above" : "below";

    const element = document.createElement("article");

    element.className =
        `timeline-event ${position}`;

    element.dataset.id = event.id;

    let typeLabel = "FEATURE FILM";

    if (event.type === "series") {
        typeLabel = "TELEVISION SERIES";
    }

    if (event.type === "event") {
        typeLabel = "MAJOR EVENT";
    }

    const nodeClass =
        event.type === "series"
            ? "series-node"
            : event.type === "event"
                ? "event-node-major"
                : "";

    element.innerHTML = `

        <div class="event-connector"></div>

        <div class="event-node ${nodeClass}"></div>

        <button class="event-card event-type-${event.type}"
                type="button"
                aria-label="Explore ${event.title}">

            <div class="event-type">
                ${typeLabel}
            </div>

            <h3>${event.title}</h3>

            <div class="event-date">
                ${formatYear(event.year)}
            </div>

            <div class="event-franchise">
                ${event.franchise.toUpperCase()}
            </div>

        </button>

        <div class="event-year">
            ${event.year}
        </div>

    `;

    const card = element.querySelector(".event-card");

    card.addEventListener("click", () => {
        openEvent(event.id);
    });

    return element;

}


/* =========================================
   RENDER TIMELINE
========================================= */

function renderTimeline() {

    const events = getFilteredEvents();

    timelineEvents.innerHTML = "";

    events.forEach((event, index) => {

        const element = createTimelineEvent(event, index);

        timelineEvents.appendChild(element);

    });

    timelineCount.textContent =
        `${events.length} RECORDS`;

    if (selectedEvent &&
        !events.some(event => event.id === selectedEvent)) {

        closePanel();

    }

    if (selectedEvent) {

        const selectedNode = document.querySelector(
            `.timeline-event[data-id="${selectedEvent}"]`
        );

        if (selectedNode) {
            selectedNode.classList.add("selected");
        }

    }

}


/* =========================================
   OPEN INTELLIGENCE PANEL
========================================= */

function openEvent(id) {

    const event = timelineData.find(item => item.id === id);

    if (!event) return;

    selectedEvent = id;

    document.querySelectorAll(".timeline-event").forEach(node => {
        node.classList.remove("selected");
    });

    const selectedNode = document.querySelector(
        `.timeline-event[data-id="${id}"]`
    );

    if (selectedNode) {
        selectedNode.classList.add("selected");
    }

    const typeLabels = {
        film: "FEATURE FILM",
        series: "TELEVISION SERIES",
        event: "MAJOR HISTORICAL EVENT"
    };

    panelContent.innerHTML = `

        <div class="panel-category">
            ${typeLabels[event.type]}
        </div>

        <h2 class="panel-title">
            ${event.title}
        </h2>

        <div class="panel-date">
            ${formatYear(event.year)}
        </div>

        <hr class="panel-divider">

        <div class="panel-section-label">
            HISTORICAL OVERVIEW
        </div>

        <p class="panel-description">
            ${event.description}
        </p>

        <div class="panel-meta">

            <div class="panel-meta-item">
                <span>ARCHIVE ID</span>
                <strong>${event.id.toUpperCase()}</strong>
            </div>

            <div class="panel-meta-item">
                <span>FRANCHISE</span>
                <strong>${event.franchise}</strong>
            </div>

            <div class="panel-meta-item">
                <span>CHRONOLOGICAL DATE</span>
                <strong>${event.year}</strong>
            </div>

            <div class="panel-meta-item">
                <span>RELEASE YEAR</span>
                <strong>${event.releaseYear}</strong>
            </div>

        </div>

        <hr class="panel-divider">

        <div class="panel-section-label">
            DATABASE RELATIONSHIPS
        </div>

        <p class="panel-description">
            Additional character, location and event relationships
            will become available when this timeline is connected
            to the Fictional Archive database.
        </p>

    `;

    intelligencePanel.classList.add("open");
    panelOverlay.classList.add("open");

}


/* =========================================
   CLOSE PANEL
========================================= */

function closePanel() {

    intelligencePanel.classList.remove("open");
    panelOverlay.classList.remove("open");

    document.querySelectorAll(".timeline-event").forEach(node => {
        node.classList.remove("selected");
    });

    selectedEvent = null;

}


closePanelButton.addEventListener("click", closePanel);

panelOverlay.addEventListener("click", closePanel);

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closePanel();
    }

});


/* =========================================
   ORDER SWITCH
========================================= */

document.querySelectorAll(".view-button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".view-button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentOrder = button.dataset.order;

        closePanel();

        renderTimeline();

        timelineViewport.scrollLeft = 0;

    });

});


/* =========================================
   FILTER SWITCH
========================================= */

document.querySelectorAll(".filter-button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-button").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        closePanel();

        renderTimeline();

        timelineViewport.scrollLeft = 0;

    });

});


/* =========================================
   ZOOM SYSTEM
========================================= */

function updateZoom() {

    timelineCanvas.style.transform =
        `scale(${currentZoom})`;

    zoomLabel.textContent =
        `${Math.round(currentZoom * 100)}%`;

}


document.getElementById("zoomIn").addEventListener("click", () => {

    currentZoom = Math.min(1.5, currentZoom + 0.1);

    updateZoom();

});


document.getElementById("zoomOut").addEventListener("click", () => {

    currentZoom = Math.max(0.7, currentZoom - 0.1);

    updateZoom();

});


/* =========================================
   INITIALISE
========================================= */

renderTimeline();

updateZoom();

