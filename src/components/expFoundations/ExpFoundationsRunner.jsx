import { useState, useEffect, useMemo } from 'react';
import { expFoundationModules } from '../../data/expFoundationModules.js';
import { saveExpFoundationProgress, getAllExpFoundationProgress } from '../../utils/expFoundationProgress.js';
import { track } from '../../utils/analytics.js';
import { InsightBox as SharedInsightBox, NextBtn as SharedNextBtn, MCQOption, CheckBtn as SharedCheckBtn, InstructionBox as SharedInstructionBox } from '../shared/FoundationPrimitives.jsx';
import { FoundationRunnerShell } from '../shared/FoundationRunnerShell.jsx';
import { Icon } from '../shared/Icon.jsx';

// ── Thin wrappers: shared primitives default to teal; ExpFoundations uses accent (blue) ──
function InsightBox(props) {
  return <SharedInsightBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />;
}
function NextBtn(props) {
  return <SharedNextBtn color='var(--accent)' {...props} />;
}
function CheckBtn(props) {
  return <SharedCheckBtn color='var(--accent)' {...props} />;
}
function InstructionBox(props) {
  return <SharedInstructionBox color='var(--accent)' bg='var(--accent-bg)' border='var(--accent-border)' {...props} />;
}

// ── Persistence helpers ──────────────────────────────────────────────────────
function saveEFState(id, state) {
  try { localStorage.setItem('pal-ef-' + id + '-v1', JSON.stringify(state)); } catch(e) {}
}
function loadEFState(id) {
  try { var raw = localStorage.getItem('pal-ef-' + id + '-v1'); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}
function shuffleEF(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

// ── Module imports ───────────────────────────────────────────────────────────
import { Module_EF01 } from './modules/Module01_WhyWeExperiment.jsx';
import { Module_EF02 } from './modules/Module02_UnitOfRandomization.jsx';
import { Module_EF03 } from './modules/Module03_StatisticalPower.jsx';
import { Module_EF04 } from './modules/Module04_PValues.jsx';
import { Module_EF05 } from './modules/Module05_SRM.jsx';
import { Module_EF06 } from './modules/Module06_NoveltyEffects.jsx';
import { Module_EF07 } from './modules/Module07_MultipleTesting.jsx';
import { Module_EF08 } from './modules/Module08_AATesting.jsx';
import { Module_EF09 } from './modules/Module09_CUPED.jsx';
import { Module_EF10 } from './modules/Module10_SequentialTesting.jsx';
import { Module_EF11 } from './modules/Module11_NetworkEffects.jsx';
import { Module_EF12 } from './modules/Module12_HoldoutGroups.jsx';
import { Module_EF13 } from './modules/Module13_MultiarmedBandits.jsx';
import { Module_EF14 } from './modules/Module14_GeoExperiments.jsx';
import { Module_EF15 } from './modules/Module15_SwitchbackExperiments.jsx';

// ── Module registry ─────────────────────────────────────────────────────────
const MODULE_COMPONENTS = {
  ef01: Module_EF01,
  ef02: Module_EF02,
  ef03: Module_EF03,
  ef04: Module_EF04,
  ef05: Module_EF05,
  ef06: Module_EF06,
  ef07: Module_EF07,
  ef08: Module_EF08,
  ef09: Module_EF09,
  ef10: Module_EF10,
  ef11: Module_EF11,
  ef12: Module_EF12,
  ef13: Module_EF13,
  ef14: Module_EF14,
  ef15: Module_EF15,
};

// ── Runner shell ────────────────────────────────────────────────────────────
export function ExpFoundationsRunner({ moduleId, onBack, onNext, unlocked, onSelectModule }) {
  var module = expFoundationModules.find(function(m) { return m.id === moduleId; });
  var [completed, setCompleted] = useState(false);
  var allProgress = getAllExpFoundationProgress();

  useEffect(function() {
    setCompleted(false);
  }, [moduleId]);

  if (!module) return null;

  var ModuleComponent = MODULE_COMPONENTS[moduleId];

  function handleComplete() {
    saveExpFoundationProgress(moduleId);
    track('case_completed', { room: 'exp-foundations', id: moduleId, title: module.title });
    setCompleted(true);
  }

  return (
    <FoundationRunnerShell
      module={module}
      totalModules={expFoundationModules.length}
      completed={completed}
      color='var(--accent)'
      roomLabel='A/B Foundations'
      onBack={onBack}
      playbookLinks={module.playbookLinks}
      modules={expFoundationModules}
      currentModuleId={moduleId}
      onSelectModule={onSelectModule}
      progress={allProgress}
    >
      {ModuleComponent ? (
        <>
          <ModuleComponent onComplete={handleComplete} />
          {completed && (
            <div className='pal-reveal-in' style={{ marginTop: '1.75rem' }}>
              <div style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '1rem 1.1rem', marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.35rem' }}>
                  Why this matters for experimentation practice
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                  {module.connection}
                </div>
              </div>

              <InsightBox label='Key Insight'>{module.keyInsight}</InsightBox>

              <NextBtn onClick={onNext} label={module.index < expFoundationModules.length ? 'Next module →' : 'Back to all modules'} />
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Module content coming soon.</div>
      )}
    </FoundationRunnerShell>
  );
}
