import {
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  name: "herkeserolver", 
  description: "Herkese Belirtilen Rolü Verir",
  permissions: PermissionFlagsBits.ManageRoles,

  async executeMessage(message, args, client) {
    // 🔒 Ekstra güvenlik: sadece Administrator kullansın
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Bu komutu kullanmak için **Yönetici (Administrator)** yetkisine sahip olmalısın.");
    }

    const role =
      message.mentions.roles.first() ||
      (args[0] && await message.guild.roles.fetch(args[0]).catch(() => null));

    if (!role) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Rol Bulunamadı")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setDescription("❗ Lütfen verilecek rolü etiketleyin veya geçerli bir ID girin.")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Yetki Hatası")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setDescription("❗ Bu rol verilemiyor. Rol botun rolünden yüksek.")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    const members = await message.guild.members.fetch();
    let successCount = 0;
    let failCount = 0;

    for (const [memberId, member] of members) {
      if (member.user.bot) continue; // 🤖 Botları atla
      if (member.roles.cache.has(role.id)) continue; // ✅ Zaten rolü olanları atla
      if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
        failCount++;
        continue; // 🚫 Yetki hatası olanları atla
      }

      try {
        await member.roles.add(role);
        successCount++;
      } catch {
        failCount++;
      }
    }

    const resultEmbed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Rol Verme İşlemi Tamamlandı")
      .setDescription(
        `✅ **${role.name}** rolü herkese verilmeye çalışıldı.\n\nBaşarılı: **${successCount}**\nBaşarısız: **${failCount}**`
      )
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    return message.channel.send({ embeds: [resultEmbed] });
  }
};
