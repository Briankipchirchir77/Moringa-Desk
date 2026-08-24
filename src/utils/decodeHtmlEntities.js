// Stack Exchange API titles come HTML-entity-encoded (e.g. `&quot;`) since
// they're meant for direct HTML embedding — decode before rendering as
// plain React text, or entities show up literally instead of as `"`/`'`.
export function decodeHtmlEntities(text) {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}
