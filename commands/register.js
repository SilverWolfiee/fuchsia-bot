import { SlashCommandBuilder } from "discord.js";
import { loadUsers, saveUser } from "../handlers/userdata.js";

export const command = new SlashCommandBuilder()
    .setName("register")
    .setDescription("Create an account to start fishing!");

export async function execute(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        
        const userId = interaction.user.id;
        const users = loadUsers();

        
        if (users[userId]) {
            await interaction.editReply('You already have an account!');
            return;
        }
        const newUser = {
            username: interaction.user.username,
            stats: {
                common: 0,
                rare: 0,
                legendary: 0,
                Fuchsia: 0
            },
            joinedAt: new Date().toISOString()
        };

        
        saveUser(userId, newUser);

        await interaction.editReply('Account created successfully! Welcome to the Fishing Club! 🎣✨');

    } catch (err) {
        console.error("Error in /register:", err);
        
      
        if (interaction.deferred) {
            await interaction.editReply({
                content: "Something went wrong while registering your account.",
            });
        }
    }
}