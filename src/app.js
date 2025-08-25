import { Client, GatewayIntentBits, ActivityType, Collection } from "discord.js";
import { readdirSync } from "fs";
import 'dotenv/config';



  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMessageTyping
    ],
    presence: {
      activities: [
        {
          name: "Anger Software",
          type: ActivityType.Playing
        }
      ],
      status: "online"
    }
  });

  // Event'leri yükle
readdirSync("./events").forEach(async file => {
  const event = await import(`./events/${file}`)
  event.default(client)
})




  client.commands =new Collection()
  readdirSync("./commands").forEach(category => {
    readdirSync(`./commands/${category}`).forEach(async file => {
      const command = await import(`./commands/${category}/${file}`)
      client.commands.set(command.default.name, command.default)
    })
  })
  // Botu başlat
  client.login(process.env.TOKEN);

