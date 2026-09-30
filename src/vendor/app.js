/* Elevate app: state, router, views */

var KEY = "elevate.v1";
var S = {
  track: null, resumeText: "", parsed: null, session: null,
  score: null, progress: {}, view: "home", course: null, lesson: null, quizState: null
};

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      track: S.track, resumeText: S.resumeText, parsed: S.parsed,
      score: S.score, progress: S.progress
    }));
  } catch (e) { /* private mode */ }
}
function load() {
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return;
    var d = JSON.parse(raw);
    S.track = d.track || null; S.resumeText = d.resumeText || "";
    S.parsed = d.parsed || null; S.score = d.score || null;
    S.progress = d.progress || {};
  } catch (e) { /* ignore */ }
}
function askReset() { S.confirmReset = true; render(); }
function cancelReset() { S.confirmReset = false; render(); }
function resetAll() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  S = { track:null, resumeText:"", parsed:null, session:null, score:null,
        progress:{}, view:"home", course:null, lesson:null, quizState:null };
  go("home");
  toast("Assessment cleared. Start fresh whenever you like.");
}

var toastTimer = null;
function toast(msg) {
  var t = el("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove("show"); }, 4200);
}

var el = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
  return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]; }); }

function go(view, opts) {
  S.view = view;
  if (opts) { if (opts.course !== undefined) S.course = opts.course; if (opts.lesson !== undefined) S.lesson = opts.lesson; }
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  render();
}

/* ---------------- chrome ---------------- */
function topbar() {
  var hasScore = !!S.score;
  function b(v, label, on, dis) {
    return '<button class="' + (S.view === v || on ? "on" : "") + '" ' +
      (dis ? "disabled" : 'onclick="go(\'' + v + '\')"') + '>' + label + "</button>";
  }
  return '<div class="topbar"><div class="topbar-in">' +
    '<button class="brand" onclick="go(\'home\')">' +
      '<img class="brand-mark" src="assets/logo-mark-144.png" width="44" height="44" ' +
      'alt="Supply Chain Canada West">' +
      '<span class="brand-text"><span class="brand-name">Elevate</span>' +
      '<span class="brand-sub">Supply Chain Canada West</span></span></button>' +
    '<span class="topbar-spacer"></span>' +
    '<nav class="topnav">' +
      b("goal", "Assessment", ["goal","upload","skills","quiz"].indexOf(S.view) > -1) +
      b("results", "My results", false, !hasScore) +
      b("path", "Learning path", ["path","course","lesson"].indexOf(S.view) > -1, !hasScore) +
      b("pricing", "Membership") +
    "</nav></div></div>";
}

function stepper(active) {
  var steps = [["Your goal", "goal"], ["Your resume", "upload"], ["What we found", "skills"],
               ["The quiz", "quiz"], ["Your gaps", "results"]];
  var out = '<div class="stepper">';
  steps.forEach(function (s, i) {
    var cls = i < active ? "done" : (i === active ? "on" : "");
    out += '<div class="step ' + cls + '"><span class="dot">' + (i < active ? "✓" : i + 1) +
      '</span><span class="lbl">' + s[0] + "</span></div>";
    if (i < steps.length - 1) out += '<span class="step-sep"></span>';
  });
  return out + "</div>";
}

function footer() {
  return '<footer><div class="wrap">' +
    '<div class="foot-brand">' +
      '<img src="assets/logo-mark-144.png" width="44" height="44" alt="Supply Chain Canada West">' +
      '<b>Elevate</b></div>' +
    'A competency assessment and learning concept for Supply Chain Canada West<br>' +
    '<span style="opacity:.75">Prototype for internal review. Self-assessment and development guidance only. ' +
    'Not a credential and not part of the SCMP designation process.</span>' +
    "</div></footer>";
}

