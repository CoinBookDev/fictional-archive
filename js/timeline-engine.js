
/* =========================================
   FICTIONAL ARCHIVE
   SHARED TIMELINE ENGINE
========================================= */


/* =========================================
   DATABASE ACCESS
========================================= */

window.TimelineEngine = {

    async getTimeline(slug) {

        if (!window.supabaseClient) {
            throw new Error("Supabase client unavailable.");
        }

        const { data, error } = await window.supabaseClient
            .from("timelines")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error(`Timeline "${slug}" not found.`);
        }

        return data;
    },


    async getEvents(timelineId) {

        if (!window.supabaseClient) {
            throw new Error("Supabase client unavailable.");
        }

        const { data, error } = await window.supabaseClient
            .from("timeline_events")
            .select("*")
            .eq("timeline_id", timelineId);

        if (error) {
            throw error;
        }

        return data || [];
    },


    /* =====================================
       LOAD TIMELINE
    ===================================== */

    async load(slug) {

        const timeline = await this.getTimeline(slug);

        const events = await this.getEvents(timeline.id);

        return {
            timeline,
            events: events.map(event => this.normalizeEvent(event))
        };
    },


    /* =====================================
       NORMALISE EVENT DATA
    ===================================== */

    normalizeEvent(event) {

        const chronologySort = event.chronology_sort;

        return {

            id: String(event.id),

            title: event.title || "Untitled Record",

            type: event.event_type || "unknown",

            description:
                event.description || "No description available.",

            chronologyLabel:
                event.chronology_label || null,

            chronologySort:
                chronologySort !== null &&
                chronologySort !== undefined &&
                Number.isFinite(Number(chronologySort))
                    ? Number(chronologySort)
                    : null,

            releaseDate: event.release_date || null,

            franchiseId: event.franchise_id ?? null,

            realityId: event.reality_id ?? null,

            entityId: event.entity_id ?? null,

            imageUrl: event.image_url || null,

            status: event.status || "draft"

        };
    },


    /* =====================================
       CHRONOLOGICAL SORTING
    ===================================== */

    sortChronologically(events) {

        return [...events].sort((a, b) => {

            if (a.chronologySort === null) return 1;
            if (b.chronologySort === null) return -1;

            return a.chronologySort - b.chronologySort;

        });
    },


    /* =====================================
       RELEASE SORTING
    ===================================== */

    sortByRelease(events) {

        return [...events].sort((a, b) => {

            if (!a.releaseDate) return 1;
            if (!b.releaseDate) return -1;

            return a.releaseDate.localeCompare(b.releaseDate);

        });
    }

};
