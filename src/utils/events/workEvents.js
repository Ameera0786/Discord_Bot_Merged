const fns = require('./workEventsHelper');

const workEvents = [
    { name: 'lucky', run: fns.lucky },
    { name: 'bad', run: fns.bad },
    { name: 'bonus', run: fns.bonus },
    { name: 'loseMoney', run: fns.loseMoney },
    { name: 'hunger', run: fns.hunger },
    { name: 'suspended', run: fns.suspended },
    { name: 'sick', run: fns.sick },
    { name: 'normal', run: fns.normal },
];

function getWorkEvent(user) {
    const index = Math.floor(Math.random() * workEvents.length);
    const event = workEvents[index];

    return event.run(user);
}
module.exports = { workEvents, getWorkEvent };