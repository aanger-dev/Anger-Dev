import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  PermissionFlagsBits
} from "discord.js";

export default {
  name: "dm",
  description: "Belirtilen Kullanıcıya DM Atar (Butonlu Tür Seçimi)",
  async execute(message, args, client) {

    // Kullanıcı yetkisini kontrol et
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Bu komutu kullanmak için `Mesajları Yönet (Manage Messages)` yetkisine sahip olmalısın.");
    }

    const target =
      message.mentions.members.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    const dmContent = args.slice(1).join(" ");

    if (!target) {
      return message.author.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❗ Hedef Kullanıcı Bulunamadı")
            .setDescription("Lütfen geçerli bir kullanıcı etiketleyin veya ID girin.")
            .setTimestamp()
        ]
      }).catch(() => message.reply("❗ Hedef kullanıcı bulunamadı ve sana özel mesaj gönderilemedi."));
    }

    if (!dmContent) {
      return message.author.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❗ Mesaj Eksik")
            .setDescription("Lütfen gönderilecek mesajı yazın.")
            .setTimestamp()
        ]
      }).catch(() => message.reply("❗ Mesaj eksik ve sana özel mesaj gönderilemedi."));
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("duyuru").setLabel("📢 Duyuru").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("iletisim").setLabel("💬 İletişim").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("reklam").setLabel("🛍️ Reklam").setStyle(ButtonStyle.Danger)
    );

    const promptEmbed = new EmbedBuilder()
      .setColor("Blurple")
      .setTitle("📨 Mesaj Türünü Seç")
      .setDescription("Gönderilecek DM mesajının türünü aşağıdaki butonlardan seç.")
      .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const sentMsg = await message.channel.send({ embeds: [promptEmbed], components: [row] });

    try {
      const interaction = await sentMsg.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 15000,
        filter: i => i.user.id === message.author.id
      });

      await interaction.deferUpdate();

      const typeMap = {
        duyuru: { title: "📢 Duyuru", color: "Gold" },
        iletisim: { title: "💬 İletişim Mesajı", color: "Green" },
        reklam: { title: "🛍️ Reklam", color: "Red" }
      };

      const { title, color } = typeMap[interaction.customId] || { title: "📨 Mesaj", color: "Grey" };

      const dmEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(dmContent)
        .setFooter({ text: `Gönderen: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      try {
        await target.send({ embeds: [dmEmbed] });

        const confirmEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ DM Gönderildi")
          .setDescription(`✅ ${target.user.tag} adlı kullanıcıya DM başarıyla gönderildi.`)
          .setTimestamp();

        return message.author.send({ embeds: [confirmEmbed] });
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❗ DM Gönderilemedi")
          .setDescription(`❗ ${target.user.tag} adlı kullanıcıya DM gönderilemedi. DM'leri kapalı olabilir.`)
          .setTimestamp();

        return message.author.send({ embeds: [errorEmbed] }).catch(() => {
          return message.reply("❗ DM gönderilemedi ve sana özel mesaj gönderilemedi.");
        });
      }
    } catch (err) {
      console.error("Buton etkileşimi hatası:", err);
      await message.reply("⏱️ Buton etkileşimi zaman aşımına uğradı veya bir hata oluştu. Lütfen komutu tekrar kullan.");
    }
  }
};
