import { CityMap } from '../components/CityMap';
import { Noha } from '../components/Noha';
import { Num } from '../components/Num';
import { GoldCoin } from '../components/GoldStamp';
import { DISTRICTS } from '../content/districts';
import { enabledDistricts, settings } from '../config/settings';
import { navigate } from '../lib/router';
import { useProgress } from '../state/progress';
import { fmt } from '../lib/numbers';

export function CityScreen() {
  const { districtProgress, cityLevel, progress } = useProgress();
  const ids = enabledDistricts();
  const next = ids.find((id) => !districtProgress(id).stamp);
  const stamps = ids.filter((id) => districtProgress(id).stamp).length;
  const pct = Math.round(cityLevel * 100);

  return (
    <main className="page city-page">
      <section className="city-top">
        <Noha compact mood={next ? 'happy' : 'cheer'}>
          {next ? (
            <>
              اقتراحي لكِ: ابدئي بـ<strong>{DISTRICTS[next].name}</strong> ({DISTRICTS[next].topic}). اضغطي على أي مبنى في
              الخريطة لتدخليه.
            </>
          ) : progress.finalDone ? (
            <>أنجزتِ كل الأحياء وافتتحتِ حديقة المدينة. يمكنكِ التدرّب مجددًا في أي حي.</>
          ) : (
            <>أنجزتِ كل الأحياء! حان وقت المهمة الختامية: افتتاح حديقة المدينة.</>
          )}
        </Noha>
        <div className="growth" aria-label={`نمو المدينة ${fmt(pct)}٪`}>
          <div className="growth-head">
            <span>نمو المدينة</span>
            <strong>
              <Num v={pct} />٪
            </strong>
          </div>
          <div className="growth-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="growth-meta">
            <span>
              الأختام: <Num v={stamps} /> من <Num v={ids.length} />
            </span>
            <span>
              لبنات البناء: <Num v={progress.bricks} />
            </span>
          </div>
        </div>
      </section>

      <section className="map-wrap" aria-label="خريطة المدينة التفاعلية">
        <CityMap onSelect={(id) => navigate(`/d/${id}`)} onPark={() => navigate('/final')} />
      </section>

      <section className="path-list" aria-labelledby="path-title">
        <h2 id="path-title">المسار المقترح</h2>
        <ol>
          {ids.map((id, i) => {
            const d = DISTRICTS[id];
            const dp = districtProgress(id);
            return (
              <li key={id}>
                <a href={`#/d/${id}`} className={`path-card ${dp.stamp ? 'is-done' : ''} ${id === next ? 'is-next' : ''}`} style={{ ['--c' as string]: d.color }}>
                  <span className="path-icon" aria-hidden="true">
                    {d.icon}
                    <span className="path-num">
                      <Num v={i + 1} />
                    </span>
                  </span>
                  <span className="path-text">
                    <strong>{d.name}</strong>
                    <small>{d.topic}</small>
                  </span>
                  <span className="path-state">
                    {dp.stamp ? (
                      <span className="path-gold"><GoldCoin size={28} /> مختوم</span>
                    ) : dp.tasksDone > 0 ? (
                      <>
                        <Num v={dp.tasksDone} /> / <Num v={settings.tasksPerDistrict} />
                      </>
                    ) : id === next ? (
                      'التالي'
                    ) : (
                      ''
                    )}
                  </span>
                </a>
              </li>
            );
          })}
          <li>
            <a href="#/final" className={`path-card final ${progress.finalDone ? 'is-done' : ''}`} style={{ ['--c' as string]: '#5ED6B4' }}>
              <span className="path-icon" aria-hidden="true">⛲</span>
              <span className="path-text">
                <strong>افتتاح حديقة المدينة</strong>
                <small>المهمة الختامية</small>
              </span>
              <span className="path-state">{progress.finalDone ? <span className="path-gold"><GoldCoin size={28} /> مختوم</span> : ''}</span>
            </a>
          </li>
        </ol>
      </section>
    </main>
  );
}
