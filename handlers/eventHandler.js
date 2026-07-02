const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        const eventName = file.split('.')[0];
        
        // ربط الحدث بالديسكورد تلقائياً
        client.on(eventName, (...args) => event(client, ...args));
    }
    console.log(`⚡ [المعالج] تم تحميل [ ${eventFiles.length} ] حدث تلقائي بنجاح.`);
};
