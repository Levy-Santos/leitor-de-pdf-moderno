import React from 'react';

/**
 * Transforms plain text into Bionic Reading format:
 * The first 40-50% of each word is highlighted with font-bold or semibold,
 * allowing the reader's eye to skim through text faster on small screens.
 */
export function renderBionicText(text: string): React.ReactNode {
  const words = text.split(/(\s+)/);

  return (
    <>
      {words.map((chunk, idx) => {
        // If it's pure whitespace, preserve it
        if (/^\s+$/.test(chunk)) {
          return chunk;
        }

        // Split word into lead (bold) and rest
        const len = chunk.length;
        if (len <= 1) {
          return <span key={idx} className="font-bold">{chunk}</span>;
        }

        // Midpoint calculation: 1 letter for 2-3 char words, 2 for 4-5 chars, etc.
        const highlightLen = Math.ceil(len * 0.45);
        const boldPart = chunk.slice(0, highlightLen);
        const restPart = chunk.slice(highlightLen);

        return (
          <span key={idx}>
            <span className="font-extrabold opacity-95">{boldPart}</span>
            <span>{restPart}</span>
          </span>
        );
      })}
    </>
  );
}
