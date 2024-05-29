const {sequelize} = require("../../conf/DB.conf");

async function getEvents(authKey) {

    const events = await sequelize.models.event.findAll();

    return {status: 200, message: "Events retrieved successfully", events: events};
}

function getEvent(id, authKey) {
    // Get event from database
    // return {status: 200, message: "Event retrieved successfully", event: event};
}

function createEvent(eventInfo, authKey) {
    // Create event in database
    // return {status: 200, message: "Event created successfully"};

}

function updateEvent(id, eventInfo, authKey) {
    // Update event in database
    // return {status: 200, message: "Event updated successfully"};

}

function deleteEvent(id, authKey) {
    // Delete event from database
    // return {status: 200, message: "Event deleted successfully"};

}

module.exports = {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent
};

