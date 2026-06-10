// qa.js — 브라우저 없이 doReading()을 실행해 index.html 출력을 점검하는 검증 하니스
// 사용법:  node qa.js      (먼저 한 번:  npm i lunar-javascript)
// index.html 과 같은 폴더에 두고 실행한다.

const fs = require('fs');
const path = require('path');

// lunar-javascript 전역 등록 (사주/대운/세운/월운 계산)
const { Solar, Lunar } = require('lunar-javascript');
globalThis.Solar = Solar;
globalThis.Lunar = Lunar;
globalThis.cnchar = undefined; // STROKE 테이블 우선 — cnchar 없어도 동작

// 브라우저 전역 스텁
globalThis.window = { addEventListener() {}, scrollTo() {}, scrollY: 0, innerHeight: 800 };
globalThis.getComputedStyle = () => ({ display: 'block' });

// ── 표준 테스트 입력: 김동영 (CLAUDE.md 4절 기준값) ─────────────
const vals = {
  nameKo: '김동영', hanja: '金洞瑩', gender: 'M', strokesManual: '',
  calType: 'lunar', yy: '1994', mm: '9', dd: '25', hh: '15', mi: '30',
  tsRegion: '128.085', tsLon: ''
};
const checks = { leap: false, noTime: false, trueSolar: true };
// ──────────────────────────────────────────────────────────────

const reg = {};
function el(id) {
  if (reg[id]) return reg[id];
  const e = {
    _id: id, _h: '',
    get value() { return vals[id] !== undefined ? vals[id] : ''; }, set value(v) { vals[id] = v; },
    get checked() { return !!checks[id]; }, set checked(v) { checks[id] = v; },
    style: { display: '' },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; },
    set textContent(v) { this._t = v; }, get textContent() { return this._t || ''; },
    addEventListener() {}, scrollIntoView() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    children: [], appendChild() {}, removeChild() {}, insertBefore() {},
    matches() { return false; }, hasAttribute() { return false; }, getAttribute() { return ''; },
    getBoundingClientRect() { return { top: 0 }; }, offsetParent: null
  };
  reg[id] = e; return e;
}
globalThis.document = {
  getElementById: el,
  querySelector() { return null; }, querySelectorAll() { return []; },
  addEventListener(ev, fn) { if (ev === 'DOMContentLoaded') fn(); },
  fonts: { ready: Promise.resolve() },
  body: { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } }
};

// index.html 의 모든 <script> 블록 추출 → 구문검사 후 평가
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

let synErr = 0;
scripts.forEach((c, i) => {
  try { new Function(c); }
  catch (e) { synErr++; console.log('구문오류 S#' + (i + 1) + ':', e.message); }
});
scripts.forEach(c => { try { (0, eval)(c); } catch (e) { /* 핸들러 등록 중 일부 무해한 예외 무시 */ } });

// 실행
if (typeof doReading === 'function') doReading();
else { console.log('❌ doReading() 를 찾지 못함 — 스크립트 평가 실패'); process.exit(1); }

// ── 점검 ────────────────────────────────────────────────────
const oh = (reg['ohaeng'] && reg['ohaeng']._h) || '';
const interp = (reg['interp'] && reg['interp']._h) || '';
const saju = (reg['sajuBox'] && reg['sajuBox']._h) || '';
const all = interp + saju + oh;
function ck(label, cond) { console.log((cond ? '✅' : '❌') + ' ' + label); }

console.log('\n=== QA: 김동영 ===');
ck('구문 정상', synErr === 0);
ck('사주표 렌더', /천간/.test(saju));
ck('오행 레이더(SVG polygon)', /<svg/.test(oh) && /polygon/.test(oh));
ck('오행 막대', /class="bar"/.test(oh));
ck('십성 구조/분포', /십성별 상세/.test(interp));
ck('대운 흐름', /대운/.test(interp));
ck('분야별 운세', /분야별 운세/.test(interp));
ck('월별 운세', /월별 운세/.test(interp));
ck('종합 제언', /종합/.test(interp));
ck('한자 한글 병기(火(화))', /火\(화\)/.test(all));

console.log('\n# 내용을 직접 보고 싶으면 아래 주석을 풀어 실행:');
console.log('#   console.log(reg["interp"]._h)   // 전체 해석 HTML');
console.log('#   console.log(reg["ohaeng"]._h)   // 오행 차트 HTML');
