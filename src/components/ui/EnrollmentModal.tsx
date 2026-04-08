import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onConfirm: (email: string) => Promise<void>;
}

export function EnrollmentModal({ isOpen, onClose, courseId: _courseId, courseTitle, onConfirm }: EnrollmentModalProps) {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await onConfirm(email);
      onClose();
    } catch {
      setError('Enrollment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('enrollment.modalTitle')}>
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">You are enrolling in: <strong>{courseTitle}</strong></p>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('enrollment.emailPlaceholder')}
          error={error}
        />
        <p className="text-xs text-gray-400">Your student ID will be sent to this email. This will also add you to our learning newsletter.</p>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            {t('enrollment.cancel')}
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={handleConfirm} isLoading={isLoading}>
            {t('enrollment.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default EnrollmentModal;
