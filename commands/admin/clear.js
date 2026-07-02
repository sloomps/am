const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'clear',
    aliases: ['مسح', 'م'], // الاختصار السريع لمسح الشات لمحاكاة بروبوت
    description: 'تنظيف الشات ومسح الرسائل بسرعة وكفاءة عالية',
    async execute(client, message, args) {
        // التحقق من امتلاك العضو لصلاحية إدارة الرسائل
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ لا تملك صلاحية `إدارة الرسائل` لتنظيف الشات.');
        }

        // جلب العدد المطلوب مسحه أو جعل القيمة الافتراضية 100 رسالة
        let amount = parseInt(args[0]) || 100;

        if (amount < 1 || amount > 100) {
            return message.reply('❌ **نظام التنظيف:** يرجى اختيار عدد رسائل يتراوح بين 1 و 100 رسالة فقط في المرة الواحدة.');
        }

        // حذف رسالة الأمر نفسها أولاً لكي لا تحسب من العدد
        await message.delete().catch(() => {});

        // تنفيذ الحذف الجماعي الآمن من الأخطاء
        await message.channel.bulkDelete(amount, true)
            .then(messages => {
                message.channel.send(`🧹 **[المطهر]: تم مسح ${messages.size} رسالة بنجاح وتنظيف الغرفة.**`)
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 4000)); // حذف رسالة التأكيد تلقائياً بعد 4 ثوانٍ
            })
            .catch(error => {
                console.error('خطأ أثناء مسح الرسائل:', error);
                message.channel.send('❌ **تنبيه أمني:** لم أتمكن من مسح بعض الرسائل، قد يكون مر عليها أكثر من 14 يوماً (قوانين ديسكورد تمنع حذفها جماعياً).');
            });
    }
};
