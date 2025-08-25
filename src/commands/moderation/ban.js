import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  ComponentType
} from "discord.js";

export default {
  name: "ban",
  description: "Kullanıcıyı sunucudan yasaklar (onaylı butonlu).",
  permissions: PermissionFlagsBits.BanMembers,

  async executeMessage(message, args, client) {
    try {
      // Kullanıcının yetkisini kontrol et
      if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
      
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Bu komutu kullanmak için `Üyeleri Yasakla (Ban Members)` yetkisine sahip olmalısın.");
      }

      // Botun yetkisini kontrol et
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply("❌ Botun `Üyeleri Yasakla (Ban Members)` yetkisi yok, işlem yapılamaz.");
      }

      const target =
        message.mentions.members?.first() ||
        (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

      if (!target) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❗ Kullanıcı Bulunamadı")
          .setDescription("Lütfen yasaklanacak kullanıcıyı etiketleyin veya geçerli bir ID girin.")
          .setTimestamp();
        return message.channel.send({ embeds: [embed] });
      }

      // Argümanları kontrol et
      const reason = args.length > 2 ? args.slice(1, -1).join(" ") : "Sebep belirtilmedi";
      const duration = args.length > 2 ? args[args.length - 1] : "Belirtilmedi";

      const confirmButton = new ButtonBuilder()
        .setCustomId("confirm_ban")
        .setLabel("✅ Onaylıyorum")
        .setStyle(ButtonStyle.Danger);

      const cancelButton = new ButtonBuilder()
        .setCustomId("cancel_ban")
        .setLabel("🔄 Banı Kaldır")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Ban İşlemi Onayı")
        .setDescription(`**Kullanıcı:** ${target.user.tag}\n**Sebep:** ${reason}\n**Süre:** ${duration}`)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Ban Onayı", iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

      const sentMessage = await message.channel.send({
        embeds: [embed],
        components: [row]
      });

      const collector = sentMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000
      });

      collector.on("collect", async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("⛔ Yetkisiz İşlem")
            .setDescription("Bu butonları sadece komutu kullanan kişi kullanabilir.")
            .setTimestamp();
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const dmEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("🚫 Yasaklandınız")
          .setDescription(`Merhaba ${target.user.toString()}, ${message.guild.name} sunucusunda **${message.author.username}** tarafından yasaklandınız.`)
          .addFields(
            { name: "Sebep", value: reason },
            { name: "Süre", value: duration }
          )
          .setFooter({ text: `Yetkili: ${message.author.tag}` })
          .setTimestamp();

        if (interaction.customId === "confirm_ban") {
          await target.send({ embeds: [dmEmbed] }).catch(() => {
            const dmFailEmbed = new EmbedBuilder()
              .setColor("Orange")
              .setTitle("⚠️ DM Gönderilemedi")
              .setDescription(`${target.user.toString()} kullanıcısına DM gönderilemedi. Muhtemelen DM'leri kapalı.`)
              .setTimestamp();
            message.channel.send({ embeds: [dmFailEmbed] });
          });

          await target.ban({ reason });

          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Ban Başarılı")
            .setDescription(`**${target.user.tag}** başarıyla yasaklandı.`)
            .setTimestamp();

          await interaction.update({ embeds: [embed], components: [] });
        }

        if (interaction.customId === "cancel_ban") {
          await message.guild.members.unban(target.user.id).catch(() => {});
          const embed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("🔄 Ban Kaldırıldı")
            .setDescription(`**${target.user.tag}** için ban kaldırıldı.`)
            .setTimestamp();
          await interaction.update({ embeds: [embed], components: [] });
        }
      });

      collector.on("end", async () => {
        try {
          await sentMessage.edit({ components: [] });
        } catch {}
      });

    } catch (err) {
      console.error("Ban komutu hatası:", err);
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Hata")
        .setDescription("Ban işlemi sırasında bir hata oluştu.")
        .setTimestamp();
      await message.channel.send({ embeds: [embed] });
    }
  }
};
