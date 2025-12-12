async function fetchDefinitionFromDicolink(word) {
    try {
        const url = `https://www.dicolink.com/mots/${encodeURIComponent(word)}`;
        const res = await fetch(url);

        if (!res.ok) {
            console.warn("HTTP error:", res.status);
            return null;
        }

        const html = await res.text();

        const match = html.match(/<meta name="description" content="([^"]+)"/i);
        if (!match) return null;

        let content = match[1];

        const prefix = word.toLowerCase() + ":";
        if (content.toLowerCase().startsWith(prefix)) {
            content = content.slice(prefix.length).trim();
        }

        if (content.includes("Dicolink est un dictionnaire francais en ligne")) {
            return "Aucune définition disponible.";
        }

        return content;

    } catch (err) {
        console.error("Scraping error:", err);
        return null;
    }
}

module.exports = { fetchDefinitionFromDicolink };