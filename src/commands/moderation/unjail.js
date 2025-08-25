import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  name: "unjail",
  description: "Belirtilen kullanıcının jail cezasını kaldırır.",
  permissions: PermissionFlagsBits.ManageRoles,

  async executeMessage(message, args) {
    // Kullanıcı yetki kontrolü
    if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
    
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetki Hatası")
        .setDescription("Bu komutu kullanmak için 'Rolleri Yönet' iznine sahip olmalısın.")
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const target =
      message.mentions.members?.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    const jailRoleId = "1277410290367070375"; 

    if (!target) {
      return message.reply("❗ Lütfen jail'den çıkarılacak kullanıcıyı etiketleyin veya geçerli bir ID girin.");
    }

    if (!target.roles.cache.has(jailRoleId)) {
      return message.reply("⚠️ Bu kullanıcı jail'de değil.");
    }

    try {
      // Jail rolünü kaldır
      await target.roles.remove(jailRoleId);

      // Jail kanalını bul ve sil (ismi jail-username formatında varsayılıyor)
      const jailChannelName = `jail-${target.user.username}`;
      const jailChannel = message.guild.channels.cache.find(
        channel => channel.name === jailChannelName
      );

      if (jailChannel) {
        await jailChannel.delete().catch(() => {
          message.channel.send("⚠️ Jail kanalı silinemedi.");
        });
      }

      // DM embed
      const dmEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Jail'den Çıkarıldınız")
        .setDescription(`Merhaba ${target.user.username}, ${message.guild.name} sunucusundaki jail cezanız kaldırıldı.`)
        .setFooter({ text: `Yetkili: ${message.author.tag}` })
        .setTimestamp();

      await target.send({ embeds: [dmEmbed] }).catch(() => {
        message.channel.send("⚠️ Kullanıcının DM'leri kapalı olduğu için özel mesaj gönderilemedi.");
      });

      await message.reply(`✅ ${target.user.tag} jail'den çıkarıldı.`);

    } catch (err) {
      console.error("Unjail hatası:", err);
      await message.reply("❌ Jail kaldırma işlemi sırasında bir hata oluştu.");
    }
  }
};
