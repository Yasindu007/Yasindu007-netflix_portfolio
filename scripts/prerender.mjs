// Build-time pre-rendering for SEO and AI crawlers.
//
// The app is a client-side SPA whose content comes from DatoCMS at runtime, so
// crawlers that don't run JavaScript (most AI crawlers) used to see an empty page.
// After `vite build`, this script:
//   1. fetches the same DatoCMS content the app shows,
//   2. writes build/<route>/index.html for every route, each with its own title,
//      description, canonical URL and the page's real text inside #root
//      (React replaces it on load, so visitors see the normal app),
//   3. writes build/sitemap.xml and build/llms.txt.
//
// If the CMS can't be reached, it still writes pages with the static profile
// info below and logs a warning, so a CMS outage never breaks a deploy.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'build');
const SITE = 'https://malith.is-a.dev';

const PERSON = {
  name: 'Malith De Silva',
  altName: 'Yasindu De Silva',
  role: 'Site Reliability Engineer Intern at WSO2',
  tagline: 'Cloud, DevOps & Full-Stack Development',
  bio:
    'Malith De Silva (also known as Yasindu De Silva) is a Site Reliability ' +
    'Engineer Intern at WSO2 and a Computer Science student at the University ' +
    'of Westminster, from Sri Lanka, working across cloud infrastructure ' +
    '(Azure, AWS, Kubernetes, Terraform), observability, CI/CD and full-stack ' +
    'web development (React, Node.js, Go).',
  links: [
    ['GitHub', 'https://github.com/Yasindu007'],
    ['LinkedIn', 'https://www.linkedin.com/in/yasindu-desilva/'],
    ['Medium', 'https://medium.com/@yasindudesilva'],
    ['X (Twitter)', 'https://x.com/malith_is_a_dev'],
  ],
};

// ---------------------------------------------------------------- CMS data

const QUERY = `{
  profilebanner { headline profileSummary { value } }
  allTimelines { name timelineType title techStack summaryPoints dateRange }
  allSkills(orderBy: category_ASC, first: 100) { name category description { value } }
  allProjects(orderBy: title_ASC, first: 100) { title description { value } techUsed githubLink }
  allCertifications(first: 100) { title issuer issuedDate link }
}`;

async function fetchCms() {
  const env = { ...loadEnv('production', ROOT, 'REACT_APP_'), ...process.env };
  const token = env.REACT_APP_DATO_CMS_API_TOKEN;
  if (!token) return warn('REACT_APP_DATO_CMS_API_TOKEN is not set');
  try {
    const res = await fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
      signal: AbortSignal.timeout(20000),
    });
    const json = await res.json();
    if (!res.ok || json.errors || !json.data) {
      return warn(`DatoCMS returned HTTP ${res.status}`);
    }
    return json.data;
  } catch (e) {
    return warn(`DatoCMS request failed: ${e.message}`);
  }
}

function warn(msg) {
  console.warn(
    `\n⚠️  prerender: ${msg}. Pages will only contain the static profile info.\n`,
  );
  return null;
}

// ---------------------------------------------------------------- helpers

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// DatoCMS structured text -> plain paragraphs
const stText = (st) => {
  if (!st) return [];
  if (typeof st === 'string') return [st];
  const walk = (n) =>
    n.value ?? (n.children ? n.children.map(walk).join('') : '');
  return (st.value?.document?.children ?? [])
    .map(walk)
    .map((s) => s.trim())
    .filter(Boolean);
};

const lines = (s) =>
  String(s ?? '')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

const endYear = (range) => {
  if (/present|current/i.test(range)) return 9999;
  const ys = String(range).match(/\d{4}/g);
  return ys ? +ys[ys.length - 1] : 0;
};

// ---------------------------------------------------------------- sections

