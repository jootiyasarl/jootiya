export function generateSmartReplies(lastMessage: string): string[] {
    const msg = lastMessage.toLowerCase();

    if (msg.includes("prix") || msg.includes("thaman") || msg.includes("chhal")) {
        return ["C'est mon dernier prix.", "On peut s'arranger.", "Proposez votre prix."];
    }

    if (msg.includes("dispo") || msg.includes("mawjoud") || msg.includes("kayn")) {
        return ["Oui, c'est toujours disponible.", "C'est disponible.", "Désolé, c'est déjà vendu."];
    }

    if (msg.includes("fin") || msg.includes("localisation") || msg.includes("place")) {
        return ["Casablanca, Maarif.", "Rabat, Agdal.", "Envoyez-moi votre localisation."];
    }

    if (msg.includes("salam") || msg.includes("bonjour")) {
        return ["Bonjour, comment allez-vous ?", "Bonjour, enchanté.", "Bienvenue !"];
    }

    return ["Oui, disponible.", "Merci de votre intérêt.", "Je vous réponds bientôt."];
}
