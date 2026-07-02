const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        // التأكد من أنه مجلد وليس ملف عشوائي
        if (!fs.lstatSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));
            
            if (command.name) {
                // تسجيل الأمر باسمه الرئيسي
                client.commands.set(command.name, command);
                
                // تسجيل الاختصارات (Aliases) إذا وجدت
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => client.aliases.set(alias, command.name));
                }
            }
        }
    }
    console.log(`📦 [المعالج] تم تحميل [ ${client.commands.size} ] أمر بنجاح.`);
};
