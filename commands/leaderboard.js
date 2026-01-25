import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { loadUsers } from "../handlers/userdata.js";

export const command = new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View top 10 player's Leaderboard")


export async function execute(interaction) {
    
    const users = loadUsers();
   
    const sortedLeaderboard = Object.entries(users)
        .map(([id, data]) => {
            const s = data.stats;
            const totalXP = (1 * s.common) + Math.round(1.5 * s.rare) + (2 * s.legendary) + (5 * s.Fuchsia);
            return {
                username: data.username,
                xp: totalXP
            };
        })
        // 2. Sort by XP 
        .sort((a, b) => b.xp - a.xp)
        // 3. Take only the top 10 
        .slice(0, 10)
    const leaderBoarddesc = sortedLeaderboard
        .map((user, index) => `${index + 1}. **${user.username}** — ${user.xp} XP`)
        .join("\n");
    const embed = new EmbedBuilder()
        .setTitle("Fishing Leaderboard")
        .setColor('42bcf5')
        .setDescription(leaderBoarddesc || "No one has fished yet!")
        .setFooter({ 
            text: "XP Scaling: Common: 1 | Rare: 1.5 (Rounded) | Legendary: 2 | Fuchsia: 5" 
        });
    await interaction.reply({embeds : [embed]})



}



