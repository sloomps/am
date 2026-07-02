const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits,
    StringSelectMenuBuilder
} = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

const config = {
    prefix: "!",
    port: process.env.PORT || 3000
};

// قواعد بيانات وهمية في الذاكرة لتخزين الحالات، الليفل، والتذاكر
const disabledCommands = new Set(); 
const levelsDatabase = new Map(); // لتخزين الـ XP والليفل للأعضاء
const ticketCreators = new Map(); // لتخزين صاحب كل تذكرة من أجل إرسال التفاصيل في الخاص

// 🛡️ نظام منع الانهيار وحماية البوت
process.on('unhandledRejection', (reason, p) => { console.error(' [حماية] خطأ غير معالج:', reason); });
process.on("uncaughtException", (err, origin) => { console.error(' [حماية] استثناء خارجي:', err); });

client.once('ready', () => {
    console.log(`🚀 تم تشغيل النظام الخرافي بنجاح: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // ================= 📈 نظام الليفل التلقائي والخرافي =================
    const userId = message.author.id;
    if (!levelsDatabase.has(userId)) {
        levelsDatabase.set(userId, { xp: 0, level: 1 });
    }

    const userData = levelsDatabase.get(userId);
    // إعطاء XP عشوائي بين 10 و 25 لكل رسالة
    userData.xp += Math.floor(Math.random() * 15) + 10;

    // معادلة حساب الـ XP المطلوب لليفل القادم: Level * 100
    const xpNeeded = userData.level * 100;
    if (userData.xp >= xpNeeded) {
        userData.xp -= xpNeeded;
        userData.level += 1;
        
        const levelUpEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
            .setDescription(`🎉 **كفو! طار مستواك لفوق وصار ليفلك الحالي: ${userData.level}** 🚀`)
            .setTimestamp();
            
        message.channel.send({ embeds: [levelUpEmbed] }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    levelsDatabase.set(userId, userData);

    // التحقق من البريفكس للاستمرار للأوامر
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandInput = args.shift().toLowerCase();

    // ================= 🔀 نظام الاختصارات والتحكم الكامل بالأوامر =================
    // خريطة لربط الاختصارات بالأوامر الأساسية
    const aliases = {
        'م': 'مسح',
        'ق': 'قفل',
        'ف': 'فتح',
        'ت': 'تذاكر',
        'ل': 'ليفل',
        'ح': 'تحكم',
        'ب': 'بنج'
    };

    // تحديد الأمر الأساسي سواء كتب العضو الاسم كاملاً أو الاختصار
    const command = aliases[commandInput] || commandInput;

    // التحقق مما إذا كان الأمر معطلاً
    if (disabledCommands.has(command) && command !== 'تحكم') {
        return message.reply('❌ **هذا الأمر معطل حالياً من قبل إدارة السيرفر!**');
    }

    // 1. أمر التحكم الكامل بتعطيل وتفعيل الأوامر
    if (command === 'تحكم') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ هذا الأمر مخصص لمديري النظام فقط.');
        }

        const targetCmd = args[0];
        const action = args[1];

        if (!targetCmd || !['تفعيل', 'تعطيل'].includes(action)) {
            return message.reply('📝 **الاستخدام الصحيح:** `!تحكم [اسم_الأمر] [تفعيل/تعطيل]`\nمثال: `!تحكم مسح تعطيل` أو بالاحتصارات `!ح م تعطيل`');
        }

        if (action === 'تعطيل') {
            disabledCommands.add(targetCmd);
            return message.reply(`🔒 تم **تعطيل** أمر \`!${targetCmd}\` بنجاح في السيرفر.`);
        } else {
            disabledCommands.delete(targetCmd);
            return message.reply(`🔓 تم **إعادة تفعيل** أمر \`!${targetCmd}\` بنجاح.`);
        }
    }

    // 2. أمر مسح الرسائل (يدعم اختصار !م)
    if (command === 'مسح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('❌ لا تملك صلاحية إدارة الرسائل.');
        const amount = parseInt(args[0]) || 100;
        if (amount < 1 || amount > 100) return message.reply('❌ يرجى اختيار عدد بين 1 و 100.');
        
        await message.channel.bulkDelete(amount, true);
        return message.channel.send(`🧹 **نظام التطهير الخرافي: تم مسح ${amount} رسالة بنجاح.**`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }

    // 3. أمر معرفة مستوى الليفل الحالي
    if (command === 'ليفل') {
        const targetUser = message.mentions.users.first() || message.author;
        const targetData = levelsDatabase.get(targetUser.id) || { xp: 0, level: 1 };
        const nextXp = targetData.level * 100;

        const levelEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle(`📊 مستوى الخبرة لـ ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '⭐ الليفل الحالي', value: `\`${targetData.level}\``, inline: true },
                { name: '✨ نقاط الخبرة (XP)', value: `\`${targetData.xp} / ${nextXp}\``, inline: true }
            )
            .setFooter({ text: 'استمر في التفاعل لرفع مستواك!' })
            .setTimestamp();

        return message.reply({ embeds: [levelEmbed] });
    }

    // 4. أمر إنشاء نظام التذاكر المطور
    if (command === 'تذاكر') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ للمسؤولين فقط.');

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 مركز الدعم الفني والمساعدة الخرافي')
            .setDescription('مرحباً بك! يرجى اختيار قسم الدعم المناسب لمشكلتك من القائمة أدناه، وسيتم فتح تذكرة خاصة بك فوراً.');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('📁 اختر القسم من هنا...')
            .addOptions([
                { label: 'الدعم العام والاستفسارات', value: 'general_support', emoji: '💬' },
                { label: 'تقديم على رتبة إدارة', value: 'staff_apply', emoji: '🛡️' },
                { label: 'قسم البلاغات والشكاوى', value: 'report_section', emoji: '⚠️' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        return message.channel.send({ embeds: [embed], components: [row] });
    }

    // 5. أمر قفل الروم (يدعم اختصار !ق)
    if (command === 'قفل') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        return message.reply('🔒 **تم إغلاق الغرفة بنجاح وبإمكانك فتحها عبر أمر `!فتح` أو `!ف`.**');
    }

    // 6. أمر فتح الروم (يدعم اختصار !ف)
    if (command === 'فتح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        return message.reply('🔓 **تم إعادة فتح الغرفة للجميع.**');
    }

    // 7. أمر البنج (يدعم اختصار !ب)
    if (command === 'بنج') {
        return message.reply(`🏓 **سرعة اتصال النظام:** \`${client.ws.ping}ms\``);
    }
});