/* ---------------- views ---------------- */
function vHome() {
  var totalQ = QUESTIONS.length;
  return '<div class="hero"><div class="wrap">' +
    '<span class="eyebrow">Supply Chain Canada West · Alberta &amp; BC</span>' +
    '<h1>Know exactly where you stand. <span class="accent">Then close the gap.</span></h1>' +
    '<p class="lede">Tell us the job you want. Add your resume. Answer some questions. ' +
    'In about fifteen minutes you get a clear picture of what you are already good at, ' +
    'what is missing for that job, and exactly which lessons close the difference.</p>' +
    '<a class="btn btn-accent btn-lg" onclick="go(\'goal\')">Start — it is free</a> ' +
    '<a class="btn btn-ghost btn-lg" style="color:#fff;border-color:rgba(255,255,255,.4)" onclick="go(\'pricing\')">See membership</a>' +
    '<div class="hero-stats">' +
      '<div class="hero-stat"><div class="n">10</div><div class="l">Skill areas</div></div>' +
      '<div class="hero-stat"><div class="n">6</div><div class="l">Jobs to aim for</div></div>' +
      '<div class="hero-stat"><div class="n">' + TOTAL_LESSONS + '</div><div class="l">Lessons</div></div>' +
      '<div class="hero-stat"><div class="n">' + totalQ + '</div><div class="l">Quiz questions</div></div>' +
    "</div></div></div>" +

    '<div class="section"><div class="wrap">' +
    '<h2 class="center">How it works</h2>' +
    '<p class="center muted" style="max-width:58ch;margin:0 auto 32px">Four steps, about fifteen minutes. ' +
    'You end up with a report you can act on, not a score you file away. Nothing to pay to find out.</p>' +
    '<div class="grid g2">' +
      card("Step 1 · Pick the job you want", "Choose one of six career tracks. Each job needs different things, so this sets the bar you are measured against. Takes a few seconds.") +
      card("Step 2 · Add your resume", "Upload a file or paste the text. We read it and show you what we found for each of the ten skill areas, so you can correct anything we got wrong. Your resume stays in your browser.") +
      card("Step 3 · Answer the questions", "A short quiz checks what your resume claims. It gets harder when you do well and easier when you do not, so it finds your real level in about twenty questions.") +
      card("Step 4 · See your gaps and what fixes them", "You get a score for every skill area, side by side with what the job needs. Wherever there is a gap, we list the exact lessons that close it.") +
    "</div></div></div>" +

    '<div class="section" style="background:var(--paper)"><div class="wrap">' +
    '<div class="grid g2" style="align-items:center;gap:40px">' +
      "<div><h2>A resume is a claim. We check it.</h2>" +
      "<p>Most tools read your resume and believe it. We do not. For every skill area you get two numbers: " +
      "what your resume suggests, and what you actually showed in the quiz.</p>" +
      "<p>Where those two disagree is the most useful thing in the report. It is also why your lesson list " +
      "is specific to you instead of the same list everyone else gets.</p></div>" +
      '<div class="card card-pad">' +
        '<div class="skillrow"><span class="ic">\u{1F4D1}</span><div class="nm"><b>Contract Management</b>' +
        '<small>Resume evidence: strong</small></div><div class="bar"><i style="width:92%"></i></div></div>' +
        '<div class="skillrow"><span class="ic">✅</span><div class="nm"><b>Demonstrated in assessment</b>' +
        '<small>2 of 3 correct, one advanced item missed</small></div><div class="bar"><i style="width:58%;background:linear-gradient(90deg,var(--warn-500),var(--warn-400))"></i></div></div>' +
        '<div class="notice" style="margin-top:16px"><b>Verified level: Developing.</b> ' +
        "Exposure is broad but risk allocation and remedy design are not yet secure. Two courses close this.</div>" +
      "</div>" +
    "</div></div></div>" +

    '<div class="section"><div class="wrap center">' +
    "<h2>The ten skill areas we measure</h2>" +
    '<p class="muted" style="max-width:60ch;margin:0 auto 26px">Every area is scored on the same five-point scale, ' +
    "from no evidence up to leading the work. Built for Canada: public procurement under CFTA and NWPTA, " +
    "CUSMA rules of origin, and Bill S-211 forced labour reporting.</p>" +
    '<div class="grid g3" style="text-align:left">' +
    DOMAINS.map(function (d) {
      return '<div class="card card-pad"><div style="font-size:1.5rem;margin-bottom:6px">' + d.icon + "</div>" +
        "<h3 style='font-size:.99rem'>" + esc(d.name) + "</h3>" +
        '<p class="muted" style="margin:0">' + esc(d.blurb) + "</p></div>";
    }).join("") +
    "</div>" +
    '<div style="margin-top:34px"><a class="btn btn-accent btn-lg" onclick="go(\'goal\')">Start — it is free</a></div>' +
    "</div></div>";
}
function card(t, b) {
  return '<div class="card card-pad"><h3>' + esc(t) + "</h3><p class='muted' style='margin:0'>" + esc(b) + "</p></div>";
}

function vGoal() {
  return '<div class="section"><div class="wrap">' + stepper(0) +
    "<h2>Which job are you aiming for?</h2>" +
    '<p class="muted" style="max-width:60ch">Pick the role you want <b>next</b>, not the one you hold now. ' +
    'Each one needs a different mix of skills, and that is what we measure you against. ' +
    'You can change this later and run it again.</p>' +
    '<div class="grid g2" style="margin-top:22px">' +
    TRACKS.map(function (t) {
      return '<button class="track ' + (S.track === t.id ? "sel" : "") + '" onclick="pickTrack(\'' + t.id + '\')">' +
        '<span class="ic">' + t.icon + "</span>" +
        "<h3>" + esc(t.name) + "</h3><p>" + esc(t.tagline) + "</p>" +
        '<div class="meta"><span class="pill pill-teal">' + esc(t.demand) + '</span>' +
        '<span class="pill">' + esc(t.salary) + "</span></div></button>";
    }).join("") + "</div>" +
    '<div style="margin-top:26px">' +
    '<button class="btn btn-accent btn-lg" ' + (S.track ? "" : "disabled") +
    ' onclick="go(\'upload\')">Next: add your resume</button>' +
    (S.track ? '' : '<p class="muted" style="margin:10px 0 0;font-size:.85rem">Pick a job above to continue.</p>') +
    '</div>' +
    "</div></div>";
}
function pickTrack(id) { S.track = id; save(); render(); }

function vUpload() {
  var t = TRACK_BY_ID[S.track];
  return '<div class="section"><div class="wrap-narrow">' + stepper(1) +
    "<h2>Add your resume</h2>" +
    '<p class="muted" style="max-width:60ch">We read it to see which of the ten skill areas you already have ' +
    'evidence for. You are being measured against <b>' + esc(t.name) + '</b>.<br>' +
    '<b>Your resume never leaves your browser.</b> Nothing is uploaded to a server.</p>' +
    '<div class="drop" id="drop" onclick="document.getElementById(\'file\').click()">' +
      '<div class="ic">\u{1F4C4}</div><b>Drop your resume here, or click to pick a file</b>' +
      '<div class="muted" style="margin-top:5px">PDF, Word (.docx) or a plain text file</div>' +
      '<input type="file" id="file" class="hidden" accept=".pdf,.docx,.txt,.md" onchange="onFile(event)">' +
    "</div>" +
    '<div id="filestatus" style="margin-top:12px"></div>' +
    '<div class="divider"></div>' +
    '<label class="muted" style="display:block;margin-bottom:7px;font-weight:600">Or just paste the text instead</label>' +
    '<textarea class="resume" id="rtext" placeholder="Paste your resume text here…">' + esc(S.resumeText) + "</textarea>" +
    '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-accent" onclick="doParse()">Analyze my resume</button>' +
      '<button class="btn btn-ghost" onclick="useSample()">Try it with a sample resume</button>' +
    "</div></div></div>";
}

