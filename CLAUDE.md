# CLAUDE.md — 사주·명리 + 성명학 셀프 웹툴

> 이 파일은 Claude Code가 이 프로젝트를 이어서 작업할 때 필요한 전체 맥락이다.
> 작업 전에 반드시 끝까지 읽고, "작업 규칙"과 "검증·배포"를 지킬 것.

---

## 0. 프로젝트 한 줄 요약

생년월일시·이름을 넣으면 **사주(명리)와 성명학을 규칙 기반으로 풀이**해 주는 **단일 HTML 정적 웹툴**. 결과는 **따뜻한 파스텔 톤 + 고양이·강아지 마스코트**가 안내하는 친근한 리포트 화면으로 보여 준다(점쟁이 고양이가 섹션을 안내하고, "쉽게 말하면"은 강아지가 말풍선으로 설명). **라이브 AI 호출 없음 — 100% 클라이언트 사이드, 결정론적(같은 입력 = 같은 출력).**

- **유일한 산출물:** `index.html` (약 1,500줄, 단일 파일)
- **레포:** `Deonggul/fortune-teller` (Public)
- **배포:** GitHub Pages — https://deonggul.github.io/fortune-teller/ (`<meta robots noindex>` 적용됨)
- **소통 언어:** 한국어.

---

## 1. 작업 규칙 (중요)

1. **결정론 유지** — 모든 풀이는 규칙/데이터 테이블 기반. 난수·라이브 AI·외부 API 호출 금지. 같은 입력은 항상 같은 결과.
2. **명리는 참고용** — 단정적/부정적 예언 금지. 경향·흐름으로 서술. **건강 항목엔 항상 "의학적 진단 아님" 고지.**
3. **쉬운 말 + 진짜 풀이** — 중학생도 이해할 평이한 한국어. 단, **용어 정의만 늘어놓지 말 것**(과거 실패). "이 사람은 ~한 사람" 식 실제 해석을 줄 것. 한자엔 한글 병기(`火(화)`, `戊(무)`, `丙午(병오)`).
4. **재미·풍부함** — 분야별/월별 운세는 캐치한 헤드라인 + 생생한 비유 + 개운법(색·방향·소품)·귀인·여행까지. 단 **이모지(유니코드 그림문자)는 본문·헤드라인에 넣지 않는다** — 회사망/폰트 호환과 결정론을 위해 캐릭터·아이콘은 전부 **직접 그린 인라인 SVG**로 표현(마스코트·표정 등). 레퍼런스(사주아이 등) 문구를 베끼지 말고 같은 톤으로 새로 작성.
5. **내용을 숨기지 말 것** — 과거 "쉽게/자세히 보기" 토글이 풀이 본문·차트를 숨겨 부실해지는 회귀가 있었다. 지금은 토글 제거, **본문·차트·쉬운설명을 항상 표시**. 토글류를 다시 넣어도 절대 핵심 콘텐츠를 숨기지 말 것.
6. **CDN은 jsdelivr만** — 사용자 회사망에서 **unpkg 차단**됨. 새 라이브러리도 jsdelivr 또는 인라인.
7. **차트는 외부 라이브러리 없이** — SVG/CSS로 직접(회사망·오프라인 안전).
8. **디자인 톤(이 프로젝트 전용)** — **따뜻한 파스텔 + 고양이·강아지 마스코트** 방향. Pretendard 유지. 토큰은 웜톤(`--ink` 갈색 계열, `--surface` 크림/`#FFFDF9`, `--surface-1` `#FBF3E8`, `--line-soft` `#ECDFCB`), 액센트 코랄(`--accent #FF7A45` / `--accent-ink #E0622E` / `--accent-soft #FFE7D1` / `--accent-line #FFC79A`), 쉬운설명 민트(`--mint #EFF8F1` / `--mint-ink #2E8B5B`). 카드는 둥근 모서리(radius 20~22)+부드러운 그림자, 표지는 피치 그라데이션. 마스코트: 점쟁이 고양이(표지·섹션 제목·PART 디바이더), 강아지("쉽게 말하면" 말풍선) — 전부 인라인 SVG 상수 `CAT_AV`/`DOG_AV`(+표지용 큰 고양이는 커버 마크업에 직접). 데이터 시각화(오행 레이더·대운 타임라인 현재 표시·용어 점선밑줄)도 코랄 톤.
   - ⚠️ **NHN HTML Design System(차가운 흰/검정 에디토리얼 톤)은 \"업무용 보고서\" 작성 시에만 적용하고, 이 사주 프로젝트에는 적용하지 않는다.** 과거 NHN 에디토리얼 톤(3px ink 라인 섹션, 다크 커버)에서 위 파스텔+마스코트 톤으로 전면 교체했으니, 되돌리지 말 것.

