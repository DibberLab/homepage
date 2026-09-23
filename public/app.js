const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const main = document.getElementById('main');

async function load() {
  let groups;
  try {
    groups = await fetch('data.json', { cache: 'no-store' }).then((r) => r.json());
  } catch (err) {
    main.innerHTML = '<p class="loading">Could not load data.json.</p>';
    return;
  }

  main.innerHTML = groups.map((g) => `
    <section class="group" data-group>
      <h2>${esc(g.group)}</h2>
      <div class="grid">
        ${g.items.map((item) => `
          <a class="card" href="${esc(item.url)}" target="_blank" rel="noreferrer">
            <span class="icon"><i class="${esc(item.icon || 'fa-solid fa-link')}"></i></span>
            <span class="text">
              <span class="name">${esc(item.name)}</span>
              ${item.sub ? `<span class="sub">${esc(item.sub)}</span>` : ''}
            </span>
          </a>`).join('')}
      </div>
    </section>`).join('') + '<p id="empty" class="empty" hidden>No matches.</p>';

  wireSearch();
}

function wireSearch() {
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
}

load();
