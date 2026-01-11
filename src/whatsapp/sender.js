async function sendText(sock, number, message) {
    const jid = number
        .replace(/^0/, '62')
        .replace(/\D/g, '') + '@s.whatsapp.net'

    return sock.sendMessage(jid, { text: message })
}

export default { sendText }
