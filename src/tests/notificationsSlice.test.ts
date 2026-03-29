import notificationsReducer, {
  setNotifications,
  markRead,
  markAllRead,
  removeNotification,
  addNotification,
  type AppNotification,
} from '../store/notificationsSlice';

const makeNotif = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  examId: 'upsc-cse',
  examName: 'UPSC CSE',
  title: 'Test Notification',
  message: 'Test message',
  type: 'info',
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('notificationsSlice', () => {
  const initialState = { items: [], unreadCount: 0, loading: false };

  it('returns initial state', () => {
    expect(notificationsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('sets notifications and updates unreadCount', () => {
    const notifs = [makeNotif({ id: 'n1', read: false }), makeNotif({ id: 'n2', read: true })];
    const state = notificationsReducer(initialState, setNotifications(notifs));
    expect(state.items).toHaveLength(2);
    expect(state.unreadCount).toBe(1);
  });

  it('marks a single notification as read', () => {
    const start = notificationsReducer(
      initialState,
      setNotifications([makeNotif({ id: 'n1', read: false }), makeNotif({ id: 'n2', read: false })]),
    );
    const state = notificationsReducer(start, markRead('n1'));
    expect(state.items.find((n) => n.id === 'n1')?.read).toBe(true);
    expect(state.unreadCount).toBe(1);
  });

  it('marks all notifications as read', () => {
    const start = notificationsReducer(
      initialState,
      setNotifications([makeNotif({ id: 'n1', read: false }), makeNotif({ id: 'n2', read: false })]),
    );
    const state = notificationsReducer(start, markAllRead());
    expect(state.items.every((n) => n.read)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('removes a notification', () => {
    const start = notificationsReducer(
      initialState,
      setNotifications([makeNotif({ id: 'n1', read: false }), makeNotif({ id: 'n2', read: true })]),
    );
    const state = notificationsReducer(start, removeNotification('n1'));
    expect(state.items).toHaveLength(1);
    expect(state.unreadCount).toBe(0);
  });

  it('adds a new unread notification', () => {
    const state = notificationsReducer(initialState, addNotification(makeNotif({ read: false })));
    expect(state.items).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });

  it('adding a read notification does not increase unreadCount', () => {
    const state = notificationsReducer(initialState, addNotification(makeNotif({ read: true })));
    expect(state.unreadCount).toBe(0);
  });
});
