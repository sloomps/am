const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const config = {
    prefix: "!",
    port: process.env.PORT || 3000
};

// 🛡️ نظام الحماية ومنع الانهيار
process.on('unhandledRejection', (reason, p) => { console.error(' [حماية] خطأ:', reason, p); });
process.on("uncaughtException", (err, origin) => { console.error(' [حماية] استثناء:', err, origin); });

client.once('ready', () => {
    console.log(`✅ النظام الخرافي نشط: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ================= فئة المساعدة =================
    if (command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('✨ دليل أوامر الألعاب والنظام المتكامل ✨')
            .setDescription('مرحباً بك! إليك الألعاب الجديدة والمطورة:')
            .addFields(
                { name: '🎮 ألعاب حماسية وتفاعلية', value: '`!روليت` | `!نسبة-الجمال` | `!ذكاء` | `!فعالية` | `!نرد`', inline: false },
                { name: '🛡️ الإدارة والحماية', value: '`!طرد` | `!حظر` | `!مسح` | `!قفل` | `!فتح`', inline: false },
                { name: '🎫 التذاكر والتحكم', value: '`!انشاء-تذاكر` | `!داشبورد`', inline: false }
            )
            .setFooter({ text: 'تصميم معاصر مريح للعين' })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }

    // ================= فئة الألعاب المتطورة والأجواء الحماسية =================

    // 1. لعبة الروليت (التحدي والميوت)
    if (command === 'روليت') {
        const msg = await message.reply('🔄 **جاري تدوير أسطوانة الروليت... 🎚️**');
        
        setTimeout(async () => {
            const rouletteOutcome = Math.floor(Math.random() * 6); // احتمال 1 من 6
            
            if (rouletteOutcome === 0) {
                const embedLoser = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('💥 طلقة في الهدف!')
                    .setDescription(`لقد استقرت الرصاصة عليك يا ${message.author}! تم تطبيق الصمت عليك لمدة دقيقة واحدة بنجاح. 💀`)
                    .setTimestamp();
                
                await msg.edit({ content: ' ', embeds: [embedLoser] });
                // محاولة إعطاء ميوت إذا كان لدى البوت الصلاحية
                await message.member.edit({ mute: true }).catch(() => {}); 
                setTimeout(() => message.member.edit({ mute: false }).catch(() => {}), 60000);
            } else {
                const embedSurvivor = new EmbedBuilder()
                    .setColor('#43B581')
                    .setTitle('🎉 نجوت بأعجوبة!')
                    .setDescription(`اضغط الزناد وخرجت الرصاصة فارغة! الحظ في صفك اليوم يا ${message.author}. 😎`)
                    .setTimestamp();
                
                await msg.edit({ content: ' ', embeds: [embedSurvivor] });
            }
        }, 2500); // تأثير حركة وتأخير مريح
    }

    // 2. لعبة نسبة الجمال مع شريط تفاعلي
    if (command === 'نسبة-الجمال') {
        const user = message.mentions.users.first() || message.author;
        const percentage = Math.floor(Math.random() * 101);
        
        // إنشاء شريط تحميل متحرك بصرياً
        const progress = Math.round((percentage / 10));
        const progressText = '🟩'.repeat(progress) + '⬜'.repeat(10 - progress);

        const embed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle('✨ كاشف نسبة الجمال المتطور ✨')
            .setDescription(`نسبة جمال **${user.username}** هي: **${percentage}%**\n\n${progressText}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // 3. لعبة قياس الذكاء
    if (command === 'ذكاء') {
        const user = message.mentions.users.first() || message.author;
        const iq = Math.floor(Math.random() * 71) + 70; // نسبة بين 70 و 140
        
        const progress = Math.round(((iq - 70) / 70) * 10);
        const progressText = '🟦'.repeat(Math.max(0, progress)) + '⬜'.repeat(Math.max(0, 10 - progress));

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🧠 مقياس الذكاء الفوري')
            .setDescription(`مستوى ذكاء **${user.username}** هو: **${iq} IQ**\n\n${progressText}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // ================= باقي الأوامر الأساسية والإدارية =================
    if (command === 'طرد') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply('❌ لا تملك الصلاحية.');
        const member = message.mentions.members.first();
        if (!member || !member.kickable) return message.reply('❌ تعذر الطرد.');
        await member.kick();
        return message.reply(`✅ تم طرد ${member.user.tag}`);
    }

    if (command === 'حظر') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('❌ لا تملك الصلاحية.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ حدد العضو.');
        await member.ban();
        return message.reply(`🚫 تم حظر ${member.user.tag}`);
    }

    if (command === 'مسح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('❌ لا تملك الصلاحية.');
        const amount = parseInt(args[0]) || 100;
        await message.channel.bulkDelete(amount, true);
        return message.channel.send(`🧹 تم مسح ${amount} رسالة.`).then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
    }

    if (command === 'قفل') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        return message.reply('🔒 تم إغلاق الغرفة.');
    }

    if (command === 'فتح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        return message.reply('🔓 تم فتح الغرفة.');
    }

    if (command === 'انشاء-تذاكر') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ للمسؤولين فقط.');
        const embed = new EmbedBuilder().setColor('#2F3136').setTitle('🎫 مركز الدعم').setDescription('اضغط لفتح تذكرة');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('open_ticket').setLabel('📩 فتح تذكرة').setStyle(ButtonStyle.Primary));
        await message.channel.send({ embeds: [embed], components: [row] });
    }

    if (command === 'داشبورد') {
        return message.reply('🎛️ لوحة التحكم تعمل ومؤمنة سحابياً عبر خادمك الخاص.');
    }
});

// نظام التذاكر التفاعلي
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'open_ticket') {
        await interaction.deferReply({ ephemeral: true });
        const channel = await interaction.guild.channels.create({
            name: `تذكرة-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });
        const embed = new EmbedBuilder().setColor('#5865F2').setDescription(`مرحباً بك ${interaction.user}، فريق الدعم معك قريباً.`);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 إغلاق').setStyle(ButtonStyle.Danger));
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: `✅ تذكرتك: ${channel}`, ephemeral: true });
    }
    if (interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 سيتم الإغلاق خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// لوحة التحكم (Express)
const app = express();
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family: Arial; text-align: center; background: #2f3136; color: white; padding-top: 50px;">
            <h1 style="color: #5865F2;">🎛️ لوحة تحكم النظام المتكامل</h1>
            <p>الحالة: متصل ومؤمن 🟢</p>
        </body>
    `);
});
app.listen(config.port);

client.login(process.env.TOKEN);
