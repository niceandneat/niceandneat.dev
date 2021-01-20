function startDraw() {
  const path = document.querySelector<SVGPathElement>('.abstract__face path');

  if (!path) {
    return;
  }

  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length} ${length}`;
  path.style.strokeDashoffset = `${length}`;
  path.classList.toggle('drawing--start');

  // Trigger a layout so styles are calculated & the browser
  // picks up the starting position before animating
  path.getBoundingClientRect();

  path.style.transition = `stroke-dashoffset ${length / 200}s linear`;
  path.style.strokeDashoffset = '0';
}

startDraw();

// Hack : https://github.com/microsoft/TypeScript/issues/18232
export {};
