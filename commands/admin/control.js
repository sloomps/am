const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'control',
    aliases: ['تحكم', 'ح'], // الاختصار الأساسي لسهولة التحكم
    description: 'لوحة التحكم الداخلية لتفعيل وتعطيل الأوامر والأوتولاين',
    async execute(client, message, args) {
        // حماية الأمر: مخصص فقط لمدراء السيرفر (Administrator)
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ **نظام الأمان:** هذا الأمر مخصص للإدارة العليا فقط.');
        }

        const action = args[0]; // (تفعيل / تعطيل / خط)
        const targetCommand = args[1]; // اسم الأمر المراد تفعيله أو تعطيله

        // ─── نظام تشغيل وإيقاف الأوتولاين (الخط التلقائي) ───
        if (action === 'خط' || action === 'line') {
            if (client.autoLineChannels.has(message.channel.id)) {
                client.autoLineChannels.delete(message.channel.id);
                return message.reply('📴 **[التحكم التلقائي]:** تم إيقاف نظام الأوتولاين (الخط التلقائي) في هذه القناة.');
            } else {
                client.autoLineChannels.add(message.channel.id);
                return message.reply('🔛 **[التحكم التلقائي]:** تم تفعيل نظام الأوتولاين! سيقوم البوت بإرسال خطك تلقائياً بعد كل رسالة هنا.');
            }
        }

        // التحقق من المدخلات الصحيحة لأوامر التفعيل والتعطيل
        if (!action || !targetCommand || !['تفعيل', 'تعطيل'].includes(action)) {
            const usageEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('📝 دليل استخدام أمر التحكم والداشبورد')
                .setDescription('يمكنك إدارة رومات السيرفر والأوامر فوراً من الشات عبر الخيارات التالية:')
                .addFields(
                    { name: '⚙️ تشغيل/إيقاف الأوتولاين بالروم الحالي', value: '`!تحكم خط` أو الاختصار السريع: `!ح خط`' },
                    { name: '🔒 تعطيل أمر معين في السيرفر', value: '`!تحكم تعطيل [اسم_الأمر]`\nمثال: `!ح تعطيل روليت`' },
                    { name: '🔓 إعادة تفعيل أمر معطل', value: '`!تحكم تفعيل [اسم_الأمر]`\nمثال: `!ح تفعيل روليت`' }
                )
                .setTimestamp();
            return message.reply({ embeds: [usageEmbed] });
        }

        // تنفيذ عملية التعطيل
        if (action === 'تعطيل') {
            // منع صاحب البوت من تعطيل أمر التحكم نفسه لكي لا يقفل البوت تماماً
            if (targetCommand === 'control' || targetCommand === 'تحكم' || targetCommand === 'ح') {
                return message.reply('❌ **نظام الحماية:** لا يمكنك تعطيل أمر التحكم الرئيسي لضمان استقرار البوت.');
            }
            client.disabledCmds.add(targetCommand);
            return message.reply(`🔒 **[التحكم العالي]:** تم بنجاح **تعطيل** أمر \`!${targetCommand}\` على مستوى السيرفر.`);
        }

        // تنفيذ عملية التفعيل
        if (action === 'تفعيل') {
            client.disabledCmds.delete(targetCommand);
            return message.reply(`🔓 **[التحكم العالي]:** تم بنجاح **إعادة تفعيل** أمر \`!${targetCommand}\` وهو جاهز للاستخدام الآن.`);
        }
    }
};
