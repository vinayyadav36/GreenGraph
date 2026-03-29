import subscriptionsReducer, {
  setSubscriptions,
  addSubscription,
  removeSubscription,
  type ExamSubscription,
} from '../store/subscriptionsSlice';

const makeSub = (id: string, examId: string): ExamSubscription => ({
  id,
  examId,
  createdAt: new Date().toISOString(),
  exam: {
    id: examId,
    name: 'UPSC CSE',
    fullName: 'Union Public Service Commission Civil Services Examination',
    category: 'Central Government',
    icon: '🏛️',
    color: 'from-blue-500 to-indigo-600',
    examDate: 'Jun 2025',
    difficulty: 'hard',
  },
});

describe('subscriptionsSlice', () => {
  const initialState = { items: [], subscribedExamIds: [], loading: false };

  it('returns initial state', () => {
    expect(subscriptionsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets subscriptions and extracts exam IDs', () => {
    const subs = [makeSub('s1', 'upsc-cse'), makeSub('s2', 'ssc-cgl')];
    const state = subscriptionsReducer(initialState, setSubscriptions(subs));
    expect(state.items).toHaveLength(2);
    expect(state.subscribedExamIds).toContain('upsc-cse');
    expect(state.subscribedExamIds).toContain('ssc-cgl');
  });

  it('adds a subscription', () => {
    const state = subscriptionsReducer(initialState, addSubscription(makeSub('s1', 'upsc-cse')));
    expect(state.items).toHaveLength(1);
    expect(state.subscribedExamIds).toContain('upsc-cse');
  });

  it('does not duplicate exam ID when adding existing subscription', () => {
    const start = subscriptionsReducer(initialState, addSubscription(makeSub('s1', 'upsc-cse')));
    const state = subscriptionsReducer(start, addSubscription(makeSub('s2', 'upsc-cse')));
    const count = state.subscribedExamIds.filter((id) => id === 'upsc-cse').length;
    expect(count).toBe(1);
  });

  it('removes a subscription by examId', () => {
    const start = subscriptionsReducer(
      initialState,
      setSubscriptions([makeSub('s1', 'upsc-cse'), makeSub('s2', 'ssc-cgl')]),
    );
    const state = subscriptionsReducer(start, removeSubscription('upsc-cse'));
    expect(state.items).toHaveLength(1);
    expect(state.subscribedExamIds).not.toContain('upsc-cse');
    expect(state.subscribedExamIds).toContain('ssc-cgl');
  });
});