---

## 2. 기술 스택 / 구조

- **단일 파일** `index.html`. `<style>` + 마크업 + 여러 `<script>` 블록.
- **CDN(전부 jsdelivr):** `lunar-javascript@1.7.7`(전역 Solar/Lunar — 사주·대운·세운·월운), `cnchar`+`cnchar-trad`(획수 보조), Pretendard 폰트.
- **입력 폼(#inputCard):** `nameKo` · `hanja` · `gender`(M/F) · `calType`(solar/lunar)+`leap` · `yy/mm/dd/hh/mi`(범위검증) · `noTime` · `trueSolar`+`tsRegion`(경도) · `strokesManual`. 실행 버튼 `#run`.

### 임베디드 데이터 테이블 (전역 const)
`STROKE`(강희 원획 8525자) · `NAME_HANJA`(156자) · `GAN_E`/`GAN_Y`/`ZHI_E`/`ZHI_MAIN` · `E_LABEL`(한글 병기형 `{화:'火(화)'...}`) · `GAN_KO`/`ZHI_KO`+`koread()`/`kz()`(간지·오행 한글 병기) · `DM_DESC` · `SIPSIN_DESC` · `ELEM_LACK`/`ELEM_HEALTH`/`ELEM_DIR`/`ELEM_COLOR`/`ELEM_ITEM`/`GAEUN_DIR` · `GAEUN`(오행별 구체 개운법) · `SIP_PLAIN`/`SIP_FIELD`(십성 평이 해석) · `SIP_MONTH`/`FOCUS`(월운) · `CHUNG`/`YUKHAP`/`SANHAP`/`WANGJI`/`HYEONG`/`WONJIN`/`JIJANG`/`CHANGGO`(묘고) · `SEASON` · `ZHI_ANIMAL`(띠) · `OH_HEX`/`OH_LB`(차트) + `johuHint()`.
- **한 줄 비유(커버)·캐릭터:** `DAY_IMG`(일간→물상 명사구, 짧게) · `DAY_ROLE`(일간→캐릭터 한 줄) · `LACK_IMG`(결핍 오행→'무엇이 그리운가'). buildInterp가 이를 조합해 `window._tagline={img,role}` 세팅 → 커버 알약(`#cvTagline`)+부제(`#cvTagSub`)와 핵심요약 리드에 노출. 예) 김동영 → "모닥불이 절실한 거대한 산".
- **연애/직장 데이터:** `SPOUSE_STYLE`/`SPOUSE_PREF`(배우자궁 십성→관계 스타일·이상형).
- **용어 인라인 각주:** `GLOSSARY`(긴/복합어 우선 정렬) + `annotateTerms(html)` — 본문 텍스트노드의 각 용어 **첫 등장만** 툴팁(`.gl`/`.gl-pop`)으로 감쌈(태그/속성·이미 감싼 부분은 건드리지 않음). buildInterp 끝에서 `return annotateTerms(html)`. 맨 아래 `s-term` 카드는 참고용 유지.
- **마스코트 SVG 상수:** `CAT_AV`(섹션 제목·PART 디바이더용 고양이) · `DOG_AV`("쉽게 말하면" 강아지). 표지용 큰 고양이는 커버 마크업에 직접.

