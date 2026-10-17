import { useId } from 'react';
import { useProgress } from '../state/progress';

const FIELDS = [
  { key: 'studentName', label: 'إعداد الطالبة', auto: 'name' },
  { key: 'grade', label: 'الصف', auto: 'off', placeholder: 'مثل: الرابع الابتدائي' },
  { key: 'school', label: 'المدرسة', auto: 'organization' },
  { key: 'teacher', label: 'المعلمة', auto: 'off' },
] as const;

/** حقول قابلة للتعديل لبيانات المشروع (تُحفظ في هذا الجهاز فقط) */
export function ProjectInfoForm({ compact = false }: { compact?: boolean }) {
  const { progress, setInfo } = useProgress();
  const base = useId();
  return (
    <div className={`info-form ${compact ? 'is-compact' : ''}`}>
      {FIELDS.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={`${base}-${f.key}`}>{f.label}</label>
          <input
            id={`${base}-${f.key}`}
            type="text"
            autoComplete={f.auto}
            maxLength={60}
            value={progress.info[f.key]}
            placeholder={'placeholder' in f ? f.placeholder : 'اتركيه فارغًا أو اكتبي هنا'}
            onChange={(e) => setInfo({ [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
