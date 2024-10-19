export async function hmacSHA256(message, key) {
    const encoder = new TextEncoder()
    let keyBytes

    if (typeof key === 'string') {
        keyBytes = encoder.encode(key)
    } else if (key && key.words && key.sigBytes) {
        keyBytes = new Uint8Array(key.sigBytes)
        for (let i = 0; i < key.sigBytes / 4; i++) {
            keyBytes[i * 4] = (key.words[i] >> 24) & 0xFF
            keyBytes[i * 4 + 1] = (key.words[i] >> 16) & 0xFF
            keyBytes[i * 4 + 2] = (key.words[i] >> 8) & 0xFF
            keyBytes[i * 4 + 3] = key.words[i] & 0xFF
        }
    } else {
        throw new Error('Invalid key format')
    }

    const messageBytes = encoder.encode(message)
    const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes)
    const littleEndianWords = new Uint32Array(signature)
    const bigEndianWords = Array.from(
        littleEndianWords,
        word =>
            ((word & 0xFF) << 24) |
            ((word & 0xFF00) << 8) |
            ((word >> 8) & 0xFF00) |
            ((word >> 24) & 0xFF)
    )

    return { words: bigEndianWords, sigBytes: signature.byteLength }
}