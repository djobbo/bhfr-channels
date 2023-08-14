import { Embed, createSlashCommand } from "reaccord"

export const clanCommand = createSlashCommand("clan", "Ajouter le role de clan")
    .userParam("user", "Utilisateur à ajouter")
    .render(({ user }, interaction) => (
        <Embed>
            <Embed.Title>
                Hello {user?.username ?? interaction.user.username}
            </Embed.Title>
        </Embed>
    ))