// ================= ⚡ التفاعلات ونظام إرسال تفاصيل التذكرة للخاص =================
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
        await interaction.deferReply({ ephemeral: true });

        const departmentMap = {
            general_support: 'دعم-عام',
            staff_apply: 'تقديم-إدارة',
            report_section: 'شكاوى'
        };

        const deptName = departmentMap[interaction.values[0]] || 'تذكرة';

        const channel = await interaction.guild.channels.create({
            name: `🎫-${deptName}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] }
            ]
        });

        // حفظ صاحب التذكرة لمعرفته عند إغلاق الروم وإرسال التفاصيل له
        ticketCreators.set(channel.id, {
            userId: interaction.user.id,
            openedAt: new Date().toLocaleString('ar-EG'),
            department: deptName
        });

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle(`✨ تذكرة جديدة - قسم ${deptName}`)
            .setDescription(`مرحباً بك ${interaction.user}، لقد تم فتح تذكرتك بنجاح. يرجى كتابة تفاصيل مشكلتك هنا وسيقوم الدعم الفني بالرد عليك.\n\n🔒 **عند الانتهاء، اضغط على الزر أدناه ليتم حفظ التفاصيل وإرسالها إلى حسابك في الخاص مباشرة.**`)
            .setTimestamp();

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 إغلاق وحفظ التفاصيل').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [closeBtn] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك بنجاح: ${channel}` });
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 **جاري جمع البيانات وإرسال التقرير لخاص العضو، سيتم حذف الروم خلال 5 ثوانٍ...**');
        
        const ticketData = ticketCreators.get(interaction.channel.id);
        
        if (ticketData) {
            try {
                // سحب آخر 50 رسالة دارت في التذكرة لتوثيقها كأرشيف (Transcript)
                const fetchedMessages = await interaction.channel.messages.fetch({ limit: 50 });
                let transcriptText = fetchedMessages.reverse()
                    .map(m => `[${m.createdAt.toLocaleTimeString('ar-EG')}] ${m.author.tag}: ${m.content}`)
                    .join('\n');

                const dmEmbed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('📋 تقرير إغلاق التذكرة الفوري')
                    .setDescription(`مرحباً بك، تم إغلاق تذكرتك بنجاح وإليك كافة معلوماتها للتوثيق:`)
                    .addFields(
                        { name: '📁 القسم الخاص بها', value: `\`${ticketData.department}\``, inline: true },
                        { name: '📅 وقت الفتح', value: `\`${ticketData.openedAt}\``, inline: true },
                        { name: '🔒 أُغلقت بواسطة', value: `${interaction.user}`, inline: true }
                    )
                    .setFooter({ text: 'شكراً لتعاملك مع نظام الدعم الفني المطور' })
                    .setTimestamp();

                const member = await interaction.guild.members.fetch(ticketData.userId).catch(() => null);
                if (member) {
                    // إرسال الـ Embed وبداخل المرفقات نص المحادثة الكامل
                    await member.send({ 
                        embeds: [dmEmbed],
                        files: [{
                            attachment: Buffer.from(transcriptText || "لم يتم كتابة أي رسائل."),
                            name: `transcript-${interaction.channel.name}.txt`
                        }]
                    }).catch(() => console.log("⚠️ تعذر إرسال التفاصيل لخاص العضو لأن خاصه مغلق."));
                }
            } catch (err) {
                console.error("خطأ أثناء معالجة بيانات الإغلاق:", err);
            }
            // تنظيف الذاكرة
            ticketCreators.delete(interaction.channel.id);
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// تشغيل سيرفر الويب المستقر
const app = express();
app.get('/', (req, res) => { res.send('<h1 style="text-align:center; padding-top:50px;">🌐 النظام الخرافي متصل سحابياً 100%</h1>'); });
app.listen(config.port);

client.login(process.env.DISCORD_TOKEN || 'ضع_التوكن_هنا');
