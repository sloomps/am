const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const config = require('./config.json');

// 🛡️ نظام الحماية المتقدم (يمنع توقف البوت نهائياً بسبب أي خطأ)
process.on('unhandledRejection', (reason, p) => { console.error(' [حماية] خطأ غير معالج:', reason, p); });
process.on("uncaughtException", (err, origin) => { console.error(' [حماية] استثناء غير ممسوك:', err, origin); });

// 📁 قراءة الأوامر من المجلدات تلقائياً
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFolders = fs.readdirSync(commandsPath);
    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));
            client.commands.set(command.name, command);
        }
    }
}

// 🚀 حدث تشغيل البوت
client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح: ${client.user.tag}`);
    client.user.setActivity('نظام متكامل | !مساعدة', { type: 3 });
});

// 📨 استقبال الأوامر والتحقق من الرتب والصلاحيات
client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    // التحقق من الصلاحيات (نظام الرتب الآمن)
    if (command.permissions && !message.member.permissions.has(command.permissions)) {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription('❌ **عذراً، لا تملك الصلاحيات الكافية لاستخدام هذا الأمر.**');
        return message.reply({ embeds: [embed] });
    }

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('❌ حدث خطأ غير متوقع أثناء تنفيذ الأمر.');
    }
});

// 🎫 نظام التفاعل مع أزرار التذاكر (Tickets)
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        await interaction.deferReply({ ephemeral: true });
        
        // إنشاء غرفة التذكرة بحماية وصلاحيات محددة
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

// 🌐 لوحة التحكم (Dashboard) - خادم الويب الأساسي لربط الاختصارات والرومات
const app = express();
app.get('/', (req, res) => {
    res.send(`
        <body style="font-family: Arial; text-align: center; background: #2f3136; color: white; padding-top: 50px;">
            <h1>🎛️ لوحة تحكم البوت المتكاملة</h1>
            <p>النظام نشط ويعمل باللغة العربية بالكامل.</p>
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
