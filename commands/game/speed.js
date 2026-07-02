module.exports = {
    name: 'speed',
    aliases: ['سرعة', 'س'], // الاختصارات
    description: 'تحدي كتابة الكلمة بأسرع وقت ممكن بين الأعضاء',
    async execute(client, message, args) {
        const wordsPool = ['ديسكورد', 'برمجيات', 'حماية', 'مطور', 'سيرفرات', 'إبداع', 'المستقبل', 'تكنولوجيا'];
        const randomWord = wordsPool[Math.floor(Math.random() * wordsPool.length)];

        await message.reply(`⏱️ **[تحدي السرعة]: أسرع عضو يكتب الكلمة التالية صحيحة يفوز:**\n\n🎯 الكلمة هي: \`${randomWord}\``);

        // إنشاء فلتر لالتقاط رسالة العضو الفائز (بشرط أن يكتب الكلمة صح ولا يكون بوت)
        const filter = m => m.content === randomWord && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            m.reply(`🎉 **كفو يا وحش! أنت أسرع واحد كتب الكلمة صحيحة وفزت بالتحدي!** 🥇`);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                message.channel.send(`⏱️ **[انتهى الوقت]:** للاسف انتهت الـ 15 ثانية ولم يكتب أحد الكلمة بالشكل الصحيح.`);
            }
        });
    }
};
