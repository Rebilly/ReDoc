export const IS_BROWSER = typeof window !== 'undefined' && 'HTMLElement' in window;

export function querySelector(selector: string): Element | null {
  if (typeof document !== 'undefined') {
    return document.querySelector(selector);
  }
  return null;
}

/**
 * Drop everything inside <...> (i.e., tags/elements), and keep the text.
 * Unlike browser innerText, this removes newlines; it also doesn't handle
 * un-encoded `<` or `>` characters very well, so don't feed it malformed HTML
 */
export function html2Str(html: string): string {
  return html
    .split(/<[^>]+>/)
    .map(chunk => {
      return chunk.trim();
    })
    .filter(trimmedChunk => {
      return trimmedChunk.length > 0;
    })
    .join(' ');
}

// scrollIntoViewIfNeeded polyfill

if (typeof Element !== 'undefined' && !(Element as any).prototype.scrollIntoViewIfNeeded) {
  (Element as any).prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    const parent = this.parentNode;
    const parentComputedStyle = window.getComputedStyle(parent, undefined);
    const parentBorderTopWidth = parseInt(
      parentComputedStyle.getPropertyValue('border-top-width'),
      10,
    );
    const parentBorderLeftWidth = parseInt(
      parentComputedStyle.getPropertyValue('border-left-width'),
      10,
    );
    const overTop = this.offsetTop - parent.offsetTop < parent.scrollTop;
    const overBottom =
      this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth >
      parent.scrollTop + parent.clientHeight;
    const overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft;
    const overRight =
      this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth >
      parent.scrollLeft + parent.clientWidth;
    const alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop =
        this.offsetTop -
        parent.offsetTop -
        parent.clientHeight / 2 -
        parentBorderTopWidth +
        this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft =
        this.offsetLeft -
        parent.offsetLeft -
        parent.clientWidth / 2 -
        parentBorderLeftWidth +
        this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}
