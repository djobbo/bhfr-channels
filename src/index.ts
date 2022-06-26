import { Client, VoiceBasedChannel } from 'discord.js';
import { config as loadEnv } from 'dotenv';

loadEnv();

const CATEGORY_PREFIX = '🎮 ';
const GEN_CHANNEL_PREFIX = '➕ ';
const VOICE_CHANNEL_PREFIX = '🎮 ';

const { DISCORD_TOKEN } = process.env;

const client = new Client({
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_MESSAGES',
		'GUILD_VOICE_STATES',
	],
});

const isGeneratorChannel = (
	channel: VoiceBasedChannel | null
): channel is VoiceBasedChannel =>
	!!channel &&
	channel.name.startsWith(GEN_CHANNEL_PREFIX) &&
	!!channel.parent?.name.startsWith(CATEGORY_PREFIX);

const isVoiceChannel = (
	channel: VoiceBasedChannel | null
): channel is VoiceBasedChannel =>
	!!channel &&
	channel.name.startsWith(VOICE_CHANNEL_PREFIX) &&
	!!channel.parent?.name.startsWith(CATEGORY_PREFIX);

const deleteChannelIfEmpty = async (channel: VoiceBasedChannel | null) => {
	if (!isVoiceChannel(channel)) return;

	if (channel.members.size > 0) return;

	await channel.delete();
};

const cloneGeneratorChannel = async (channel: VoiceBasedChannel | null) => {
	if (!isGeneratorChannel(channel)) return null;

	if (!channel.parent) return null;

	const genChannel = await channel.clone({
		name: `${VOICE_CHANNEL_PREFIX}${channel.name.slice(
			GEN_CHANNEL_PREFIX.length
		)}`,
		parent: channel.parent,
		position: channel.parent.children.size,
	});
	return genChannel;
};

client.on('voiceStateUpdate', async (oldState, newState) => {
	await deleteChannelIfEmpty(oldState.channel);
	await cloneGeneratorChannel(newState.channel).then(async (channel) => {
		if (!channel) return;

		await newState.member?.voice.setChannel(channel);
	});
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(DISCORD_TOKEN);
