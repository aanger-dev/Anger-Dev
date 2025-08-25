import {
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  name: "newembed",
  description: "Başlık ve mesaj içeriğiyle yeni bir embed oluşturur",
  execute: async (message, args, client) => {
    // Yetki kontrolü: Mesajları Yönet izni
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetki Hatası")
        .setDescription("Bu komutu kullanmak için 'Mesajları Yönet' iznine sahip olmalısın.")
        .setTimestamp()
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL() });
      return message.reply({ embeds: [embed] });
    }

    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("📌 Komut Kullanımı")
        .setDescription("Kullanım: `!newembed <başlık> <mesaj>`\nÖrnek: `!newembed Duyuru Sunucu bakıma giriyor`")
        .setTimestamp()
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL() });
      return message.reply({ embeds: [embed] });
    }

    const baslik = args[0];
    const mesaj = args.slice(1).join(" ");

    const embed = new EmbedBuilder()
      .setColor("#800080")
      .setTitle(baslik)
      .setDescription(mesaj)
      .setFooter({
        text: "Anger Software",
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
};
