const input = document.getElementById('search');
const groups = document.querySelectorAll('[data-group]');
const empty = document.getElementById('empty');

input.addEventListener('input', () => {
  const q = input.value.trim().toLowerCase();
  let anyVisible = false;

  groups.forEach((group) => {
    let groupHasMatch = false;
    group.querySelectorAll('.card').forEach((card) => {
      const text = card.textContent.toLowerCase();
      const match = !q || text.includes(q);
      card.hidden = !match;
      if (match) groupHasMatch = true;
    });
    group.hidden = !groupHasMatch;
    if (groupHasMatch) anyVisible = true;
  });

  empty.hidden = anyVisible;
});

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== input) {
    e.preventDefault();
    input.focus();
  }
});
