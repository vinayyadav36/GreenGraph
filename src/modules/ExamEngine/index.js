import { Card } from '../../components/Card.js';
import { Button } from '../../components/Button.js';

function node(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (typeof text === 'string') n.textContent = text;
  return n;
}

async function getAttemptSummary() {
  const data = await fetch('/api/data/exam_results').then((r) => r.json());
  const attempts = data.attempts || [];
  if (!attempts.length) return { attempts: 0, avgScore: 0 };
  const total = attempts.reduce((sum, a) => sum + (a.score || 0), 0);
  return { attempts: attempts.length, avgScore: Math.round(total / attempts.length) };
}

export async function ExamHome() {
  const container = node('div');
  container.appendChild(node('h2', '', 'Exam Engine'));

  const questionsData = await fetch('/api/data/exam_questions').then((r) => r.json());
  const stats = await getAttemptSummary();

  const examSelect = document.createElement('select');
  examSelect.innerHTML = '<option value="NEET">NEET</option><option value="JEE">JEE</option>';

  const topicSelect = document.createElement('select');

  const controls = node('div', 'row');
  controls.appendChild(examSelect);
  controls.appendChild(topicSelect);

  const openBtn = Button({
    label: 'Start Topic Practice',
    onClick: () => {
      if (!topicSelect.value) return;
      window.location.hash = `#/exam/practice/${topicSelect.value}?exam=${examSelect.value}`;
    },
  });

  const statsCard = Card({
    title: 'Practice Stats',
    body: `Attempts: ${stats.attempts}, Average Score: ${stats.avgScore}%`,
  });

  const renderTopics = () => {
    topicSelect.innerHTML = '';
    const topics = questionsData.topics.filter((t) => t.exam === examSelect.value);
    for (const t of topics) {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.subject}: ${t.name}`;
      topicSelect.appendChild(opt);
    }
  };

  examSelect.addEventListener('change', renderTopics);
  renderTopics();

  container.appendChild(controls);
  container.appendChild(openBtn);
  container.appendChild(statsCard);

  return container;
}

export async function TopicPracticePage({ topicId, exam }) {
  const container = node('div');
  container.appendChild(node('h2', '', `Topic Practice: ${topicId}`));

  const questionsData = await fetch('/api/data/exam_questions').then((r) => r.json());
  const allResults = await fetch('/api/data/exam_results').then((r) => r.json());
  const scoped = questionsData.questions.filter((q) => q.topic_id === topicId && q.exam === exam);

  if (!scoped.length) {
    container.appendChild(node('p', '', 'No questions available for this topic.'));
    return container;
  }

  const q = scoped[0];
  const qWrap = node('section', 'question-box');
  qWrap.appendChild(node('p', '', q.prompt));

  if (q.question_type === 'mcq') {
    const options = node('ul');
    q.options.forEach((o, i) => options.appendChild(node('li', '', `${i}: ${o}`)));
    qWrap.appendChild(options);
  }

  const input = document.createElement('input');
  input.placeholder = q.question_type === 'mcq' ? 'Enter option index (0-based)' : 'Enter numeric answer';

  const feedback = node('p', 'muted', 'Answer one question at a time.');
  const solution = node('div', 'solution');

  const submitBtn = Button({
    label: 'Submit Answer',
    onClick: async () => {
      const value = input.value.trim();
      const isCorrect = q.question_type === 'mcq'
        ? Number(value) === q.correct_option_index
        : String(value).toLowerCase() === String(q.correct_answer_value).toLowerCase();

      feedback.textContent = isCorrect ? 'Correct.' : 'Incorrect.';
      solution.innerHTML = '';
      q.solution_steps.sort((a, b) => a.step_index - b.step_index).forEach((s) => {
        solution.appendChild(node('p', '', `${s.step_index}. ${s.text} (Hint: ${s.hint})`));
      });

      const started = new Date().toISOString();
      const completed = new Date().toISOString();
      const score = isCorrect ? q.marks : -Math.abs(q.negative_marks || 0);
      allResults.attempts.push({
        id: `attempt_${Date.now()}`,
        user_id: 'user_1',
        exam,
        topic_id: topicId,
        mode: 'topic_practice',
        started_at: started,
        completed_at: completed,
        score,
        total_marks: q.marks,
        details: [
          {
            question_id: q.id,
            user_answer: value,
            is_correct: isCorrect,
            time_spent_seconds: 30,
          },
        ],
      });

      await fetch('/api/data/exam_results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allResults),
      });
    },
  });

  qWrap.appendChild(input);
  qWrap.appendChild(submitBtn);
  qWrap.appendChild(feedback);
  qWrap.appendChild(solution);
  container.appendChild(qWrap);

  return container;
}
