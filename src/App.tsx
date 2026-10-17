import { useEffect } from 'react';
import { useHashPath, navigate } from './lib/router';
import { useProgress } from './state/progress';
import { settings, type DistrictId } from './config/settings';
import { DISTRICTS } from './content/districts';
import { Welcome } from './screens/Welcome';
import { CityScreen } from './screens/CityScreen';
import { DistrictScreen } from './screens/DistrictScreen';
import { Passport } from './screens/Passport';
import { FinalMission } from './screens/FinalMission';
import { Tour } from './screens/Tour';

function Header({ path }: { path: string }) {
  const { progress, toggleSound } = useProgress();
  const items = [
    { to: '/city', label: 'الخريطة', icon: '🗺️', tone: 'sky' },
    { to: '/passport', label: 'الجواز', icon: '📘', tone: 'grape' },
    { to: '/tour', label: 'جولة في مدينتي', short: 'الجولة', icon: '🎤', tone: 'coral' },
  ];
  return (
    <header className="app-header">
      <a href="#/city" className="brand" aria-label="مدينة الرياضيات — العودة إلى الخريطة">
        <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true" className="brand-logo">
          <rect x="2" y="2" width="60" height="60" rx="16" fill="#3EC5F2" stroke="#2A2B5F" strokeWidth="3" />
          <circle cx="48" cy="17" r="7" fill="#FFE27A" />
          <rect x="9" y="27" width="16" height="28" rx="3" fill="#FFC53D" stroke="#2A2B5F" strokeWidth="2.5" />
          <rect x="27" y="15" width="14" height="40" rx="3" fill="#FF6B5B" stroke="#2A2B5F" strokeWidth="2.5" />
          <rect x="43" y="31" width="12" height="24" rx="3" fill="#34D6A6" stroke="#2A2B5F" strokeWidth="2.5" />
          <rect x="31" y="21" width="6" height="6" rx="1" fill="#FFF3A6" />
          <rect x="31" y="33" width="6" height="6" rx="1" fill="#FFF3A6" />
        </svg>
        <span className="brand-text">مدينة الرياضيات</span>
      </a>
      <nav aria-label="التنقل الرئيسي" className="nav">
        {items.map((it) => (
          <a
            key={it.to}
            href={`#${it.to}`}
            className={`nav-btn tone-${it.tone} ${path.startsWith(it.to) ? 'is-current' : ''}`}
            aria-current={path.startsWith(it.to) ? 'page' : undefined}
          >
            <span aria-hidden="true">{it.icon}</span>
            <span className="nav-label">{it.short ? <><span className="lg-only">{it.label}</span><span className="sm-only">{it.short}</span></> : it.label}</span>
          </a>
        ))}
        <button
          type="button"
          className="nav-btn tone-sun sound-btn"
          onClick={toggleSound}
          aria-pressed={!progress.sound}
          aria-label={progress.sound ? 'كتم الصوت' : 'تشغيل الصوت'}
          title={progress.sound ? 'كتم الصوت' : 'تشغيل الصوت'}
        >
          <span aria-hidden="true">{progress.sound ? '🔊' : '🔇'}</span>
          <span className="nav-label">{progress.sound ? 'الصوت' : 'مكتوم'}</span>
        </button>
      </nav>
    </header>
  );
}

export default function App() {
  const path = useHashPath();
  const [base, query = ''] = path.split('?');
  const parts = base.split('/').filter(Boolean);

  useEffect(() => {
    const id = parts[0] === 'd' ? (parts[1] as DistrictId) : null;
    document.title = id && DISTRICTS[id] ? `${DISTRICTS[id].name} — مدينة الرياضيات` : 'مدينة الرياضيات — ابني مدينتك بذكائك';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  let screen;
  if (parts.length === 0) screen = <Welcome />;
  else if (parts[0] === 'city') screen = <CityScreen />;
  else if (parts[0] === 'd' && parts[1] && parts[1] in DISTRICTS && settings[parts[1] as DistrictId].enabled)
    screen = <DistrictScreen key={path} id={parts[1] as DistrictId} practice={new URLSearchParams(query).get('practice')} />;
  else if (parts[0] === 'passport') screen = <Passport />;
  else if (parts[0] === 'final') screen = <FinalMission key={path} />;
  else if (parts[0] === 'tour') screen = <Tour />;
  else {
    screen = (
      <main className="page narrow">
        <h1>هذه الصفحة غير موجودة</h1>
        <button className="btn btn-primary" onClick={() => navigate('/city')}>
          العودة إلى الخريطة
        </button>
      </main>
    );
  }

  const bare = parts.length === 0 || parts[0] === 'tour';
  return (
    <div className={`app ${bare ? 'is-bare' : ''}`}>
      {!bare && <Header path={base} />}
      {screen}
    </div>
  );
}