function useSample() {
  el("rtext").value = SAMPLE_RESUME;
  el("filestatus").innerHTML = '<span class="filebadge">✓ Sample resume loaded</span>';
}

async function onFile(ev) {
  var f = ev.target.files && ev.target.files[0];
  if (!f) return;
  var st = el("filestatus");
  st.innerHTML = '<span class="muted">Reading ' + esc(f.name) + "…</span>";
  try {
    var txt = await extractTextFromFile(f);
    if (!txt || txt.trim().length < 40) throw new Error("No readable text found. If this is a scanned PDF, paste the text below instead.");
    el("rtext").value = txt.trim();
    st.innerHTML = '<span class="filebadge">✓ ' + esc(f.name) + " · " +
      txt.trim().split(/\s+/).length + " words</span>";
  } catch (e) {
    st.innerHTML = '<div class="notice"><b>Could not read that file.</b> ' + esc(e.message || "Try pasting the text below.") + "</div>";
  }
}

function doParse() {
  var txt = el("rtext").value.trim();
  if (txt.length < 80) {
    el("filestatus").innerHTML = '<div class="notice"><b>Not enough text.</b> Add your resume or click "Use a sample resume" to try the flow.</div>';
    return;
  }
  S.resumeText = txt;
  S.parsed = parseResume(txt);
  save();
  go("skills");
}

function vSkills() {
  var p = S.parsed, t = TRACK_BY_ID[S.track];
  if (!p) return vUpload();
  var rows = DOMAINS.map(function (d) {
    var r = p.domains[d.id];
    var pct = (r.claimed / 4) * 100;
    var ev = r.evidence[0] || (r.hits.length ? "Matched: " + r.hits.slice(0, 5).join(", ") : "No evidence found in your resume");
    return '<div class="skillrow"><span class="ic">' + d.icon + "</span>" +
      '<div class="nm"><b>' + esc(d.name) + "</b><small>" + esc(ev.slice(0, 120)) + "</small></div>" +
      '<span class="pill ' + (r.claimed >= 3 ? "pill-teal" : r.claimed === 0 ? "pill-rose" : "") + '">' +
      LEVELS[r.claimed].short + "</span>" +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
  }).join("");

  return '<div class="section"><div class="wrap-narrow">' + stepper(2) +
    "<h2>Here is what we found</h2>" +
    '<p class="muted" style="max-width:62ch">This is only what your <b>resume</b> says — we have not checked it yet. ' +
    'The quiz does that next, and your real score can come out higher or lower than this.</p>' +
    '<div class="grid g3" style="margin:20px 0">' +
      mini("Experience", p.years ? p.years + " yrs" : "—") +
      mini("Seniority signal", p.seniorityLabel) +
      mini("Credentials", p.credentials.length ? p.credentials.length : "None found") +
    "</div>" +
    (p.credentials.length ? '<div style="margin-bottom:16px">' + p.credentials.map(function (c) {
      return '<span class="pill pill-navy" style="margin-right:6px">' + esc(c) + "</span>"; }).join("") + "</div>" : "") +
    '<div class="card card-pad">' + rows + "</div>" +
    '<div class="notice notice-info" style="margin-top:18px"><b>Something missing?</b> ' +
    'We can only read what you actually wrote down. If you can do something but never mentioned it, ' +
    'it will show as missing here. Either ' +
    '<a href="#" onclick="go(\'upload\');return false">go back and add it</a>, ' +
    'or carry on — the quiz will pick it up anyway.</div>' +
    '<div style="margin-top:22px"><button class="btn btn-accent btn-lg" onclick="startQuiz()">' +
    'Next: take the quiz</button>' +
    '<p class="muted" style="margin:10px 0 0;font-size:.85rem">About 20 questions, roughly 10 minutes. ' +
    'You can stop and come back — your progress is saved on this device.</p></div></div></div>';
}
function mini(l, v) {
  return '<div class="card card-pad" style="padding:16px 18px"><div class="muted" style="font-size:.74rem;' +
    'text-transform:uppercase;letter-spacing:.07em;font-weight:700">' + esc(l) + "</div>" +
    '<div style="font-size:1.25rem;font-weight:750;color:var(--heading);margin-top:2px">' + esc(String(v)) + "</div></div>";
}

/* ---------------- quiz ---------------- */
function startQuiz() {
  S.session = buildAssessment(S.track, S.parsed);
  S.quizState = { q: null, answered: false, choice: null, total: totalPlanned(S.session) };
  S.quizState.q = nextQuestion(S.session);
  go("quiz");
}

