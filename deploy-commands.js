import { REST, Routes } from "discord.js";
import "dotenv/config";
import {command as register} from "./commands/register.js"
import {command as fish} from "./commands/fish.js"
import {command as leaderboard} from "./commands/leaderboard.js"
const commands = [register, fish, leaderboard].map(cmd =>
  cmd.toJSON()
);

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.CLIENT_ID;


const guilds = [process.env.GUILD_ID];

(async () => {
  try {
    for (const guildId of guilds) {
      console.log(`Registering commands in guild ${guildId}...`);
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`Commands registered in guild ${guildId}`);
    }

    console.log("Registering global commands (optional)...");
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log("Global commands registered (may take up to 1 hour)");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
})();
