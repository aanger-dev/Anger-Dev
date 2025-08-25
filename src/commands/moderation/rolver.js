import {
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  name: "rolver",
  description: "Belirtilen kullanıcıya rol verir.",
  permissions: PermissionFlagsBits.ManageRoles,
  async executeMessage(message, args, client) {
    const errorEmbed = (title, description) =>
      new EmbedBuilder()
        .setColor("Red")
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

    // Sunucu ve üye kontrolü
    if (!message.guild || !message.member)
      return message.reply({ embeds: [errorEmbed("❌ Komut Kullanılamaz", "Bu komut sadece sunucu içinde kullanılabilir.")] });

    // Yetki kontrolü
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return message.reply({ embeds: [errorEmbed("❌ Yetki Hatası", "Bu komutu kullanmak için 'Rolleri Yönet' iznine sahip olmalısın.")] });

    // Hedef kullanıcıyı al
    const target =
      message.mentions.members.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    if (!target)
      return message.channel.send({ embeds: [errorEmbed("❗ Kullanıcı Bulunamadı", "Lütfen rol verilecek kullanıcıyı etiketleyin veya geçerli bir ID girin.")] });

    // Rolü al
    const role =
      message.mentions.roles.first() ||
      (args[1] && await message.guild.roles.fetch(args[1]).catch(() => null));

    if (!role)
      return message.channel.send({ embeds: [errorEmbed("❗ Rol Bulunamadı", "Lütfen verilecek rolü etiketleyin veya geçerli bir ID girin.")] });

    // Yetki hiyerarşisi kontrolü
    const botHighest = message.guild.members.me.roles.highest.position;
    if (target.roles.highest.position >= botHighest)
      return message.channel.send({ embeds: [errorEmbed("❗ Yetki Hatası", "Bu kullanıcıya rol verilemiyor. Kullanıcının rolü botun rolünden yüksek.")] });

    if (role.position >= botHighest)
      return message.channel.send({ embeds: [errorEmbed("❗ Yetki Hatası", "Bu rol verilemiyor. Rol botun rolünden yüksek.")] });

    // Zaten rolü varsa
    if (target.roles.cache.has(role.id)) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("❗ Rol Zaten Var")
        .setDescription("Bu kullanıcı zaten bu role sahip.")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Rolü ver
    await target.roles.add(role);
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Rol Verildi")
      .setDescription(`✅ ${target.user.tag} adlı kullanıcıya **${role.name}** rolü başarıyla verildi.`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }
};
