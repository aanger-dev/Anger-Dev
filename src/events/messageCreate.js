import { EmbedBuilder } from "discord.js";

export default (client) => {
  const yetkilirolID = "1394677222564036608";
  const ownerID = "1160168898017099816";
  const prefix = process.env.PREFIX || "!";
  const ticketActivityMap = new Map();
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot || !message.guild || !message.content) return;

      const mesaj = message.content.toLowerCase();

      // 🔹 Etiketli mesajlar (prefixsiz)
      if (!message.content.startsWith(prefix)) {
        if (["sa", "selamın aleyküm", "sea", "selam"].includes(mesaj)) {
          return message.reply("Aleyküm Selam Hoşgeldin! Nasılsın?");
        } else if (["merhaba"].includes(mesaj)) {
          return message.reply("Merhaba hoşgeldin! Nasılsın?");
        } else if (["gidiyorum", "allaha emanet", "bb", "bye", "öptüm", "gülegüle", "ben gidiyom"].includes(mesaj)) {
          return message.reply("Allaha Emanet canım kendine iyi bak");
        } else if (["iyidir", "seni sormalı", "iyiyiz", "ya sen", "sen nasılsın", "iyi işte seni sormalı", "iyiyim"].includes(mesaj)) {
          return message.reply("Daim olsun canım");
        } else if (["nasılsın", "naber", "napıyorsun", "yasen", "sen nasılsın", "seni sormalı", "napan", "neydirsen", "nasılsan", "nslsn", "Nasılsın"].includes(mesaj)) {
          return message.reply("İyi ya sen");
        } else if (["partnerlik", "partner", "partner dm"].includes(mesaj)) {
          return message.reply(`Senin için yetkili kişileri etiketliyorum <@&${yetkilirolID}>`);
        } else if (["sorum var sunucu ile ilgili", "sunucu hakkında"].includes(mesaj)) {
          return message.reply(`Sorunun cevabını <@${ownerID}> sahibimden bulabilirsin`);
        }

        if (message.mentions.users?.has(ownerID)) {
          const member = await message.guild.members.fetch(ownerID).catch(() => null);
          if (member?.presence?.status === "offline") {
            await message.reply("Sahibim şu an müsait değil, mesajını ona ilettim ✅").catch(() => {});
            const ownerUser = await client.users.fetch(ownerID).catch(() => null);
            if (ownerUser) {
              await ownerUser.send(`📢 ${message.author.tag} seni etiketledi.\nMesaj: "${message.content}"`).catch(() => {});
            }
          }
          return;
        }

        if (message.mentions.users?.has(client.user.id)) {
          return message.reply("Merhaba Nasılsın Beni Etiketlemişsin 🥰");
        }

        if (mesaj === "bilgi") {
          const response = new EmbedBuilder()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle("ANGER DEVELOPMENT.\n\u200b")
            .setFooter({ text: "Anger Dev Present", iconURL: client.user.displayAvatarURL() })
            .setDescription("Anger Development ")
            .setColor("#1508d1")
            .setTimestamp()
            .addFields(
              { name: "Developer", value: "Woltr", inline: true },
              { name: "Services", value: "All", inline: true },
              { name: "Support Server", value: "https://discord.gg/2ftxMaaG7g" }
            );
          return message.channel.send({ content: "Anger Software", embeds: [response] }).catch(() => {});
        }

        return;
      }

      // 🔹 Prefix ile başlayan komutlar
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      const command =
        client.commands.get(commandName) ||
        client.commands.find(c => c.aliases?.includes(commandName));
      if (!command) return;

      // Yetki kontrolü
      if (command.permission && !message.member.permissions.has(command.permission)) {
        return message.reply("❌ Bu komutu kullanmak için yetkin yok.");
      }

      // executeMessage varsa çağır
      if (typeof command.executeMessage === "function") {
        try {
          await command.executeMessage(message, args, client);
        } catch (err) {
          console.error("Message komut çalıştırma hatası:", err);
          await message.channel.send("Komut çalıştırılırken hata oluştu.").catch(() => {});
        }
        return;
      }

      // execute varsa çağır
      if (typeof command.execute === "function") {
        try {
          await command.execute(message, args, client);
        } catch (err) {
          console.error("Komut Hatası", err);
          message.channel.send("Bir Hata Oluştu").catch(() => {});
        }
      }
    } catch (err) {
      console.error("messageCreate handler hatası:", err);
    }

     if (!message.guild || message.author.bot) return;

    if (ticketActivityMap.has(message.channel.id)) {
      const activity = ticketActivityMap.get(message.channel.id);

      // Son mesaj zamanını güncelle
      activity.lastMessageTimestamp = Date.now();

      // Mevcut deleteTimeout'u sıfırla
      clearTimeout(activity.timeouts.deleteTimeout);
      activity.timeouts.deleteTimeout = setTimeout(async () => {
        try {
          await message.channel.send("❌ Ticket kanalında 2 saattir mesaj alınmadığı için kanal kapatılıyor.");
          await message.channel.delete().catch(() => {});
          ticketActivityMap.delete(message.channel.id);
        } catch {}
      }, 2 * 60 * 60 * 1000); // 2 saat

      ticketActivityMap.set(message.channel.id, activity);
    }
  });
};
