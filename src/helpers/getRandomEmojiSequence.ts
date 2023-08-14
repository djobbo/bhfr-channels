export const getRandomEmojiSequence = (
    emojis: string[],
    minLength: number = 1,
    maxLength = 8,
) => {
    const length =
        Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
    const sequence = Array.from(
        { length },
        () => emojis[Math.floor(Math.random() * emojis.length)],
    )
    return `:${sequence.join("::")}:`
}
