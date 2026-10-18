// ---------------------------------------------------------------------------
// THE COLLECTION
//
// The pictures hung on the walls of the dark wings. Every one is a real work
// from the Metropolitan Museum of Art's open-access collection, released under
// CC0 (public domain): four European paintings and two classical marbles. They
// are the "permanent collection" the exhibition rooms are showing, and the
// reason the wings read as a hang rather than a colour field.
//
// The files live in `public/exhibits/` (resized to WebP). The works keep their
// own colour — only the owner's portrait is desaturated. Credits are printed in
// the footer, and the full list with source pages is in HANDOVER.md.
//
// Titles and dates are the Met's own catalogue entries, shortened. Nothing here
// is presented as the artist's own work.
// ---------------------------------------------------------------------------

export const COLLECTION = {
  aphrodite: {
    src: '/exhibits/aphrodite.webp',
    alt: 'Marble statue of Aphrodite, a classical Greek torso, photographed against a plain ground',
    title: 'Marble statue of Aphrodite',
    credit: 'The Met, CC0',
    year: '1st–2nd c.',
    type: 'sculpture',
  },
  herakles: {
    src: '/exhibits/herakles.webp',
    alt: 'Marble statue of Herakles, a classical Roman figure, photographed in the round',
    title: 'Marble statue of Herakles',
    credit: 'The Met, CC0',
    year: '1st c.',
    type: 'sculpture',
  },
  portraitMan: {
    src: '/exhibits/portrait-man.webp',
    alt: 'Portrait of a Man, an early seventeenth-century oil painting on wood',
    title: 'Portrait of a Man',
    credit: 'The Met, CC0',
    year: 'ca. 1618',
    type: 'painting',
  },
  portraitWoman: {
    src: '/exhibits/portrait-woman.webp',
    alt: 'Portrait of a Woman, a sixteenth-century oil painting on wood with a gold frame',
    title: 'Portrait of a Woman',
    credit: 'The Met, CC0',
    year: 'ca. 1520',
    type: 'painting',
  },
  portraitYoungWoman: {
    src: '/exhibits/portrait-young-woman.webp',
    alt: 'Portrait of a Young Woman, a late fifteenth-century oil painting on wood',
    title: 'Portrait of a Young Woman',
    credit: 'The Met, CC0',
    year: 'ca. 1490–1500',
    type: 'painting',
  },
  portico: {
    src: '/exhibits/portico.webp',
    alt: 'A Renaissance Portico with Elegant Figures, an oil painting on copper from about 1615',
    title: 'A Renaissance Portico with Elegant Figures',
    credit: 'The Met, CC0',
    year: 'ca. 1615',
    type: 'painting',
  },
}
