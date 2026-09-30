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
      '<span class="brand-mark">E</span>' +
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
  var steps = [["Goal", "goal"], ["Resume", "upload"], ["Skills", "skills"], ["Assessment", "quiz"], ["Results", "results"]];
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
    '<b>Elevate</b> &nbsp;·&nbsp; A competency assessment and learning concept for Supply Chain Canada West<br>' +
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
    '<p class="lede">Elevate measures your supply chain competencies against the role you actually want, ' +
    'verifies what your resume claims, and builds a learning path from the gap. Built on the competency ' +
    'framework behind the profession in Canada.</p>' +
    '<a class="btn btn-accent btn-lg" onclick="go(\'goal\')">Start my assessment</a> ' +
    '<a class="btn btn-ghost btn-lg" style="color:#fff;border-color:rgba(255,255,255,.28)" onclick="go(\'pricing\')">See membership</a>' +
    '<div class="hero-stats">' +
      '<div class="hero-stat"><div class="n">10</div><div class="l">Competency domains</div></div>' +
      '<div class="hero-stat"><div class="n">6</div><div class="l">Career tracks</div></div>' +
      '<div class="hero-stat"><div class="n">' + TOTAL_LESSONS + '</div><div class="l">Micro-lessons</div></div>' +
      '<div class="hero-stat"><div class="n">' + totalQ + '</div><div class="l">Assessment items</div></div>' +
    "</div></div></div>" +

    '<div class="section"><div class="wrap">' +
    '<h2 class="center">How it works</h2>' +
    '<p class="center muted" style="max-width:56ch;margin:0 auto 32px">Four steps, about fifteen minutes. ' +
    'The output is a gap report you can act on, not a score you file away.</p>' +
    '<div class="grid g2">' +
      card("1 · Choose your goal", "Pick the role you are working toward. Every track carries its own competency benchmark, so the bar you are measured against is the one that matters to you.") +
      card("2 · Upload your resume", "Elevate parses your experience, maps it to ten competency domains, and shows you the evidence it found for each. You can correct anything it misread.") +
      card("3 · Prove it", "An adaptive assessment tests what your resume claims. Difficulty rises when you answer well and falls when you do not, so it finds your real level quickly.") +
      card("4 · Get your path", "Your verified level is compared to the benchmark. The gap generates a sequenced learning path with CPD hours attached.") +
    "</div></div></div>" +

    '<div class="section" style="background:var(--paper)"><div class="wrap">' +
    '<div class="grid g2" style="align-items:center;gap:40px">' +
      "<div><h2>Your resume says. The assessment knows.</h2>" +
      "<p>Most skills platforms read a resume and take it at face value. Elevate treats it as a claim to be tested. " +
      "You get two numbers for every competency: what your experience suggests, and what you demonstrated.</p>" +
      "<p>The gap between them is the most useful thing in the whole report, and it is what makes the learning " +
      "path worth following rather than generic.</p></div>" +
      '<div class="card card-pad">' +
        '<div class="skillrow"><span class="ic">\u{1F4D1}</span><div class="nm"><b>Contract Management</b>' +
        '<small>Resume evidence: strong</small></div><div class="bar"><i style="width:92%"></i></div></div>' +
        '<div class="skillrow"><span class="ic">✅</span><div class="nm"><b>Demonstrated in assessment</b>' +
        '<small>2 of 3 correct, one advanced item missed</small></div><div class="bar"><i style="width:58%;background:linear-gradient(90deg,#F5A524,#FFBC4D)"></i></div></div>' +
        '<div class="notice" style="margin-top:16px"><b>Verified level: Developing.</b> ' +
        "Exposure is broad but risk allocation and remedy design are not yet secure. Two courses close this.</div>" +
      "</div>" +
    "</div></div></div>" +

    '<div class="section"><div class="wrap center">' +
    "<h2>Ten domains built for Canadian supply chain</h2>" +
    '<p class="muted" style="max-width:58ch;margin:0 auto 26px">Including public procurement under CFTA and NWPTA, ' +
    "CUSMA rules of origin, and Bill S-211 forced labour reporting. Content no global platform covers.</p>" +
    '<div class="grid g3" style="text-align:left">' +
    DOMAINS.map(function (d) {
      return '<div class="card card-pad"><div style="font-size:1.5rem;margin-bottom:6px">' + d.icon + "</div>" +
        "<h3 style='font-size:.99rem'>" + esc(d.name) + "</h3>" +
        '<p class="muted" style="margin:0">' + esc(d.blurb) + "</p></div>";
    }).join("") +
    "</div>" +
    '<div style="margin-top:34px"><a class="btn btn-accent btn-lg" onclick="go(\'goal\')">Start my assessment</a></div>' +
    "</div></div>";
}
function card(t, b) {
  return '<div class="card card-pad"><h3>' + esc(t) + "</h3><p class='muted' style='margin:0'>" + esc(b) + "</p></div>";
}

