const { 
    Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, 
    ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, 
    StringSelectMenuBuilder, AttachmentBuilder 
} = require('discord.js');
const express = require('express');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildVoiceStates
    ]
});

// --- 📦 قاعدة البيانات والتحكم ---
const db = {
    disabledCmds: new Set(),
    levels: new Map(),
    tickets: new Map(),
    autoLine: new Set(), // تخزين آيدي الرومات التي تدعم الخط التلقائي
    logsChannel: null    // قناة اللوجات
};

const config = {
    prefix: "!",
    lineLink: "https://i.imgur.com/your-line-link.png", // ضع رابط خطك هنا
    ownerId: "YOUR_ID" // آيدي حسابك الشخصي
};

// --- 🛡️ نظام الحماية من الانهيار (Elite Protection) ---
process.on('unhandledRejection', (reason) => console.log('🛑 حماية: خطأ غير معالج:', reason));
process.on('uncaughtException', (err) => console.log('🛑 حماية: استثناء قاتل:', err));

client.once('ready', () => {
    console.log(`🚀 Elite Bot Is Ready: ${client.user.tag}`);
});

// --- 📩 معالجة الرسائل والأوامر ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // 1️⃣ نظام الأوتو لاين (Auto-Line)
    if (db.autoLine.has(message.channel.id)) {
        message.channel.send(config.lineLink).catch(() => {});
    }

    // 2️⃣ نظام الليفل (XP)
    const authorId = message.author.id;
    let u = db.levels.get(authorId) || { xp: 0, lvl: 1 };
    u.xp += 15;
    if (u.xp >= u.lvl * 150) {
        u.lvl++;
        u.xp = 0;
        message.channel.send(`✨ **كفو ${message.author}! ارتقيت للمستوى [ ${u.lvl} ]**`).then(m => setTimeout(() => m.delete(), 5000));
    }
    db.levels.set(authorId, u);

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmdInput = args.shift().toLowerCase();

    // 3️⃣ نظام الاختصارات والداشبورد الداخلي
    const aliases = {
        'م': 'مسح', 'ق': 'قفل', 'ف': 'فتح', 'ت': 'تذاكر', 'ل': 'ليفل', 'ح': 'تحكم', 
        'خط': 'اوتولاين', 'لوج': 'لوجات', 'ر': 'روليت'
    };
    const command = aliases[cmdInput] || cmdInput;

    if (db.disabledCmds.has(command) && command !== 'تحكم') return message.reply('❌ هذا الأمر معطل حالياً.');

    // --- 🎮 أوامر الألعاب (الروليت المرئي) ---
    if (command === 'روليت') {
        const frames = ["🌑", "🌑", "🌑", "🌑", "🌑", "🔴"];
        let msg = await message.reply("🔄 **جاري تدوير الروليت...**");
        
        // محاكاة بصرية بسيطة
        let i = 0;
        let interval = setInterval(async () => {
            await msg.edit(`🔄 **تـدوير: [ ${frames[i % frames.length]} ]**`);
            i++;
            if (i > 5) {
                clearInterval(interval);
                const win = Math.random() > 0.5;
                if (!win) {
                    await msg.edit("💥 **طاااااخ! الرصاصة في رأسك!**");
                    if (message.member.kickable) message.member.timeout(60000, "خسر في الروليت");
                } else {
                    await msg.edit("😎 **نجوت! الرصاصة كانت فارغة.**");
                }
            }
        }, 800);
    }

    // --- 🛡️ أوامر الإدارة والتحكم (Dashboard) ---
    if (command === 'تحكم') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const target = args[0];
        const action = args[1]; // تفعيل / تعطيل
        if (action === 'تعطيل') db.disabledCmds.add(target);
        else db.disabledCmds.delete(target);
        message.reply(`✅ تم ${action} أمر [ ${target} ] بنجاح.`);
    }

    if (command === 'اوتولاين') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        if (db.autoLine.has(message.channel.id)) {
            db.autoLine.delete(message.channel.id);
            message.reply("📴 تم تعطيل الخط التلقائي هنا.");
        } else {
            db.autoLine.add(message.channel.id);
            message.reply("🔛 تم تفعيل الخط التلقائي في هذه القناة.");
        }
    }

    // --- 🎫 نظام التذاكر الأحدث (The Master Ticket) ---
    if (command === 'تذاكر') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const ticketEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎫 مركز الدعم الفني المطور')
            .setDescription('يرجى اختيار القسم المناسب لفتح تذكرة وسيتم الرد عليك فوراً.')
            .setThumbnail(message.guild.iconURL());

        const menu = new StringSelectMenuBuilder()
            .setCustomId('elite_ticket')
            .setPlaceholder('اختر القسم...')
            .addOptions([
                { label: 'الدعم الفني', value: 'tech', emoji: '🛠️' },
                { label: 'الشكاوى', value: 'report', emoji: '⚖️' },
                { label: 'التقديم للإدارة', value: 'apply', emoji: '📝' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);
        message.channel.send({ embeds: [ticketEmbed], components: [row] });
    }
});

// --- ⚡ معالجة التفاعلات (التذاكر واللوجات) ---
client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'elite_ticket') {
        const type = interaction.values[0];
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        });

        db.tickets.set(channel.id, interaction.user.id);

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('🎫 تذكرة جديدة')
            .setDescription(`مرحباً ${interaction.user}، فريق **${type}** سيتواصل معك قريباً.\nاضغط الزر أدناه لحفظ الأرشيف وإغلاق التذكرة.`);

        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_elite').setLabel('إغلاق وأرشفة').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [welcomeEmbed], components: [closeBtn] });
        await interaction.reply({ content: `✅ تم فتح تذكرتك: ${channel}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'close_elite') {
        const ownerId = db.tickets.get(interaction.channel.id);
        const owner = await client.users.fetch(ownerId).catch(() => null);
        
        await interaction.reply("🔒 جاري إرسال الأرشيف وإغلاق التذكرة...");

        // نظام الأرشفة (Transcript) المبسط
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');
        
        if (owner) {
            const file = new AttachmentBuilder(Buffer.from(transcript), { name: 'transcript.txt' });
            await owner.send({ content: `📋 أرشيف تذكرتك في سيرفر **${interaction.guild.name}**`, files: [file] }).catch(() => {});
        }

        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

// --- 🌐 تشغيل السيرفر ---
const app = express();
app.get('/', (req, res) => res.send('Elite Bot is Online!'));
app.listen(3000);

client.login(process.env.DISCORD_TOKEN || config.token);
