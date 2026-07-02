const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

module.exports = async (client, interaction) => {
    // ─── 1️⃣ التفاعل مع القائمة المنسدلة لفتح التذكرة ───
    if (interaction.isStringSelectMenu() && interaction.customId === 'elite_ticket_system') {
        // الرد المخفي المبدئي لمنع ديسكورد من إعطاء خطأ انتهاء وقت الاستجابة
        await interaction.deferReply({ ephemeral: true });

        const selectedType = interaction.values[0];
        
        const departmentMap = {
            tech_support: 'دعم-فني',
            report_support: 'شكاوى',
            apply_support: 'تقديم'
        };

        const deptName = departmentMap[selectedType] || 'تذكرة';

        // إنشاء الروم الخاص بالتذكرة وتحديد الصلاحيات بدقة فائقة
        const ticketChannel = await interaction.guild.channels.create({
            name: `🎫-${deptName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel] // إخفاء الروم عن السيرفر كله
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles] // صلاحيات العضو صاحب التذكرة
                }
            ]
        });

        // حفظ بيانات التذكرة في الذاكرة لربطها بالمالك عند الإغلاق
        client.tickets.set(ticketChannel.id, {
            ownerId: interaction.user.id,
            openedAt: new Date().toLocaleString('ar-EG'),
            department: deptName
        });

        // رسالة الترحيب والتعليمات داخل التذكرة الجديدة
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`✨ تذكرة جديدة - قسم [ ${deptName} ]`)
            .setDescription(`مرحباً بك ${interaction.user}، تم فتح تذكرتك بنجاح في القسم المختص.\n\nيرجى كتابة مشكلتك أو طلبك بالتفصيل هنا، وسيقوم أحد مشرفي الدعم الفني بالرد عليك في أقرب وقت ممكن.\n\n🔒 **ملاحظة أمنية:** عند الانتهاء من حل مشكلتك، اضغط على الزر أدناه ليقوم النظام بحفظ نسخة كاملة من الشات وإرسالها لخاصك تلقائياً ثم حذف الروم.`)
            .setTimestamp();

        // زر الإغلاق الاحترافي الأحمر
        const closeButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_elite_ticket')
                .setLabel('🔒 إغلاق التذكرة والأرشفة')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ embeds: [welcomeEmbed], components: [closeButton] });

        // الرد على العضو برابط التذكرة الجديدة الخاص به
        await interaction.editReply({ content: `✅ **تم فتح تذكرتك بنجاح!** توجه إليها من هنا: ${ticketChannel}` });
    }

    // ─── 2️⃣ التفاعل مع زر إغلاق التذكرة وصناعة الأرشيف (Transcript) ───
    if (interaction.isButton() && interaction.customId === 'close_elite_ticket') {
        await interaction.reply('🔒 **نظام التذاكر:** جاري استخراج سجل المحادثة الكامل وإرساله لخاص العضو، سيتم حذف الروم بعد 5 ثوانٍ...');

        const ticketInfo = client.tickets.get(interaction.channel.id);

        if (ticketInfo) {
            try {
                // جلب آخر 100 رسالة دارت في التذكرة لتوثيقها بالكامل
                const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
                const transcriptText = fetchedMessages.reverse()
                    .map(m => `[${m.createdAt.toLocaleTimeString('ar-EG')}] ${m.author.tag}: ${m.content}`)
                    .join('\n');

                // بناء إمبيد الإحصائيات الفخم للخاص
                const dmArchiveEmbed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('📋 تقرير إغلاق وأرشفة تذكرة')
                    .setDescription(`أهلاً بك، تم إغلاق تذكرتك بنجاح، وإليك تقرير مفصل بكافة بياناتها للتوثيق والمراجعة:`)
                    .addFields(
                        { name: '📁 قسم الدعم', value: `\`${ticketInfo.department}\``, inline: true },
                        { name: '📅 وقت إنشاء التذكرة', value: `\`${ticketInfo.openedAt}\``, inline: true },
                        { name: '🔒 أُغلقت بواسطة', value: `${interaction.user}`, inline: true }
                    )
                    .setFooter({ text: 'شكراً لتعاملك مع نظام الدعم الفني لدينا' })
                    .setTimestamp();

                // البحث عن العضو في السيرفر لإرسال التقرير لخاصه
                const member = await interaction.guild.members.fetch(ticketInfo.ownerId).catch(() => null);
                if (member) {
                    // تحويل نص الشات إلى ملف نصي مرفق رسمي (.txt)
                    const fileAttachment = new AttachmentBuilder(Buffer.from(transcriptText || "لم يتم كتابة أي رسائل في هذه التذكرة."), { name: `transcript-${interaction.channel.name}.txt` });
                    
                    await member.send({ embeds: [dmArchiveEmbed], files: [fileAttachment] }).catch(() => {
                        console.log(`⚠️ لم يتمكن البوت من إرسال الأرشيف لخاص العضو ${member.user.tag} لأن حسابه مغلق الخاص.`);
                    });
                }
            } catch (err) {
                console.error('حدث خطأ أثناء أرشفة التذكرة:', err);
            }

            // تنظيف الذاكرة المؤقتة للروم المحذوف
            client.tickets.delete(interaction.channel.id);
        }

        // حذف قناة التذكرة نهائياً بعد مرور 5 ثوانٍ
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
};

// ربط الحدث بالعميل تلقائياً داخل الملف
client.on('interactionCreate', interaction => module.exports(client, interaction));
