import { EmbedBuilder } from "discord.js"
import { RULES_CHANNEL_ID, SUPPORT_CHANNEL_ID } from "../../env"

export const voiceChatRulesEmbed = new EmbedBuilder()
    .setColor("White")
    .setTitle("Règles des salons vocaux")
    .addFields(
        {
            name: "Règles générales",
            value: `:straight_ruler: Les règles générales du serveur s'appliquent également dans les salons vocaux.\n*Lisez les attentivement et respectez-les: <#${RULES_CHANNEL_ID}>.*`,
        },
        {
            name: "Modération",
            value: `:warning: Les modérateurs peuvent voir qui est rentré et sorti du salon.\n:octagonal_sign: Si quelqu\'un ne respecte pas les règles (toxicité, insultes, etc.), merci d'ouvrir un ticket dans <#${SUPPORT_CHANNEL_ID}> **AVEC UNE PREUVE** (vidéo de préférence).`,
        },
        {
            name: "Rooms Brawlhalla",
            value: `:ledger: Merci d'envoyer le **numéro de room actuel** dans le salon textuel associé à votre vocal.\n:handshake: Cela permet aux autres joueurs de vous rejoindre plus facilement.\n*N'oubliez pas de le renvoyer à chaque fois que vous changez de room!*`,
        },
    )
