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

// قواعد البيانات المؤقتة في الذاكرة
const disabledCommands = new Set(); 
const levelsDatabase = new Map(); 
const ticketCreators = new Map(); 

// 🛡️ نظام منع الانهيار وحماية البوت
process.on('unhandledRejection', (reason, p) => { console.error(' [حماية] خطأ غير معالج:', reason); });
process.on("uncaughtException", (err, origin) => { console.error(' [حماية] استثناء خارجي:', err); });

client.once('ready', () => {
    console.log(`🚀 تم تشغيل النظام الكامل بنجاح: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // ================= 📈 نظام الليفل التلقائي =================
    const userId = message.author.id;
    if (!levelsDatabase.has(userId)) {
        levelsDatabase.set(userId, { xp: 0, level: 1 });
    }

    const userData = levelsDatabase.get(userId);
    userData.xp += Math.floor(Math.random() * 15) + 10;

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

    // ================= 🔀 نظام الاختصارات والتحكم الكامل =================
    const aliases = {
        'م': 'مسح',
        'ق': 'قفل',
        'ف': 'فتح',
        'ت': 'تذاكر',
        'ل': 'ليفل',
        'ح': 'تحكم',
        'ب': 'بنج',
        'س': 'سرعة',
        'ص': 'صراحة',
        'خ': 'خيروك'
    };

    const command = aliases[commandInput] || commandInput;

    // التحقق مما إذا كان الأمر معطلاً
    if (disabledCommands.has(command) && command !== 'تحكم') {
        return message.reply('❌ **هذا الأمر معطل حالياً من قبل إدارة السيرفر!**');
    }

    // 1. أمر التحكم الكامل
    if (command === 'تحكم') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ هذا الأمر مخصص لمديري النظام فقط.');
        }

        const targetCmd = args[0];
        const action = args[1];

        if (!targetCmd || !['تفعيل', 'تعطيل'].includes(action)) {
            return message.reply('📝 **الاستخدام الصحيح:** `!تحكم [اسم_الأمر] [تفعيل/تعطيل]`\nمثال: `!تحكم مسح تعطيل`');
        }

        if (action === 'تعطيل') {
            disabledCommands.add(targetCmd);
            return message.reply(`🔒 تم **تعطيل** أمر \`!${targetCmd}\` بنجاح في السيرفر.`);
        } else {
            disabledCommands.delete(targetCmd);
            return message.reply(`🔓 تم **إعادة تفعيل** أمر \`!${targetCmd}\` بنجاح.`);
        }
    }

    // 2. أمر مسح الرسائل (!م)
    if (command === 'مسح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('❌ لا تملك صلاحية إدارة الرسائل.');
        const amount = parseInt(args[0]) || 100;
        if (amount < 1 || amount > 100) return message.reply('❌ يرجى اختيار عدد بين 1 و 100.');
        
        await message.channel.bulkDelete(amount, true);
        return message.channel.send(`🧹 **تم مسح ${amount} رسالة بنجاح.**`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }

    // 3. أمر معرفة مستوى الليفل الحالي (!ل)
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
            .setTimestamp();

        return message.reply({ embeds: [levelEmbed] });
    }

    // 4. أمر إنشاء نظام التذاكر المطور (!ت)
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

    // 5. أمر قفل الروم (!ق)
    if (command === 'قفل') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        return message.reply('🔒 **تم إغلاق الغرفة بنجاح.**');
    }

    // 6. أمر فتح الروم (!ف)
    if (command === 'فتح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        return message.reply('🔓 **تم إعادة فتح الغرفة للجميع.**');
    }

    // 7. أمر البنج (!ب)
    if (command === 'بنج') {
        return message.reply(`🏓 **سرعة اتصال النظام:** \`${client.ws.ping}ms\``);
    }

    // 8. أمر روليت
    if (command === 'روليت') {
        const outcomes = ['💀 تم إقصاؤك من اللعبة بالرصاصة!', '😎 محظوظ! نجوت هذه المرة.', '💥 طاخ! خسرت الحولة.'];
        return message.reply(`🎲 **نتيجتك في الروليت:** ${outcomes[Math.floor(Math.random() * outcomes.length)]}`);
    }

    // 9. أمر سرعة (!س)
    if (command === 'سرعة') {
        const words = ['ديسكورد', 'برمجة', 'سيرفر', 'تطوير', 'بوت', 'حماية', 'إبداع'];
        const chosenWord = words[Math.floor(Math.random() * words.length)];
        await message.reply(`⏱️ **أسرع شخص يكتب الكلمة التالية:** \`${chosenWord}\``);
        
        const filter = m => m.content === chosenWord && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            m.reply(`🎉 **كفو! أنت أسرع واحد كتبها وصح.**`);
        });
    }

    // 10. أمر صراحة (!ص)
    if (command === 'صراحة') {
        const questions = [
            'هل أنت راضٍ عن حياتك الحالية؟',
            'ما هو أكثر شيء تندم عليه؟',
            'من هو الشخص المفضل لديك في هذا السيرفر؟',
            'ما هي أكبر مخاوفك؟'
        ];
        return message.reply(`🤔 **سؤال صراحة لك:** ${questions[Math.floor(Math.random() * questions.length)]}`);
    }

    // 11. أمر خيروك (!خ)
    if (command === 'خيروك') {
        const choices = [
            'لو خيروك: تعيش وحيد في جزيرة 🏝️ أو تعيش مع شخص تكرهه في قصر 🏰؟',
            'لو خيروك: تفقد القدرة على الكلام 🤐 أو تفقد القدرة على السمع 🔇؟',
            'لو خيروك: تمتلك قوة الطيران 🦅 أو قوة الاختفاء 👻؟'
        ];
        return message.reply(`🤷‍♂️ **لو خيروك:**\n${choices[Math.floor(Math.random() * choices.length)]}`);
    }

    // 12. أمر المساعدة المطور والكامل
    if (command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('✨ دليل الأوامر المتكامل والخرافي')
            .setDescription('جميع الأوامر تدعم الاختصارات والتحكم الكامل بالتعطيل والتفعيل.')
            .addFields(
                { name: '⚙️ أوامر الإدارة والتحكم', value: '`!تحكم` (لتعطيل/تفعيل الأوامر)\n`!تذاكر` (أو `!ت` لانشاء نظام التذاكر)\n`!مسح` (أو `!م` لتنظيف الشات)\n`!قفل` (`!ق`) & `!فتح` (`!ف`)' },
                { name: '📊 أوامر النظام العام', value: '`!ليفل` (أو `!ل` لعرض مستواك الحالي)\n`!بنج` (أو `!ب` لعرض سرعة الاستجابة)' },
                { name: '🎮 أوامر التسلية والألعاب', value: '`!روليت` (لعبة الحظ)\n`!سرعة` (أو `!س` لتحدي الكتابة السريعة)\n`!صراحة` (أو `!ص` لأسئلة الصراحة)\n`!خيروك` (أو `!خ` لألعاب الخيارات)' }
            )
            .setFooter({ text: 'البوت مجهز ومحمي بالكامل ضد الانهيار' })
            .setTimestamp();
        return message.reply({ embeds: [helpEmbed] });
    }
});