function vQuiz() {
  var st = S.quizState;
  if (!st || !st.q) { return vResults(); }
  var q = st.q, d = DOMAIN_BY_ID[q.dom];
  var n = S.session.answers.length + 1;
  var pct = ((n - 1) / st.total) * 100;
  var diffLabel = ["", "Foundational", "Applied", "Advanced"][q.d];

  var opts = q.opts.map(function (o, i) {
    var cls = "opt", tag = "";
    if (st.answered) {
      if (i === q.a) { cls += " right"; tag = '<span class="tag" >Correct</span>'; }
      else if (i === st.choice) { cls += " wrong"; tag = '<span class="tag" >Your answer</span>'; }
    }
    return '<button class="' + cls + '" ' + (st.answered ? "disabled" : 'onclick="answer(' + i + ')"') + ">" +
      tag + esc(o) + "</button>";
  }).join("");

  return '<div class="section"><div class="wrap-narrow">' + stepper(3) +
    '<div class="qcard fadein">' +
      '<div class="qmeta"><span class="pill">' + d.icon + " " + esc(d.name) + "</span>" +
      '<span class="muted">Question ' + n + " of ~" + st.total + ' · <b>' + diffLabel + "</b></span></div>" +
      '<div class="qprog"><i style="width:' + pct + '%"></i></div>' +
      '<div class="qtext">' + esc(q.q) + "</div>" + opts +
      (st.answered ? '<div class="why fadein"><b>' +
        (st.choice === q.a ? "Correct. " : "Not quite. ") + "</b>" + esc(q.why) + "</div>" +
        '<div style="margin-top:18px"><button class="btn btn-accent" onclick="nextQ()">' +
        (nextQuestion(S.session) ? "Next question" : "See my results") + "</button></div>" : "") +
    "</div></div></div>";
}

function answer(i) {
  var st = S.quizState;
  if (st.answered) return;
  st.answered = true; st.choice = i;
  recordAnswer(S.session, st.q, i);
  render();
}
function nextQ() {
  var nx = nextQuestion(S.session);
  if (!nx) {
    S.score = scoreAssessment(S.session, S.parsed, S.track);
    save();
    go("results");
    return;
  }
  S.quizState = { q: nx, answered: false, choice: null, total: S.quizState.total };
  render();
}

/* ---------------- results ---------------- */

/* Plain-language meaning for each 0-4 level, so a number is never shown bare. */
var LEVEL_MEANING = [
  "No evidence yet",
  "You know the basics",
  "You can do it with support",
  "You work independently",
  "You lead and set the standard"
];

function levelName(n) { return LEVELS[n].short; }

/* One bullet row: your level (bar), the role benchmark (tick),
   what your resume claimed (hollow dot), and the shortfall (hatched). */
function bulletRow(d, r) {
  var max = 4;
  var pctHave = (r.level / max) * 100;
  var pctBench = (r.benchmark / max) * 100;
  var pctClaim = (r.claimed / max) * 100;
  var met = r.gap === 0;

  var chip, chipCls;
  if (r.tested === 0 && r.benchmark > 0) { chipCls = "chip-untested"; chip = "— Not tested"; }
  else if (met) { chipCls = "chip-met"; chip = "✓ At the level"; }
  else if (r.gap === 1) { chipCls = "chip-g1"; chip = "▲ 1 level short"; }
  else if (r.gap === 2) { chipCls = "chip-g2"; chip = "▲▲ 2 levels short"; }
  else { chipCls = "chip-g3"; chip = "▲▲▲ " + r.gap + " levels short"; }

  var note;
  if (met) {
    note = "You are at <b>" + levelName(r.level) + "</b>, which is what this role asks for.";
  } else if (r.level === 0) {
    note = "Nothing in your resume or your answers showed this yet. This role needs <b>" +
           levelName(r.benchmark) + "</b>.";
  } else {
    note = "You are at <b>" + levelName(r.level) + "</b>. This role needs <b>" +
           levelName(r.benchmark) + "</b>.";
  }
  if (r.tested === 0 && r.benchmark > 0) {
    note += " We did not test this one, so it is capped until you do.";
  }

  var shortfall = "";
  if (!met) {
    shortfall = '<div class="track-need" style="left:' + pctHave + '%;width:' +
      (pctBench - pctHave) + '%"></div>';
  }

  var title = d.name + " — you: " + levelName(r.level) +
    ", role needs: " + levelName(r.benchmark) +
    ", your resume suggested: " + levelName(r.claimed);

  return '<div class="bullet ' + (met ? "met" : "") + '" title="' + esc(title) + '">' +
    '<div class="bullet-h"><span class="ic">' + d.icon + '</span>' +
    '<span class="nm">' + esc(d.name) + '</span>' +
    '<span class="chip ' + chipCls + '">' + esc(chip) + '</span></div>' +
    '<div class="track-wrap">' +
      '<div class="track-bg"></div>' + shortfall +
      '<div class="track-have" style="width:' + pctHave + '%"></div>' +
      '<div class="track-claim" style="left:' + pctClaim + '%"></div>' +
      '<div class="track-mark" style="left:' + pctBench + '%"></div>' +
    '</div>' +
    '<div class="bullet-f"><span class="bullet-note">' + note + '</span></div>' +
    '</div>';
}

