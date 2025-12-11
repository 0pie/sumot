import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://www.listesdemots.net/"
OUTPUT_FILE = "words.json"

def fetch_page(url):
    print(f"Téléchargement : {url}")
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    return r.text

def extract_words(html):
    soup = BeautifulSoup(html, "html.parser")
    spans = soup.find_all("span", class_="mt")
    return [s.get_text(strip=True).lower() for s in spans]

def fetch_all_for_length(n):
    all_words = set()

    page_index = 1
    while True:
        if page_index == 1:
            url = f"{BASE_URL}mots{n}lettres.htm"
        else:
            url = f"{BASE_URL}mots{n}lettrespage{page_index}.htm"

        try:
            html = fetch_page(url)
        except requests.HTTPError:
            break

        words = extract_words(html)
        if not words:
            break

        for w in words:
            all_words.add(w)

        page_index += 1
        time.sleep(0.5)
    
    return sorted(all_words)

def main():
    result = {}

    for n in range(3, 11):
        print(f"\n=== Mots de {n} lettres ===")
        words = fetch_all_for_length(n)
        result[str(n)] = words
        print(f"{len(words)} mots trouvés.")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nFichier généré : {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
