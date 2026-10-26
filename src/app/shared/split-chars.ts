function charSpan(char: string): { wrap: HTMLElement; inner: HTMLElement } {
  const wrap = document.createElement('span');
  wrap.className = 'char-wrap';
  wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top';
  const inner = document.createElement('span');
  inner.className = 'char';
  inner.style.display = 'inline-block';
  inner.textContent = char === ' ' ? ' ' : char;
  wrap.appendChild(inner);
  return { wrap, inner };
}

/**
 * Replaces the text of `line` with one masked span per character (spaces become
 * non-breaking), as the reference does for its headings. Returns the inner spans.
 *
 * With `wrapWords`, characters are grouped per word and real spaces are kept between
 * words, so a long line can still wrap at word boundaries.
 */
export function splitChars(line: HTMLElement, { wrapWords = false } = {}): HTMLElement[] {
  const text = line.textContent ?? '';
  line.textContent = '';
  const chars: HTMLElement[] = [];

  if (!wrapWords) {
    for (const char of Array.from(text)) {
      const { wrap, inner } = charSpan(char);
      line.appendChild(wrap);
      chars.push(inner);
    }
    return chars;
  }

  text.split(' ').forEach((word, index) => {
    if (index > 0) line.appendChild(document.createTextNode(' '));
    const group = document.createElement('span');
    group.style.cssText = 'display:inline-block;white-space:nowrap';
    for (const char of Array.from(word)) {
      const { wrap, inner } = charSpan(char);
      group.appendChild(wrap);
      chars.push(inner);
    }
    line.appendChild(group);
  });
  return chars;
}
