import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";

export default {
  name: "ceza",
  description: "Kullanıcıya ceza vermek için panel açar",
  execute: async (message, args, client) => {

    const target =
      message.mentions.members.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    const sebep = args.slice(1).join(" ") || "Sebep Belirtilmedi";

    if (!target) {
      return message.reply("❗ Lütfen ceza verilecek kullanıcıyı etiketleyin veya geçerli bir ID girin.");
    }

    const embed = new EmbedBuilder()
      .setColor("#800080")
      .setTitle("Ceza Paneli")
      .setDescription(`**${target.user.tag}** için ceza seçin.\n**Sebep:** ${sebep}`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: "Ceza İşlemi ● Bot Paneli",
        iconURL: client.user.displayAvatarURL()
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ceza_${target.id}_mute_600000`)
        .setLabel("🔇 Mute (10dk)")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`ceza_${target.id}_jail_1800000`)
        .setLabel("🚨 Jail (30dk)")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`ceza_${target.id}_kick_0`)
        .setLabel("⛓️ Kick")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`ceza_${target.id}_ban_0`)
        .setLabel("⛔ Ban")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`ceza_${target.id}_warn_1`)
        .setLabel("⚠️ Warn")
        .setStyle(ButtonStyle.Secondary)  
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`ceza_${target.id}_remove_0`)
        .setLabel("🧹 Ceza Kaldır")
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({
      embeds: [embed],
      components: [row, row2]
    });
  }
};
