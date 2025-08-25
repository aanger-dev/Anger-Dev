import {
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} from "discord.js";

export default {
  name: "jail",
  description: "Kullanıcıyı jail'e atar ve onun adına özel bir kanal oluşturur.",
  permissions: PermissionFlagsBits.Administrator,

  async executeMessage(message, args) {
    if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
    
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Bu komutu kullanmak için **Yönetici (Administrator)** yetkisine sahip olmalısın.");
    }

    const target =
      message.mentions.members?.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    const reason = args.slice(2).join(" ") || "Sebep belirtilmedi.";
    const duration = args[1] || "Süre belirtilmedi."; // 2. argüman süre olacak
    const jailRoleId = "1277410290367070375";

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Kullanıcı Bulunamadı")
        .setDescription("Lütfen jail'e atılacak kullanıcıyı etiketleyin veya geçerli bir ID girin.")
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    if (target.id === message.author.id) {
      return message.reply("❌ Kendini jail'e atamazsın.");
    }

    if (target.roles.cache.has(jailRoleId)) {
      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("⚠️ Jail Durumu")
        .setDescription(`${target.user.tag} zaten jail'de.`)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    if (target.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ Bu kullanıcıyı jail'e atamazsın (rolü senden yüksek).");
    }
    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ Bu kullanıcıyı jail'e atamıyorum (rolü bottan yüksek).");
    }

    try {
      // Rollerini kaldır ve jail rolünü ver
      await target.roles.set([jailRoleId]);

      // Jail kanalı oluştur
      const jailChannel = await message.guild.channels.create({
        name: `jail-${target.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: target.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ],
          },
          {
            id: message.author.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          }
        ]
      });

      // Jail kanalına bilgilendirme mesajı at
      const jailEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🚨 Jail Kanalı Açıldı")
        .setDescription(
          `${target} jail'e atıldı.\n\n` +
          `⏰ Süre: **${duration}**\n` +
          `📄 Sebep: **${reason}**\n\n` +
          `Burada Konuşabilirsin **${duration}** kadar.`
        )
        .setFooter({ text: `Yetkili: ${message.author.tag}` })
        .setTimestamp();

      await jailChannel.send({ content: `${target}`, embeds: [jailEmbed] });

      // DM gönder
      const dmEmbed = new EmbedBuilder()
        .setColor("DarkRed")
        .setTitle("🚫 Jail'e Atıldınız")
        .setDescription(
          `Merhaba ${target.user.toString()}, ${message.guild.name} sunucusunda **${message.author.username}** tarafından jail'e atıldınız.\n\n` +
          `⏰ Süre: **${duration}**\n📄 Sebep: **${reason}**`
        )
        .setFooter({ text: `Yetkili: ${message.author.tag}` })
        .setTimestamp();

      await target.send({ embeds: [dmEmbed] }).catch(() => {
        const dmFailEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("⚠️ DM Gönderilemedi")
          .setDescription("Kullanıcının DM'leri kapalı olduğu için özel mesaj gönderilemedi.")
          .setTimestamp();
        message.channel.send({ embeds: [dmFailEmbed] });
      });

      // Genel kanala bilgi
      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Jail Uygulandı")
        .setDescription(`${target.user.tag} jail'e atıldı ve kanal oluşturuldu: #${jailChannel.name}`)
        .setFooter({ text: `Yetkili: ${message.author.tag}` })
        .setTimestamp();

      await message.channel.send({ embeds: [successEmbed] });

    } catch (err) {
      console.error("Jail hatası:", err);

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Jail Hatası")
        .setDescription("Jail işlemi sırasında bir hata oluştu.")
        .setTimestamp();

      await message.channel.send({ embeds: [errorEmbed] });
    }
  }
};
