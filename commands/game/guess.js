module.exports = {
    name: 'guess',
    aliases: ['خمن', 'خ'],
    description: 'لعبة تخمين الرقم السري الصحيح من 1 إلى 20',
    async execute(client, message, args) {
        const secretNumber = Math.floor(Math.random() * 20) + 1;
        
        await message.reply("🎲 **[لعبة التخمين]: لقد اخترت رقماً سرياً مجهولاً بين (1 و 20). ابدأوا بالتخمين الآن في الشات!**");

        // الفلتر يستقبل أي رقم مكتوب من الأعضاء
        const filter = m => !m.author.bot && !isNaN(m.content);
        const collector = message.channel.createMessageCollector({ filter, time: 30000 });

        collector.on('collect', m => {
            const userGuess = parseInt(m.content);

            if (userGuess === secretNumber) {
                m.reply(`🎯 **أوووه خطير!! جبتها صح الرقم السري هو بالفعل [ ${secretNumber} ]، مبروك الفوز!** 🏆`);
                collector.stop('won');
            } else if (userGuess < secretNumber) {
                m.reply("🔼 **[تلميح]:** رقمك أصغر من الرقم السري، حاول برقم أعلى!");
            } else if (userGuess > secretNumber) {
                m.reply("🔽 **[تلميح]:** رقمك أكبر من الرقم السري، حاول برقم أقل!");
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'won') {
                message.channel.send(`⏳ **[انتهت اللعبة]:** انتهى الوقت المتاح للتخمين ولم يعرف أحد الإجابة. الرقم السري كان: **${secretNumber}**`);
            }
        });
    }
};