function vResults() {
  var sc = S.score;
  if (!sc) return vGoal();
  var t = TRACK_BY_ID[sc.trackId];
  var path = buildPath(sc);

  var scored = DOMAINS.filter(function (d) { return sc.domains[d.id].benchmark > 0; });
  var met = scored.filter(function (d) { return sc.domains[d.id].gap === 0; });
  var short = scored.filter(function (d) { return sc.domains[d.id].gap > 0; });
  var sorted = scored.slice().sort(function (a, b) {
    return sc.domains[b.id].gap - sc.domains[a.id].gap ||
           sc.domains[b.id].benchmark - sc.domains[a.id].benchmark;
  });
  var biggest = short.length ? sorted[0] : null;

  /* What the assessment changed about the resume's story. */
  var moved = scored.filter(function (d) {
    var r = sc.domains[d.id];
    return r.demonstrated !== null && r.tested > 0 && Math.abs(r.demonstrated - r.claimed) >= 1;
  }).sort(function (a, b) {
    return Math.abs(sc.domains[b.id].demonstrated - sc.domains[b.id].claimed) -
           Math.abs(sc.domains[a.id].demonstrated - sc.domains[a.id].claimed);
  });

  var hrs = Math.max(1, Math.round(path.minutes / 60));

  var plain = met.length === scored.length
    ? "You are already at the level this job needs in every skill area."
    : "You are at the level this job needs in " + met.length + " of " + scored.length +
      " skill areas. " + short.length + " still " + (short.length === 1 ? "needs" : "need") + " work.";

  return '<div class="section"><div class="wrap">' + stepper(4) +

    /* ---- headline ---- */
    '<div class="scorehero fadein">' +
      '<div class="cap">' + esc(t.name) + '</div>' +
      '<div class="big">' + sc.readiness + '%</div>' +
      '<h2>' + esc(sc.band) + '</h2>' +
      '<p style="color:var(--on-dark-2);margin:0;max-width:46ch;margin-inline:auto">' +
      'This is how close you are to what this job needs, across the ' +
      scored.length + ' skill areas it is measured on.</p>' +
    '</div>' +

    /* ---- the four numbers that matter ---- */
    '<div class="tiles">' +
      '<div class="tile ok"><div class="tl">At the level</div><div class="tv">' + met.length +
        ' <span style="font-size:.9rem;color:var(--ink-3);font-weight:600">of ' + scored.length + '</span></div>' +
        '<div class="tn">Ready for this role</div></div>' +
      '<div class="tile gap"><div class="tl">Needs work</div><div class="tv">' + short.length + '</div>' +
        '<div class="tn">' + (short.length ? 'Covered by your learning path' : 'Nothing outstanding') + '</div></div>' +
      '<div class="tile"><div class="tl">Biggest gap</div><div class="tv" style="font-size:1.02rem;line-height:1.3">' +
        (biggest ? esc(biggest.name) : '—') + '</div>' +
        '<div class="tn">' + (biggest ? sc.domains[biggest.id].gap + ' levels to close' : 'None') + '</div></div>' +
      '<div class="tile"><div class="tl">Study time</div><div class="tv">' + hrs + 'h</div>' +
        '<div class="tn">' + path.cpd + ' CPD hours</div></div>' +
    '</div>' +

    '<div class="notice notice-info" style="margin-bottom:22px"><b>What this means.</b> ' + esc(plain) +
    ' Your answers were compared with what this job needs, not with other people.</div>' +

    /* ---- the gap chart ---- */
    '<div class="card card-pad">' +
      '<h3 style="margin-bottom:4px">Where you stand, skill area by skill area</h3>' +
      '<p class="muted" style="font-size:.87rem">Ordered by how much work each one needs. ' +
      'Every skill area is rated on the same five-point scale.</p>' +
      '<div class="scalekey">' +
        LEVELS.map(function (l, i) {
          return '<span><b>' + i + '</b> ' + esc(l.short) + '</span>';
        }).join('') +
      '</div>' +
      sorted.map(function (d) { return bulletRow(d, sc.domains[d.id]); }).join('') +
      '<div class="marks-key">' +
        '<span><i class="mk-bar"></i>Your verified level</span>' +
        '<span><i class="mk-tick"></i>What this role needs</span>' +
        '<span><i class="mk-claim"></i>What your resume suggested</span>' +
        '<span><i class="mk-need"></i>The gap to close</span>' +
      '</div>' +
    '</div>' +

    /* ---- shape at a glance + the honesty check ---- */
    '<div class="grid g2" style="align-items:start;margin-top:20px">' +
      '<div class="card card-pad"><h3>Your profile at a glance</h3>' +
      '<p class="muted" style="font-size:.86rem">The further the shape reaches, the stronger you are. ' +
      'Where the solid shape sits inside the dashed outline, there is a gap.</p>' +
      '<div class="radar-wrap">' + radarSVG(sc, 330) + '</div>' +
      '<div class="marks-key" style="justify-content:center">' +
        '<span><i class="mk-bar"></i>You</span>' +
        '<span><i class="mk-need"></i>This role needs</span></div></div>' +

      '<div class="card card-pad"><h3>Resume vs assessment</h3>' +
      '<p class="muted" style="font-size:.86rem">A resume is a claim. The assessment is the check. ' +
      'Here is where the two disagreed.</p>' +
      (moved.length
        ? '<div class="reality">' + moved.slice(0, 6).map(function (d) {
            var r = sc.domains[d.id];
            var diff = r.demonstrated - r.claimed;
            var over = diff < 0;
            return '<div class="reality-row"><span class="d">' + d.icon + ' ' + esc(d.name) + '</span>' +
              '<span class="muted" style="font-size:.79rem">Resume: ' + levelName(r.claimed) +
              ' → Tested: ' + levelName(r.demonstrated) + '</span>' +
              '<span class="delta ' + (over ? 'over' : 'under') + '">' +
              (over ? '▼ ' + Math.abs(diff) + ' lower' : '▲ ' + diff + ' higher') + '</span></div>';
          }).join('') + '</div>' +
          '<p class="muted" style="font-size:.82rem;margin:12px 0 0">' +
          'Lower means the assessment did not back up what the resume implied. ' +
          'Higher means you know more than your resume says — worth rewriting.</p>'
        : '<div class="notice">Your assessment results lined up with what your resume claimed ' +
          'in every area. That is a good sign: the document represents you accurately.</div>') +
      '</div>' +
    '</div>' +

    /* ---- what happens next ---- */
    '<div class="card card-pad" style="margin-top:20px">' +
      '<h3>What to do next</h3>' +
      (path.recs.length
        ? '<p class="muted">We picked <b>' + path.recs.length + ' courses</b> that close the gaps above, ' +
          'in the order that gets you to the benchmark fastest. That is <b>' + path.lessons +
          ' lessons</b>, roughly <b>' + hrs + ' hours</b>, worth <b>' + path.cpd + ' CPD hours</b>.</p>'
        : '<p class="muted">You have no outstanding gaps for this role. Browse the full catalogue ' +
          'to go deeper, or reassess against a more senior track.</p>') +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
      '<button class="btn btn-accent btn-lg" onclick="go(\'path\')">' +
      (path.recs.length ? 'Show me my learning path' : 'Browse the catalogue') + '</button>' +
      (S.confirmReset
        ? '<span class="confirmbar">Clear your assessment, scores and lesson progress? ' +
          '<button class="btn btn-sm" style="background:var(--err-500)" onclick="resetAll()">Yes, clear it</button> ' +
          '<button class="btn btn-ghost btn-sm" onclick="cancelReset()">Cancel</button></span>'
        : '<button class="btn btn-ghost" onclick="askReset()">Start over</button>') +
      '</div>' +
    '</div></div></div>';
}

