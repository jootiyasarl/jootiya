export function generateSmartReplies(lastMessage: string): string[] {
    const msg = lastMessage.toLowerCase();

    if (msg.includes("prix") || msg.includes("thaman") || msg.includes("chhal")) {
        return ["Akhir thaman howa hada.", "Momkin ntfahmo.", "Propose ton prix."];
    }

    if (msg.includes("dispo") || msg.includes("mawjoud") || msg.includes("kayn")) {
        return ["Oui, mizal dispo.", "Mawjoud a khouya.", "Vendu, désolé."];
    }

    if (msg.includes("fin") || msg.includes("localisation") || msg.includes("place")) {
        return ["Casa, Maarif.", "Rabat, Agdal.", "Envoie-moi ta localisation."];
    }

    if (msg.includes("salam") || msg.includes("bonjour")) {
        return ["Wa alaykoum salam.", "Bonjour, ça va ?", "Merhba bik."];
    }

    return ["Oui, disponible.", "Merci de votre intérêt.", "Je vous réponds bientôt."];
}
