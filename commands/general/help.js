const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'help',
    aliases: ['مساعدة', 'اوامر', 'الأوامر'], // الاختصارات لتسهيل الوصول للدليل
    description: 'عرض دليل الأوامر الشامل والاختصارات وأنظمة التحكم بالبوت',
    async execute(client, message, args) {
        
        // تصميم إمبيد المساعدة الفخم والمتكامل لعام 2026
        const helpEmbed = new EmbedBuilder()
            .setColor('#2F3136') // لون داكن فخم مريح للعين
            .setTitle('✨ دليل أوامر النظام المتكامل والخرافي')
            .setDescription(`مرحباً بك في لوحة تحكم ودليل أوامر البوت.\nالبوت مجهز بنظام **الاختصارات الذكي**، يمكنك كتابة الأمر كاملاً أو حرف الاختصار الخاص به الموضح أدناه.\n\n البادئة الحالية للبوت هي: \`${config.prefix}\``)
            .addFields(
                { 
                    name: '⚙️ أولاً: أوامر التحكم والداشبورد الإداري', 
                    value: `\`${config.prefix}control\` أو \`${config.prefix}تحكم\` أو \`${config.prefix}ح\`\n└ للتحكم الكامل بتفعيل/تعطيل أي أمر بالسيرفر، وتشغيل نظام الخط التلقائي (\`${config.prefix}ح خط\`).\n\n\`${config.prefix}clear\` أو \`${config.prefix}مسح\` أو \`${config.prefix}م\`\n└ لتطهير وتنظيف الشات بسرعة فائقة (لغاية 100 رسالة).` 
                },
                { 
                    name: '🎫 ثانياً: نظام التذاكر والدعم الفني (Tickets v2)', 
                    value: `\`${config.prefix}tickets\` أو \`${config.prefix}تذاكر\` أو \`${config.prefix}ت\`\n└ لإنشاء لوحة التذاكر الذكية بالقوائم المنسدلة، المدعومة بنظام الأرشفة الفوري وإرسال سجل المحادثة لخاص العضو تلقائياً عند الإغلاق.` 
                },
                { 
                    name: '🎮 ثالثاً: حزمة الألعاب والتسلية الفخمة', 
                    value: `\`${config.prefix}roulette\` أو \`${config.prefix}روليت\` أو \`${config.prefix}ر\`\n└ لعبة الحظ الروسية المرئية بالتحديث التلقائي وعقوبة الميوت التلقائي.\n\n\`${config.prefix}speed\` أو \`${config.prefix}سرعة\` أو \`${config.prefix}س\`\n└ تحدي الكتابة السريعة العشوائي لإشعال التفاعل بالشات.\n\n\`${config.prefix}guess\` أو \`${config.prefix}خمن\` أو \`${config.prefix}خ\`\n└ لعبة تخمين الرقم السري من 1 إلى 20 مع التوجيه الذكي الآلي.` 
                },
                {
                    name: '📈 رابعاً: الأنظمة التلقائية المدمجة',
                    value: `⭐ **نظام الليفل والشات (XP):** يعمل تلقائياً مع كل رسالة لرفع مستويات الأعضاء وإرسال تهنيئات فخمة تحذف نفسها تلقائياً.\n\n🔛 **نظام الأوتولاين (Auto-Line):** يقوم بإرسال خط سيرفرك تلقائياً بعد كل رسالة عضو في الرومات التي تحددها عبر أمر التحكم.`
                }
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'تم تطوير هذا النظام بأحدث التقنيات البرمجية 2026 🛡️', iconURL: message.guild.iconURL() })
            .setTimestamp();

        // إرسال الدليل الفخم للعضو
        await message.reply({ embeds: [helpEmbed] });
    }
};
