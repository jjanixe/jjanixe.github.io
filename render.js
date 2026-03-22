// render.js — Fetches YAML data and renders sections into the page.

async function fetchYaml(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const text = await res.text();
  return jsyaml.load(text);
}

async function loadSection(section) {
  const index = await fetchYaml(`data/${section}/_index.yaml`);
  const entries = [];
  for (const file of index) {
    const entry = await fetchYaml(`data/${section}/${file}`);
    entries.push(entry);
  }
  return entries;
}

// ===== Publications =====

function renderAuthors(authors) {
  return authors.map(a => {
    const name = a.me ? `<strong>${a.name}</strong>` : a.name;
    return a.url && !a.me ? `<a href="${a.url}">${name}</a>` : name;
  }).join(', ');
}

function renderPublication(pub) {
  const links = (pub.links || [])
    .map(l => `<a href="${l.url}">[${l.label}]</a>`)
    .join(' / ');

  return `
    <div class="paper">
      <div class="paper-image">
        <img src="${pub.image || 'images/placeholder_paper.svg'}" alt="${pub.title}">
      </div>
      <div class="paper-text">
        <span class="paper-title"><a href="${(pub.links && pub.links[0] && pub.links[0].url) || '#'}">${pub.title}</a></span>
        <br>
        ${renderAuthors(pub.authors)}
        <br>
        <em>${pub.venue}</em>, ${pub.year}
        <br>
        ${links}
        ${pub.description ? `<br><span class="paper-desc">${pub.description}</span>` : ''}
      </div>
    </div>
  `;
}

// ===== Research & Teaching Experiences =====

function renderExperience(exp) {
  const title = exp.course
    ? `${exp.role} — ${exp.course}`
    : `${exp.role}`;
  const org = exp.lab
    ? `${exp.lab}, ${exp.institution}`
    : exp.institution;

  return `
    <div class="experience-item">
      <div class="experience-header">
        <span class="experience-title">${title}</span>
        <span class="experience-period">${exp.period}</span>
      </div>
      <div class="experience-org">${org}</div>
      ${exp.description ? `<div class="experience-desc">${exp.description}</div>` : ''}
    </div>
  `;
}

// ===== Reviewer =====

function renderReviewer(rev) {
  return `<li>${rev.venue} (${rev.years})</li>`;
}

// ===== Main =====

async function renderAll() {
  try {
    const [pubs, research, teaching, reviewer] = await Promise.all([
      loadSection('publications'),
      loadSection('research'),
      loadSection('teaching'),
      loadSection('reviewer'),
    ]);

    document.getElementById('publications').innerHTML =
      pubs.map(renderPublication).join('');

    document.getElementById('research').innerHTML =
      research.map(renderExperience).join('');

    document.getElementById('teaching').innerHTML =
      teaching.map(renderExperience).join('');

    document.getElementById('reviewer').innerHTML =
      `<ul class="reviewer-list">${reviewer.map(renderReviewer).join('')}</ul>`;

  } catch (err) {
    console.error('Error rendering sections:', err);
  }
}

document.addEventListener('DOMContentLoaded', renderAll);
