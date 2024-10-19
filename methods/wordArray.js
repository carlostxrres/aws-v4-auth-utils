export function wordArrayToString({ words, sigBytes }) {
    const hexChars = []
    for (let i = 0; i < sigBytes; i++) {
        const bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        hexChars.push((bite >>> 4).toString(16))
        hexChars.push((bite & 0x0f).toString(16))
    }
    return hexChars.join('')
}