function sections(cms) {
  const timeline = (cms?.allTimelines ?? [])
    .map((t) => ({ ...t, dateRange: String(t.dateRange ?? '').trim() }))
    .sort((a, b) => endYear(b.dateRange) - endYear(a.dateRange));
  const work = timeline.filter((t) => /^work$/i.test(t.timelineType));
  const edu = timeline.filter((t) => !/^work$/i.test(t.timelineType));
  const skills = cms?.allSkills ?? [];
  const projects = cms?.allProjects ?? [];
  const certs = cms?.allCertifications ?? [];
  const summary = stText(cms?.profilebanner?.profileSummary);

  const about = `
    <h1>${esc(PERSON.name)} <small>(${esc(PERSON.altName)})</small></h1>
    <p><strong>${esc(PERSON.role)}</strong> · ${esc(PERSON.tagline)}</p>
    <p>${esc(PERSON.bio)}</p>
    ${summary.map((p) => `<p>${esc(p)}</p>`).join('')}`;

  const experience = `
    <h2>Work experience</h2>
    ${
      work.length
        ? `<ul>${work
            .map(
              (t) => `<li><h3>${esc(t.title)} – ${esc(t.name)}</h3>
                <p>${esc(t.dateRange)}${t.techStack ? ` · ${esc(t.techStack)}` : ''}</p>
                <ul>${lines(t.summaryPoints)
                  .map((l) => `<li>${esc(l)}</li>`)
                  .join('')}</ul></li>`,
            )
            .join('')}</ul>`
        : `<p>${esc(PERSON.role)}.</p>`
    }
    <h2>Education</h2>
    ${
      edu.length
        ? `<ul>${edu
            .map(
              (t) =>
                `<li><h3>${esc(t.name)}</h3><p>${esc(t.title)} · ${esc(t.dateRange)}</p></li>`,
            )
            .join('')}</ul>`
        : '<p>BSc (Hons) Computer Science, University of Westminster.</p>'
    }`;

  const byCat = skills.reduce((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});
  const skillsHtml = `
    <h2>Skills</h2>
    ${
      skills.length
        ? Object.entries(byCat)
            .map(
              ([cat, list]) =>
                `<h3>${esc(cat)}</h3><ul>${list
                  .map(
                    (s) =>
                      `<li><strong>${esc(s.name)}</strong>: ${esc(stText(s.description).join(' '))}</li>`,
                  )
                  .join('')}</ul>`,
            )
            .join('')
        : '<p>Azure, AWS, Kubernetes, Terraform, Helm, Docker, CI/CD, KQL, PostgreSQL, Java, Python, Go, Node.js, React and TypeScript.</p>'
    }`;

  const projectsHtml = `
    <h2>Projects</h2>
    ${
      projects.length
        ? `<ul>${projects
            .map(
              (p) => `<li><h3>${esc(p.title)}</h3>
                <p>${esc(stText(p.description).join(' '))}</p>
                ${p.techUsed ? `<p>Tech: ${esc(p.techUsed)}</p>` : ''}
                ${p.githubLink ? `<p><a href="${esc(p.githubLink)}">Source on GitHub</a></p>` : ''}</li>`,
            )
            .join('')}</ul>`
        : `<p>See <a href="${PERSON.links[0][1]}">GitHub</a>.</p>`
    }`;

  const certsHtml = `
    <h2>Certifications</h2>
    ${
      certs.length
        ? `<ul>${certs
            .map(
              (c) =>
                `<li>${c.link ? `<a href="${esc(c.link)}">${esc(c.title)}</a>` : esc(c.title)} – ${esc(c.issuer)}${c.issuedDate ? ` (${esc(c.issuedDate)})` : ''}</li>`,
            )
            .join('')}</ul>`
        : ''
    }`;

  const contact = `
    <h2>Find ${esc(PERSON.name)} online</h2>
    <ul>${PERSON.links
      .map(([n, u]) => `<li><a href="${u}" rel="me">${n}</a></li>`)
      .join('')}</ul>`;

  return {
    about,
    experience,
    skillsHtml,
    projectsHtml,
    certsHtml,
    contact,
    cms,
    work,
    edu,
    skills,
    projects,
    certs,
    summary,
  };
}

// ---------------------------------------------------------------- pages

const NAV = [
  ['/', 'Home'],
  ['/work-experience', 'Experience'],
  ['/skills', 'Skills'],
  ['/projects', 'Projects'],
  ['/certifications', 'Certifications'],
  ['/recommendations', 'Recommendations'],
  ['/blogs', 'Blog'],
  ['/contact-me', 'Contact'],
];

