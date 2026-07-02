const config = require('../config.json');

module.exports = async (client, message) => {
    // تجاهل رسائل البوتات أو الرسائل الخاصة (DM) لضمان استقرار النظام
    if (message.author.bot || !message.guild) return;

    // ─── 1️⃣ نظام الأوتو لاين المتطور ───
    if (client.autoLineChannels.has(message.channel.id)) {
        // التحقق من وجود رابط الخط في الإعدادات قبل الإرسال
        if (config.lineLink && config.lineLink !== "") {
            message.channel.send(config.lineLink).catch(() => {});
        }
    }

    // ─── 2️⃣ نظام الليفل والـ XP التلقائي ───
    let u = client.levels.get(message.author.id) || { xp: 0, lvl: 1 };
    // إعطاء نقاط خبرة عشوائية بين 10 و 25 لكل رسالة لتشجيع التفاعل
    u.xp += Math.floor(Math.random() * 15) + 10;
    
    // معادلة الصعود للمستوى التالي
    if (u.xp >= u.lvl * 120) {
        u.lvl++;
        u.xp = 0;
        const levelUpEmbed = {
            color: 0x2ecc71,
            description: `🎉 **كفو ${message.author}! مستواك ارتفع وصار [ ${u.lvl} ]** 🚀`,
            timestamp: new Date()
        };
        message.channel.send({ embeds: [levelUpEmbed] })
            .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    client.levels.set(message.author.id, u);

    // ─── 3️⃣ نظام معالجة الأوامر والاختصارات ───
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // البحث عن الأمر بالاسم الأصلي أو عبر نظام الاختصارات الذكي (Aliases)
    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    if (!command) return;

    // التحقق مما إذا كان الأمر معطلاً من خلال نظام التحكم (Dashboard)
    if (client.disabledCmds.has(command.name) && command.name !== 'control') {
        return message.reply('❌ **هذا الأمر معطل مؤقتاً في السيرفر بواسطة الإدارة العليا.**');
    }

    // تنفيذ الأمر مع نظام حماية لعزل الأخطاء
    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(`خطأ أثناء تنفيذ أمر !${command.name}:`, error);
        message.reply('❌ حدث خطأ داخلي أثناء محاولة تشغيل هذا الأمر، تم إرسال التقرير للمطور.');
    }
};
