const {sequelize} = require("../../conf/DB.conf");

async function getEvents(authKey) {

    const events = await sequelize.models.event.findAll();

    return {status: 200, message: "Events retrieved successfully", events: events};
}

function getEvent(id, authKey) {
    // Get event from database
    // return {status: 200, message: "Event retrieved successfully", event: event};
}

async function createEvent(eventInfo, playerId) {
    try {
        const player = await sequelize.models.player.findOne({where: {id: playerId}});

        const event = await sequelize.models.event.create({
            name: eventInfo.name,
            description: eventInfo.description,
            location: { type: 'Point', coordinates: [eventInfo.location.lat, eventInfo.location.lng]},
            active: true
        });

        event.setPlayer(player);

        return {status: 200, message: "Event created successfully", event: event};

    } catch (error) {
        return {status: 500, message: "An error occurred while creating the event", error: error};
    }
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

