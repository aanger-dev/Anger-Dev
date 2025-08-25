import {
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} from "discord.js";

/* Yardımcılar */
function parseDurationToMs(str) {
  if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
  if (!str) return 0;
  const regex = /(\d+)([dhm])/g;
  let match;
  let ms = 0;
  while ((match = regex.exec(str)) !== null) {
    const v = parseInt(match[1], 10);
    const u = match[2];
    if (u === "day") ms += v * 24 * 60 * 60 * 1000;
    if (u === "hour") ms += v * 60 * 60 * 1000;
    if (u === "minute") ms += v * 60 * 1000;
  }
  return ms;
}
function humanizeDuration(str) { return str ?? "Kalıcı"; }

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

export default {
  name: "mute",
  description: "Kullanıcıyı susturur (timeout). Prefix ve slash destekler.",
  options: [
    { name: "kullanıcı", type: 6, description: "Susturulacak kullanıcı", required: true },
    { name: "sebep", type: 3, description: "Sebep", required: true },
    { name: "süre", type: 3, description: "Süre (örn: 1d,2h,30m).", required: true },
    { name: "kanal", type: 7, description: "Bildirimin gönderileceği kanal", required: false }
  ],
  permissions: [PermissionFlagsBits.ModerateMembers],

  // Slash handler
  async execute(interaction) {
    try {
      if (!interaction.guild) return interaction.reply({ content: "❗Bu komut sunucuda kullanılmalıdır.", ephemeral: true });

      // Yetki kontrolü
      if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: "❗Bu komutu kullanmak için yeterli iznin yok.", ephemeral: true });
      }

      const user = interaction.options.getUser("kullanıcı");
      const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";
      const durationStr = interaction.options.getString("süre");
      const channelOpt = interaction.options.getChannel("kanal");
      const notifyChannel = channelOpt && channelOpt.type === ChannelType.GuildText ? channelOpt : interaction.channel;

      if (!user) return interaction.reply({ content: "Kullanıcı belirtilmedi.", ephemeral: true });
      if (user.id === interaction.user.id) return interaction.reply({ content: "❗Kendini susturamazsın.", ephemeral: true });
      if (user.id === interaction.client.user.id) return interaction.reply({ content: "❗Botu susturamazsın.", ephemeral: true });

      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.reply({ content: "❗Kullanıcı sunucuda bulunamadı.", ephemeral: true });

      const me = interaction.guild.members.me ?? await interaction.guild.members.fetch(interaction.client.user.id).catch(() => null);
      if (!me) return interaction.reply({ content: "❗Bot üyelik bilgileri alınamadı.", ephemeral: true });

      // Bot yetkisi
      if (!me.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: "Botun 'Moderate Members' izni yok.", ephemeral: true });
      if (me.roles.highest.position <= member.roles.highest.position) {
        return interaction.reply({ content: "Bot rolünü hedef kullanıcının rolünün üstüne taşımalısınız.", ephemeral: true });
      }

      const ms = parseDurationToMs(durationStr);
      if (ms <= 0) return interaction.reply({ content: "❗Geçerli bir süre girin. (örn: 1d, 2h, 30m)", ephemeral: true });
      if (ms > MAX_TIMEOUT_MS) return interaction.reply({ content: `Maksimum timeout ${Math.floor(MAX_TIMEOUT_MS / (24*60*60*1000))} gündür.`, ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle("Timeout Onayı")
        .setColor("Orange")
        .setDescription(`${user.tag} kullanıcısını **${reason}** sebebiyle **${humanizeDuration(durationStr)}** süreyle timeoutlamak istiyor musunuz?`)
        .setFooter({ text: `Talep eden: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(user.displayAvatarURL({dynamic:true}))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("mute_confirm").setLabel("Onayla").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("mute_unmute").setLabel("Unmute").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("mute_cancel").setLabel("İptal").setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
      const reply = await interaction.fetchReply();
      const comp = await reply.awaitMessageComponent({ filter: i => i.user.id === interaction.user.id, time: 20000 }).catch(() => null);
      if (!comp) return interaction.editReply({ content: "Zaman aşımı. İşlem iptal edildi.", embeds: [], components: [] }).catch(() => {});
      if (comp.customId === "mute_cancel") return comp.update({ content: "İşlem iptal edildi.", embeds: [], components: [] });

      if (comp.customId === "mute_unmute") {
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!target) return comp.update({ content: "Kullanıcı sunucuda bulunamadı.", embeds: [], components: [] });
        try { await target.timeout(null, "Unmute (buton)"); } catch {}
        await comp.update({ content: "Kullanıcının susturması kaldırıldı.", embeds: [], components: [] });
        try { await user.send({ embeds: [new EmbedBuilder()
          .setTitle("Susturman Kaldırıldı")
          .setColor("Green")
          .setDescription(`${interaction.guild.name} sunucusunda susturman kaldırıldı.`)
          .setThumbnail(user.displayAvatarURL({dynamic:true}))
          .setTimestamp()] }).catch(() => {}); } catch {}
        return;
      }

      await member.timeout(ms, `${reason} — Susturan: ${interaction.user.tag}`).catch(async e => {
        console.error("Timeout hatası:", e);
        return comp.update({ content: "Timeout uygulanırken hata oluştu.", embeds: [], components: [] }).catch(() => {});
      });

      const result = new EmbedBuilder()
        .setTitle("Kullanıcı Susturuldu")
        .setColor("Red")
        .setDescription(`**Kullanıcı:** ${user.tag}\n**Sebep:** ${reason}\n**Süre:** ${humanizeDuration(durationStr)}`)
        .setFooter({ text: `Susturan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(user.displayAvatarURL({dynamic:true}))
        .setTimestamp();

      await notifyChannel.send({ embeds: [result] }).catch(() => {});
      await comp.update({ content: "Kullanıcı başarıyla timeoutlandı.", embeds: [], components: [] }).catch(() => {});
      try { await user.send({ embeds: [new EmbedBuilder().setTitle("Susturuldunuz").setColor("DarkRed").setDescription(`${interaction.guild.name} sizi **${reason}** sebebiyle susturdu.\nSüre: **${humanizeDuration(durationStr)}**`).setTimestamp()] }).catch(() => {}); } catch {}

    } catch (err) {
      console.error("Mute komutu hata:", err);
      if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: "Bir hata oluştu.", ephemeral: true }).catch(() => {});
      else await interaction.editReply({ content: "Bir hata oluştu.", embeds: [], components: [] }).catch(() => {});
    }
  },

  // Prefix handler
  async executeMessage(message, args) {
    try {
      if (!message.guild) return message.reply("Bu komut sunucuda kullanılmalıdır.");

      // Yetki kontrolü
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply("Bu komutu kullanmak için yeterli iznin yok.");
      }

      const mention = message.mentions.users.first();
      if (!mention && !args[0]) return message.reply("Kullanıcı belirtin. Örnek: !mute @kullanıcı sebep 1d");
      const userId = mention ? mention.id : args[0].replace(/[<@!>]/g, "");
      const user = await message.client.users.fetch(userId).catch(() => null);
      if (!user) return message.reply("Kullanıcı bulunamadı.");

      let durationStr = null;
      let reasonParts = mention ? args.slice(1) : args.slice(1);
      const last = reasonParts[reasonParts.length - 1];
      if (last && /^(\d+[dhm])+$/.test(last)) {
        durationStr = last;
        reasonParts = reasonParts.slice(0, -1);
      }
      const reason = reasonParts.join(" ").trim() || "Sebep belirtilmedi.";
      const notifyChannel = message.channel;

      if (user.id === message.author.id) return message.reply("Kendini susturamazsın.");
      if (user.id === message.client.user.id) return message.reply("Botu susturamazsın.");

      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (!member) return message.reply("Kullanıcı sunucuda bulunamadı.");

      const me = message.guild.members.me ?? await message.guild.members.fetch(message.client.user.id).catch(() => null);
      if (!me) return message.reply("Bot üyelik bilgileri alınamadı.");

      const ms = parseDurationToMs(durationStr);
      if (ms <= 0) return message.reply("Geçerli bir süre girin. (örn: 1d, 2h, 30m)");
      if (ms > MAX_TIMEOUT_MS) return message.reply(`Maksimum timeout ${Math.floor(MAX_TIMEOUT_MS / (24*60*60*1000))} gündür.`);
      if (!me.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("Botun 'Moderate Members' izni yok.");
            if (me.roles.highest.position <= member.roles.highest.position) 
        return message.reply("Bot rolünü hedef kullanıcının rolünün üstüne taşımalısınız.");

      const confirmEmbed = new EmbedBuilder()
        .setTitle("Timeout Onayı")
        .setColor("Orange")
        .setDescription(`${user.tag} kullanıcısını **${reason}** sebebiyle **${humanizeDuration(durationStr)}** süreyle timeoutlamak istiyor musunuz?`)
        .setFooter({ text: `Talep eden: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setThumbnail(user.displayAvatarURL({dynamic:true}))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mute_confirm_${message.id}`).setLabel("Onayla").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`mute_unmute_${message.id}`).setLabel("Unmute").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`mute_cancel_${message.id}`).setLabel("İptal").setStyle(ButtonStyle.Secondary)
      );

      const sent = await message.channel.send({ embeds: [confirmEmbed], components: [row] });

      const comp = await sent.awaitMessageComponent({ filter: i => i.user.id === message.author.id, time: 20000 }).catch(() => null);
      if (!comp) return sent.edit({ content: "Zaman aşımı. İşlem iptal edildi.", embeds: [], components: [] });
      if (comp.customId.endsWith("mute_cancel")) return comp.update({ content: "İşlem iptal edildi.", embeds: [], components: [] });

      if (comp.customId.endsWith("mute_unmute")) {
        const target = await message.guild.members.fetch(user.id).catch(() => null);
        if (!target) return comp.update({ content: "Kullanıcı sunucuda bulunamadı.", embeds: [], components: [] });
        try { await target.timeout(null, "Unmute (buton)"); } catch {}
        await comp.update({ content: "Kullanıcının susturması kaldırıldı.", embeds: [], components: [] });
        try { await user.send({ embeds: [new EmbedBuilder()
          .setTitle("Susturman Kaldırıldı")
          .setColor("Green")
          .setDescription(`${message.guild.name} sunucusunda susturman kaldırıldı.`)
          .setThumbnail(user.displayAvatarURL({dynamic:true}))
          .setTimestamp()] }).catch(() => {}); } catch {}
        return;
      }

      await member.timeout(ms, `${reason} — Susturan: ${message.author.tag}`).catch(e => {
        console.error("Timeout hatası:", e);
        return comp.update({ content: "Timeout uygulanırken hata oluştu.", embeds: [], components: [] });
      });

      const resultEmbed = new EmbedBuilder()
        .setTitle("Kullanıcı Susturuldu")
        .setColor("Red")
        .setDescription(`**Kullanıcı:** ${user.tag}\n**Sebep:** ${reason}\n**Süre:** ${humanizeDuration(durationStr)}`)
        .setFooter({ text: `Susturan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setThumbnail(user.displayAvatarURL({dynamic:true}))
        .setTimestamp();

      await notifyChannel.send({ embeds: [resultEmbed] }).catch(() => {});
      await comp.update({ content: "Kullanıcı başarıyla timeoutlandı.", embeds: [], components: [] });

      try {
        await user.send({ embeds: [new EmbedBuilder()
          .setTitle("Susturuldunuz")
          .setColor("DarkRed")
          .setDescription(`${message.guild.name} sizi **${reason}** sebebiyle susturdu.\nSüre: **${humanizeDuration(durationStr)}**`)
          .setTimestamp()] }).catch(() => {});
      } catch {}

    } catch (err) {
      console.error("Mute komutu hata:", err);
      if (!message.replied) message.reply("Bir hata oluştu.").catch(() => {});
      else message.editReply({ content: "Bir hata oluştu.", embeds: [], components: [] }).catch(() => {});
    }
  }
};

