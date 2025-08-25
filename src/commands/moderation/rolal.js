import {
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
    name:"rolal",
    description:"Belirtilen Kullanıcıdan Rol Alır",
    permissions: PermissionFlagsBits.ManageRoles,
    executeMessage: async (message, args, client) => {
        // Kullanıcı yetki kontrolü
        
        if (isMember && targetMember.roles.highest.position >= member.roles.highest.position) {
      return interaction.reply({ content: "❌ Bu kullanıcıya işlem yapamazsınız. Rolü sizden yüksek.", flags: 64 });
    }
        
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("❌ Yetki Hatası")
                .setDescription("Bu komutu kullanmak için 'Rolleri Yönet' iznine sahip olmalısın.")
                .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        const target =
            message.mentions.members.first() ||
            (args[0] && await message.guild.members.fetch(args[0]).catch(() => null));
    
        if (!target) {
            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❗ Kullanıcı Bulunamadı")
            .setDescription("❗ Lütfen rolu alınacak kullanıcıyı etiketleyin veya geçerli bir ID girin.")
            .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }
    
        const role =
            message.mentions.roles.first() ||
            (args[1] && await message.guild.roles.fetch(args[1]).catch(() => null));
    
        if (!role) {
            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❗ Rol Bulunamadı")
            .setDescription("❗ Lütfen alınacak rolü etiketleyin veya geçerli bir ID girin.")
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
            .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({dynamic:true}) })
            .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }
    
        if (target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❗ Yetki Hatası")
            .setDescription("❗ Bu kullanıcıdan rol alınamıyor. Kullanıcının rolü botun rolünden yüksek.")
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
            .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({dynamic:true}) })
            .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }
    
        if (role.position >= message.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("❗ Yetki Hatası")
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
            .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({dynamic:true}) })
            .setDescription("❗ Bu rol alınamıyor. Rol botun rolünden yüksek.")
            .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }
    
        if (!target.roles.cache.has(role.id)) {
            const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle("❗ Rol Zaten Yok")
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
            .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({dynamic:true}) })
            .setDescription("❗ Bu kullanıcıda bu rol zaten yok.")
            .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }
    
        await target.roles.remove(role);
    
        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Rol Alındı")
            .setDescription(`✅ ${target.user.tag} adlı kullanıcıdan ${role.name} rolü alındı.`)
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}))
            .setFooter({ text: "Anger Software", iconURL: client.user.displayAvatarURL({dynamic:true}) })
            .setTimestamp(); 
        return message.channel.send({ embeds: [embed] });
    }
}
