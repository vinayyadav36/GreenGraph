import { Layout } from './components/Layout.js';
import { FundamentalsHome, ConceptDetailPage } from './modules/FundamentalsLab/index.js';
import { ExamHome, TopicPracticePage } from './modules/ExamEngine/index.js';
import { CareerHome, ResumeBuilderPage } from './modules/CareerLaunchpad/index.js';
import { ProjectHome } from './modules/ProjectStudio/index.js';

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/fundamentals';
  const [pathOnly, queryString] = raw.split('?');
  const query = new URLSearchParams(queryString || '');
  return { path: pathOnly, query };
}

function matchRoute(path) {
  if (path === '/' || path === '/fundamentals') return { key: 'fundamentalsHome' };
  if (path.startsWith('/fundamentals/concept/')) return { key: 'conceptDetail', id: path.split('/').pop() };
  if (path === '/exam') return { key: 'examHome' };
  if (path.startsWith('/exam/practice/')) return { key: 'topicPractice', topicId: path.split('/').pop() };
  if (path === '/career') return { key: 'careerHome' };
  if (path === '/career/resume') return { key: 'resumeBuilder' };
  if (path === '/projects') return { key: 'projectHome' };
  return { key: 'notFound' };
}

function moduleNameFromPath(path) {
  if (path.startsWith('/fundamentals')) return 'Fundamentals Lab';
  if (path.startsWith('/exam')) return 'Exam Engine';
  if (path.startsWith('/career')) return 'Career Launchpad';
  if (path.startsWith('/projects')) return 'Project Studio';
  return 'Home';
}

async function resolveView(routeMatch, query) {
  switch (routeMatch.key) {
    case 'fundamentalsHome':
      return FundamentalsHome();
    case 'conceptDetail':
      return ConceptDetailPage({ id: routeMatch.id });
    case 'examHome':
      return ExamHome();
    case 'topicPractice':
      return TopicPracticePage({ topicId: routeMatch.topicId, exam: query.get('exam') || 'NEET' });
    case 'careerHome':
      return CareerHome();
    case 'resumeBuilder':
      return ResumeBuilderPage();
    case 'projectHome':
      return ProjectHome();
    default: {
      const div = document.createElement('div');
      div.textContent = 'Page not found';
      return div;
    }
  }
}

export async function renderRoute(root) {
  const { path, query } = parseHash();
  const routeMatch = matchRoute(path);
  const content = await resolveView(routeMatch, query);
  root.innerHTML = '';
  root.appendChild(
    Layout({
      activePath: path,
      moduleName: moduleNameFromPath(path),
      content,
    }),
  );
}
