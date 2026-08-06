export interface Verse {
  text: string;
  reference: string;
}

const verseRotationStorageKey = "ecclesia_one_verse_rotation";

export const verses: Verse[] = [
  {
    text: "Servi uns aos outros, cada um conforme o dom que recebeu.",
    reference: "1 Pedro 4:10",
  },
  {
    text: "Tudo deve ser feito com decencia e ordem.",
    reference: "1 Corintios 14:40",
  },
  {
    text: "Confiem no Senhor de todo o coracao.",
    reference: "Proverbios 3:5",
  },
  {
    text: "O Senhor e a minha forca e o meu escudo.",
    reference: "Salmos 28:7",
  },
];

export function getVerseForAccess() {
  if (typeof window === "undefined") {
    return verses[0];
  }

  const rawRotation = Number(window.localStorage.getItem(verseRotationStorageKey) ?? "0");
  const normalizedRotation = Number.isFinite(rawRotation) ? rawRotation : 0;
  const nextRotation = normalizedRotation + 1;

  window.localStorage.setItem(verseRotationStorageKey, String(nextRotation));

  return verses[normalizedRotation % verses.length] ?? verses[0];
}
