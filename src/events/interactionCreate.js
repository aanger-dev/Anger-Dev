import {
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const warnMap = new Map();
const jailMap = new Map(); // Kullanıcının önceki rolleri için
const jailRoleId = "1277410290367070375"; // Jail rolü
const ticketCategoryId = "1201411744589942815"; // Ticket category
const modRoleId = "1394677222564036608"; // Yetkili rol

export default (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const member = interaction.member;
    const guild = interaction.guild;

    // --- Destek Türleri ---
    const supportTypes = {
      botdestek: { name: "Bot Destek", color: "#0099FF" },
      destek: { name: "Destek", color: "#6A0DAD" },
      sikayet: { name: "Şikayet", color: "#FF0000" },
      teknik: { name: "Teknik Arızalar", color: "#FFA500" }
    };

    // --- Ticket Oluşturma ---
    if (Object.keys(supportTypes).includes(interaction.customId)) {
      const type = supportTypes[interaction.customId];
      const existingChannel = guild.channels.cache.find(
        c =>
          c.parentId === ticketCategoryId &&
          c.name === `ticket-${interaction.customId}-${member.user.username.toLowerCase()}`
      );

      if (existingChannel)
        return interaction.reply({ content: "❌ Zaten açık bir ticket kanalınız var.", ephemeral: true });

      await interaction.deferReply({ ephemeral: true });

      try {
        const ticketChannel = await guild.channels.create({
          name: `ticket-${interaction.customId}-${member.user.username.toLowerCase()}`,
          type: ChannelType.GuildText,
          parent: ticketCategoryId,
          permissionOverwrites: [
            { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: modRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: guild.members.me.roles.highest.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
          ],
          topic: `Ticket sahibi: ${member.user.tag}`
        });

        const embed = new EmbedBuilder()
          .setTitle(`🎫 ${type.name} Talebi`)
          .setDescription(`${member}, ticket kanalınız açıldı! Yetkililer en kısa sürede size yardımcı olacak.`)
          .setColor(type.color)
          .setTimestamp();

        const closeButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket-close")
            .setLabel("Ticket Kapat")
            .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({ content: `${member}`, embeds: [embed], components: [closeButton] });

        await interaction.editReply({ content: `✅ Ticket kanalı oluşturuldu: ${ticketChannel}`, ephemeral: true });
      } catch (error) {
        console.error("Ticket oluşturma hatası:", error);
        return interaction.editReply({ content: "❌ Ticket oluşturulurken hata oluştu.", ephemeral: true });
      }

      return;
    }

    // --- Ticket Kapatma ---
    if (interaction.customId === "ticket-close") {
      if (!interaction.channel.name.startsWith("ticket-"))
        return interaction.reply({ content: "❌ Bu buton sadece ticket kanallarında çalışır.", ephemeral: true });

      await interaction.reply({ content: "Ticket kapatılıyor...", ephemeral: true });
      setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
      return;
    }

    // --- Ceza İşlemleri ---
    const parts = interaction.customId.split("_");
    const action = parts[0];

    // Ceza Kaldırma
    if (action === "ceza-kaldır") {
      const userId = parts[1];
      const targetMember = await guild.members.fetch(userId).catch(() => null);
      const isMember = !!targetMember;

      try {
        // Mute kaldır
        if (isMember && targetMember.isCommunicationDisabled()) await targetMember.timeout(null, "Ceza kaldırıldı.");

        // Jail kaldır
        if (isMember && targetMember.roles.cache.has(jailRoleId)) {
          const previousRoles = jailMap.get(userId) || [];
          await targetMember.roles.set(previousRoles);
          jailMap.delete(userId);
        }

        // Ban kaldır
        const banInfo = await guild.bans.fetch(userId).catch(() => null);
        if (banInfo) await guild.bans.remove(userId, "Ceza kaldırıldı.");

        // Warn kaldır
        if (warnMap.has(userId)) warnMap.delete(userId);

        return interaction.reply({
          content: `✅ ${isMember ? targetMember.user.tag : userId} üzerindeki tüm cezalar kaldırıldı.`,
          ephemeral: true
        });
      } catch (err) {
        console.error("Ceza kaldırma hatası:", err);
        return interaction.reply({ content: `❌ Ceza kaldırma başarısız oldu: ${err.message}`, ephemeral: true });
      }
    }

    // --- Jail, Mute, Kick, Ban, Warn İşlemleri ---
    if (!action.startsWith("ceza")) return;
    const [_, userId, tür, extra] = parts;
    const targetMember = await guild.members.fetch(userId).catch(() => null);
    const isMember = !!targetMember;
    const executor = interaction.member;

    if (!isMember)
      return interaction.reply({ content: "❌ Kullanıcı sunucuda değil.", ephemeral: true });

    // Rol hiyerarşi kontrolü
    if (isMember && executor.roles.highest.position <= targetMember.roles.highest.position)
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız.", ephemeral: true });

    if (isMember && targetMember.roles.highest.position >= guild.members.me.roles.highest.position)
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapılamıyor.", ephemeral: true });

    const embedDesc = interaction.message.embeds?.[0]?.description || "";
    const sebep = embedDesc.split("Sebep:")[1]?.trim() || "Sebep belirtilmedi";

    const createDMEmbed = (cezaTuru, sebep, süre, yetkili, uyarıSayısı = null) => {
      const fields = [
        { name: "Ceza Türü", value: `${cezaTuru}${uyarıSayısı !== null ? ` (${uyarıSayısı}/3)` : ""}` },
        { name: "Sebep", value: sebep },
        { name: "Ceza Süresi", value: süre },
        { name: "Yetkili", value: yetkili.user.tag }
      ];
      return new EmbedBuilder()
        .setColor(cezaTuru === "Uyarıldınız" ? 0xFFA500 : 0xFF0000)
        .setTitle("🚨 Ceza Bildirimi")
        .addFields(...fields)
        .setThumbnail(yetkili.user.displayAvatarURL())
        .setFooter({ text: guild.name, iconURL: guild.iconURL() })
        .setTimestamp();
    };

    try {
      switch (tür) {
        case "mute":
          await targetMember.timeout(parseInt(extra), sebep);
          await targetMember.send({ embeds: [createDMEmbed("Susturuldunuz", sebep, `${parseInt(extra)/60000} dakika`, executor)] }).catch(() => {});
          return interaction.reply({ content: `🔇 ${targetMember.user.tag} susturuldu.`, ephemeral: true });

        case "jail":
          const previousRoles = targetMember.roles.cache.filter(r => r.id !== guild.id && r.id !== jailRoleId).map(r => r.id);
          jailMap.set(userId, previousRoles);
          await targetMember.roles.set([jailRoleId], sebep);

          // Jail DM
          await targetMember.send({ embeds: [createDMEmbed("Jail", sebep, `${parseInt(extra)/60000} dakika`, executor)] }).catch(() => {});

          // Jail kanalı oluştur
          const jailChannel = await guild.channels.create({
            name: `jail-${targetMember.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
              { id: targetMember.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
              { id: executor.id, allow: [PermissionsBitField.Flags.ViewChannel] }
            ]
          });

          await jailChannel.send({ content: `${targetMember}`, embeds: [createDMEmbed("Jail Kanalı", sebep, `${parseInt(extra)/60000} dakika`, executor)] });
          return interaction.reply({ content: `🚨 ${targetMember.user.tag} jail'e atıldı ve kanal oluşturuldu: ${jailChannel}`, ephemeral: true });

        case "kick":
          await targetMember.kick(sebep);
          return interaction.reply({ content: `👢 ${targetMember.user.tag} atıldı.`, ephemeral: true });

        case "ban":
          await targetMember.ban({ reason: sebep });
          return interaction.reply({ content: `⛔ ${targetMember.user.tag} banlandı.`, ephemeral: true });

        case "warn":
          const currentWarns = warnMap.get(userId) || 0;
          const newWarns = currentWarns + 1;
          warnMap.set(userId, newWarns);
          await targetMember.send({ embeds: [createDMEmbed("Uyarıldınız", sebep, "—", executor, newWarns)] }).catch(() => {});
          if (newWarns >= 3) {
            await targetMember.ban({ reason: `3 uyarı limiti aşıldı. Sebep: ${sebep}` });
            warnMap.delete(userId);
            return interaction.reply({ content: `⛔ ${targetMember.user.tag} 3 uyarı aldı ve banlandı.`, ephemeral: true });
          } else {
            return interaction.reply({ content: `⚠️ ${targetMember.user.tag} uyarıldı. (${newWarns}/3)`, ephemeral: true });
          }

        default:
          return interaction.reply({ content: "❌ Geçersiz ceza türü.", ephemeral: true });
      }
    } catch (err) {
      console.error("Ceza işlemi hatası:", err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: `❌ İşlem başarısız oldu: ${err.message}`, ephemeral: true });
      } else {
        await interaction.followUp({ content: `❌ İşlem başarısız oldu: ${err.message}`, ephemeral: true });
      }
    }
  });
};
