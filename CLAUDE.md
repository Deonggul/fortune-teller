# CLAUDE.md — 사주·명리 + 성명학 셀프 웹툴

> 이 파일은 Claude Code가 이 프로젝트를 이어서 작업할 때 필요한 전체 맥락이다.
> 작업 전에 반드시 끝까지 읽고, "작업 규칙"과 "검증·배포"를 지킬 것.

---

## 0. 프로젝트 한 줄 요약

생년월일시·이름을 넣으면 **사주(명리)와 성명학을 규칙 기반으로 풀이**해 주는 **단일 HTML 정적 웹툴**. 결과는 NHN 에디토리얼 톤의 리포트 화면으로 보여 준다. **라이브 AI 호출 없음 — 100% 클라이언트 사이드, 결정론적(같은 입력 = 같은 출력).**

- **유일한 산출물:** `index.html` (약 1,500줄, 단일 파일)
- **레포:** `Deonggul/fortune-teller` (Public)
- **배포:** GitHub Pages — https://deonggul.github.io/fortune-teller/ (`<meta robots noindex>` 적용됨)
- **소통 언어:** 한국어.

---

## 1. 작업 규칙 (중요)

1. **결정론 유지** — 모든 풀이는 규칙/데이터 테이블 기반. 난수·라이브 AI·외부 API 호출 금지. 같은 입력은 항상 같은 결과.
2. **명리는 참고용** — 단정적/부정적 예언 금지. 경향·흐름으로 서술. **건강 항목엔 항상 "의학적 진단 아님" 고지.**
3. **쉬운 말 + 진짜 풀이** — 중학생도 이해할 평이한 한국어. 단, **용어 정의만 늘어놓지 말 것**(과거 실패). "이 사람은 ~한 사람" 식 실제 해석을 줄 것. 한자엔 한글 병기(`火(화)`, `戊(무)`, `丙午(병오)`).
4. **재미·풍부함** — 분야별/월별 운세는 캐치한 헤드라인 + 생생한 비유 + 개운법(색·방향·소품)·귀인·여행까지. 단 **이모지는 헤드라인에 넣지 않는다**(NHN 에디토리얼 톤). 레퍼런스(사주아이 등) 문구를 베끼지 말고 같은 톤으로 새로 작성.
5. **내용을 숨기지 말 것** — 과거 "쉽게/자세히 보기" 토글이 풀이 본문·차트를 숨겨 부실해지는 회귀가 있었다. 지금은 토글 제거, **본문·차트·쉬운설명을 항상 표시**. 토글류를 다시 넣어도 절대 핵심 콘텐츠를 숨기지 말 것.
6. **CDN은 jsdelivr만** — 사용자 회사망에서 **unpkg 차단**됨. 새 라이브러리도 jsdelivr 또는 인라인.
7. **차트는 외부 라이브러리 없이** — SVG/CSS로 직접(회사망·오프라인 안전).
8. 디자인 톤은 **NHN HTML Design System**(Pretendard, ink 토큰, --blue #0F80F6 / --green #01A058 / --red #EB453D, --max 800px, 사이드 네비)을 리포트 UI에 맞게 적용.

---

## 2. 기술 스택 / 구조

- **단일 파일** `index.html`. `<style>` + 마크업 + 여러 `<script>` 블록.
- **CDN(전부 jsdelivr):** `lunar-javascript@1.7.7`(전역 Solar/Lunar — 사주·대운·세운·월운), `cnchar`+`cnchar-trad`(획수 보조), Pretendard 폰트.
- **입력 폼(#inputCard):** `nameKo` · `hanja` · `gender`(M/F) · `calType`(solar/lunar)+`leap` · `yy/mm/dd/hh/mi`(범위검증) · `noTime` · `trueSolar`+`tsRegion`(경도) · `strokesManual`. 실행 버튼 `#run`.

### 임베디드 데이터 테이블 (전역 const)
`STROKE`(강희 원획 8525자) · `NAME_HANJA`(156자) · `GAN_E`/`GAN_Y`/`ZHI_E`/`ZHI_MAIN` · `E_LABEL`(한글 병기형 `{화:'火(화)'...}`) · `GAN_KO`/`ZHI_KO`+`koread()`/`kz()`(간지·오행 한글 병기) · `DM_DESC` · `SIPSIN_DESC` · `ELEM_LACK`/`ELEM_HEALTH`/`ELEM_DIR`/`ELEM_COLOR`/`ELEM_ITEM`/`GAEUN_DIR` · `GAEUN`(오행별 구체 개운법) · `SIP_PLAIN`/`SIP_FIELD`(십성 평이 해석) · `SIP_MONTH`/`FOCUS`(월운) · `CHUNG`/`YUKHAP`/`SANHAP`/`WANGJI`/`HYEONG`/`WONJIN`/`JIJANG`/`CHANGGO`(묘고) · `SEASON` · `ZHI_ANIMAL`(띠) · `OH_HEX`/`OH_LB`(차트) + `johuHint()`.

### 핵심 로직
- **`buildInterp(pillars, dayGan, cnt, ec)`** — 해석 HTML 생성.
  - `sec(id, title, body, easy, keep)` — `<section class="rsub" id="i-<id>" data-nav>` + `.rsub-h` + `.rsub-b`(본문) + `.easy`(쉬운설명 박스). **easy는 진짜 풀이여야 함(용어정의 X). 본문·쉬운설명 둘 다 항상 표시.** `keep`은 현재 영향 없음(토글 잔재).
  - `note(text)` — 파란 각주 박스.
  - 섹션 id: `sum balance gj sip jz per life nameu daeun seun wol fin`.
  - 깊은 분석: 식신/칠살 stem, 반합, 묘고 갇힌 오행(`lockedLack`), 통근, `cBigeop/cSiksang/cJae/cGwan/cIn`, `sinwangJaeyak`, `sikje`(식신제살), 조후.
- **`doReading()`** — `#run` 클릭 → 검증 → `showLoading()` → `setTimeout(doReading,80)`. try/catch/finally. 렌더: `#sajuBox`(사주표,`.ko` 병기)·`#dm`·`#tsNote`·`#ohaeng`(오행 레이더 SVG+막대)·`#interp`·`#balchain`/`#balnote`(한글이름 없으면 `#s-name` 숨김)·`#hanjaCard`(hanja≥1)·`#suriCard`(hanja≥2 or 수동)·커버 → `enterReportMode()`.

### 리포트 모드 IIFE
- `PARTS`: I 사주분석[s-saju,s-ohaeng,i-sum,i-balance,i-gj,i-sip,i-jz,i-per,i-life] · II 성명학[s-name,hanjaCard,suriCard,i-nameu] · III 2026운세[i-seun,i-wol] · IV 흐름과제언[i-daeun,i-fin] · 부록[s-term].
- `layoutBody()` PART 순서 재배치+디바이더(빈 PART 숨김, 재실행 시 중복 i-* 제거). `buildNav()` PART 그룹+접기/펼치기 사이드 네비, 01..N 번호 주입, `setActivePart()` 현재 PART 파란 강조. 스크롤탑, fonts.ready/load 재계산.

### 차트 (SVG/CSS, 외부 라이브러리 X)
- **오행 레이더(오각형)** `#ohaeng` — 5축+폴리곤, 꼭짓점 한자+개수, 결핍 회색, `OH_HEX` 색 + 색막대.
- **십성 5분류 막대** — `sipChart`(비겁/식상/재성/관성/인성), `sipHtml` 앞에 prepend.
- **대운 타임라인** — `dyHtml` 상단 가로 카드 띠. 파란=현재, 초록 테두리=용신 보강기.

---

## 3. 검증·배포 (반드시 이 순서)

### 3-1. 구문 검증
```bash
node -e '
const fs=require("fs");const h=fs.readFileSync("index.html","utf8");
const re=/<script>([\s\S]*?)<\/script>/g;let m,i=0,ok=true;
while((m=re.exec(h))){i++;try{new Function(m[1]);}catch(e){ok=false;console.log("S#"+i,e.message);}}
console.log(ok?"구문 정상":"구문 오류");'
```

### 3-2. 실행 검증 (DOM 스텁 하니스 qa.js)
브라우저 없이 `doReading()` 직접 호출. 표준 케이스 = "김동영"(4절).
스텁 필수: `globalThis.Solar/Lunar`, `window`(addEventListener/scrollTo/scrollY/innerHeight), `getComputedStyle`=>({display:'block'}), `document`(getElementById→stub el: value/checked/style/classList/innerHTML/children/appendChild/removeChild/insertBefore/matches/hasAttribute/getAttribute/getBoundingClientRect/offsetParent), `document.fonts.ready`, DOMContentLoaded 즉시 실행.
점검: 사주표·일간·오행 레이더(SVG polygon)·십성 막대·대운 타임라인·분야별/월별 운세·한자 병기(火(화))·성명 카드 표시/숨김.
> `npm i lunar-javascript cnchar cnchar-trad`(없으면). sxtwl은 검산용 옵션.

### 3-3. 배포
Claude Code면 직접: `git add index.html && git commit -m "<요약>" && git push` → GitHub Pages 자동 반영 → 사용자에게 **강력 새로고침(Ctrl+Shift+R)** 안내.
push 권한 없으면: GitHub 웹 Add file→Upload files→Commit 후 강력새로고침 안내.

---

## 4. 표준 테스트 케이스 — 김동영 (검산 기준값, 출력 일치 필수)

- **입력:** 이름 `김동영`, 한자 `金洞瑩`, 남자, **음력 1994-09-25 15:30**, 진태양시 ON, 경도 128.085(진주).
- **사주:** 시 `庚申`(식신)·일 `戊子`(일지 정재)·월 `甲戌`(편관)·연 `甲戌`. **일간 戊土(양), 신강.**
- **진태양시:** 15:30→15:19, `庚申` 유지.
- **오행:** 木2 火0(결핍=용신) 土3 金2 水1.
- **격국:** 식신제살(시간 庚 식신이 월간 甲 칠살 제압) + 식상생재(申子 반합 水=재성). 신왕재약.
- **용신:** 火. 조후로도 丙·壬 부재.
- **신살:** 역마(申)·화개(戌戌)·도화(子)·문창(申).
- **대운(getYun, +1 관습):** 4乙亥/14丙子/24丁丑(현재)/34戊寅/... 火보강=丙子·丁丑. (맞춤 리포트는 대운수3=3·13·23세 → 툴은 "±1 관법 차이" 고지.)
- **2026 세운 丙午:** 천간 편인·지지 정인(인성운), 火 보강, 子午冲(일지 정재 충→재물·가정·거처 변동), 살인상생, 도식 주의, 역마+인성→이직 우호. 월운 절기(입춘) 정확.
- **성명:** 발음 김木→동火→영土 상생(火 보완). 수리 천격9·인격18·지격25·외격16·총격33. 자원 金→水→金.

---

## 5. 주요 변경 이력 (완료·검증됨)

- 분야별 세운: 캐치 헤드라인+원국 근거+비유+전략+개운법.
- 월별: 달마다 헤드라인+십성/충·합·형/보강+FOCUS+개운법·귀인·여행.
- 한자 한글 병기: E_LABEL='火(화)', kz() 간지, 사주표 .ko, 일간/커버.
- "쉽게/자세히" 토글 제거(회귀 원인) → 항상 표시. easy를 진짜 풀이로 재작성.
- 차트 3종: 오행 레이더·십성 막대·대운 타임라인.
- 개운법 구체화(GAEUN), 을(를)·火(화)(화) 등 어색 표현 정리.
- 성명학: 한글이름 없으면 발음카드+PART II 자동 숨김.

---

## 6. 사용자 피드백 경향

- "부실하다/짧다" → 더 길고 구체적으로(원국 근거+비유+조언). 단 결정론·과장 금지.
- "용어 어렵다" → 평이하되 진짜 해석.
- "차트/시각화" → SVG/CSS 직접.
- "어색한 표현" → 조사·중복어·모호어 정리.
- 다른 사람 사주로 테스트 → 어떤 입력에도 동작(김동영 하드코딩 금지, 기준값일 뿐).

---

## 7. 마무리 체크리스트

- [ ] 구문 검증 통과(3-1)
- [ ] qa.js 실행 검증 + 김동영 기준값 일치(3-2,4)
- [ ] 결정론 유지(난수·라이브 AI 없음)
- [ ] 건강=의학 아님 고지, 단정적 예언 없음
- [ ] 차트·본문·쉬운설명 모두 표시(숨김 없음)
- [ ] 한자 한글 병기 유지
- [ ] commit & push(또는 업로드 안내) + 강력새로고침 안내
