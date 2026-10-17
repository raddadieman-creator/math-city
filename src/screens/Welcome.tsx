import { useId, useState } from 'react';
import { navigate } from '../lib/router';
import { useProgress } from '../state/progress';
import { projectTagline, branding } from '../config/settings';
import { NohaFace, NohaRoles } from '../components/Noha';
import { sfx } from '../lib/sound';

const INK = '#2A2B5F';

/** مشهد المدينة في شاشة الترحيب */
function HeroScene() {
  return (
    <svg className="hero-scene" viewBox="0 0 800 300" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      {/* تلال */}
      <path d="M0 230 Q 160 170 320 220 T 640 210 T 800 220 V300 H0 Z" fill="#7BE3BF" />
      <path d="M0 260 Q 200 215 420 255 T 800 245 V300 H0 Z" fill="#34D6A6" />
      {/* المباني */}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <rect x="70" y="150" width="90" height="100" rx="8" fill="#FFC53D" />
        <path d="M60 154 L115 106 L170 154 Z" fill="#FF6B5B" />
        <rect x="180" y="96" width="76" height="154" rx="8" fill="#3EC5F2" />
        <rect x="276" y="168" width="110" height="82" rx="8" fill="#FFF7E6" />
        <path d="M266 170 L278 132 L384 132 L396 170 Z" fill="#FF7AB8" />
        <rect x="560" y="120" width="90" height="130" rx="8" fill="#8E7CFF" />
        <rect x="664" y="160" width="80" height="90" rx="8" fill="#FF9A4D" />
      </g>
      {/* نوافذ مضيئة */}
      <g fill="#FFF3A6" stroke={INK} strokeWidth="2">
        {[0, 1, 2, 3, 4].map((r) => (
          <g key={r}>
            <rect x="192" y={110 + r * 26} width="18" height="14" rx="3" className={`blink b${r % 3}`} />
            <rect x="226" y={110 + r * 26} width="18" height="14" rx="3" className={`blink b${(r + 1) % 3}`} />
          </g>
        ))}
        <rect x="88" y="176" width="22" height="20" rx="3" />
        <rect x="122" y="176" width="22" height="20" rx="3" className="blink b1" />
      </g>
      {/* لوحة أعمدة على مبنى الإحصاء */}
      <g stroke={INK} strokeWidth="2">
        <rect x="574" y="140" width="62" height="56" rx="6" fill="#fff" />
        <rect x="582" y="172" width="10" height="18" fill="#3EC5F2" />
        <rect x="598" y="160" width="10" height="30" fill="#FFC53D" />
        <rect x="614" y="150" width="10" height="40" fill="#FF6B5B" />
      </g>
      {/* أشجار */}
      {[430, 470, 510].map((x, i) => (
        <g key={x} stroke={INK} strokeWidth="2.5">
          <rect x={x - 4} y="214" width="8" height="26" fill="#B07A47" />
          <circle cx={x} cy={206 - (i % 2) * 8} r="22" fill={i % 2 ? '#2FBF7A' : '#4FD58F'} />
        </g>
      ))}
      {/* نافورة */}
      <g>
        <ellipse cx="470" cy="262" rx="40" ry="10" fill="#3EC5F2" stroke={INK} strokeWidth="2.5" />
        <path className="fountain-water" d="M470 258 Q 450 220 434 258 M470 258 Q 490 220 506 258 M470 258 L470 226" stroke="#3EC5F2" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      {/* القطار */}
      <g className="hero-train">
        <line x1="-20" y1="292" x2="820" y2="292" stroke={INK} strokeWidth="3" />
        <g transform="translate(0 258)" stroke={INK} strokeWidth="2.5">
          <rect x="0" y="0" width="54" height="30" rx="7" fill="#FF6B5B" />
          <rect x="6" y="-12" width="18" height="16" rx="3" fill="#FF6B5B" />
          <rect x="60" y="4" width="50" height="26" rx="6" fill="#FFC53D" />
          <rect x="116" y="4" width="50" height="26" rx="6" fill="#34D6A6" />
          {[14, 42, 74, 98, 130, 154].map((cx) => (
            <circle key={cx} cx={cx} cy="32" r="6" fill={INK} />
          ))}
        </g>
      </g>
    </svg>
  );
}

