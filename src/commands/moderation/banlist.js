import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

export default {
  name: "banlist",
  description: "Sunucudaki yasaklı kullanıcıları listeler.",
  permissions: PermissionFlagsBits.BanMembers,

  async executeMessage(message) {
    try {
      // Kullanıcının yetkisini kontrol et
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Bu komutu kullanmak için `Üyeleri Yasakla (Ban Members)` yetkisine sahip olmalısın.");
      }

      // Botun yetkisini kontrol et
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Botun `Üyeleri Yasakla (Ban Members)` yetkisi yok, ban listesi görüntülenemiyor.");
      }

      const bans = await message.guild.bans.fetch();

      if (bans.size === 0) {
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Ban Listesi")
          .setDescription("Sunucuda yasaklı kullanıcı bulunmamaktadır.")
          .setTimestamp();
        return message.channel.send({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor("DarkRed")
        .setTitle("🚫 Yasaklı Kullanıcılar")
        .setDescription(
          bans.map((ban, index) => `**${index + 1}.** ${ban.user.tag} - ${ban.reason || "Sebep belirtilmemiş"}`).join("\n")
        )
        .setFooter({ text: `Toplam: ${bans.size} kullanıcı` })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("Ban listesi hatası:", err);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Hata")
        .setDescription("Ban listesi alınırken bir hata oluştu.")
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    }
  }
};
