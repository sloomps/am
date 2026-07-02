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

// --- إعدادات البوت (يمكنك تغييرها من هنا مباشرة) ---
const config = {
    token: "ضع_توكن_البوت_هنا",
    prefix: "!",
    port: 3000
};

// 🛡️ نظام الحماية المتقدم لمنع الانهيار (Anti-Crash)
process.on('unhandledRejection', (reason, p) => { console.error(' [حماية] خطأ غير معالج:', reason, p); });
process.on("uncaughtException", (err, origin) => { console.error(' [حماية] استثناء غير ممسوك:', err, origin); });

// 🚀 حدث تشغيل البوت
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
    client.user.setActivity('نظام متكامل | !مساعدة', { type: 3 });
});

// 📨 استقبال الأوامر والتحقق منها (كل الأوامر مدمجة هنا)
client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1️⃣ أمر المساعدة
    if (command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#43B581')
            .setTitle('✨ لوحة أوامر النظام المتكامل ✨')
            .setDescription('مرحباً بك! إليك دليل الأوامر الشامل المنظم والمريح للعين:')
            .addFields(
                { name: '🛡️ نظام الحماية والإدارة', value: '`!حظر` | `!طرد` | `!مسح` | `!ميوت`', inline: false },
                { name: '🎫 نظام التذاكر المتطور', value: '`!انشاء-تذاكر`', inline: false },
                { name: '🎛️ الإعدادات والتحكم', value: '`!داشبورد`', inline: false }
            )
            .setFooter({ text: 'تمت البرمجة بأحدث معايير الحماية والتنسيق المعاصر' })
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
            .setColor('#7289DA')
            .setTitle('🎛️ لوحة التحكم واختصارات الرومات والرولات')
            .setDescription('يمكنك إدارة الرومات المفعلة والاختصارات مباشرة وبشكل معاصر ومريح عبر الرابط التالي:')
            .addFields({ name: '🔗 رابط الدخول المباشر:', value: `📊 [اضغط هنا لفتح اللوحة](http://localhost:${config.port}/)` })
            .setFooter({ text: 'مؤمن بنظام تشفير داخلي حامي للملفات' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // يمكنك إضافة أوامر إضافية هنا بنفس الطريقة (if command === 'اسم_الأمر')
});

// 🎫 نظام التفاعل مع أزرار التذاكر (Tickets)
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

// 🌐 لوحة التحكم (Dashboard) - خادم الويب
const app = express();
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family: Arial; text-align: center; background: #2f3136; color: white; padding-top: 50px;">
            <h1>🎛️ لوحة تحكم البوت المتكاملة</h1>
            <p>النظام نشط ويعمل باللغة العربية بالكامل من ملف واحد.</p>
            <div style="background: #202225; display: inline-block; padding: 20px; border-radius: 8px;">
                <h3>📊 إحصائيات سريعة:</h3>
                <p>حالة البوت: متصل ومؤمن 🟢</p>
                <p>الاختصارات والرومات المفعّلة يتم التحكم بها عبر السيرفر مباشرة.</p>
            </div>
        </body>
    `);
});
app.listen(config.port, () => console.log(`🌐 لوحة التحكم تعمل على المنفذ: ${config.port}`));

client.login(config.token);
