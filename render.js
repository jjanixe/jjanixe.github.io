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
    try {
      const entry = await fetchYaml(`data/${section}/${file}`);
      entries.push(entry);
    } catch (err) {
      console.warn(`Skipping ${section}/${file}:`, err);
    }
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
        <span class="paper-title">${pub.project_url ? `<a href="${pub.project_url}">${pub.title}</a>` : pub.title}</span>
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

async function renderSection(section, containerId, renderFn, wrapFn) {
  try {
    const entries = await loadSection(section);
    const html = wrapFn ? wrapFn(entries.map(renderFn).join('')) : entries.map(renderFn).join('');
    document.getElementById(containerId).innerHTML = html;
  } catch (err) {
    console.error(`Error rendering ${section}:`, err);
    document.getElementById(containerId).innerHTML =
      `<p style="color:#c00">Failed to load ${section}. Check console for details.</p>`;
  }
}

async function renderAll() {
  if (typeof jsyaml === 'undefined') {
    document.body.innerHTML += '<p style="color:#c00;text-align:center;margin:2em;">Error: js-yaml library failed to load.</p>';
    return;
  }

  await Promise.all([
    renderSection('publications', 'publications', renderPublication),
    renderSection('research', 'research', renderExperience),
    renderSection('teaching', 'teaching', renderExperience),
    renderSection('reviewer', 'reviewer', renderReviewer, html => `<ul class="reviewer-list">${html}</ul>`),
  ]);
}

document.addEventListener('DOMContentLoaded', renderAll);
