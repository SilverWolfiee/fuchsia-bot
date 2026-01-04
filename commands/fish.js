import { SlashCommandBuilder, ActionRowBuilder, ButtonStyle, AttachmentBuilder, ComponentType, ButtonBuilder } from "discord.js";
import { loadUsers, saveUser } from "../handlers/userdata.js";
import fs from "fs"
import path from "path"

const allowedChannels = ["1457317154373369936", "1432372213700628592"]; //modify this according to ur discord server

        if (!allowedChannels.includes(interaction.channelId)) {
            await interaction.reply({ 
                content: "🚫 **No Fishing Here!**\nThe water is too shallow! Please go to the designated fishing zones. 🎣", 
                ephemeral: true 
            });
            return; 
        }

const loadLoot=()=>{
    const lootPath = path.join(process.cwd(), 'data/loot.json');
    if (!fs.existsSync(lootPath)) return null;
    return JSON.parse(fs.readFileSync(lootPath, 'utf-8'));
}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const command = new SlashCommandBuilder()
    .setName("fish")
    .setDescription("Start fishing")

export async function execute(interaction) {
    try{
        const userId = interaction.user.id
        const users = loadUsers()
        if(!users[userId]){
            await interaction.reply({content : "You haven't got yourself a fishing license, please use /register"})
            return
        }
        await interaction.deferReply({ephemeral:true})
        await interaction.editReply({
            content: "🎣 **You cast your line...**\n\n*Shhh... stay quiet and watch this message.*\n⚠️ **DO NOT dismiss this message or you'll lose the fish!**\nWaiting for a bite..."
        });
        const waitTime = Math.floor(Math.random() * 40000) + 5000;
        await wait(waitTime);
        const liftButton = new ButtonBuilder()
            .setCustomId('lift_rod')
            .setLabel('LIFT!')
            .setStyle(ButtonStyle.Danger) 
            .setEmoji('🎣');

        const row = new ActionRowBuilder().addComponents(liftButton);
        try {
            await interaction.user.send(`🎣 **I sense some movement!!** Check the server quick! You have 60 seconds!`)
        } catch (error) {
            console.log(`Could not DM user ${interaction.user.tag} (DMs likely off).`)
        }

        await interaction.editReply({
            content: "💦 **SOMETHING BIT THE HOOK!**\n\nQUICK! Click the button below! You have **60 seconds**!",
            components: [row]
        })
        const message = await interaction.fetchReply();
        try {
            const confirmation = await message.awaitMessageComponent({ 
                filter: i => i.user.id === userId && i.customId === 'lift_rod', 
                time: 60000, // 60 seconds
                componentType: ComponentType.Button 
            });

            const disabledRow = new ActionRowBuilder().addComponents(
                liftButton.setDisabled(true).setLabel('Reeling in...')
            );
            await confirmation.update({ components: [disabledRow] })
            const loot = loadLoot();
            if (!loot) {
                await interaction.editReply({ content: "You reeled it in... but the ocean is empty? (Missing loot.json)", components: [] })
                return
            }
            const roll = Math.floor(Math.random() * 100) + 1
            let rarity = "";
            let fishList = [];
            //Common 75%, Rare 20%, Legendary 3%, Fuchsia 2%
            if (roll <= 75) {
                rarity = "common"
                fishList = loot.common
            } else if (roll <= 95) {
                rarity = "rare"
                fishList = loot.rare
            } else if (roll <= 98) {
                rarity = "legendary";
                fishList = loot.legendary
            } else {
                rarity = "fuchsia"
                fishList = loot.fuchsia
            }
            const caughtFish = fishList[Math.floor(Math.random() * fishList.length)]
            if (!users[userId].stats[rarity]) users[userId].stats[rarity] = 0
            users[userId].stats[rarity] += 1
            saveUser(userId, users[userId])
            let publicContent = "";
            let publicFiles = [];
            const fishName = caughtFish.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            
            if (caughtFish === "Hysilens") {
                publicContent = `📸 **LEGENDARY CATCH LOG**\n**Player:** <@${userId}>\n**Loot:** Hysilens?!\n\n*Wait, how did she get in there?*`;
                publicFiles = [new AttachmentBuilder('./assets/HysilensChibi.png')];
            } else if (caughtFish === "Fuchsia") {
                publicContent = `🚨 **CRITICAL CATCH LOG**\n**Player:** <@${userId}>\n**Loot:** FUCHSIA?!\n\n*Put me down this instant!!*`;
                publicFiles = [new AttachmentBuilder('./assets/Fufuhooked.png')];
            } else {
                let emoji = "🐟"
                if (rarity === "rare") emoji = "✨"
                if (rarity === "legendary") emoji = "👑"
                
                publicContent = `🎣 **FISHING LOG**\n**Player:** <@${userId}>\n**Catch:** ${fishName} ${emoji}\n**Rarity:** ${rarity.toUpperCase()}`;
            }

           
            await interaction.channel.send({
                content: publicContent,
                files: publicFiles
            });

          
            await interaction.editReply({
                content: `✅ **Nice catch!**`,
                components: []
            });

        } catch (e) {
            console.log("Collector error : ", e)
            const disabledRow = new ActionRowBuilder().addComponents(
               
                liftButton.setDisabled(true).setLabel('Too slow!').setStyle(ButtonStyle.Secondary)
            );
            
            await interaction.editReply({
                content: "**Oops it got away!! The fishing line broke!! Better luck next time!",
                components: [disabledRow]
            });
        }
    } catch(err){
        console.error("Error in /fish:", err)
        
        try {
            await interaction.editReply({ content: "Ouch! The line snapped (Error occurred).", components: [] })
        } catch (ignore) {}
    }
}