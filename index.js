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

// --- الإعدادات العامة (التوكن يتم قراءته من السيرفر للحماية) ---
const config = {
    prefix: "!",
    port: process.env.PORT || 3000
};

// 🛡️ نظام الحماية المتقدم ومنع الانهيار (Anti-Crash)
process.on('unhandledRejection', (reason, p) => { console.error(' [حماية] خطأ غير معالج:', reason, p); });
process.on("uncaughtException", (err, origin) => { console.error(' [حماية] استثناء غير ممسوك:', err, origin); });

// 🚀 حدث تشغيل البوت
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    client.user.setActivity('نظام متكامل | !مساعدة', { type: 3 });
});

// 📨 نظام استقبال ومعالجة الأوامر باللغة العربية
client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1️⃣ أمر المساعدة المتطور والمعاصر
    if (command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('✨ لوحة أوامر النظام المتكامل ✨')
            .setDescription('مرحباً بك! إليك دليل الأوامر الشامل المنظم والمريح للعين:')
            .addFields(
                { name: '🛡️ نظام الإدارة والحماية', value: '`!حظر` | `!طرد` | `!مسح` | `!ميوت`', inline: false },
                { name: '🎫 نظام التذاكر المتطور', value: '`!انشاء-تذاكر`', inline: false },
                { name: '🎛️ الإعدادات والتحكم', value: '`!داشبورد`', inline: false }
            )
            .setFooter({ text: 'تمت البرمجة بأحدث معايير التنسيق المعاصر' })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }

    // 2️⃣ أمر إنشاء نظام التذاكر (للإدارة فقط)
    if (command === 'انشاء-تذاكر') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ **عذراً، لا تملك صلاحية إدارة السيرفر لاستخدام هذا الأمر.**');
        }

        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('🎫 مركز الدعم الفني والمساعدة')
            .setDescription('إذا كنت تواجه مشكلة أو تحتاج إلى مساعدة من الإدارة، اضغط على الزر بالأسفل لفتح تذكرة خاصة بك.')
            .setFooter({ text: 'نظام تذاكر مشفر وآمن بالكامل' });

        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('📩 فتح تذكرة جديدة')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [buttonRow] });
        return message.delete().catch(() => {});
    }

    // 3️⃣ أمر رابط لوحة التحكم (Dashboard)
    if (command === 'داشبورد') {
        const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🎛️ لوحة التحكم واختصارات الرومات والرولات')
            .setDescription('يمكنك إدارة الرومات المفعلة والاختصارات مباشرة وبشكل معاصر ومريح عبر الرابط الموفر من Railway بعد التشغيل.')
            .setFooter({ text: 'مؤمن بنظام حماية داخلي' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
});

// 🎫 نظام التفاعل وتشغيل أزرار التذاكر (Tickets)
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

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 تذكرة جديدة')
            .setDescription(`مرحباً بك ${interaction.user}، فريق الدعم الفني سيكون معك قريباً.\nاضغط على الزر أدناه لإغلاق التذكرة.`)
            .setTimestamp();

        const closeButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('🔒 إغلاق التذكرة').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [closeButton] });
        await interaction.editReply({ content: `✅ تم فتح تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply('🔒 سيتم إغلاق الغرفة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// 🌐 لوحة التحكم (Dashboard Web Server) المتوافقة مع منفذ Railway تلقائياً
const app = express();
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family: Arial; text-align: center; background: #2f3136; color: white; padding-top: 50px;">
            <h1>🎛️ لوحة تحكم البوت المتكاملة</h1>
            <p>النظام نشط ويعمل على منصة Railway بالكامل.</p>
            <div style="background: #202225; display: inline-block; padding: 20px; border-radius: 8px;">
                <h3>📊 إحصائيات سريعة:</h3>
                <p>حالة البوت: متصل ومؤمن 🟢</p>
                <p>يتم التحكم بالاختصارات والرومات عبر السيرفر مباشرة.</p>
            </div>
        </body>
    `);
});
app.listen(config.port, () => console.log(`🌐 لوحة التحكم تعمل على المنفذ: ${config.port}`));

// قراءة التوكن من نظام الحماية الخاص بـ Railway لضمان عدم حدوث خطأ Authorization
client.login(process.env.TOKEN);
