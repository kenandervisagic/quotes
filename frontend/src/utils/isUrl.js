export function isUrl(inputValue) {
    const urlRegex = /(https?:\/\/|www\.|\.(com|org|net|io|gov|edu|co|ai))\S+/i;
    return urlRegex.test(inputValue)
}