function pages(s) {
  const who = `${PERSON.name} (${PERSON.altName})`;
  const intro = (what) =>
    `<p>${esc(what)} of ${esc(who)}, ${esc(PERSON.role)}.</p>`;
  const page = (path, title, description, body, opts = {}) => ({
    path,
    title,
    description,
    body,
    canonical: opts.canonical ?? path,
    sitemap: opts.sitemap ?? true,
    priority: opts.priority ?? '0.8',
  });

  const homeTitle = `${who} | ${PERSON.role}`;
  const homeDesc = `${PERSON.name} (also known as ${PERSON.altName}) – ${PERSON.role} and Computer Science student at the University of Westminster, working across cloud, DevOps and full-stack development.`;
  const full = [
    s.about,
    s.experience,
    s.skillsHtml,
    s.projectsHtml,
    s.certsHtml,
    s.contact,
  ].join('');

  const profiles = ['recruiter', 'developer', 'stalker', 'adventurer'].map(
    (p) =>
      page(
        `/profile/${p}`,
        `${PERSON.name} – Profile | ${PERSON.role}`,
        homeDesc,
        s.about + s.experience + s.contact,
        { canonical: '/profile/recruiter', sitemap: p === 'recruiter' },
      ),
  );

  return [
    page('/', homeTitle, homeDesc, full, { priority: '1.0' }),
    page('/browse', homeTitle, homeDesc, s.about + s.contact, {
      canonical: '/',
      sitemap: false,
    }),
    ...profiles,
    page(
      '/work-experience',
      `Work Experience & Education | ${PERSON.name}`,
      `Work experience and education of ${who}: ${
        s.work
          .map((t) => `${t.title} at ${t.name}`)
          .slice(0, 3)
          .join('; ') || PERSON.role
      }.`,
      `<h1>Work Experience & Education – ${esc(PERSON.name)}</h1>${intro('Career timeline')}${s.experience}`,
    ),
    page(
      '/skills',
      `Skills | ${PERSON.name} – Cloud, DevOps & Full-Stack`,
      `Technical skills of ${who}: ${s.skills.map((k) => k.name).join(', ') || 'Azure, AWS, Kubernetes, Terraform, Docker, Java, Python, Go, React'}.`,
      `<h1>Skills – ${esc(PERSON.name)}</h1>${intro('Technical skills')}${s.skillsHtml}`,
    ),
    page(
      '/projects',
      `Projects | ${PERSON.name}`,
      `Software projects built by ${who}${s.projects.length ? `: ${s.projects.map((p) => p.title).join(', ')}` : ''}.`,
      `<h1>Projects – ${esc(PERSON.name)}</h1>${intro('Projects')}${s.projectsHtml}`,
    ),
    page(
      '/certifications',
      `Certifications | ${PERSON.name}`,
      `Certifications earned by ${who}.`,
      `<h1>Certifications – ${esc(PERSON.name)}</h1>${intro('Certifications')}${s.certsHtml}`,
    ),
    page(
      '/recommendations',
      `Recommendations | ${PERSON.name}`,
      `Recommendations and references for ${who}, ${PERSON.role}.`,
      `<h1>Recommendations – ${esc(PERSON.name)}</h1>${intro('Recommendations')}`,
    ),
    page(
      '/blogs',
      `Blog | ${PERSON.name}`,
      `Articles and blog posts written by ${who} on software engineering, DevOps and development.`,
      `<h1>Blog – ${esc(PERSON.name)}</h1>${intro('Articles and blog posts')}<p><a href="https://medium.com/@yasindudesilva">Read on Medium</a></p>`,
    ),
    page(
      '/contact-me',
      `Contact | ${PERSON.name}`,
      `How to contact ${who}, ${PERSON.role}.`,
      `<h1>Contact ${esc(PERSON.name)}</h1>${intro('Contact details')}${s.contact}`,
    ),
    page(
      '/music',
      `Music | ${PERSON.name}`,
      `Music that ${who} enjoys.`,
      `<h1>Music – ${esc(PERSON.name)}</h1>`,
      { priority: '0.3' },
    ),
    page(
      '/reading',
      `Reading | ${PERSON.name}`,
      `Books that ${who} is reading and recommends.`,
      `<h1>Reading – ${esc(PERSON.name)}</h1>`,
      { priority: '0.3' },
    ),
  ];
}