const FLOATERS = ['+', '٧', '×', '٣', '=', '٥', '−', '٩', '٢', '<'];

export function Welcome() {
  const { progress, setStarted, setPlayerName } = useProgress();
  const id = useId();
  const returning = progress.started;
  const name = progress.playerName.trim();
  const [askName] = useState(!name);
  return (
    <main className="welcome">
      <div className="sky-deco" aria-hidden="true">
        <span className="sun" />
        <span className="cloud c1" />
        <span className="cloud c2" />
        <span className="cloud c3" />
        <svg className="balloon-float" viewBox="0 0 60 90">
          <path d="M30 4 C 50 4 58 22 54 36 C 50 50 38 58 30 62 C 22 58 10 50 6 36 C 2 22 10 4 30 4 Z" fill="#FF7AB8" stroke={INK} strokeWidth="3" />
          <path d="M30 4 C 38 20 38 46 30 62 C 22 46 22 20 30 4" fill="#FFC53D" stroke={INK} strokeWidth="2" />
          <rect x="22" y="72" width="16" height="12" rx="3" fill="#B07A47" stroke={INK} strokeWidth="2.5" />
          <line x1="24" y1="62" x2="24" y2="72" stroke={INK} strokeWidth="2" />
          <line x1="36" y1="62" x2="36" y2="72" stroke={INK} strokeWidth="2" />
        </svg>
        {FLOATERS.map((f, i) => (
          <span key={i} className={`floater f${i}`}>
            {f}
          </span>
        ))}
      </div>

      <div className="welcome-inner">
        <h1 className="welcome-title">
          <span className="wt-kind">{branding.cityKind}</span>
          <span className="wt-main">{branding.cityName}</span>
          <span className="wt-sub">{branding.slogan}</span>
        </h1>

        <section className="credits" aria-label="بيانات المشروع">
          <div className="credit">
            <span className="credit-icon" aria-hidden="true">
              🧕
            </span>
            <span className="credit-role">إعداد الطالبة</span>
            <strong className="credit-name">{progress.info.studentName.trim() || '—'}</strong>
            {(progress.info.grade.trim() || progress.info.school.trim()) && (
              <span className="credit-sub">
                {progress.info.grade.trim() && `الصف ${progress.info.grade.trim()}`}
                {progress.info.grade.trim() && progress.info.school.trim() && '، '}
                {progress.info.school.trim()}
              </span>
            )}
          </div>
          <div className="credit">
            <span className="credit-icon" aria-hidden="true">
              👩‍🏫
            </span>
            <span className="credit-role">إشراف المعلمة</span>
            <strong className="credit-name">{progress.info.teacher.trim() || '—'}</strong>
          </div>
        </section>

        <div className="welcome-card">
          <div className="welcome-noha">
            <NohaFace mood="cheer" size={120} />
            <div>
              <p className="wn-hello">
                {returning ? (
                  <>أهلًا بعودتكِ{name ? ` يا ${name.split(' ')[0]}` : ''}! مدينتكِ تنتظركِ.</>
                ) : (
                  <>
                    أهلًا بكِ{name ? ` يا ${name.split(' ')[0]}` : ''}! أنا <strong>نُهى</strong>، مرشدتكِ في {branding.cityName}.
                  </>
                )}
              </p>
              <p className="wn-sub">سأرافقكِ في كل حي:</p>
            </div>
          </div>
          <NohaRoles />
          {askName && (
            <div className="field">
              <label htmlFor={id}>اكتبي اسمكِ ليظهر في جوازكِ</label>
              <input
                id={id}
                type="text"
                value={progress.playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                autoComplete="given-name"
                maxLength={40}
                placeholder="اكتبي اسمكِ"
              />
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary btn-xl btn-go"
            onClick={() => {
              sfx.stamp();
              setStarted();
              navigate('/city');
            }}
          >
            {returning ? 'تابعي رحلتك' : 'ابدئي رحلتك'}
          </button>
          <p className="welcome-tagline">{projectTagline}.</p>
          <a className="welcome-link" href="#/tour">
            🎤 جولة في مدينتي
          </a>
        </div>
      </div>
      <HeroScene />
    </main>
  );
}
