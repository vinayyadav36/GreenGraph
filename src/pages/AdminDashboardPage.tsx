import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';
import { mockCourses, mockExamResults, resourceLinks as initialResources } from '../lib/mockData';
import { type ResourceLink } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

type AdminTab = 'overview' | 'resources' | 'courses' | 'questions';

function StatCard({ label, value, icon, change }: { label: string; value: string | number; icon: string; change?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

const EMPTY_RESOURCE: Omit<ResourceLink, 'id'> = {
  name: '',
  description: '',
  url: '',
  icon: '🔗',
  category: 'Study Material',
  features: [''],
  color: 'from-blue-500 to-indigo-600',
  badge: 'Free',
};

const GRADIENT_OPTIONS = [
  'from-blue-500 to-indigo-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-500',
  'from-purple-500 to-pink-600',
  'from-yellow-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-red-500 to-rose-600',
  'from-teal-500 to-cyan-700',
  'from-slate-600 to-slate-800',
  'from-amber-500 to-yellow-600',
];

function ResourceManagerTab() {
  const [resources, setResources] = useState<ResourceLink[]>(initialResources);
  const [form, setForm] = useState<Omit<ResourceLink, 'id'>>(EMPTY_RESOURCE);
  const [features, setFeatures] = useState<string[]>(['']);
  const [editId, setEditId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const filtered = resources.filter(
    (r) =>
      !searchQ ||
      r.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQ.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filledFeatures = features.filter((f) => f.trim());
    if (!form.name || !form.url || !form.description) return;
    if (editId) {
      setResources((prev) =>
        prev.map((r) => (r.id === editId ? { ...form, features: filledFeatures, id: editId } : r)),
      );
      setSuccess('Resource updated successfully!');
      setEditId(null);
    } else {
      const newResource: ResourceLink = {
        ...form,
        features: filledFeatures,
        id: `res-${Date.now()}`,
      };
      setResources((prev) => [...prev, newResource]);
      setSuccess('Resource added successfully!');
    }
    setForm(EMPTY_RESOURCE);
    setFeatures(['']);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (r: ResourceLink) => {
    setEditId(r.id);
    setForm({ name: r.name, description: r.description, url: r.url, icon: r.icon, category: r.category, color: r.color, badge: r.badge, features: r.features });
    setFeatures(r.features.length ? r.features : ['']);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this resource?')) {
      setResources((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const addFeatureRow = () => setFeatures((prev) => [...prev, '']);
  const updateFeature = (idx: number, val: string) =>
    setFeatures((prev) => prev.map((f, i) => (i === idx ? val : f)));
  const removeFeature = (idx: number) =>
    setFeatures((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      {/* Add / Edit Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🔗</span>
          {editId ? 'Edit Resource' : 'Add New Resource'}
        </h2>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Resource Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="e.g. Testbook"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">URL *</label>
              <input
                required
                type="url"
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description *</label>
            <textarea
              required
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              placeholder="Short description of the resource..."
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Icon (Emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="📚"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {['Study Material', 'Mock Tests & PYQs', 'Current Affairs & GK', 'Live Classes', 'UPSC & Civil Services', 'JEE & NEET Prep', 'Reference'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option>Free</option>
                <option>Free & Paid</option>
                <option>Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Gradient Color</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, color: g }))}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-r ${g} ring-2 transition-all ${form.color === g ? 'ring-blue-500 scale-110' : 'ring-transparent'}`}
                  title={g}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Key Features</label>
            <div className="space-y-2">
              {features.map((f, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder={`Feature ${idx + 1}`}
                  />
                  {features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600 px-2">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addFeatureRow} className="text-xs text-blue-600 hover:underline">+ Add feature</button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary">
              {editId ? '💾 Update Resource' : '+ Add Resource'}
            </Button>
            {editId && (
              <Button type="button" variant="ghost" onClick={() => { setEditId(null); setForm(EMPTY_RESOURCE); setFeatures(['']); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Resources List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">All Resources ({resources.length})</h2>
          <input
            type="search"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search resources..."
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center text-lg shrink-0`}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${r.badge === 'Free' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{r.badge}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{r.category} • {r.url}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(r)} className="text-xs text-blue-600 hover:underline px-2 py-1 bg-blue-50 rounded-lg">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="text-xs text-red-600 hover:underline px-2 py-1 bg-red-50 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No resources found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const progress = useSelector((state: RootState) => state.progress);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminStats, setAdminStats] = useState<{ users: number; enrollments: number; results: number; questions: number } | null>(null);

  const totalStagesCompleted = Object.values(progress.courseProgress).flat().filter((s) => s.completed).length;

  useEffect(() => {
    api.get<{ users: number; enrollments: number; results: number; questions: number }>('/admin/stats')
      .then((res) => setAdminStats(res.data))
      .catch(() => { /* ignore */ });
  }, []);

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'resources', label: 'Resource Manager', icon: '🔗' },
    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'questions', label: 'Questions', icon: '❓' },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and monitor the Forever University platform</p>
            </div>
            <Badge variant="primary">{user?.role}</Badge>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-100 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={adminStats?.users ?? '—'} icon="👥" />
              <StatCard label="Enrollments" value={adminStats?.enrollments ?? '—'} icon="📚" />
              <StatCard label="Exams Completed" value={adminStats?.results ?? mockExamResults.length} icon="📝" />
              <StatCard label="Questions" value={adminStats?.questions ?? '—'} icon="❓" />
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Recent Exam Results</h2>
                <div className="space-y-3">
                  {mockExamResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{result.examId}</p>
                        <p className="text-xs text-gray-400">User ID: {result.userId}</p>
                        <p className="text-xs text-gray-400">{new Date(result.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'error'}>
                          {result.score}%
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">{Math.round(result.timeTakenSeconds / 60)}m taken</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-4">Course Overview</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {mockCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                        <p className="text-xs text-gray-400">{course.stages.length} stages • {course.subject}</p>
                      </div>
                      <Badge variant={course.difficultyTag === 'easy' ? 'success' : course.difficultyTag === 'medium' ? 'warning' : 'error'}>
                        {course.difficultyTag}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => setActiveTab('resources')}>
                  + Add Resource
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('courses')}>
                  Manage Courses
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('questions')}>
                  + Add Questions
                </Button>
                <Button variant="ghost" onClick={() => {
                    window.open('/api/export/users', '_blank');
                  }}>
                  Export Users (Excel)
                </Button>
                <Button variant="ghost" onClick={() => {
                    window.open('/api/export/results', '_blank');
                  }}>
                  Export Results (Excel)
                </Button>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Platform Health</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'API Uptime', value: '99.9%', status: 'success' },
                  { label: 'Avg. Response', value: '120ms', status: 'success' },
                  { label: 'Error Rate', value: '0.01%', status: 'success' },
                ].map(({ label, value, status }) => (
                  <div key={label} className="bg-white rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    <Badge variant={status as 'success'}>{status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'resources' && <ResourceManagerTab />}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Course Management</h2>
            <p className="text-sm text-gray-500 mb-4">Showing {mockCourses.length} courses. Full course editor coming soon.</p>
            <div className="space-y-3">
              {mockCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {course.subject} • {course.stages.length} stages • {course.language.toUpperCase()} •{' '}
                      {course.stages.filter((s) => !s.locked).length} unlocked
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={course.difficultyTag === 'easy' ? 'success' : course.difficultyTag === 'medium' ? 'warning' : 'error'}>
                      {course.difficultyTag}
                    </Badge>
                    <button className="text-xs text-blue-600 px-2 py-1 bg-blue-50 rounded-lg hover:bg-blue-100">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Question Bank Management</h2>
            <p className="text-sm text-gray-500 mb-6">Full question editor with bulk upload coming soon. Use the form below to preview the structure.</p>
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-600 overflow-x-auto">
              <pre>{`{
  "id": "q-new-1",
  "text": "Your question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": "Option A",
  "type": "single",
  "difficulty": "medium",
  "tags": ["exam-name", "topic"],
  "explanation": "Explain why the answer is correct.",
  "trick": "Optional memory tip for the student."
}`}</pre>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={() => alert('Bulk upload (CSV/JSON) coming soon!')}>
                📤 Bulk Upload CSV/JSON
              </Button>
              <Button variant="ghost" onClick={() => alert('Question editor form coming soon!')}>
                + Add Single Question
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminDashboardPage;
