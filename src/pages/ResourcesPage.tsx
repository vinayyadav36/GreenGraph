import { useState } from 'react';
import { resourceLinks } from '../lib/mockData';
import { type ResourceLink } from '../types';

const ALL_CATEGORIES = 'All';

function ResourceCard({ resource }: { resource: ResourceLink }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 duration-200 flex flex-col group">
      {/* Gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${resource.color}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center text-2xl shrink-0 shadow-sm`}>
            {resource.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{resource.name}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${resource.badge === 'Free' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {resource.badge}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{resource.category}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{resource.description}</p>

        {/* Features */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Features</p>
          <ul className="space-y-1.5">
            {resource.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center py-2.5 px-4 bg-gradient-to-r ${resource.color} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm`}
        >
          Visit {resource.name} →
        </a>
      </div>
    </div>
  );
}

export function ResourcesPage() {
  const categories = [ALL_CATEGORIES, ...Array.from(new Set(resourceLinks.map((r) => r.category)))];
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState('');

  const filtered = resourceLinks.filter((r) => {
    const matchesCat = activeCategory === ALL_CATEGORIES || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.features.some((f) => f.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <main id="main-content" className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-5">
              <span className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse" />
              {resourceLinks.length} Curated Resources
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Study Resources Hub
            </h1>
            <p className="text-cyan-100 text-lg leading-relaxed">
              Handpicked resources from India's best exam preparation platforms — GKToday, Oliveboard, PracticeMock, Testbook, and more. Everything you need to crack any competitive exam.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-xl shrink-0">ℹ️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">External Resources</p>
            <p className="text-xs text-amber-700 mt-0.5">
              These links direct to external websites. We curate the best resources but have no affiliation with these platforms.
              Always verify information from official exam notification pages.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              aria-label="Search resources"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          {filtered.length} resource{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 text-sm">Try a different search term or category</p>
          </div>
        )}

        {/* Tip Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { icon: '📅', title: 'Daily Current Affairs', desc: 'Read GKToday daily to stay updated with current events. Even 15 minutes a day makes a huge difference.', color: 'bg-blue-50 border-blue-100' },
            { icon: '📊', title: 'Take Mock Tests', desc: 'Attempt at least 2–3 full-length mock tests per week on Oliveboard or PracticeMock. Analyze your mistakes thoroughly.', color: 'bg-green-50 border-green-100' },
            { icon: '🔄', title: 'Revise Regularly', desc: 'Use spaced repetition to revise topics. Short 10-minute revision sessions are more effective than marathon study sessions.', color: 'bg-purple-50 border-purple-100' },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className={`rounded-2xl border p-5 ${color}`}>
              <div className="text-2xl mb-3">{icon}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ResourcesPage;
