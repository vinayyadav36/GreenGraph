import { Card } from '../../components/Card.js';

export async function ProjectHome() {
  const root = document.createElement('div');
  const title = document.createElement('h2');
  title.textContent = 'Project Studio (Stub)';
  root.appendChild(title);

  const data = await fetch('/api/data/projects').then((r) => r.json());
  for (const project of data.projects) {
    root.appendChild(
      Card({
        title: project.title,
        subtitle: `${project.subject} • Grade ${project.grade_band}`,
        body: `Difficulty: ${project.difficulty} | Time: ${project.estimated_time_minutes} min`,
      }),
    );
  }

  return root;
}
