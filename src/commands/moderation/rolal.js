import {
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  name: "rolal",
  description: "Belirtilen kullanıcıdan rol alır.",
  permissions: PermissionFlagsBits.ManageRoles,
  async executeMessage(message, args, client) {
    // Sunucu ve üye kontrolü
    if (!message.guild || !message.member) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Komut Kullanılamaz")
        .setDescription("Bu komut sadece sunucu içinde kullanılabilir.")
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Yetki kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetki Hatası")
        .setDescription("Bu komutu kullanmak için 'Rolleri Yönet' iznine sahip olmalısın.")
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Kullanıcıyı al (mention veya ID)
    const target =
      message.mentions.members.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Kullanıcı Bulunamadı")
        .setDescription("❗ Lütfen rol alınacak kullanıcıyı etiketleyin veya geçerli bir ID girin.")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Rolü al (mention veya ID)
    const role =
      message.mentions.roles.first() ||
      (args[1] && await message.guild.roles.fetch(args[1]).catch(() => null));

    if (!role) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Rol Bulunamadı")
        .setDescription("❗ Lütfen alınacak rolü etiketleyin veya geçerli bir ID girin.")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Yetki hiyerarşisi kontrolü
    const botHighest = message.guild.members.me.roles.highest.position;
    if (target.roles.highest.position >= botHighest) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Yetki Hatası")
        .setDescription("❗ Bu kullanıcıdan rol alınamıyor. Kullanıcının rolü botun rolünden yüksek.")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    if (role.position >= botHighest) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Yetki Hatası")
        .setDescription("❗ Bu rol alınamıyor. Rol botun rolünden yüksek.")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Kullanıcıda rol yoksa
    if (!target.roles.cache.has(role.id)) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("❗ Rol Zaten Yok")
        .setDescription("❗ Bu kullanıcıda bu rol zaten yok.")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Rolü al
    await target.roles.remove(role);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Rol Alındı")
      .setDescription(`✅ ${target.user.tag} adlı kullanıcıdan **${role.name}** rolü başarıyla alındı.`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }
};