/* ---------------- learning path ---------------- */
function courseProgress(c) {
  var done = 0;
  c.modules.forEach(function (m) { m.lessons.forEach(function (l) { if (S.progress[l.uid]) done++; }); });
  return { done: done, total: c.lessonCount, pct: c.lessonCount ? (done / c.lessonCount) * 100 : 0 };
}

function vPath() {
  var sc = S.score;
  if (!sc) return vGoal();
  var path = buildPath(sc);
  var t = TRACK_BY_ID[sc.trackId];

  var totalDone = 0;
  path.recs.forEach(function (r) { totalDone += courseProgress(r.course).done; });

  var cards = path.recs.map(function (r, i) {
    var pr = courseProgress(r.course);
    return '<div class="coursecard"><div class="coursecard-h">' +
      '<span class="ic">' + r.domain.icon + "</span><div style='flex:1;min-width:0'>" +
      '<div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:5px">' +
      '<span class="pill prio' + (i < 2 ? "-1" : i < 4 ? "-2" : "-3") + '">Priority ' + (i + 1) + "</span>" +
      '<span class="pill">' + r.course.cpd + " CPD hrs</span>" +
      '<span class="pill">' + r.course.lessonCount + " lessons</span></div>" +
      "<h3>" + esc(r.course.title) + "</h3><p>" + esc(r.course.blurb) + "</p>" +
      '<div class="muted" style="font-size:.82rem">Closes a ' + r.gap + "-level gap in " +
      esc(r.domain.name) + " (" + LEVELS[r.result.level].short + " → " + LEVELS[r.result.benchmark].short + ")</div>" +
      "</div></div>" +
      '<div class="coursecard-f"><div class="progline"><i style="width:' + pr.pct + '%"></i></div>' +
      '<span class="muted" style="font-size:.8rem;white-space:nowrap">' + pr.done + "/" + pr.total + "</span>" +
      '<button class="btn btn-sm ' + (pr.done ? "btn-ghost" : "btn-accent") + '" onclick="openCourse(\'' +
      r.course.id + '\')">' + (pr.done ? (pr.done === pr.total ? "Review" : "Continue") : "Start") + "</button></div></div>";
  }).join("");

  var other = COURSES.filter(function (c) {
    return !path.recs.some(function (r) { return r.course.id === c.id; });
  });

  return '<div class="section"><div class="wrap">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:6px">' +
    "<div><h2 style='margin-bottom:4px'>Your learning path</h2>" +
    '<p class="muted" style="margin:0">Sequenced for <b>' + esc(t.name) + "</b> · " +
    totalDone + " of " + path.lessons + " lessons complete</p></div>" +
    '<button class="btn btn-ghost btn-sm" onclick="go(\'results\')">Back to results</button></div>' +
    '<div class="progline" style="height:8px;margin:14px 0 26px"><i style="width:' +
    (path.lessons ? (totalDone / path.lessons) * 100 : 0) + '%"></i></div>' +
    '<div class="grid" style="gap:16px">' + cards + "</div>" +

    (other.length ? '<div class="divider" style="margin:34px 0 22px"></div>' +
      "<h3>Also in the catalogue</h3>" +
      '<p class="muted" style="font-size:.88rem">Not prioritized for your current goal, but open to members.</p>' +
      '<div class="grid g2" style="margin-top:14px">' + other.map(function (c) {
        var d = DOMAIN_BY_ID[c.dom];
        return '<div class="card card-pad" style="display:flex;gap:12px;align-items:flex-start">' +
          '<span style="font-size:1.3rem">' + d.icon + "</span><div style='flex:1'>" +
          "<h3 style='font-size:.97rem;margin-bottom:3px'>" + esc(c.title) + "</h3>" +
          '<p class="muted" style="font-size:.84rem;margin:0 0 8px">' + c.lessonCount + " lessons · " + c.cpd + " CPD hrs</p>" +
          '<button class="btn btn-ghost btn-sm" onclick="openCourse(\'' + c.id + '\')">Open</button></div></div>';
      }).join("") + "</div>" : "") +
    "</div></div>";
}