// ---------------------------------------------------------------- render

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!re.test(html))
    throw new Error(`meta ${attr}=${key} not found in template`);
  return html.replace(re, `$1${esc(value)}$2`);
}

function render(template, p) {
  const url = SITE + (p.canonical === '/' ? '/' : p.canonical);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = setMeta(html, 'name', 'description', p.description);
  html = setMeta(html, 'property', 'og:title', p.title);
  html = setMeta(html, 'property', 'og:description', p.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', p.title);
  html = setMeta(html, 'name', 'twitter:description', p.description);

  const nav = NAV.map(([h, n]) => `<a href="${h}">${n}</a>`).join(' · ');
  const content = `<div id="root"><!--prerender--><div style="max-width:860px;margin:0 auto;padding:24px 16px;color:#e5e5e5;line-height:1.6">
<header><nav>${nav}</nav></header>
<main>${p.body}</main>
</div><!--/prerender--></div>`;
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('<div id="root"></div> not found in template');
  }
  return html.replace('<div id="root"></div>', content);
}

function llmsTxt(s) {
  const out = [
    `# ${PERSON.name} (${PERSON.altName})`,
    '',
    `> ${PERSON.role}. ${PERSON.tagline}.`,
    '',
    PERSON.bio,
    ...s.summary.map((p) => `\n${p}`),
    '',
    '## Names',
    `- Primary name: ${PERSON.name}`,
    `- Also known as: ${PERSON.altName}`,
    '',
    '## Experience',
    ...(s.work.length
      ? s.work.map(
          (t) =>
            `- ${t.title}, ${t.name} (${t.dateRange})${t.techStack ? `: ${t.techStack}` : ''}`,
        )
      : [`- ${PERSON.role}`]),
    '',
    '## Education',
    ...(s.edu.length
      ? s.edu.map((t) => `- ${t.name}: ${t.title} (${t.dateRange})`)
      : ['- BSc (Hons) Computer Science, University of Westminster']),
    '',
  ];
  if (s.skills.length) {
    out.push('## Skills');
    const byCat = {};
    s.skills.forEach((k) => (byCat[k.category] ??= []).push(k.name));
    Object.entries(byCat).forEach(([c, n]) =>
      out.push(`- ${c}: ${n.join(', ')}`),
    );
    out.push('');
  }
  if (s.projects.length) {
    out.push('## Projects');
    s.projects.forEach((p) =>
      out.push(
        `- ${p.title}${p.githubLink ? ` (${p.githubLink})` : ''}: ${stText(p.description).join(' ')}`,
      ),
    );
    out.push('');
  }
  out.push('## Pages');
  NAV.forEach(([h, n]) => out.push(`- [${n}](${SITE}${h})`));
  out.push('', '## Profiles');
  PERSON.links.forEach(([n, u]) => out.push(`- [${n}](${u})`));
  return out.join('\n') + '\n';
}

function sitemap(list) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = list
    .filter((p) => p.sitemap)
    .map(
      (p) => `  <url>
    <loc>${SITE}${p.path === '/' ? '/' : p.path}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// ---------------------------------------------------------------- main

// Strip any previously injected content so re-running on the same build works.
const template = readFileSync(join(OUT, 'index.html'), 'utf8').replace(
  /<div id="root"><!--prerender-->[\s\S]*<!--\/prerender--><\/div>/,
  '<div id="root"></div>',
);
const cms = await fetchCms();
const s = sections(cms);
const list = pages(s);

for (const p of list) {
  const file =
    p.path === '/' ? join(OUT, 'index.html') : join(OUT, p.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(template, p));
}
writeFileSync(join(OUT, 'sitemap.xml'), sitemap(list));
writeFileSync(join(OUT, 'llms.txt'), llmsTxt(s));

console.log(
  `prerender: wrote ${list.length} pages, sitemap.xml and llms.txt` +
    (cms ? ' (with CMS content)' : ' (static profile info only)'),
);
