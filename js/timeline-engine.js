
/* =========================================
   FICTIONAL ARCHIVE
   SHARED TIMELINE ENGINE
========================================= */


/* =========================================
   DATABASE ACCESS
========================================= */

const TimelineEngine = {

    async getTimeline(slug) {

        if (!window.supabaseClient) {
            throw new Error("Supabase client unavailable.");
        }

        const { data, error } = await window.supabaseClient
            .from("timelines")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .single();

        if (error) throw error;

        return data;
    },


    async getEvents(timelineId) {

        if (!window.supabaseClient) {
            throw new Error("Supabase client unavailable.");
        }

        const { data, error } = await window.supabaseClient
            .from("timeline_events")
            .select("*")
            .eq("timeline_id", timelineId)
            .eq("status", "published");

        if (error) throw error;

        return data || [];
    },


    async load(slug) {

        const timeline = await this.getTimeline(slug);

        const events = await this.getEvents(timeline.id);

        return {
            timeline,
            events: events.map(event => this.normalizeEvent(event))
        };

    },


    normalizeEvent(event) {

        return {

            id: String(event.id),

            title: event.title,

            type: event.event_type,

            description:
                event.description || "No description available.",

            chronologyLabel:
                event.chronology_label || null,

            chronologySort:
                event.chronology_sort !== null
                    ? Number(event.chronology_sort)
                    : null,

            releaseDate: event.release_date || null,

            franchiseId: event.franchise_id,

            realityId: event.reality_id,

            entityId: event.entity_id,

            imageUrl: event.image_url || null,

            status: event.status

        };

    },


    sortChronologically(events) {

        return [...events].sort((a, b) => {

            if (a.chronologySort === null) return 1;

            if (b.chronologySort === null) return -1;

            return a.chronologySort - b.chronologySort;

        });

    },


    sortByRelease(events) {

        return [...events].sort((a, b) => {

            if (!a.releaseDate) return 1;

            if (!b.releaseDate) return -1;

            return a.releaseDate.localeCompare(b.releaseDate);

        });

    }

};
