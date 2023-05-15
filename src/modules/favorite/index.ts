import { GuildMember } from 'discord.js'
import { createMessageMenuCommand } from 'reaccord/lib/Command'
import { addMomentsRoleIds } from '../../env'
import { isMemberAdmin } from '../../helpers/userRoles'
import { saveMoment } from './saveMoment'


const canAddMoment = (member?: GuildMember): member is GuildMember =>
    !!member && addMomentsRoleIds.some((id) => member.roles.cache.has(id))

export const favoriteCommand = createMessageMenuCommand("Funny Moment").exec(
    async (interaction) => {
        const client = interaction.client
        if (!interaction.isMessageContextMenuCommand()) return

        const { targetMessage, user, guild } = interaction

        const member = await guild?.members.fetch(user.id)

        if (!isMemberAdmin(member) && !canAddMoment(member)) {
            interaction.reply({
                content: `Vous n'avez pas la permission d'ajouter un favoris.`,
                ephemeral: true,
            })
            return
        }

        try {
            await saveMoment(targetMessage, user, client)
        } catch {
            interaction.reply({
                content: `Une erreur est survenue.`,
                ephemeral: true,
            })
            return
        }

        await interaction.reply({
            content: `Favoris ajouté !`,
            ephemeral: true,
        })
    },
)