import { PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  name: "unban",
  description: "Belirtilen kullanıcının yasağını kaldırır.",
  permissions: PermissionFlagsBits.BanMembers,

  async executeMessage(message, args) {
    // Kullanıcı yetki kontrolü
   
   if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
   
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Yetki Hatası")
        .setDescription("Bu komutu kullanmak için 'Üyeleri Yasakla' iznine sahip olmalısın.")
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    // Mention formatını ayıkla: <@123456789012345678> veya <@!123456789012345678>
    let userId = args[0];
    if (!userId) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Eksik Bilgi")
        .setDescription("Lütfen yasağı kaldırılacak kullanıcının ID'sini girin.")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Eğer mention formatındaysa ayıkla
    if (userId.startsWith("<@") && userId.endsWith(">")) {
      userId = userId.replace(/[<@!>]/g, "");
    }

    // ID geçerli mi?
    if (isNaN(userId) || userId.length > 19) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❗ Geçersiz ID")
        .setDescription("Lütfen geçerli bir kullanıcı ID'si girin.")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    try {
      // Banlı kullanıcıları çek
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.get(userId);

      if (!bannedUser) {
        const embed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("❌ Kullanıcı Bulunamadı")
          .setDescription("Bu ID ile banlanmış bir kullanıcı bulunamadı.")
          .setTimestamp();
        return message.channel.send({ embeds: [embed] });
      }

      // Yasağı kaldır
      await message.guild.members.unban(userId);

      const successEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Yasağı Kaldırıldı")
        .setDescription(`${bannedUser.user.tag} adlı kullanıcının yasağı başarıyla kaldırıldı.`)
        .setTimestamp();

      await message.channel.send({ embeds: [successEmbed] });

      // DM embed
      const dmEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("✅ Yasağınız Kaldırıldı")
        .setDescription(`Merhaba ${bannedUser.user.username}, ${message.guild.name} sunucusundaki yasağınız kaldırıldı. Artık sunucuya tekrar katılabilirsiniz.`)
        .setTimestamp();

      await bannedUser.user.send({ embeds: [dmEmbed] }).catch(() => {
        const dmFailEmbed = new EmbedBuilder()
          .setColor("Orange")
          .setTitle("⚠️ DM Gönderilemedi")
          .setDescription("Kullanıcının DM'leri kapalı olduğu için özel mesaj gönderilemedi.")
          .setTimestamp();
        message.channel.send({ embeds: [dmFailEmbed] });
      });

    } catch (err) {
      console.error("Unban hatası:", err);
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("❌ Hata Oluştu")
        .setDescription("Yasağı kaldırırken bir hata oluştu.")
        .setTimestamp();
      await message.channel.send({ embeds: [errorEmbed] });
    }
  }
};
