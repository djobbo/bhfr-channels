import { createMessageMenuCommand } from "reaccord/lib/Command"
import { getRandomEmojiSequence } from "../../helpers/getRandomEmojiSequence"
import { isMemberAdmin } from "../../helpers/userRoles"

export const mockMessageCommand = createMessageMenuCommand("Se moquer").exec(
    async (interaction) => {
        if (!interaction.isMessageContextMenuCommand()) return

        const { targetMessage, user, guild } = interaction

        const member = await guild?.members.fetch(user.id)

        if (!isMemberAdmin(member)) {
            interaction.reply({
                content: `Vous n'avez pas la permission de vous moquer. 😈`,
                ephemeral: true,
            })
            return
        }

        try {
            const emojis = getRandomEmojiSequence(
                [
                    "sob",
                    "joy",
                    "rofl",
                    "fire",
                    "100",
                    "nerd",
                    "person_swimming",
                    "woman_swimming",
                    "man_swimming",
                    "thumbsup",
                    "skull",
                    "flushed",
                ],
                12,
                24,
            )
            await targetMessage.reply(emojis)
        } catch {
            interaction.reply({
                content: `Une erreur est survenue.`,
                ephemeral: true,
            })
            return
        }

        await interaction.reply({
            content: `Message moqué !`,
            ephemeral: true,
        })
    },
)