// ================= ⚡ التفاعلات ونظام التذاكر =================
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

        ticketCreators.set(channel.id, {
            userId: interaction.user.id,
            openedAt: new Date().toLocaleString('ar-EG'),
            department: deptName
        });

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle(`✨ تذكرة جديدة - قسم ${deptName}`)
            .setDescription(`مرحباً بك ${interaction.user}، تم فتح تذكرتك بنجاح. اكتب تفاصيل مشكلتك وسيرد عليك الدعم الفني قريباً.\n\n🔒 **عند الانتهاء، اضغط على الزر ليتم إرسال التفاصيل لخاصك وحذف الروم.**`)
            .setTimestamp();

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 إغلاق التذكرة والأرشفة').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [closeBtn] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك هنا: ${channel}` });
    }

    if (interaction.isButton() && interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 **جاري معالجة الأرشيف وإرساله لخاص العضو، سيتم الحذف بعد 5 ثوانٍ...**');
        
        const ticketData = ticketCreators.get(interaction.channel.id);
        
        if (ticketData) {
            try {
                const fetchedMessages = await interaction.channel.messages.fetch({ limit: 50 });
                let transcriptText = fetchedMessages.reverse()
                    .map(m => `[${m.createdAt.toLocaleTimeString('ar-EG')}] ${m.author.tag}: ${m.content}`)
                    .join('\n');

                const dmEmbed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('📋 أرشيف تذكرتك المغلقة')
                    .setDescription(`مرحباً بك، إليك كافة تفاصيل تذكرتك بعد أن تم إغلاقها للتوثيق والمراجعة:`)
                    .addFields(
                        { name: '📁 قسم الدعم', value: `\`${ticketData.department}\``, inline: true },
                        { name: '📅 تاريخ الفتح', value: `\`${ticketData.openedAt}\``, inline: true },
                        { name: '🔒 أُغلقت بواسطة', value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp();

                const member = await interaction.guild.members.fetch(ticketData.userId).catch(() => null);
                if (member) {
                    await member.send({ 
                        embeds: [dmEmbed],
                        files: [{
                            attachment: Buffer.from(transcriptText || "لم يتم العثور على رسائل."),
                            name: `transcript-${interaction.channel.name}.txt`
                        }]
                    }).catch(() => console.log("⚠️ تعذر الإرسال للخاص لأن حساب العضو مغلق."));
                }
            } catch (err) {
                console.error("خطأ بالأرشفة:", err);
            }
            ticketCreators.delete(interaction.channel.id);
        }

        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

const app = express();
app.get('/', (req, res) => { res.send('<h1 style="text-align:center; padding-top:50px;">🌐 النظام الخرافي المتكامل جاهز ويعمل</h1>'); });
app.listen(config.port);

client.login(process.env.DISCORD_TOKEN || 'ضع_التوكن_هنا');
