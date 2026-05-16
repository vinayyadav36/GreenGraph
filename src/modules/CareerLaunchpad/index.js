import { Button } from '../../components/Button.js';

function n(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (typeof text === 'string') e.textContent = text;
  return e;
}

export async function CareerHome() {
  const root = n('div');
  root.appendChild(n('h2', '', 'Career Launchpad'));
  root.appendChild(n('p', '', 'Build an ATS-friendly resume from templates.'));

  const btn = Button({
    label: 'Open Resume Builder',
    onClick: () => {
      window.location.hash = '#/career/resume';
    },
  });
  root.appendChild(btn);
  return root;
}

function findKeywordMatches(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.filter((k) => lower.includes(k.toLowerCase()));
}

export async function ResumeBuilderPage() {
  const root = n('div');
  root.appendChild(n('h2', '', 'Resume Builder'));

  const [templateData, jobsData, usersData] = await Promise.all([
    fetch('/api/data/resume_templates').then((r) => r.json()),
    fetch('/api/data/job_descriptions').then((r) => r.json()),
    fetch('/api/data/users').then((r) => r.json()),
  ]);

  const templateSelect = document.createElement('select');
  templateData.templates.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    templateSelect.appendChild(opt);
  });

  const jobSelect = document.createElement('select');
  jobsData.jobs.forEach((j) => {
    const opt = document.createElement('option');
    opt.value = j.id;
    opt.textContent = `${j.title} - ${j.company}`;
    jobSelect.appendChild(opt);
  });

  const controls = n('div', 'row');
  controls.appendChild(templateSelect);
  controls.appendChild(jobSelect);
  root.appendChild(controls);

  const form = n('form', 'resume-form');
  const keywordMatch = n('p', 'muted', 'Keyword match: select JD and start filling.');
  root.appendChild(form);
  root.appendChild(keywordMatch);

  const renderFields = () => {
    form.innerHTML = '';
    const template = templateData.templates.find((t) => t.id === templateSelect.value);
    if (!template) return;

    for (const section of template.sections) {
      form.appendChild(n('h3', '', section.title));
      for (const field of section.fields) {
        const label = n('label', '', `${field.label} (${field.hint})`);
        const input = document.createElement('input');
        input.name = `${section.type}__${field.field_key}`;
        label.appendChild(input);
        form.appendChild(label);
      }
    }

    const saveBtn = Button({ label: 'Save Resume', variant: 'primary' });
    saveBtn.type = 'submit';
    form.appendChild(saveBtn);
  };

  const updateKeywords = () => {
    const job = jobsData.jobs.find((j) => j.id === jobSelect.value);
    if (!job) return;

    const values = Array.from(form.querySelectorAll('input')).map((i) => i.value || '').join(' ');
    const matches = findKeywordMatches(values + ' ' + job.description, job.keywords);
    keywordMatch.textContent = `Keyword match (${matches.length}/${job.keywords.length}): ${matches.join(', ') || 'none yet'}`;
  };

  templateSelect.addEventListener('change', () => {
    renderFields();
    updateKeywords();
  });

  jobSelect.addEventListener('change', updateKeywords);
  form.addEventListener('input', updateKeywords);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const template = templateData.templates.find((t) => t.id === templateSelect.value);
    const job = jobsData.jobs.find((j) => j.id === jobSelect.value);
    const formData = Object.fromEntries(new FormData(form).entries());

    const resume = {
      id: `resume_${Date.now()}`,
      template_id: template?.id,
      template_name: template?.name,
      target_job_id: job?.id,
      values: formData,
      saved_at: new Date().toISOString(),
    };

    const user = usersData.users.find((u) => u.id === 'user_1') || usersData.users[0];
    if (!user.resumes) user.resumes = [];
    user.resumes.push(resume);

    await fetch('/api/data/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usersData),
    });

    keywordMatch.textContent = 'Resume saved locally to users.json.';
  });

  renderFields();
  updateKeywords();

  return root;
}
