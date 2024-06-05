const {sequelize} = require("../../conf/DB.conf");

async function getEvents(authKey) {

    const events = await sequelize.models.event.findAll();

    return {status: 200, message: "Events retrieved successfully", events: events};
}

function getEvent(id, authKey) {
    // Get event from database
    // return {status: 200, message: "Event retrieved successfully", event: event};
}

function createEvent(eventInfo) {
    // Create event in database
    // return {status: 200, message: "Event created successfully"};

    const event = sequelize.models.event.create(eventInfo);

    return {status: 200, message: "Event created successfully", event: event};

}

function updateEvent(id, eventInfo, authKey) {
    // Update event in database
    // return {status: 200, message: "Event updated successfully"};

}

function deleteEvent(id) {
    // Delete event from database
    // return {status: 200, message: "Event deleted successfully"};

    if (id === undefined || id === null) return {status: 400, message: "Event id is required"};

    try {
        const event = sequelize.models.event.destroy({
            where: {
                id: id
            }
        });
        return {status: 200, message: "Event deleted successfully", event: event};
    } catch (error) {
        return {status: 500, message: "An error occurred while deleting the event", error: error};
    }

    return {status: 500, message: "An error occurred while deleting the event"};
}

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
};

