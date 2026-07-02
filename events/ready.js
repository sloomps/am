module.exports = (client) => {
    console.log(`=================================`);
    console.log(`🚀 تم تشغيل البوت بنجاح!`);
    console.log(`👤 الحساب: ${client.user.tag}`);
    console.log(`🆔 الآيدي: ${client.user.id}`);
    console.log(`=================================`);
    
    // وضع حالة البوت (Activity) لعام 2026
    client.user.setActivity('Elite System 2026 🛡️', { type: 3 }); // Type 3 يعني Watching (يشاهد)
};