function vGoal() {
  return '<div class="section"><div class="wrap">' + stepper(0) +
    "<h2>What are you working toward?</h2>" +
    '<p class="muted" style="max-width:58ch">Each track carries a different competency benchmark. ' +
    'Pick the role you want next, not the one you hold now.</p>' +
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
    ' onclick="go(\'upload\')">Continue</button></div>' +
    "</div></div>";
}
function pickTrack(id) { S.track = id; save(); render(); }

function vUpload() {
  var t = TRACK_BY_ID[S.track];
  return '<div class="section"><div class="wrap-narrow">' + stepper(1) +
    "<h2>Add your resume</h2>" +
    '<p class="muted">Targeting <b>' + esc(t.name) + '</b>. Your resume is parsed in your browser and never leaves this device.</p>' +
    '<div class="drop" id="drop" onclick="document.getElementById(\'file\').click()">' +
      '<div class="ic">\u{1F4C4}</div><b>Drop a file or click to browse</b>' +
      '<div class="muted" style="margin-top:5px">PDF, Word (.docx) or plain text</div>' +
      '<input type="file" id="file" class="hidden" accept=".pdf,.docx,.txt,.md" onchange="onFile(event)">' +
    "</div>" +
    '<div id="filestatus" style="margin-top:12px"></div>' +
    '<div class="divider"></div>' +
    '<label class="muted" style="display:block;margin-bottom:7px;font-weight:600">Or paste the text</label>' +
    '<textarea class="resume" id="rtext" placeholder="Paste your resume text here…">' + esc(S.resumeText) + "</textarea>" +
    '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-accent" onclick="doParse()">Analyze my resume</button>' +
      '<button class="btn btn-ghost" onclick="useSample()">Use a sample resume</button>' +
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
    "<h2>What your resume claims</h2>" +
    '<p class="muted">This is evidence found in your text, not a verified level. The assessment tests it next.</p>' +
    '<div class="grid g3" style="margin:20px 0">' +
      mini("Experience", p.years ? p.years + " yrs" : "—") +
      mini("Seniority signal", p.seniorityLabel) +
      mini("Credentials", p.credentials.length ? p.credentials.length : "None found") +
    "</div>" +
    (p.credentials.length ? '<div style="margin-bottom:16px">' + p.credentials.map(function (c) {
      return '<span class="pill pill-navy" style="margin-right:6px">' + esc(c) + "</span>"; }).join("") + "</div>" : "") +
    '<div class="card card-pad">' + rows + "</div>" +
    '<div class="notice" style="margin-top:18px"><b>Anything look wrong?</b> ' +
    'Resume parsing reads what is written, so a skill you have but never described will show as missing. ' +
    'You can <a href="#" onclick="go(\'upload\');return false">go back and edit your text</a>, or let the assessment sort it out.</div>' +
    '<div style="margin-top:22px"><button class="btn btn-accent btn-lg" onclick="startQuiz()">' +
    "Start the assessment</button></div></div></div>";
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
      if (i === q.a) { cls += " right"; tag = '<span class="tag" style="color:var(--teal-600)">Correct</span>'; }
      else if (i === st.choice) { cls += " wrong"; tag = '<span class="tag" style="color:var(--rose-500)">Your answer</span>'; }
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
function vResults() {
  var sc = S.score;
  if (!sc) return vGoal();
  var t = TRACK_BY_ID[sc.trackId];
  var path = buildPath(sc);

  var gapRows = DOMAINS.filter(function (d) { return sc.domains[d.id].benchmark > 0; })
    .sort(function (a, b) { return sc.domains[b.id].gap - sc.domains[a.id].gap ||
                                   sc.domains[b.id].benchmark - sc.domains[a.id].benchmark; })
    .map(function (d) {
      var r = sc.domains[d.id];
      var bars = "";
      for (var i = 1; i <= 4; i++) {
        var cls = i <= r.level ? "has" : (i <= r.benchmark ? "need" : "");
        bars += '<i class="' + cls + '"></i>';
      }
      var note;
      if (r.gap === 0) note = "At the level this role requires.";
      else note = "Needs " + r.gap + " level" + (r.gap > 1 ? "s" : "") + " to reach " + LEVELS[r.benchmark].short + ".";
      var verify = "";
      if (r.tested > 0 && r.demonstrated !== null) {
        if (r.demonstrated < r.claimed - 1) verify = " Resume suggested " + LEVELS[r.claimed].short +
          ", assessment showed " + LEVELS[r.demonstrated].short + ".";
        else if (r.demonstrated > r.claimed) verify = " You scored above what your resume showed.";
      } else if (r.tested === 0) {
        verify = " Not directly tested, so this is capped until assessed.";
      }
      return '<div class="gaprow"><div class="gaphead"><span class="ic">' + d.icon + "</span>" +
        "<b>" + esc(d.name) + "</b>" +
        '<span class="pill ' + (r.gap === 0 ? "pill-teal" : r.gap >= 2 ? "pill-rose" : "pill-amber") + '">' +
        LEVELS[r.level].short + " / " + LEVELS[r.benchmark].short + "</span></div>" +
        '<div class="levelbar">' + bars + "</div>" +
        '<div class="levelnote">' + esc(note + verify) + "</div></div>";
    }).join("");

  return '<div class="section"><div class="wrap">' + stepper(4) +
    '<div class="scorehero fadein">' +
      '<div class="cap">Role readiness · ' + esc(t.name) + "</div>" +
      '<div class="big">' + sc.readiness + "%</div>" +
      "<h2>" + esc(sc.band) + "</h2>" +
      '<p style="color:#A9C2D4;margin:0">You answered ' + sc.correct + " of " + sc.total +
      " assessment items correctly across " + DOMAINS.length + " competency domains.</p>" +
    "</div>" +

    '<div class="grid g2" style="align-items:start">' +
      '<div class="card card-pad"><h3>Your profile against the benchmark</h3>' +
      '<div class="radar-wrap">' + radarSVG(sc, 330) + "</div>" +
      '<div class="center muted" style="font-size:.8rem">' +
      '<span style="color:var(--teal-600);font-weight:700">■</span> Your verified level &nbsp; ' +
      '<span style="color:var(--amber-500);font-weight:700">▨</span> Role benchmark</div></div>' +

      '<div class="card card-pad"><h3>Where the gaps are</h3>' + gapRows + "</div>" +
    "</div>" +

    '<div class="card card-pad" style="margin-top:20px">' +
      "<h3>Your recommended path</h3>" +
      '<p class="muted">Based on your gaps, Elevate has sequenced <b>' + path.recs.length +
      " courses</b> containing <b>" + path.lessons + " lessons</b> (about " +
      Math.round(path.minutes / 60) + " hours) worth <b>" + path.cpd + " CPD hours</b>.</p>" +
      '<button class="btn btn-accent btn-lg" onclick="go(\'path\')">Open my learning path</button> ' +
      (S.confirmReset
        ? '<span class="confirmbar">Clear your assessment, scores and lesson progress? ' +
          '<button class="btn btn-sm" style="background:var(--rose-500)" onclick="resetAll()">Yes, clear it</button> ' +
          '<button class="btn btn-ghost btn-sm" onclick="cancelReset()">Cancel</button></span>'
        : '<button class="btn btn-ghost" onclick="askReset()">Start over</button>') +
    "</div></div></div>";
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
      '<span class="pill ' + (i < 2 ? "pill-rose" : i < 4 ? "pill-amber" : "") + '">Priority ' + (i + 1) + "</span>" +
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
        if (i === q.a) { cls += " right"; tag = '<span class="tag" style="color:var(--teal-600)">Correct</span>'; }
        else if (i === st.choice) { cls += " wrong"; tag = '<span class="tag" style="color:var(--rose-500)">Your answer</span>'; }
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
    '<div class="center" style="margin-bottom:34px">' +
    "<h2>Membership</h2>" +
    '<p class="muted" style="max-width:52ch;margin:0 auto">Assessment is free for everyone. ' +
    "The learning path is a member benefit.</p></div>" +
    '<div class="pricegrid">' +
      price("Free", "$0", "", ["Full competency assessment","Verified gap report","Recommended learning path","First lesson of every course"], "Start assessment", "go('goal')", false) +
      price("Member", "$29", "per month, billed monthly", ["Everything in Free","All " + TOTAL_LESSONS + " lessons across " + COURSES.length + " courses","Checkpoint quizzes and course certificates","CPD hours logged automatically","Reassess quarterly to track progress"], "Choose monthly", "demoNote()", true) +
      price("Member Annual", "$290", "per year · two months free", ["Everything in Member","Priority access to new courses","Downloadable CPD transcript","Member rate on SCC West workshops"], "Choose annual", "demoNote()", false) +
    "</div>" +
    '<div class="notice" style="margin-top:28px">' +
    "<b>Pricing note for the business case.</b> At $29 per month, 200 subscribers is roughly $70K in annual " +
    "recurring revenue against an estimated $8K in run costs. Existing SCC West members could receive a " +
    "discounted or bundled rate, making this a retention tool as much as a revenue line.</div>" +
    "</div></div>";
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
  toast("Prototype: payment is not connected. In production this would go to Stripe Checkout, linked to the member's SCC West record.");
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
