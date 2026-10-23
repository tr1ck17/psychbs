/*
 * app.js
 * Rendering, scroll reveals, the sorting-exercise state machine, the ending
 * sequence, and the constellation. All copy comes from content.js.
 */
(function () {
  'use strict';

  const C = window.CONTENT;
  const X = C.exercise;
  const M = X.messages;
  const STAGES = C.stages;
  const LAST = STAGES.length - 1;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionQuery.matches;

  /* ---------------------------------------------------------------- */
  /* Helpers                                                           */
  /* ---------------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) appendWithLinks(node, text);
    return node;
  }

  // turns [words](https://url) into underlined link; everything else says plain text
  function appendWithLinks(node, text) {
    const pattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let last = 0;
    for (const m of text.matchAll(pattern)) {
      node.append(text.slice(last, m.index));
      const a = document.createElement('a');
      a.className = 'cite';
      a.href = m[2];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = m[1];
      node.append(a);
      last = m.index + m[0].length;
    }
    node.append(text.slice(last));
  }

  function fade(node, delaySeconds) {
    node.classList.add('fade');
    if (delaySeconds) node.style.setProperty('--d', delaySeconds + 's');
    return node;
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // Force a style flush so a class added next starts a CSS transition.
  function show(node, className = 'shown') {
    void node.offsetWidth;
    node.classList.add(className);
  }
  const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pickN = (arr, n) => shuffle(arr).slice(0, n);

  /* ---------------------------------------------------------------- */
  /* Scroll reveals                                                    */
  /* ---------------------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function observeReveals(root) {
    root.querySelectorAll('.fade, .stage-line').forEach((node) => revealObserver.observe(node));
  }

  /* ---------------------------------------------------------------- */
  /* 1. Opening                                                        */
  /* ---------------------------------------------------------------- */
  function renderOpening() {
    const section = $('#opening');
    const O = C.opening;

    const title = fade(el('h1', 'title', O.title), 0.2);
    const subtitle = fade(el('p', 'subtitle', O.subtitle), 1.2);

    const lines = el('div', 'opening-lines');
    O.lines.forEach((text, i) => lines.append(fade(el('p', 'opening-line', text), 3 + i * 2)));

    const lineStart = 3 + O.lines.length * 2 + 0.8;
    const line = el('div', 'stage-line');
    line.style.setProperty('--d', lineStart + 's');
    line.append(el('div', 'track'));
    const labels = el('ol', 'stage-labels');
    labels.setAttribute('aria-label', O.lineLabel);
    STAGES.forEach((name, i) => labels.append(fade(el('li', null, name), lineStart + 0.5 + i * 0.55)));
    line.append(labels);

    const cue = fade(el('p', 'scroll-cue', O.scrollCue), lineStart + 4.5);
    cue.setAttribute('aria-hidden', 'true');

    section.append(title, subtitle, lines, line, cue);
  }

  /* ---------------------------------------------------------------- */
  /* 2. Model                                                          */
  /* ---------------------------------------------------------------- */
  function renderModel() {
    const section = $('#model');
    const P = C.model;
    section.setAttribute('aria-labelledby', 'model-heading');
    section.append(fade(el('p', 'eyebrow', P.eyebrow)));
    const h = fade(el('h2', 'section-heading', P.heading), 0.2);
    h.id = 'model-heading';
    section.append(h);
    P.paragraphs.forEach((text, i) => section.append(fade(el('p', null, text), 0.3 + i * 0.2)));
    section.append(fade(el('p', 'model-closing', P.closing), 0.4));
  }

  /* ---------------------------------------------------------------- */
  /* 3. Exercise: rendering                                            */
  /* ---------------------------------------------------------------- */
  const ui = {
    sidebar: null, boxes: [], sidebarCracks: null,
    stage: null, slot: null, msg: null, actions: null, unplaced: null, unplacedList: null
  };

  function renderExercise() {
    const section = $('#exercise');
    section.setAttribute('aria-labelledby', 'exercise-heading');
    const inner = el('div', 'exercise-inner');

    const intro = el('div', 'exercise-intro');
    intro.append(fade(el('p', 'eyebrow', X.eyebrow)));
    const h = fade(el('h2', 'section-heading', X.heading), 0.2);
    h.id = 'exercise-heading';
    intro.append(h);
    X.intro.forEach((text, i) => intro.append(fade(el('p', null, text), 0.4 + i * 0.3)));
    const begin = fade(el('button', 'button', X.beginLabel), 1);
    begin.type = 'button';
    begin.addEventListener('click', () => startExercise(begin));
    intro.append(begin);

    const stage = el('div', 'stage');
    stage.hidden = true;
    const slot = el('div', 'card-slot');
    const msg = el('div', 'msg');
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    const actions = el('div', 'actions');
    const hint = el('p', 'hint', X.hint);
    hint.id = 'card-hint';
    const unplaced = el('div', 'unplaced');
    unplaced.hidden = true;
    unplaced.append(el('h3', null, X.unplacedHeading));
    const unplacedList = el('ul');
    unplaced.append(unplacedList);
    stage.append(slot, msg, actions, hint, unplaced);

    inner.append(intro, stage);
    section.append(inner);

    Object.assign(ui, { stage, slot, msg, actions, unplaced, unplacedList });
    renderSidebar();

    // The sidebar is only visible while the exercise section is on screen.
    new IntersectionObserver((entries) => {
      document.body.classList.toggle('in-exercise', entries[0].isIntersecting);
    }, { threshold: 0 }).observe(section);
  }

  function renderSidebar() {
    const sb = $('#sidebar');
    ui.sidebar = sb;

    const head = el('div', 'sidebar-head');
    const title = el('h2', 'sidebar-title', X.sidebarTitle);
    title.id = 'sidebar-title';
    const toggle = el('button', 'sidebar-toggle', X.drawerHide);
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', 'boxes');
    toggle.addEventListener('click', () => setDrawer(sb.classList.contains('drawer-closed')));
    head.append(title, toggle);

    const list = el('ol', 'boxes');
    list.id = 'boxes';
    STAGES.forEach((name, i) => {
      const li = el('li', 'box-wrap');
      const box = el('div', 'box');
      box.setAttribute('role', 'button');
      box.tabIndex = 0;
      box.dataset.stage = String(i);
      box.style.setProperty('--dir', i % 2 ? '-1' : '1');

      const key = el('span', 'box-key', String(i + 1));
      key.setAttribute('aria-hidden', 'true');
      const items = el('ul', 'box-items');
      items.setAttribute('aria-hidden', 'true');
      const cracks = document.createElementNS(SVG_NS, 'svg');
      cracks.setAttribute('class', 'cracks');
      cracks.setAttribute('viewBox', '0 0 100 100');
      cracks.setAttribute('preserveAspectRatio', 'none');
      cracks.setAttribute('aria-hidden', 'true');
      box.append(el('span', 'box-name', name), key, items, cracks);

      box.addEventListener('click', () => attempt(i));
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); attempt(i); }
      });
      box.addEventListener('dragover', (e) => {
        if (!S.card) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        box.classList.add('drag-over');
      });
      box.addEventListener('dragleave', () => box.classList.remove('drag-over'));
      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('drag-over');
        attempt(i);
      });

      li.append(box);
      list.append(li);
      ui.boxes.push(box);
    });

    const sbCracks = document.createElementNS(SVG_NS, 'svg');
    sbCracks.setAttribute('class', 'cracks');
    sbCracks.setAttribute('viewBox', '0 0 100 100');
    sbCracks.setAttribute('preserveAspectRatio', 'none');
    sbCracks.setAttribute('aria-hidden', 'true');
    ui.sidebarCracks = sbCracks;

    sb.append(head, list, sbCracks);
    ui.boxes.forEach((_, i) => labelBox(i));
  }

  function setDrawer(open) {
    ui.sidebar.classList.toggle('drawer-closed', !open);
    const toggle = $('.sidebar-toggle', ui.sidebar);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? X.drawerHide : X.drawerShow;
  }

  function labelBox(i) {
    const box = ui.boxes[i];
    const count = box.querySelector('.box-items').children.length;
    let label = `${STAGES[i]}, ${count} ${M.placedLabel}`;
    if (box.classList.contains('closed')) label += `, ${M.passedLabel}`;
    box.setAttribute('aria-label', label);
  }

  /* ---------------------------------------------------------------- */
  /* 3. Exercise: state machine                                        */
  /*                                                                   */
  /* Phases: idle -> A -> B -> interlude -> C -> D -> flood ->         */
  /*         collapse -> done                                          */
  /*                                                                   */
  /* Placement rule (A, B, C): the model's current stage is the later  */
  /* of the furthest stage used so far and the model's own floor.      */
  /* Stages before it are closed. Phase C cards may only go into the   */
  /* stages they belong to, all of which are closed by then, so they   */
  /* can never be placed. Phase D accepts everything.                  */
  /* ---------------------------------------------------------------- */
  const S = {
    phase: 'idle',
    deck: [],
    idx: -1,
    card: null,       // current experience object
    cardEl: null,
    rec: null,        // record for the current card
    records: [],      // every card shown, with outcome and refused attempts
    selected: false,
    busy: false,
    maxPlaced: -1,    // furthest stage the user has placed into
    floor: -1,        // stage the model itself has advanced to
    crackStarted: false,
    fractures: 0,
    dPlaced: 0,
    fragments: null
  };

  const currentStage = () => Math.max(S.maxPlaced, S.floor);

  function buildDeck() {
    // Phase A: 3-4 cards from distinct stages, in forward order.
    const aStages = pickN([0, 1, 2, 3], randInt(3, 4)).sort((a, b) => a - b);
    const phaseA = aStages.map((stage) => {
      const pool = X.phaseA.filter((c) => c.stage === stage);
      return { ...pool[randInt(0, pool.length - 1)], phase: 'A' };
    });

    // Phase B: 2-3 ambiguous cards.
    const phaseB = pickN(X.phaseB, randInt(2, 3)).map((c) => ({ ...c, phase: 'B' }));

    // Phase C: at least 3 recurrence cards, always.
    const cCount = Math.min(X.phaseC.length, randInt(3, 4));
    const phaseC = pickN(X.phaseC, Math.max(3, cCount)).map((c) => ({ ...c, phase: 'C' }));

    // Phase D: collapse.
    const phaseD = shuffle(X.phaseD).map((c) => ({ ...c, phase: 'D' }));

    return [...phaseA, ...phaseB, { phase: 'interlude' }, ...phaseC, ...phaseD];
  }

  async function startExercise(beginButton) {
    beginButton.hidden = true;
    ui.stage.hidden = false;
    document.body.classList.add('exercise-live');
    S.deck = buildDeck();
    updateClosed();
    ui.stage.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    await wait(900);
    nextCard(true);
  }

  function nextCard(focusCard) {
    S.idx += 1;
    const item = S.deck[S.idx];
    if (!item) return collapse();
    if (item.phase === 'interlude') return interlude();
    if (item.phase === 'D' && S.phase !== 'D') enterPhaseD();
    S.phase = item.phase;
    showCard(item, focusCard);
  }

  function showCard(item, focusCard) {
    const hadFocus = focusCard || ui.stage.contains(document.activeElement) || ui.sidebar.contains(document.activeElement);
    ui.slot.textContent = '';
    ui.actions.textContent = '';

    const card = el('div', 'card', item.text);
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-describedby', 'card-hint');
    card.draggable = true;

    card.addEventListener('click', (e) => toggleSelect(e.detail === 0));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(true); }
    });
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.text);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));

    ui.slot.append(card);
    S.card = item;
    S.cardEl = card;
    S.selected = false;
    S.rec = { item, stage: null, attempts: [], unplaced: false };
    S.records.push(S.rec);

    show(card);
    if (hadFocus) card.focus({ preventScroll: true });
  }

  function toggleSelect(viaKeyboard) {
    if (!S.card || S.busy) return;
    S.selected = !S.selected;
    S.cardEl.setAttribute('aria-pressed', String(S.selected));
    if (S.selected) {
      say(M.choose);
      setDrawer(true);
      if (viaKeyboard) {
        const target = S.phase === 'D' ? 0 : Math.max(0, currentStage());
        ui.boxes[target].focus();
      }
    }
  }

  function attempt(stage) {
    if (!S.card || S.busy) return;
    const item = S.card;
    if (item.phase === 'D') return accept(stage);

    const cur = currentStage();
    let reason = null;
    if (stage < cur) reason = 'passed';
    else if (item.phase === 'C' && !item.fits.includes(stage)) reason = 'noPlace';

    if (reason) refuse(stage, reason);
    else accept(stage);
  }

  async function accept(stage) {
    S.busy = true;
    const item = S.card;
    const box = ui.boxes[stage];
    S.rec.stage = stage;
    S.card = null;

    addEntry(stage, item.phase === 'D' ? item.label : (item.short || item.text), item.phase === 'D');
    box.classList.add('filled');

    if (item.phase === 'D') {
      warp(box);
    } else {
      S.maxPlaced = Math.max(S.maxPlaced, stage);
      updateClosed();
    }

    say(M.recorded);
    S.cardEl.classList.add('placed');
    await wait(item.phase === 'D' ? 800 : 1700);
    S.busy = false;

    if (item.phase === 'D') {
      S.dPlaced += 1;
      if (S.dPlaced >= X.userPlacesInD) return flood();
    }
    nextCard();
  }

  function refuse(stage, reason) {
    const box = ui.boxes[stage];
    const item = S.card;
    S.rec.attempts.push({ stage, reason });
    shake(box);

    const noValidOption = item.phase === 'C' && item.fits.every((f) => f < currentStage());

    if (noValidOption) {
      say(M[reason], M.cannotFit);
      if (!S.crackStarted) {
        // First break: a fine crack across the refused box.
        S.crackStarted = true;
        addCrack(box.querySelector('.cracks'));
      } else {
        fracture(box);
      }
      if (!ui.actions.childElementCount) {
        const leave = el('button', 'button', X.leaveLabel);
        leave.type = 'button';
        leave.addEventListener('click', release);
        ui.actions.append(leave);
      }
      // The card cannot be placed. After a few tries it is let go.
      if (S.rec.attempts.length >= 3 && !S.rec.releasing) {
        S.rec.releasing = true;
        setTimeout(release, 1600);
      }
    } else {
      say(M[reason]);
      if (S.crackStarted) fracture(box);
    }
  }

  async function release() {
    if (!S.card || S.busy) return;
    S.busy = true;
    const item = S.card;
    S.card = null;
    S.rec.unplaced = true;
    ui.actions.textContent = '';
    S.cardEl.classList.add('unplaced');

    ui.unplaced.hidden = false;
    ui.unplacedList.append(el('li', null, item.short || item.text));

    await wait(2000);
    S.busy = false;
    nextCard();
  }

  async function interlude() {
    S.phase = 'interlude';
    S.card = null;
    ui.slot.textContent = '';
    ui.actions.textContent = '';
    say('');

    const box = el('div', 'interlude');
    ui.slot.append(box);
    for (const text of X.interlude) {
      const p = el('p', null, text);
      box.append(p);
      show(p);
      await wait(1900);
    }

    // The model moves the line forward on its own.
    S.floor = LAST;
    updateClosed();

    const go = el('button', 'button', X.continueLabel);
    go.type = 'button';
    go.addEventListener('click', () => nextCard(true));
    ui.actions.append(go);
  }

  function enterPhaseD() {
    S.phase = 'D';
    ui.stage.classList.add('fast');
    ui.sidebar.classList.add('loosened');
    updateClosed();
  }

  // After the user has placed a few Phase D cards, the rest arrive faster
  // than anyone could sort them and place themselves.
  async function flood() {
    S.phase = 'flood';
    S.busy = true;
    S.card = null;
    ui.actions.textContent = '';
    say('');

    const rest = S.deck.slice(S.idx + 1).filter((d) => d.phase === 'D');
    S.idx = S.deck.length;
    const stream = shuffle([...rest, ...X.phaseDEchoes.map((e) => ({ ...e, phase: 'D' }))]);

    let delay = 620;
    for (const item of stream) {
      const stage = item.lean != null ? item.lean : randInt(0, LAST);
      ui.slot.textContent = '';
      ui.slot.append(el('p', 'ghost', item.text));
      addEntry(stage, item.label, true);
      ui.boxes[stage].classList.add('filled');
      warp(ui.boxes[stage]);
      S.records.push({ item, stage, attempts: [], unplaced: false, auto: true });
      await wait(delay);
      delay = Math.max(170, delay * 0.86);
    }
    ui.slot.textContent = '';
    await wait(1400);
    collapse();
  }

  async function collapse() {
    S.phase = 'collapse';
    S.busy = true;
    say('');

    // Remember where the boxes were, so the constellation can start there.
    S.fragments = ui.boxes.map((b) => {
      const r = b.getBoundingClientRect();
      return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
    });

    ui.boxes.forEach((b) => {
      b.style.setProperty('--fx', randInt(-60, 90) + 'px');
      b.style.setProperty('--fy', randInt(-50, 50) + 'px');
      b.style.setProperty('--fr', randInt(-14, 14) + 'deg');
    });
    ui.sidebar.classList.add('collapsing');

    await wait(reduced() ? 2600 : 5600);
    document.body.classList.remove('exercise-live');
    ui.sidebar.hidden = true;
    ui.stage.classList.add('spent');
    S.phase = 'done';

    const ending = $('#ending');
    ending.hidden = false;
    await wait(50);
    ending.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    await wait(1600);
    runEnding();
  }

  /* Visual helpers for the exercise ------------------------------- */
  function say(primary, secondary) {
    ui.msg.textContent = '';
    if (primary) ui.msg.append(el('p', null, primary));
    if (secondary) ui.msg.append(el('p', 'msg-strong', secondary));
  }

  function addEntry(stage, text, echo) {
    const items = ui.boxes[stage].querySelector('.box-items');
    items.append(el('li', echo ? 'echo' : null, text));
    if (!ui.sidebar.classList.contains('loosened')) items.scrollTop = items.scrollHeight;
    labelBox(stage);
  }

  function updateClosed() {
    const loose = S.phase === 'D' || S.phase === 'flood' || S.phase === 'collapse';
    const cur = loose ? -1 : currentStage();
    ui.boxes.forEach((box, i) => {
      box.classList.toggle('closed', i < cur);
      box.classList.toggle('current', i === cur);
      labelBox(i);
    });
  }

  function shake(box) {
    box.classList.remove('shake');
    void box.offsetWidth;
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 600);
  }

  function crackPath() {
    // A jagged line from one edge of the box to the other.
    const horizontal = Math.random() < 0.65;
    const segments = randInt(5, 8);
    let drift = 15 + Math.random() * 70;
    const pts = [];
    for (let k = 0; k <= segments; k++) {
      const along = (k / segments) * 100;
      drift = clamp(drift + (Math.random() - 0.5) * 34, 2, 98);
      pts.push(horizontal ? [along, drift] : [drift, along]);
    }
    let d = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    // Occasional small branch.
    if (Math.random() < 0.6) {
      const [bx, by] = pts[randInt(1, pts.length - 2)];
      d += ` M${bx.toFixed(1)} ${by.toFixed(1)} L${clamp(bx + randInt(-18, 18), 0, 100)} ${clamp(by + randInt(-22, 22), 0, 100)}`;
    }
    return d;
  }

  function addCrack(svg) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', crackPath());
    path.setAttribute('pathLength', '1');
    path.setAttribute('class', 'crack');
    svg.append(path);
    show(path, 'on');
  }

  // Every refusal after the first break: more cracks, and the sidebar skews.
  function fracture(box) {
    S.fractures += 1;
    addCrack(box.querySelector('.cracks'));
    if (S.fractures % 2 === 0) addCrack(ui.sidebarCracks);
    ui.sidebar.style.setProperty('--skew', String(Math.min(4, S.fractures * 0.55)));
  }

  function warp(box) {
    const w = Math.min(14, (parseFloat(box.style.getPropertyValue('--warp')) || 0) + 1);
    box.style.setProperty('--warp', String(w));
  }

  // Keyboard shortcuts: 1-5 place the current card, Escape deselects.
  document.addEventListener('keydown', (e) => {
    if (!S.card || S.busy || e.altKey || e.ctrlKey || e.metaKey) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= STAGES.length) {
      e.preventDefault();
      attempt(n - 1);
    } else if (e.key === 'Escape' && S.selected) {
      toggleSelect(false);
      S.cardEl.focus();
    }
  });

  /* ---------------------------------------------------------------- */
  /* 4. End of journey                                                 */
  /* ---------------------------------------------------------------- */
  function renderEnding() {
    const section = $('#ending');
    section.setAttribute('aria-label', C.ending.sequence[0].text);
    const lines = el('div', 'ending-lines');
    lines.setAttribute('aria-live', 'polite');
    const go = el('button', 'button ending-continue', C.ending.continueLabel);
    go.type = 'button';
    go.hidden = true;
    go.addEventListener('click', () => $('#problem').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }));
    section.append(lines, go);
  }

  async function runEnding() {
    const box = $('.ending-lines');
    for (const step of C.ending.sequence) {
      if (step.clear) {
        [...box.children].forEach((c) => c.classList.remove('shown'));
        await wait(2200);
        box.textContent = '';
        await wait(step.pause || 0);
        continue;
      }
      if (step.pause) { await wait(step.pause); continue; }
      const p = el('p', 'ending-line' + (step.style ? ' ' + step.style : ''), step.text);
      box.append(p);
      show(p);
      await wait(step.hold || 2400);
    }
    revealAfterword();
  }

  function revealAfterword() {
    renderSummary();
    ['#problem', '#another'].forEach((id) => {
      const s = $(id);
      s.hidden = false;
      observeReveals(s);
    });
    const go = $('.ending-continue');
    go.hidden = false;
    observeConstellation();
  }

  /* ---------------------------------------------------------------- */
  /* 5. The problem with the line                                      */
  /* ---------------------------------------------------------------- */
  function renderProblem() {
    const section = $('#problem');
    const P = C.problem;
    section.setAttribute('aria-labelledby', 'problem-heading');
    section.append(fade(el('p', 'eyebrow', P.eyebrow)));
    const h = fade(el('h2', 'section-heading', P.heading), 0.2);
    h.id = 'problem-heading';
    section.append(h);

    const intro = el('div', 'intro');
    P.intro.forEach((text, i) => intro.append(fade(el('p', null, text), 0.3 + i * 0.4)));
    section.append(intro);

    P.sections.forEach((sub) => {
      const block = fade(el('div', 'subsection'));
      block.append(el('h3', null, sub.heading));
      sub.paragraphs.forEach((text) => block.append(el('p', null, text)));
      section.append(block);
    });

    const summary = fade(el('div', 'summary'));
    summary.id = 'summary';
    section.append(summary);
  }

  function renderSummary() {
    const T = C.problem.summary;
    const wrap = $('#summary');
    wrap.textContent = '';
    wrap.append(el('h3', null, T.heading), el('p', null, T.intro));

    const list = el('ol');
    S.records.filter((r) => r.item.phase !== 'D').forEach((r) => {
      const li = el('li', 'rec' + (r.unplaced ? ' is-unplaced' : ''));
      li.append(el('p', 'rec-text', r.item.text));
      r.attempts.forEach((a) => {
        li.append(el('p', 'rec-attempt', `${T.tried} ${STAGES[a.stage]}: ${T.reasons[a.reason]}.`));
      });
      const outcome = r.unplaced || r.stage == null ? T.unplaced : `${T.placedIn} ${STAGES[r.stage]}`;
      li.append(el('p', 'rec-outcome', outcome));
      list.append(li);
    });
    wrap.append(list);

    const dRecords = S.records.filter((r) => r.item.phase === 'D');
    const autoRecords = dRecords.filter((r) => r.auto);
    if (autoRecords.length) {
      const labels = autoRecords.map((r) => r.item.label).join(', ');
      wrap.append(el('p', 'flood', T.flood.replace('{n}', autoRecords.length).replace('{labels}', labels)));
    }

    const totalsHeading = el('p', 'rec-outcome', T.totalsHeading);
    totalsHeading.style.marginTop = '2rem';
    wrap.append(totalsHeading);
    const totals = el('ul', 'totals');
    STAGES.forEach((name, i) => {
      const n = S.records.filter((r) => r.stage === i && !r.unplaced).length;
      const li = el('li');
      li.append(el('span', 'n', String(n)), document.createTextNode(`${name} · ${n === 1 ? T.entry : T.entries}`));
      totals.append(li);
    });
    wrap.append(totals);
  }

  /* ---------------------------------------------------------------- */
  /* 6. Another way to think about grief                               */
  /* ---------------------------------------------------------------- */
  function renderAnother() {
    const section = $('#another');
    const A = C.another;
    section.setAttribute('aria-labelledby', 'another-heading');
    section.append(fade(el('p', 'eyebrow', A.eyebrow)));
    const h = fade(el('h2', 'section-heading', A.heading), 0.2);
    h.id = 'another-heading';
    section.append(h);

    const intro = el('div', 'intro');
    A.intro.forEach((text) => intro.append(fade(el('p', null, text), 0.4)));
    section.append(intro);

    const cwrap = fade(el('div', 'constellation-wrap'));
    const canvas = el('canvas');
    canvas.id = 'constellation';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', A.constellationLabel);
    cwrap.append(canvas);
    section.append(cwrap);

    const list = el('ul', 'perspectives');
    A.perspectives.forEach((p, i) => {
      const li = fade(el('li'), (i % 2) * 0.2);
      li.append(el('h3', null, p.title), el('p', null, p.body));
      list.append(li);
    });
    section.append(list);

    const closing = el('div', 'closing');
    A.closing.forEach((text, i) => closing.append(fade(el('p', null, text), i * 1.4)));
    section.append(closing);

    const restart = fade(el('button', 'button restart', A.restartLabel));
    restart.type = 'button';
    restart.addEventListener('click', () => {
      window.scrollTo(0, 0);
      window.location.reload();
    });
    section.append(restart);

    const refs = fade(el('div', 'references'));
    refs.append(el('h3', null, A.referencesHeading));
    const ul = el('ul');
    A.references.forEach((r) => ul.append(el('li', null, r)));
    refs.append(ul);
    section.append(refs);
  }

  /* Constellation ------------------------------------------------- */
  function observeConstellation() {
    const canvas = $('#constellation');
    let started = null;
    new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !started) started = startConstellation(canvas);
      if (started) started.setVisible(visible);
    }, { threshold: 0.2 }).observe(canvas);
  }

  function startConstellation(canvas) {
    const ctx = canvas.getContext('2d');
    const fragments = S.fragments || STAGES.map((_, i) => ({ x: 0.08, y: (i + 0.5) / STAGES.length }));

    // Nodes: the five stage names plus whatever flooded the boxes.
    const words = STAGES.map((s) => s.toLowerCase());
    S.records.forEach((r) => {
      if (r.item.phase === 'D' && r.item.label && !words.includes(r.item.label)) words.push(r.item.label);
    });
    const labels = words.slice(0, 18);

    // Spread targets with best-candidate sampling (in unit space).
    const targets = [];
    labels.forEach(() => {
      let best = null;
      let bestDist = -1;
      for (let k = 0; k < 30; k++) {
        const c = { x: 0.08 + Math.random() * 0.84, y: 0.1 + Math.random() * 0.8 };
        const d = targets.reduce((m, t) => Math.min(m, Math.hypot(t.x - c.x, (t.y - c.y) * 0.7)), Infinity);
        if (d > bestDist) { bestDist = d; best = c; }
      }
      targets.push(best);
    });

    const nodes = labels.map((label, i) => {
      const f = fragments[i % fragments.length];
      return {
        label,
        from: { x: clamp(f.x + (Math.random() - 0.5) * 0.06, 0, 1), y: clamp(f.y + (Math.random() - 0.5) * 0.1, 0, 1) },
        to: targets[i],
        delay: 0.3 + i * 0.22 + Math.random() * 0.5,
        rot: Math.random() * Math.PI,
        phase: Math.random() * Math.PI * 2
      };
    });

    // Edges: each node to its two nearest neighbours, plus a few longer
    // links, so the shape has structure but no single direction.
    const edgeSet = new Set();
    nodes.forEach((n, i) => {
      nodes
        .map((m, j) => ({ j, d: Math.hypot(m.to.x - n.to.x, m.to.y - n.to.y) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach((o) => edgeSet.add(i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`));
    });
    for (let k = 0; k < 3; k++) {
      const a = randInt(0, nodes.length - 1);
      const b = randInt(0, nodes.length - 1);
      if (a !== b) edgeSet.add(a < b ? `${a}-${b}` : `${b}-${a}`);
    }
    const edges = [...edgeSet].map((s) => s.split('-').map(Number));

    let W = 0, H = 0;
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced()) draw(1e6);
    }

    const DURATION = 5;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function draw(time) {
      ctx.clearRect(0, 0, W, H);
      const pos = nodes.map((n) => {
        const p = reduced() ? 1 : ease(clamp((time - n.delay) / DURATION, 0, 1));
        const driftX = reduced() ? 0 : Math.sin(time * 0.35 + n.phase) * 5 * p;
        const driftY = reduced() ? 0 : Math.cos(time * 0.28 + n.phase) * 4 * p;
        return {
          x: (n.from.x + (n.to.x - n.from.x) * p) * W + driftX,
          y: (n.from.y + (n.to.y - n.from.y) * p) * H + driftY,
          p
        };
      });

      ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const k = Math.min(pos[a].p, pos[b].p);
        if (k <= 0.6) return;
        const alpha = ((k - 0.6) / 0.4) * 0.3;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(pos[a].x, pos[a].y);
        ctx.lineTo(pos[b].x, pos[b].y);
        ctx.stroke();
      });

      ctx.textAlign = 'center';
      ctx.font = '300 12px Inter, system-ui, sans-serif';
      nodes.forEach((n, i) => {
        const { x, y, p } = pos[i];
        if (p <= 0 && !reduced()) {
          // Waiting fragment: a short shard where the box was.
          drawShard(x, y, n.rot, 16, 0.35);
          return;
        }
        if (p < 1) drawShard(x, y, n.rot * (1 - p), 16 * (1 - p), 0.5 * (1 - p));
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.6 * p})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + 1.4 * p, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p > 0.7) {
          ctx.fillStyle = `rgba(243,242,238,${((p - 0.7) / 0.3) * 0.62})`;
          ctx.fillText(n.label, x, y + 18);
        }
      });
    }

    function drawShard(x, y, rot, len, alpha) {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(rot) * len / 2, y - Math.sin(rot) * len / 2);
      ctx.lineTo(x + Math.cos(rot) * len / 2, y + Math.sin(rot) * len / 2);
      ctx.stroke();
    }

    let t0 = null;
    let raf = null;
    let visible = true;
    function frame(now) {
      if (t0 == null) t0 = now;
      draw((now - t0) / 1000);
      raf = visible ? requestAnimationFrame(frame) : null;
    }

    window.addEventListener('resize', resize);
    resize();
    if (!reduced()) raf = requestAnimationFrame(frame);

    return {
      setVisible(v) {
        visible = v;
        if (v && !raf && !reduced()) raf = requestAnimationFrame(frame);
      }
    };
  }

  /* ---------------------------------------------------------------- */
  /* Boot                                                              */
  /* ---------------------------------------------------------------- */
  document.title = C.meta.pageTitle;
  renderOpening();
  renderModel();
  renderExercise();
  renderEnding();
  renderProblem();
  renderAnother();
  observeReveals(document.querySelector('main'));
})();
