const { PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'tickets',
    aliases: ['تذاكر', 'ت'], // الاختصار السريع لفتح لوحة التذاكر
    description: 'إنشاء لوحة التذاكر المتطورة بالقوائم المنسدلة',
    async execute(client, message, args) {
        // حماية الأمر: للمسؤولين فقط
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ **نظام الأمان:** لا تملك صلاحية لتهيئة نظام التذاكر.');
        }

        // حذف رسالة الأمر للحفاظ على نظافة الروم
        await message.delete().catch(() => {});

        // تصميم رسالة التذاكر الاحترافية (Embed)
        const ticketPanelEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 مركز الدعم الفني والمساعدة المطور')
            .setDescription('مرحباً بك في مركز المساعدة الفورية الخاص بنا.\n\nيرجى اختيار القسم المناسب لمشكلتك أو استفسارك من **القائمة المنسدلة أدناه**، وسيتم فتح غرفة خاصة مشفرة لك ولطاقم الإدارة فوراً لمساعدتك.')
            .addFields(
                { name: '⏰ أوقات العمل', value: '⏰ متواجدون على مدار الساعة لخدمتكم.', inline: true },
                { name: '🔒 أمن البيانات', value: '🛡️ يتم أرشفة كافة التذاكر تلقائياً لحفظ الحقوق.', inline: true }
            )
            .setFooter({ text: 'نظام إدارة التذاكر الذكي 2026', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        // إنشاء القائمة المنسدلة (String Select Menu) بأحدث التقنيات
        const menu = new StringSelectMenuBuilder()
            .setCustomId('elite_ticket_system')
            .setPlaceholder('📁 اضغط هنا واختـر قسم الدعم المناسب...')
            .addOptions([
                { 
                    label: 'قسم الدعم الفني العام', 
                    description: 'للاستفسارات العامة والمشاكل التقنية داخل السيرفر', 
                    value: 'tech_support', 
                    emoji: '🛠️' 
                },
                { 
                    label: 'قسم الشكاوى والبلاغات', 
                    description: 'لتقديم بلاغ رسمي ضد عضو أو مسؤول أو الإبلاغ عن مشكلة', 
                    value: 'report_support', 
                    emoji: '⚖️' 
                },
                { 
                    label: 'طلب تقديم على الإدارة', 
                    description: 'إذا كنت ترغب بالانضمام إلى طاقم إدارة السيرفر', 
                    value: 'apply_support', 
                    emoji: '📝' 
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        // إرسال اللوحة في الروم الحالي
        await message.channel.send({ embeds: [ticketPanelEmbed], components: [row] });
    }
};
