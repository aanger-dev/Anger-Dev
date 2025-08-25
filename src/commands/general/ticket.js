import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits
} from 'discord.js';

export default {
  name: "ticket",
  description: "Destek talebi paneli gönderir",
  permissions: [PermissionFlagsBits.Administrator],

  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 DESTEK TALEBİ OLUŞTUR")
      .setColor("DarkPurple")
      .setDescription(
        "❗ Talebinizi aşağıdaki kategorilere göre oluşturunuz.\n\n" +
        "**⚠️ UYARI:** Gereksiz yere açılan talepler ceza ile sonuçlanabilir.\n\n" +
        "**📜 DESTEK GEREKTİREN DURUMLAR:**\n\n" +
        "🤖 Bot Siparişi & Bilgileri\n" +
        "🧑‍💻 Genel Destek\n" +
        "🚨 Şikayet\n" +
        "⚙️ Teknik Arızalar\n\n" +
        "⏳ Talebe 2 saat içinde yazmazsanız kanal otomatik kapanır."
      )
      .setFooter({ text: "Developed by Wolftr" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('botdestek')
        .setLabel('Bot Destek')
        .setEmoji('🤖')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('destek')
        .setLabel('Destek')
        .setEmoji('🧑‍💻')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('sikayet')
        .setLabel('Şikayet')
        .setEmoji('🚨')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('teknik')
        .setLabel('Teknik Arızalar')
        .setEmoji('⚙️')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
  }
};
