import { Card } from '../../components/Card.js';
import { Button } from '../../components/Button.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === 'string') node.textContent = text;
  return node;
}

export async function FundamentalsHome() {
  const container = el('div');
  const heading = el('h2', '', 'Fundamentals Lab');
  container.appendChild(heading);

  const [conceptsData] = await Promise.all([
    fetch('/api/data/fundamentals_concepts').then((r) => r.json()),
  ]);

  const controls = el('div', 'row');
  const subjectFilter = document.createElement('select');
  const gradeFilter = document.createElement('select');

  subjectFilter.innerHTML = '<option value="">All subjects</option><option value="math">Math</option><option value="science">Science</option><option value="other">Other</option>';
  gradeFilter.innerHTML = '<option value="">All grades</option><option value="5-6">5-6</option><option value="7-8">7-8</option><option value="9-10">9-10</option>';

  controls.appendChild(subjectFilter);
  controls.appendChild(gradeFilter);
  container.appendChild(controls);

  const list = el('div', 'card-grid');
  container.appendChild(list);

  const renderList = () => {
    list.innerHTML = '';
    const filtered = conceptsData.concepts.filter((c) => {
      const subjectOk = !subjectFilter.value || c.subject === subjectFilter.value;
      const gradeOk = !gradeFilter.value || c.grade_band === gradeFilter.value;
      return subjectOk && gradeOk;
    });

    for (const concept of filtered) {
      const openBtn = Button({
        label: 'Open Concept',
        onClick: () => {
          window.location.hash = `#/fundamentals/concept/${concept.id}`;
        },
      });

      list.appendChild(
        Card({
          title: concept.title,
          subtitle: `${concept.subject} • Grade ${concept.grade_band}`,
          body: concept.short_description,
          footer: openBtn,
        }),
      );
    }
  };

  subjectFilter.addEventListener('change', renderList);
  gradeFilter.addEventListener('change', renderList);
  renderList();

  return container;
}

export async function ConceptDetailPage({ id }) {
  const container = el('div');
  const [conceptsData, questionsData] = await Promise.all([
    fetch('/api/data/fundamentals_concepts').then((r) => r.json()),
    fetch('/api/data/fundamentals_questions').then((r) => r.json()),
  ]);

  const concept = conceptsData.concepts.find((c) => c.id === id);
  if (!concept) {
    container.appendChild(el('p', '', 'Concept not found.'));
    return container;
  }

  container.appendChild(el('h2', '', concept.title));
  container.appendChild(el('p', 'muted', `Subject: ${concept.subject} | Grade: ${concept.grade_band}`));
  container.appendChild(el('p', '', concept.short_description));

  const stepTitle = el('h3', '', 'Stepwise explanation');
  container.appendChild(stepTitle);

  for (const step of concept.steps.sort((a, b) => a.step_index - b.step_index)) {
    const stepCard = el('section', 'step-card');
    stepCard.appendChild(el('h4', '', `Step ${step.step_index}: ${step.title}`));
    stepCard.appendChild(el('p', '', step.content_text));
    if (step.prompt_to_student) stepCard.appendChild(el('p', 'prompt', `Try: ${step.prompt_to_student}`));
    container.appendChild(stepCard);
  }

  const conceptQs = questionsData.questions.filter((q) => q.concept_id === concept.id);
  container.appendChild(el('h3', '', 'Practice Questions'));

  for (const q of conceptQs) {
    const qBox = el('section', 'question-box');
    qBox.appendChild(el('p', '', q.prompt));

    let attempted = false;

    const answerInput = document.createElement('input');
    answerInput.placeholder = q.question_type === 'mcq' ? 'Enter option index (0-based)' : 'Enter your answer';

    const attemptBtn = Button({
      label: 'Submit Attempt',
      onClick: () => {
        attempted = true;
        const val = answerInput.value.trim();
        const isCorrect = q.question_type === 'mcq'
          ? Number(val) === q.correct_option_index
          : String(val).toLowerCase() === String(q.correct_answer_value).toLowerCase();
        result.textContent = isCorrect ? 'Correct attempt.' : 'Attempt recorded. Re-check your steps.';
        showSolutionBtn.disabled = false;
      },
    });

    const showSolutionBtn = Button({
      label: 'Show Solution',
      variant: 'secondary',
      disabled: true,
      onClick: () => {
        if (!attempted) return;
        solution.innerHTML = '';
        for (const step of q.explanation_steps.sort((a, b) => a.step_index - b.step_index)) {
          const item = el('p', '', `${step.step_index}. ${step.text} (Hint: ${step.hint})`);
          solution.appendChild(item);
        }
      },
    });

    const result = el('p', 'muted', 'Attempt before unlocking solution.');
    const solution = el('div', 'solution');

    if (q.question_type === 'mcq' && Array.isArray(q.options)) {
      const options = el('ul');
      q.options.forEach((opt, index) => options.appendChild(el('li', '', `${index}: ${opt}`)));
      qBox.appendChild(options);
    }

    qBox.appendChild(answerInput);
    qBox.appendChild(attemptBtn);
    qBox.appendChild(showSolutionBtn);
    qBox.appendChild(result);
    qBox.appendChild(solution);
    container.appendChild(qBox);
  }

  return container;
}