function openCourse(id) {
  var c = COURSE_BY_ID[id];
  var target = null;
  c.modules.forEach(function (m) {
    m.lessons.forEach(function (l) { if (!target && !S.progress[l.uid]) target = l; });
  });
  if (!target) target = c.modules[0].lessons[0];
  go("lesson", { course: id, lesson: target.uid });
}

/* ---------------- lesson player ---------------- */
function findLesson(uid) {
  var parts = uid.split("::");
  var c = COURSE_BY_ID[parts[0]];
  if (!c) return null;
  var m = c.modules[+parts[1]];
  if (!m) return null;
  return { course: c, module: m, lesson: m.lessons[+parts[2]] };
}
function flatLessons(c) {
  var out = [];
  c.modules.forEach(function (m) { m.lessons.forEach(function (l) { out.push(l); }); });
  return out;
}

function vLesson() {
  var f = findLesson(S.lesson);
  if (!f) return vPath();
  var c = f.course, l = f.lesson;
  var flat = flatLessons(c);
  var idx = flat.findIndex(function (x) { return x.uid === l.uid; });
  var pr = courseProgress(c);
  var st = S.lessonQuiz && S.lessonQuiz.uid === l.uid ? S.lessonQuiz : null;

  var toc = "";
  c.modules.forEach(function (m) {
    toc += '<div class="toc-mod">' + esc(m.title) + "</div>";
    m.lessons.forEach(function (x) {
      toc += '<button class="toc-l ' + (x.uid === l.uid ? "on" : "") + '" onclick="go(\'lesson\',{lesson:\'' +
        x.uid + "'})\">" + '<span class="tick ' + (S.progress[x.uid] ? "done" : "") + '">' +
        (S.progress[x.uid] ? "✓" : "") + "</span><span>" + esc(x.title) + "</span></button>";
    });
  });

  var checkHtml = "";
  if (l.check) {
    var q = l.check;
    var opts = q.opts.map(function (o, i) {
      var cls = "opt", tag = "";
      if (st && st.answered) {
        if (i === q.a) { cls += " right"; tag = '<span class="tag" >Correct</span>'; }
        else if (i === st.choice) { cls += " wrong"; tag = '<span class="tag" >Your answer</span>'; }
      }
      return '<button class="' + cls + '" ' + (st && st.answered ? "disabled" : 'onclick="lessonAnswer(' + i + ')"') +
        ">" + tag + esc(o) + "</button>";
    }).join("");
    checkHtml = '<div class="divider"></div><h3>Checkpoint</h3>' +
      '<div class="qtext" style="font-size:1rem">' + esc(q.q) + "</div>" + opts +
      (st && st.answered ? '<div class="why fadein"><b>' +
        (st.choice === q.a ? "Correct. " : "Not quite. ") + "</b>" + esc(q.why) + "</div>" : "");
  }

  var doneThis = !!S.progress[l.uid];

  return '<div class="section-sm"><div class="wrap">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">' +
    '<div><div class="muted" style="font-size:.8rem;font-weight:600">' + esc(c.title) + "</div>" +
    '<div style="font-weight:700;color:var(--heading)">' + pr.done + " of " + pr.total + " lessons complete</div></div>" +
    '<button class="btn btn-ghost btn-sm" onclick="go(\'path\')">← Learning path</button></div>' +
    '<div class="progline" style="margin-bottom:20px"><i style="width:' + pr.pct + '%"></i></div>' +

    '<div class="player"><div class="toc">' + toc + "</div>" +
    '<div class="lesson fadein">' +
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">' +
      '<span class="pill">' + esc(f.module.title) + '</span><span class="pill">' + l.mins + " min read</span>" +
      (doneThis ? '<span class="pill pill-teal">✓ Complete</span>' : "") + "</div>" +
      "<h2 style='margin-bottom:18px'>" + esc(l.title) + "</h2>" +
      '<div class="lesson-body">' + l.body + "</div>" +
      '<div class="keypoints"><h4>Key points</h4><ul>' +
      l.keyPoints.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul></div>" +
      checkHtml +
      '<div class="divider"></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
        (idx > 0 ? '<button class="btn btn-ghost" onclick="go(\'lesson\',{lesson:\'' + flat[idx-1].uid + '\'})">← Previous</button>' : "") +
        '<button class="btn btn-accent" onclick="completeLesson(\'' + l.uid + '\',' + idx + ')">' +
        (doneThis ? (idx < flat.length - 1 ? "Next lesson →" : "Finish course") :
                    (idx < flat.length - 1 ? "Mark complete & continue →" : "Mark complete & finish")) + "</button>" +
      "</div></div></div></div></div>";
}

function lessonAnswer(i) {
  var f = findLesson(S.lesson);
  S.lessonQuiz = { uid: f.lesson.uid, answered: true, choice: i };
  render();
}

function completeLesson(uid, idx) {
  S.progress[uid] = true;
  save();
  var f = findLesson(uid);
  var flat = flatLessons(f.course);
  S.lessonQuiz = null;
  if (idx < flat.length - 1) go("lesson", { lesson: flat[idx + 1].uid });
  else {
    go("path");
    toast("Course complete. " + f.course.cpd + " CPD hours logged against your profile.");
  }
}

