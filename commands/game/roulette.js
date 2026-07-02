module.exports = {
    name: 'roulette',
    aliases: ['روليت', 'ر'], // الاختصارات السريعة
    description: 'لعبة روليت الحظ المرئية والتفاعلية بالشات',
    async execute(client, message, args) {
        // مصفوفة الحالات البصرية أثناء دوران اللعبة
        const frames = ["🌑 🔘 🌑", "🌑 🔴 🌑", "🌑 🔘 🌑", "🔴 🌑 🔴"];
        
        let gameMessage = await message.reply("🔄 **[نظام الألعاب]: جاري حشو المسدس وتدوير أسطوانة الحظ...**");
        
        // عمل انيميشن (تحديث مستمر للرسالة) لإعطاء طابع الإثارة
        let i = 0;
        let interval = setInterval(async () => {
            await gameMessage.edit(`🔄 **تـدوير الأسطوانة الآن: [ ${frames[i % frames.length]} ]**`).catch(() => {});
            i++;
            
            // عند انتهاء الدوران (بعد 5 تحديثات) يتم احتساب النتيجة عشوائياً
            if (i > 4) {
                clearInterval(interval);
                
                // نسبة الخسارة أو النجاة 50%
                const luckyBreak = Math.random() > 0.5;
                
                if (!luckyBreak) {
                    await gameMessage.edit("💥 **طاااااااخ! الرصاصة كانت في المجرى وخسرت الجولة!**").catch(() => {});
                    // البوت يعطي تايم أوت (ميوت) لمدة دقيقة واحدة كعقوبة للخاسر في اللعبة إذا كان ذلك ممكناً
                    if (message.member.kickable) {
                        await message.member.timeout(60000, "الخسارة في لعبة الروليت").catch(() => {});
                    }
                } else {
                    await gameMessage.edit("😎 **كفو! طقّت الرصاصة في الهوى والمسدس فارغ.. لقد نجوت!**").catch(() => {});
                }
            }
        }, 900);
    }
};
