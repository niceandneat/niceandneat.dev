// Can not make diagrams on compile time unless using pupeteer
// Issue: https://github.com/mermaid-js/mermaid/issues/1183
import mermaid from 'mermaid';

mermaid.initialize({
  securityLevel: 'loose',
});

Array.from(document.querySelectorAll('.mermaid')).map((e) =>
  e.classList.add('show'),
);