/* ---------------- pricing ---------------- */
function vPricing() {
  return '<div class="section"><div class="wrap">' +
    '<div class="center" style="margin-bottom:10px">' +
    '<h2>Membership</h2>' +
    '<p class="muted" style="max-width:56ch;margin:0 auto">' +
    'Finding out where you stand costs nothing. You only pay if you want the lessons ' +
    'that close the gaps.</p></div>' +

    /* the one thing people actually want to know, said once, plainly */
    '<div class="card card-pad" style="max-width:720px;margin:0 auto 30px">' +
      '<div class="freepaid">' +
        '<div><div class="fp-h fp-free">✓ Free, no account needed</div><ul class="fp-list">' +
          '<li>Pick your target job</li>' +
          '<li>Resume read and scored</li>' +
          '<li>The full quiz</li>' +
          '<li>Your complete gap report</li>' +
          '<li>The list of lessons that would close each gap</li>' +
          '<li>The first lesson of every course</li>' +
        '</ul></div>' +
        '<div><div class="fp-h fp-paid">Members only</div><ul class="fp-list">' +
          '<li>Every lesson, start to finish</li>' +
          '<li>Checkpoint quizzes and course certificates</li>' +
          '<li>CPD hours logged for you</li>' +
          '<li>Reassess each quarter to see movement</li>' +
        '</ul></div>' +
      '</div>' +
      '<p class="muted" style="margin:16px 0 0;font-size:.86rem">' +
      'In short: the diagnosis is free and always will be. Membership is for the treatment.</p>' +
    '</div>' +

    '<div class="pricegrid">' +
      price("Free", "$0", "forever",
        ["Everything in the assessment",
         "Your full gap report",
         "Your recommended lesson list",
         "First lesson of every course"],
        "Start the assessment", "go('goal')", false) +
      price("Monthly", "$29", "per month, cancel anytime",
        ["Everything in Free",
         "All " + TOTAL_LESSONS + " lessons across " + COURSES.length + " courses",
         "Checkpoint quizzes and certificates",
         "CPD hours logged automatically",
         "Reassess quarterly"],
        "Choose monthly", "demoNote()", true) +
      price("Yearly", "$290", "per year — two months free",
        ["Everything in Monthly",
         "Early access to new courses",
         "Downloadable CPD transcript",
         "Member rate on SCC West workshops"],
        "Choose yearly", "demoNote()", false) +
    '</div>' +

    '<div class="faq">' +
      '<h3 style="margin-bottom:12px">Questions people ask</h3>' +
      faqItem("Do I have to pay to find out where I stand?",
        "No. The assessment, the gap report and the list of lessons you would need are all free. " +
        "You only pay if you want to take the lessons.") +
      faqItem("Do I need an account?",
        "Not for the assessment. Everything is saved in your own browser on this device. " +
        "You would create an account only when you subscribe.") +
      faqItem("What happens to my resume?",
        "It is read in your browser and never sent to a server. Close the tab and it is gone.") +
      faqItem("How long does the whole thing take?",
        "About fifteen minutes: a few seconds to pick a job, a minute for your resume, " +
        "and roughly ten minutes for the quiz.") +
      faqItem("Is this the SCMP designation?",
        "No. This is a self-assessment and development tool. It is not a credential and it is " +
        "not part of the SCMP designation process.") +
      faqItem("Can I do it again later?",
        "Yes. Reassess any time to see whether the lessons moved your levels, or run it against " +
        "a more senior job to see what that would take.") +
    '</div>' +
    '</div></div>';
}

function faqItem(q, a) {
  return '<details class="faq-q"><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>';
}

function price(name, amt, per, feats, cta, action, feat) {
  return '<div class="price ' + (feat ? "feat" : "") + '">' +
    (feat ? '<span class="pill pill-teal" style="margin-bottom:10px">Most popular</span><br>' : "") +
    "<h3>" + esc(name) + '</h3><div class="amt">' + esc(amt) + '</div><div class="per">' + esc(per) + "</div>" +
    "<ul>" + feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
    '<button class="btn ' + (feat ? "btn-accent" : "btn-ghost") + '" style="width:100%" onclick="' + action + '">' +
    esc(cta) + "</button></div>";
}

function demoNote() {
  toast("This is a prototype, so payment is not connected yet. In the live version this would open Stripe Checkout and link to your Supply Chain Canada West member record.");
}

/* ---------------- render ---------------- */
function render() {
  var body = "";
  switch (S.view) {
    case "home": body = vHome(); break;
    case "goal": body = vGoal(); break;
    case "upload": body = vUpload(); break;
    case "skills": body = vSkills(); break;
    case "quiz": body = vQuiz(); break;
    case "results": body = vResults(); break;
    case "path": body = vPath(); break;
    case "lesson": body = vLesson(); break;
    case "pricing": body = vPricing(); break;
    default: body = vHome();
  }
  el("app").innerHTML = topbar() + body + footer();
  if (S.view === "upload") wireDrop();
}

function wireDrop() {
  var d = el("drop");
  if (!d) return;
  ["dragenter","dragover"].forEach(function (e) {
    d.addEventListener(e, function (ev) { ev.preventDefault(); d.classList.add("over"); });
  });
  ["dragleave","drop"].forEach(function (e) {
    d.addEventListener(e, function (ev) { ev.preventDefault(); d.classList.remove("over"); });
  });
  d.addEventListener("drop", function (ev) {
    if (ev.dataTransfer.files && ev.dataTransfer.files[0]) {
      onFile({ target: { files: ev.dataTransfer.files } });
    }
  });
}

load();
render();
