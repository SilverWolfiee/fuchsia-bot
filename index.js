import 'dotenv/config';
import { Client, Events, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs"
import path from "path"
import os from "os"

if(os.platform === "win32"){
    console.log("here's a nickel kidm GET URSELF A REAL OS!!")
}

const client = new Client({
    intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.commands = new Collection();
const commandsPath = path.join(process.cwd(),"commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  try {
    const imported = await import(`file:///${filePath.replace(/\\/g, '/')}`);
    const command = imported.command;
    const execute = imported.execute;

    if (!command?.name || typeof execute !== "function") {
      console.warn(`Skipping invalid command file: ${file}`);
      continue;
    }

    client.commands.set(command.name, { command, execute });
    console.log(`Loaded command: ${command.name}`);
  } catch (err) {
    console.warn(`Failed to load command: ${file}`);
    console.warn(`→ ${err.message}`);
  }
}
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
        await cmd.execute(interaction);
    } catch (error) {
        console.error(error);
        const errorMessage = { content: 'Oh no! Something went wrong while executing this command!', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Check-in complete! Logged in as ${readyClient.user.tag} ✨`);
});
client.login(process.env.DISCORD_TOKEN)
