import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  PermissionFlagsBits
} from "discord.js";

export default {
  name: "herkesedm",
  description: "Herkese DM Atar (Butonlu Tür Seçimi)",
  async execute(message, args, client) {

    // 🔒 YETKİ KONTROLÜ
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Bu komutu kullanmak için **Yönetici (Administrator)** yetkisine sahip olmalısın.");
    }

    const dmContent = args.join(" ");
    if (!dmContent) return await message.reply("❗ Lütfen gönderilecek mesajı yazın.");

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

      const members = await message.guild.members.fetch();
      const targets = [...members.values()].filter(m => !m.user.bot);

      let successCount = 0;
      let failCount = 0;
      let failedUsers = [];

      for (const member of targets) {
        try {
          await member.send({ embeds: [dmEmbed] });
          successCount++;
        } catch {
          failCount++;
          failedUsers.push(`${member.user.tag} (${member.id})`);
        }
      }

      const resultEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("✅ DM Gönderme Tamamlandı")
        .setDescription(`📨 Tür: **${title}**\n\nBaşarılı: ${successCount}\nBaşarısız: ${failCount}`)
        .setTimestamp();

      await message.channel.send({ embeds: [resultEmbed] });

      if (failCount > 0) {
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("❗ DM Gönderilemeyen Kullanıcılar")
          .setDescription(failedUsers.join("\n").slice(0, 4000) || "Hiçbir kullanıcı listelenemedi.")
          .setFooter({ text: "Sadece sana özel", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();

        try {
          await message.author.send({ embeds: [errorEmbed] });
        } catch {
          await message.reply("❗ Bazı kullanıcılara DM gönderilemedi ve sana özel hata mesajı gönderilemedi.");
        }
      }
    } catch (err) {
      console.error("Etkileşim hatası:", err);
      await message.reply("⏱️ Buton etkileşimi zaman aşımına uğradı veya bir hata oluştu. Lütfen komutu tekrar kullan.");
    }
  }
};