### 핵심 로직
- **`buildInterp(pillars, dayGan, cnt, ec)`** — 해석 HTML 생성.
  - `sec(id, title, body, easy, keep)` — `<section class="rsub" id="i-<id>" data-nav>` + `.rsub-h` + `.rsub-b`(본문) + `.easy`(쉬운설명 박스, `.easy-dog` 강아지 SVG + `.easy-body`). **easy는 진짜 풀이여야 함(용어정의 X). 본문·쉬운설명 둘 다 항상 표시.** `keep`은 현재 영향 없음(토글 잔재). 섹션 제목 앞 고양이 아이콘(`.hd-cat`)+번호 알약(`.rnum`)은 `buildNav()`가 주입.
  - `note(text)` — 연한 각주 박스.
  - 섹션 id: `sum balance gj sip jz per money love career health gaeun nameu daeun seun wol fin` (재물·연애결혼·직장이직·건강을 독립 섹션으로 분리, `gaeun`은 개운법 일원화 섹션 — 운세별 개운 반복 제거).
  - 깊은 분석: 식신/칠살 stem, 반합, 묘고 갇힌 오행(`lockedLack`), 통근, `cBigeop/cSiksang/cJae/cGwan/cIn`, `sinwangJaeyak`, `sikje`(식신제살), 조후.
- **`doReading()`** — `#run` 클릭 → 검증 → `showLoading()` → `setTimeout(doReading,80)`. try/catch/finally. 렌더: `#sajuBox`(사주표,`.ko` 병기)·`#dm`·`#tsNote`·`#ohaeng`(오행 레이더 SVG+막대)·`#interp`·`#balchain`/`#balnote`(한글이름 없으면 `#s-name` 숨김)·`#hanjaCard`(hanja≥1)·`#suriCard`(hanja≥2 or 수동)·커버 → `enterReportMode()`.

### 리포트 모드 IIFE
- `PARTS`: I 사주분석[s-saju,s-ohaeng,i-sum,i-balance,i-gj,i-sip,i-jz,i-per,i-money,i-love,i-career,i-health,i-gaeun] · II 성명학[s-name,hanjaCard,suriCard,i-nameu] · III 2026운세[i-seun,i-wol] · IV 흐름과제언[i-daeun,i-fin] · 부록[s-term].
- `layoutBody()` PART 순서 재배치+디바이더(빈 PART 숨김, 재실행 시 중복 i-* 제거). PART 디바이더는 웜톤+고양이(`.pd-cat`). `buildNav()` PART 그룹+접기/펼치기 사이드 네비, 01..N 번호 알약 + 고양이(`.hd-cat`) 주입, `setActivePart()` 현재 PART 코랄 강조. 스크롤탑, fonts.ready/load 재계산.

### 차트 (SVG/CSS, 외부 라이브러리 X)
- **오행 둥근 원 요약** `#ohaeng` 최상단 — 木火土金水 파스텔 원 + 개수, **부족(0) 오행은 시무룩한 표정**(SVG 호선). 한눈에 결핍 파악용.
- **오행 레이더(오각형)** `#ohaeng` — 5축+폴리곤(코랄 `#FF7A45`), 꼭짓점 한자+개수, 결핍 회색, `OH_HEX` 색 + 색막대.
- **십성 5분류 막대** — `sipChart`(비겁/식상/재성/관성/인성), `sipHtml` 앞에 prepend.
- **대운 타임라인** — `dyHtml` 상단 가로 카드 띠. 코랄=현재, 초록 테두리=용신 보강기.

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
- **커버 한 줄 비유** 추가(`DAY_IMG`+`LACK_IMG`+`DAY_ROLE`→`window._tagline`). 길이 짧게 조정해 한 줄 표기(예: "모닥불이 절실한 거대한 산").
- **재물·연애결혼·직장이직** 독립 섹션으로 상세화(상황별 예시: 미혼/기혼·이직·창업·동업 등), 건강 분리.
- **용어 인라인 각주**(`GLOSSARY`+`annotateTerms`) — 첫 등장에 점선밑줄 툴팁. 맨 아래 카드는 참고용 유지.
- **개운법 일원화** — 운세별로 반복되던 색·방향·여행 개운 제거, `i-gaeun` 섹션 한 곳으로(월별은 그 달 귀인 띠만).
- **디자인 전면 리뉴얼** — NHN 에디토리얼(흰/검정) → **따뜻한 파스텔 + 고양이·강아지 마스코트**. 웜톤 토큰·코랄 액센트·둥근 카드, 표지(고양이+알약 비유+간지 배지), 섹션 제목 고양이, "쉽게 말하면" 강아지 말풍선, 오행 둥근 원 요약(부족=시무룩 표정), 데이터 시각화 코랄화. 입력화면도 코랄 버튼+고양이. (NHN 톤은 업무용 보고서 전용 — §1.8)

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
