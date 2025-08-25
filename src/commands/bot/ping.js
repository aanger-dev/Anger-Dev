import { EmbedBuilder } from "discord.js";

export default {
  name: "ping",
  description: "Botun gecikme süresini gösterir.",
  execute: async (message, args, client) => {
    //  1. İlk bekleme mesajı: 1
    const beklemeEmbed1 = new EmbedBuilder()
      .setColor("#800080")
      .setTitle("⏳ Ping Ölçülüyor...")
      .setDescription("1️⃣")
      .setTimestamp()
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    const beklemeMesaji = await message.channel.send({ embeds: [beklemeEmbed1] });

    //  2. Güncelle: 1... 2...
    await new Promise(resolve => setTimeout(resolve, 500));
    const beklemeEmbed2 = new EmbedBuilder()
      .setColor("#800080")
      .setTitle("⏳ Ping Ölçülüyor...")
      .setDescription("1️⃣ 2️⃣")
      .setTimestamp()
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
    await beklemeMesaji.edit({ embeds: [beklemeEmbed2] });

    //  3. Güncelle: 1... 2... 3...
    await new Promise(resolve => setTimeout(resolve, 500));
    const beklemeEmbed3 = new EmbedBuilder()
      .setColor("#800080")
      .setTitle("⏳ Ping Ölçülüyor...")
      .setDescription("1️⃣ 2️⃣ 3️⃣")
      .setTimestamp()
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
    await beklemeMesaji.edit({ embeds: [beklemeEmbed3] });

    //  Ping hesaplama
    const apiPing = Math.round(client.ws.ping);
    const msgPing = Date.now() - message.createdTimestamp;

    //  Bekleme mesajını sil
    await new Promise(resolve => setTimeout(resolve, 500));
    await beklemeMesaji.delete();

    //  Durum analizi
    let durum = "🟢 Hızlı";
    if (apiPing > 200 || msgPing > 300) durum = "🟡 Orta";
    if (apiPing > 400 || msgPing > 600) durum = "🔴 Yavaş";

    //  Sonuç embed
    const embed = new EmbedBuilder()
      .setTitle("🏓 Botun Gecikme Verileri")
      .setColor("#800080")
      .setDescription("Botun gecikme bilgileri aşağıda listelenmiştir.")
      .addFields(
        { name: "📡 API Gecikmesi", value: `${apiPing} ms`, inline: true },
        { name: "💬 Mesaj Gecikmesi", value: `${msgPing} ms`, inline: true },
        { name: "📊 Durum", value: `${durum}`, inline: true }
      )
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    //  Yanıt gönder
    await message.channel.send({ embeds: [embed] });
  }
};
