import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  name: "unmute",
  description: "Belirtilen kullanıcının susturmasını kaldırır.",
  permissions: PermissionFlagsBits.MuteMembers,

  async executeMessage(message, args) {
    // Kullanıcı yetki kontrolü
   
   if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
   
   
    if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetki Hatası")
        .setDescription("Bu komutu kullanmak için 'Üyeleri Sustur' iznine sahip olmalısın.")
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const target =
      message.mentions.members?.first() ||
      (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));

    if (!target) {
      return message.reply("❗ Lütfen susturması kaldırılacak kullanıcıyı etiketleyin veya geçerli bir ID girin.");
    }

    try {
      await target.timeout(null); // timeout'u sıfırla
      await message.reply(`🔈 ${target.user.tag} susturması kaldırıldı.`);

      const dmEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("🔈 Susturmanız Kaldırıldı")
        .setDescription(`Merhaba ${target.user.username}, ${message.guild.name} sunucusundaki susturma cezanız kaldırıldı. Artık mesaj gönderebilirsiniz.`)
        .setTimestamp();

      await target.send({ embeds: [dmEmbed] }).catch(() => {
        message.channel.send("⚠️ Kullanıcının DM'leri kapalı olduğu için özel mesaj gönderilemedi.");
      });

    } catch (err) {
      console.error("Unmute hatası:", err);
      await message.reply("❌ Kullanıcının susturmasını kaldırırken bir hata oluştu.");
    }
  }
};
