import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  ComponentType
} from "discord.js";

export default {
  name: "kick",
  description: "Kullanıcıyı sunucudan atar (onaylı butonlu).",
  permissions: PermissionFlagsBits.KickMembers,

  async executeMessage(message, args, client) {
    // 🔒 Sadece yönetici veya KickMembers yetkisi olan kullanabilir
    
    if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
    
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("❌ Bu komutu kullanmak için **Üyeleri At (KickMembers)** yetkisine sahip olmalısın.");
    }

    let target;

    // Kullanıcıyı mention veya ID ile bul
    if (message.mentions.members?.first()) {
      target = message.mentions.members.first();
    } else if (args[0]) {
      try {
        target = await message.guild.members.fetch(args[0]);
      } catch {
        target = null;
      }
    }

    // Hedef kullanıcı yoksa hata ver
    if (!target || !target.user) {
      return message.reply("❗ Lütfen geçerli bir kullanıcı etiketleyin veya ID girin.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ Kendinizi sunucudan atamazsınız.");
    }

    // Rol hiyerarşisi kontrolü
    if (target.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ Bu kullanıcıyı atamazsın (rolü senden yüksek).");
    }
    if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ Bu kullanıcıyı atamıyorum (rolü bottan yüksek).");
    }

    const reason = args.slice(1).join(" ") || "Sebep belirtilmedi";

    // Butonlar
    const confirmButton = new ButtonBuilder()
      .setCustomId("confirm_kick")
      .setLabel("✅ Onaylıyorum")
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel_kick")
      .setLabel("🔄 Atmayı İptal Et")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    // Onay embed'i
    const embed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("Atma İşlemi Onayı")
      .setDescription(`**Kullanıcı:** ${target.user.tag}\n**Sebep:** ${reason}`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Atma Onayı", iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    const sentMessage = await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    // Buton dinleyici
    const collector = sentMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "⛔ Bu buton sadece komutu kullanan kişi tarafından kullanılabilir.",
          ephemeral: true
        });
      }

      if (interaction.customId === "confirm_kick") {
        try {
          // DM gönder
          await target.send({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setTitle("🚫 Sunucudan Atıldınız")
                .setDescription(`**Sunucu:** ${message.guild.name}\n**Sebep:** ${reason}`)
                .setFooter({ text: "Kick Bilgilendirmesi" })
                .setTimestamp()
            ]
          }).catch(() => null); // DM başarısız olabilir

          // Kick işlemi
          await target.kick(reason);

          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor("Green")
                .setTitle("✅ Kullanıcı Atıldı")
                .setDescription(`${target.user.tag} başarıyla sunucudan atıldı.`)
                .setTimestamp()
            ],
            components: []
          });
        } catch (error) {
          console.error("Kick hatası:", error);
          await interaction.update({
            embeds: [
              new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Hata")
                .setDescription("Kick işlemi sırasında bir hata oluştu.")
                .setTimestamp()
            ],
            components: []
          });
        }
      } else if (interaction.customId === "cancel_kick") {
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("Grey")
              .setTitle("🔄 İşlem İptal Edildi")
              .setDescription("Atma işlemi iptal edildi.")
              .setTimestamp()
          ],
          components: []
        });
      }
    });

    collector.on("end", async () => {
      try {
        await sentMessage.edit({ components: [] });
      } catch {}
    });
  }
};
