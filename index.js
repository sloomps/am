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

    // ================= فئة المساعدة الشاملة والجديدة =================
    if (command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('✨ دليل أوامر النظام الشامل والمطور (40 أمر) ✨')
            .setDescription('مرحباً بك! إليك قائمة بجميع الأوامر مقسمة ومنسقة لسهولة الوصول إليها:')
            .addFields(
                { name: '🎮 ألعاب وتسلية حماسية', value: '`!روليت` | `!نسبة-الجمال` | `!ذكاء` | `!تخمين` | `!نسبة-الحب` | `!نكتة` | `!تحدي` | `!حظي` | `!عملة` | `!سؤال` | `!مرجلة` | `!عقاب` | `!نسبة-الغباء` | `!سلة` | `!سهم` | `!كذب` | `!تحفيز`', inline: false },
                { name: '🛡️ الإدارة والإشراف والحماية', value: '`!طرد` | `!حظر` | `!مسح` | `!قفل` | `!فتح` | `!تعطيل-الكل` | `!تفعيل-الكل` | `!اسكت` | `!تكلم` | `!طرد-صوتي` | `!الادارة` | `!صلاحياتي` | `!تنظيف-البوتات` | `!تثبيت` | `!الغاء-تثبيت` | `!اخر-حظر`', inline: false },
                { name: '⚙️ الخدمات والتحكم والرومات', value: '`!صنع-رتبة` | `!حذف-رتبة` | `!تعديل-الاسم` | `!اخفاء` | `!انشاء-تذاكر` | `!داشبورد` | `!قول` | `!فحص-رتبة` | `!صنع-روم` | `!حذف-الروم`', inline: false },
                { name: '📊 معلومات السيرفر والحساب', value: '`!رحب` | `!حسابي` | `!افتار` | `!الرومات` | `!الوقت` | `!ايقونة` | `!المتصلين-صوتيا`', inline: false }
            )
            .setFooter({ text: 'النظام مبرمج ومؤمن بالكامل لمجتمعكم المتكامل' })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }

    // ================= فئة الألعاب المتطورة والأجواء الحماسية =================

    // 1. لعبة الروليت (التحدي والميوت)
    if (command === 'روليت') {
        const msg = await message.reply('🔄 **جاري تدوير أسطوانة الروليت... 🎚️**');
        
        setTimeout(async () => {
            const rouletteOutcome = Math.floor(Math.random() * 6);
            
            if (rouletteOutcome === 0) {
                const embedLoser = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('💥 طلقة في الهدف!')
                    .setDescription(`لقد استقرت الرصاصة عليك يا ${message.author}! تم تطبيق الصمت عليك لمدة دقيقة واحدة بنجاح. 💀`)
                    .setTimestamp();
                
                await msg.edit({ content: ' ', embeds: [embedLoser] });
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
        }, 2500);
    }

    // 2. لعبة نسبة الجمال مع شريط تفاعلي
    if (command === 'نسبة-الجمال') {
        const user = message.mentions.users.first() || message.author;
        const percentage = Math.floor(Math.random() * 101);
        
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
        const iq = Math.floor(Math.random() * 71) + 70; 
        
        const progress = Math.round(((iq - 70) / 70) * 10);
        const progressText = '🟦'.repeat(Math.max(0, progress)) + '⬜'.repeat(Math.max(0, 10 - progress));

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🧠 مقياس الذكاء الفوري')
            .setDescription(`مستوى ذكاء **${user.username}** هو: **${iq} IQ**\n\n${progressText}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // 4. لعبة التخمين العشوائي (توقع الرقم)
    if (command === 'تخمين') {
        const randomNumber = Math.floor(Math.random() * 10) + 1;
        const userGuess = parseInt(args[0]);
        if (!userGuess || userGuess < 1 || userGuess > 10) return message.reply('❌ يرجى تخمين رقم من 1 إلى 10! مثال: `!تخمين 5`');
        
        if (userGuess === randomNumber) {
            return message.reply(`🎉 **إجابة صحيحة مذهلة!** الرقم العشوائي كان بالفعل **${randomNumber}**. ذكاؤك خارق! 😎`);
        } else {
            return message.reply(`😢 **للأسف تخمين خاطئ!** الرقم الصحيح كان **${randomNumber}**. حاول مجدداً البركة بالجايات! 🔄`);
        }
    }

    // 5. لعبة نسبة الحب
    if (command === 'نسبة-الحب') {
        const user = message.mentions.users.first();
        if (!user) return message.reply('❌ يرجى تحديد العضو الذي تريد قياس نسبة التوافق معه عبر المنشن.');
        const lovePercentage = Math.floor(Math.random() * 101);
        
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('❤️ مقياس التوافق والمحبة المعاصر ❤️')
            .setDescription(`نسبة التوافق بينك وبين ${user} هي: **${lovePercentage}%** 💖`)
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    // 6. أمر نكتة عشوائية متجددة
    if (command === 'نكتة') {
        const jokes = [
            'مرة واحد اشترى حذاء ضيق، طلع فيه على التلفزيون وسووا معه مقابلة!',
            'محشش شاف إشارة "ممنوع الوقوف" قام انبطح!',
            'مرة مدرس رياضيات خلف ولدين واستنتج الثالث!'
        ];
        return message.reply(`😂 **نكتة اليوم:** ${jokes[Math.floor(Math.random() * jokes.length)]}`);
    }

    // 7. لعبة حجرة ورقة مقص ضد البوت
    if (command === 'تحدي') {
        const choices = ['حجرة', 'ورقة', 'مقص'];
        const userChoice = args[0];
        if (!userChoice || !choices.includes(userChoice)) return message.reply('❌ يرجى اختيار أحد الخيارات الثلاثة: `!تحدي حجرة` أو `ورقة` أو `مقص`');
        
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        let result = '';
        
        if (userChoice === botChoice) result = '👔 **تعادل مذهل! لعبنا نفس الشيء.**';
        else if (
            (userChoice === 'حجرة' && botChoice === 'مقص') ||
            (userChoice === 'ورقة' && botChoice === 'حجرة') ||
            (userChoice === 'مقص' && botChoice === 'ورقة')
        ) {
            result = '🎉 **كفو! أنت الفائز عليّ في هذا التحدي الحماسي!**';
        } else {
            result = '🤖 **هاردلك! البوت هو من فاز عليك هذه المرة!**';
        }
        
        return message.reply(`إختيارك: **${userChoice}** | إختيار البوت: **${botChoice}**\n\n${result}`);
    }

    // 8. أمر إظهار كرت الحظ العشوائي
    if (command === 'حظي') {
        const fortunes = [
            '🌟 اليوم هو يوم سعدك، هناك خبر مفرح في الطريق إليك!',
            '📉 اممم، يبدو أن الحظ ليس في أفضل حالاته اليوم، خذ قسطاً من الراحة.',
            '💰 قد تحصل على رتبة أو هدية قريباً جداً داخل السيرفر!'
        ];
        return message.reply(`🔮 **كرت حظك اليوم يقول:**\n\n${fortunes[Math.floor(Math.random() * fortunes.length)]}`);
    }

    // 9. أمر رمي العملة النقدية (طرة أو نقشة)
    if (command === 'عملة') {
        const sides = ['طرة (وجه)', 'نقشة (كتابة)'];
        return message.reply(`🪙 رميت العملة في الهواء واستقرت على: **${sides[Math.floor(Math.random() * sides.length)]}**`);
    }

    // 10. لعبة أسئلة عامة (سؤال وجواب تلقائي)
    if (command === 'سؤال') {
        const questions = [
            { q: 'ما هو أطول نهر في العالم؟', a: 'النيل' },
            { q: 'ما هي عاصمة اليابان؟', a: 'طوكيو' },
            { q: 'كم عدد قارات العالم؟', a: '7' },
            { q: 'ما هو كوكب الأحمر؟', a: 'المريخ' }
        ];
        const randomItem = questions[Math.floor(Math.random() * questions.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🧠 سؤال ثقافي سريع')
            .setDescription(`**${randomItem.q}**\n\n لديك 15 ثانية للإجابة بالـ شات (اكتب الإجابة فوراً بدون أمر)`)
            .setTimestamp();
            
        await message.reply({ embeds: [embed] });
        
        const filter = m => m.content.trim() === randomItem.a && !m.author.bot;
        message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] })
            .then(collected => {
                const winner = collected.first().author;
                message.channel.send(`🎉 كفو! الفائز هو ${winner} والإجابة الصحيحة هي **${randomItem.a}**`);
            })
            .catch(() => {
                message.channel.send(`⏱️ انتهى الوقت! لم يكتب أحد الإجابة الصحيحة. الإجابة هي: **${randomItem.a}**`);
            });
    }

    // 11. لعبة نسبة المرجلة (تسلية)
    if (command === 'مرجلة') {
        const user = message.mentions.users.first() || message.author;
        const rate = Math.floor(Math.random() * 101);
        return message.reply(`😎 نسبة المرجلة والكفو عند **${user.username}** هي: **${rate}%** 🔥`);
    }

    // 12. لعبة عقاب عشوائي
    if (command === 'عقاب') {
        const punishments = [
            'أرسل أخر صورة في معرض الصور الخاص بك 📸',
            'قم بتغيير اسمك في السيرفر إلى "أنا منبهر بالبوت" لمدة ساعة 📝',
            'اعترف بأكثر سر محرج لك في الشات العام 🤐',
            'منشن شخص واكتب له "أنا أحبك جداً" بدون تبرير 🤍'
        ];
        return message.reply(`😈 **عقابك العشوائي هو:**\n👉 ${punishments[Math.floor(Math.random() * punishments.length)]}`);
    }

    // 13. لعبة نسبة الغباء
    if (command === 'نسبة-الغباء') {
        const user = message.mentions.users.first() || message.author;
        const rate = Math.floor(Math.random() * 101);
        return message.reply(`🤪 نسبة الغباء الفطرية عند **${user.username}** هي: **${rate}%** 🧪`);
    }

    // 14. أمر رمي كرة السلة
    if (command === 'سلة') {
        const outcomes = ['🏀 وااااو! سجلت هدفا ثلاثياً رائعاً! 🎯', '❌ للأسف، ضربت الكرة في الحافة وخرجت!'];
        return message.reply(outcomes[Math.floor(Math.random() * outcomes.length)]);
    }

    // 15. أمر رمي السهم التفاعلي
    if (command === 'سهم') {
        const scores = ['🎯 100+ أصبت منتصف الهدف تماماً!', '🏹 50+ قريبة جداً من المنتصف!', '💨 0+ طارت الرصاصة خارج اللوحة بالكامل!'];
        return message.reply(scores[Math.floor(Math.random() * scores.length)]);
    }

    // 16. لعبة نسبة الكذب
    if (command === 'كذب') {
        const user = message.mentions.users.first() || message.author;
        const rate = Math.floor(Math.random() * 101);
        return message.reply(`🤥 جهاز كشف الكذب يقول أن نسبة كذب **${user.username}** الآن هي: **${rate}%**`);
    }

    // 17. أمر كلام عشوائي محفز
    if (command === 'تحفيز') {
        const quotes = [
            'لا تتوقف عندما تتعب، توقف عندما تنتهي! 💪',
            'الأشياء العظيمة تستغرق وقتاً، استمر في السعي وستصل 🚀',
            'أنت أقوى مما تظن، تذكر هذا دائماً ✨'
        ];
        return message.reply(`🌟 **حكمة ومحفز اليوم:** ${quotes[Math.floor(Math.random() * quotes.length)]}`);
    }

    // ================= فئة الأوامر الإدارية والإشرافية =================
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

    if (command === 'تعطيل-الكل') {
        if (!message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) return message.reply('❌ لا تملك صلاحية إدارة المنشن.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { MentionEveryone: false });
        return message.reply('🛡️ **تم تعطيل منشن @everyone و @here في هذه الغرفة بنجاح لحمايتها.**');
    }

    if (command === 'تفعيل-الكل') {
        if (!message.member.permissions.has(PermissionFlagsBits.MentionEveryone)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { MentionEveryone: true });
        return message.reply('🔓 **تم السماح بمنشن الجميع في هذه الغرفة مجدداً.**');
    }

    if (command === 'اسكت') {
        if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) return message.reply('❌ لا تملك صلاحية كتم الأعضاء.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ يرجى تحديد العضو المراد كتم صوته.');
        if (!member.voice.channel) return message.reply('❌ هذا العضو ليس متواجداً في روم صوتي حالياً.');
        
        await member.voice.setMute(true);
        return message.reply(`🔇 تم كتم صوت العضو **${member.user.username}** بنجاح.`);
    }

    if (command === 'تكلم') {
        if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) return message.reply('❌ لا تملك الصلاحية.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ يرجى تحديد العضو.');
        if (!member.voice.channel) return message.reply('❌ العضو ليس في روم صوتي.');
        
        await member.voice.setMute(false);
        return message.reply(`🔊 تم إلغاء كتم صوت **${member.user.username}**.`);
    }

    if (command === 'طرد-صوتي') {
        if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers)) return message.reply('❌ لا تملك صلاحية نقل أو طرد الأعضاء صوتياً.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ يرجى تحديد العضو.');
        if (!member.voice.channel) return message.reply('❌ العضو ليس في روم صوتي.');
        
        await member.voice.disconnect();
        return message.reply(`🚪 تم فصل العضو **${member.user.username}** من الروم الصوتي بنجاح.`);
    }

    if (command === 'الادارة') {
        const admins = message.guild.members.cache.filter(m => m.permissions.has(PermissionFlagsBits.Administrator) && !m.user.bot);
        return message.reply(`🛡️ **عدد مسؤولي الإدارة المتواجدين في السيرفر حالياً:** \`${admins.size}\` مسؤول.`);
    }

    if (command === 'صلاحياتي') {
        const permissions = message.guild.members.me.permissionsIn(message.channel).toArray();
        return message.reply(`🤖 **صلاحياتي داخل هذه الغرفة هي:**\n\`\`\`\n${permissions.join(', ')}\n\`\`\``);
    }

    if (command === 'تنظيف-البوتات') {
        if (message.author.id !== message.guild.ownerId) return message.reply('❌ هذا الأمر الحساس جداً مخصص فقط لصاحب السيرفر (Server Owner).');
        const bots = message.guild.members.cache.filter(m => m.user.bot && m.id !== client.user.id);
        
        bots.forEach(bot => bot.kick('تطهير السيرفر من البوتات الدخيلة').catch(() => {}));
        return message.reply(`🧹 **تم البدء في طرد جميع البوتات الدخيلة بنجاح لسلامة السيرفر.**`);
    }

    if (command === 'تثبيت') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('❌ لا تملك صلاحية إدارة الرسائل.');
        const messageId = args[0];
        if (!messageId) return message.reply('❌ يرجى وضع المعرف (ID) الخاص بالرسالة المراد تثبيتها بعد الأمر.');
        
        const msgToPin = await message.channel.messages.fetch(messageId).catch(() => null);
        if (!msgToPin) return message.reply('❌ تعذر العثور على الرسالة في هذه الغرفة.');
        
        await msgToPin.pin();
        return message.reply('📌 **تم تثبيت الرسالة بنجاح أعلى الغرفة.**');
    }

    if (command === 'الغاء-تثبيت') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return message.reply('❌ لا تملك الصلاحية.');
        const messageId = args[0];
        if (!messageId) return message.reply('❌ يرجى وضع الـ ID الخاص بالرسالة.');
        
        const msgToUnpin = await message.channel.messages.fetch(messageId).catch(() => null);
        if (!msgToUnpin) return message.reply('❌ لم أجد الرسالة.');
        
        await msgToUnpin.unpin();
        return message.reply('📌❌ **تم إزالة التثبيت عن الرسالة بنجاح.**');
    }

    if (command === 'اخر-حظر') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('❌ لا تملك صلاحية رؤية المحظورين.');
        const bans = await message.guild.bans.fetch({ limit: 1 });
        const lastBan = bans.first();
        if (!lastBan) return message.reply('📋 لا يوجد أي شخص محظور في قائمة الحظر حالياً.');
        return message.reply(`🚫 **آخر شخص تم حظره هو:** \`${lastBan.user.tag}\` | **السبب:** \`${lastBan.reason || 'غير محدد'}\``);
    }

    // ================= فئة الإعدادات، الرتب والرومات =================
    if (command === 'صنع-رتبة') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ لا تملك صلاحية إدارة الرتب.');
        const roleName = args.join(' ');
        if (!roleName) return message.reply('❌ يرجى كتابة اسم الرتبة المراد إنشاؤها بعد الأمر.');
        
        await message.guild.roles.create({ name: roleName, color: '#99AAB5' });
        return message.reply(`✅ تم إنشاء الرتبة الجديدة باسم: **${roleName}** بنجاح.`);
    }

    if (command === 'حذف-رتبة') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply('❌ لا تملك الصلاحية.');
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❌ يرجى عمل منشن للرتبة المراد حذفها.');
        
        await role.delete();
        return message.reply(`🗑️ تم حذف الرتبة بنجاح.`);
    }

    if (command === 'تعديل-الاسم') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك صلاحية إدارة الرومات.');
        const newName = args.join('-');
        if (!newName) return message.reply('❌ يرجى كتابة الاسم الجديد للروم.');
        
        await message.channel.setName(newName);
        return message.reply(`📝 تم تغيير اسم الغرفة إلى: **${newName}**`);
    }

    if (command === 'اخفاء') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false });
        return message.reply('👁️❌ **تم إخفاء هذه الغرفة عن الجميع بنجاح.**');
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

    if (command === 'قول') {
        const text = args.join(' ');
        if (!text) return message.reply('❌ اكتب الكلام الذي تريدني أن أكرره.');
        await message.delete().catch(() => {});
        return message.channel.send(text);
    }

    if (command === 'فحص-رتبة') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❌ يرجى عمل منشن للرتبة المراد فحصها.');
        return message.reply(`👥 **عدد الأعضاء الذين يملكون رتبة ${role.name} حالياً:** \`${role.members.size}\` عضو.`);
    }

    if (command === 'صنع-روم') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك صلاحية إدارة الغرف.');
        const roomName = args.join('-');
        if (!roomName) return message.reply('❌ اكتب اسم الروم المراد إنشاؤه.');
        
        const newChan = await message.guild.channels.create({ name: roomName, type: ChannelType.GuildText });
        return message.reply(`✅ تم إنشاء الغرفة الكتابية الجديدة بنجاح: ${newChan}`);
    }

    if (command === 'حذف-الروم') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ لا تملك الصلاحية.');
        await message.reply('⚠️ سيتم تدمير وحذف هذه الغرفة نهائياً خلال ثانيتين...');
        return setTimeout(() => message.channel.delete().catch(() => {}), 2000);
    }

    // ================= فئة الإحصائيات والمعلومات العامة =================
    if (command === 'رحب') {
        const user = message.mentions.users.first() || message.author;
        const welcomes = [
            `يا هلا وغلا بنور السيرفر ${user}! ✨`,
            `أشرقت الأنوار بوجودك معنا يا ${user} 🌟`,
            `حياك الله، نورتنا ونورت مجتمعنا الخرافي 🎉`
        ];
        return message.channel.send(welcomes[Math.floor(Math.random() * welcomes.length)]);
    }

    if (command === 'حسابي') {
        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('👤 معلومات حسابك الشخصي')
            .setDescription(`تاريخ انضمامك لديسكورد: <t:${Math.floor(message.author.createdTimestamp / 1000)}:R>\nمعرّف الحساب (ID): \`${message.author.id}\``)
            .setThumbnail(message.author.displayAvatarURL());
        return message.reply({ embeds: [embed] });
    }

    if (command === 'افتار') {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle(`📸 صورة الحساب لـ ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    if (command === 'الرومات') {
        const channels = message.guild.channels.cache;
        return message.reply(`📊 **إحصائيات القنوات في هذا السيرفر:**\n\n📁 إجمالي الغرف: **${channels.size}** غرفة شات وصوت.`);
    }

    if (command === 'الوقت') {
        const now = new Date();
        return message.reply(`📅 **التاريخ الحالي المعتمد بالسيرفر:** \`${now.toLocaleDateString('ar-EG')}\`\n⏱️ **الوقت الحالي:** \`${now.toLocaleTimeString('ar-EG')}\``);
    }

    if (command === 'ايقونة') {
        const iconUrl = message.guild.iconURL({ dynamic: true, size: 1024 });
        if (!iconUrl) return message.reply('❌ هذا السيرفر لا يملك أي أيقونة أو صورة حالياً.');
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`🖼️ صورة سيرفر: ${message.guild.name}`)
            .setImage(iconUrl);
        return message.reply({ embeds: [embed] });
    }

    if (command === 'المتصلين-صوتيا') {
        const voiceCount = message.guild.members.cache.filter(m => m.voice.channel).size;
        return message.reply(`🎙️ **عدد الأعضاء المتواجدين في الغرف الصوتية الآن:** \`${voiceCount}\` عضو.`);
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
