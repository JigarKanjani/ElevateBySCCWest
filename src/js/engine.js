/* Elevate engine: resume parsing, scoring, path generation */

function loadScript(src) {
  return new Promise(function (res, rej) {
    if (document.querySelector('script[src="' + src + '"]')) return res();
    var s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = function () { rej(new Error("load failed")); };
    document.head.appendChild(s);
  });
}

async function extractTextFromFile(file) {
  var name = (file.name || "").toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv") || file.type === "text/plain") {
    return await file.text();
  }
  if (name.endsWith(".docx")) {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js");
    var buf = await file.arrayBuffer();
    var r = await window.mammoth.extractRawText({ arrayBuffer: buf });
    return r.value || "";
  }
  if (name.endsWith(".pdf")) {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    var ab = await file.arrayBuffer();
    var pdf = await window.pdfjsLib.getDocument({ data: ab }).promise;
    var out = [];
    for (var i = 1; i <= pdf.numPages; i++) {
      var pg = await pdf.getPage(i);
      var tc = await pg.getTextContent();
      out.push(tc.items.map(function (it) { return it.str; }).join(" "));
    }
    return out.join("\n");
  }
  if (name.endsWith(".doc")) {
    throw new Error("Legacy .doc files are not supported. Save as .docx or paste the text below.");
  }
  return await file.text();
}

function splitSentences(text) {
  return text
    .split(/\n+|(?<=[.;])\s+/)
    .map(function (s) { return s.replace(/\s+/g, " ").trim(); })
    .filter(function (s) { return s.length > 12; });
}

function parseResume(text) {
  var lower = text.toLowerCase();
  var sentences = splitSentences(text);

  var seniority = 0, seniorityLabel = "Entry level";
  SENIORITY_SIGNALS.forEach(function (s) {
    if (s.re.test(text) && s.weight >= seniority) { seniority = s.weight; seniorityLabel = s.label; }
  });

  var creds = [];
  CREDENTIALS.forEach(function (c) { if (c.re.test(text)) creds.push(c); });

  var years = 0;
  var yrMatch = text.match(/(\d{1,2})\+?\s*years?\s+(of\s+)?experience/i);
  if (yrMatch) years = parseInt(yrMatch[1], 10);
  if (!years) {
    var yrs = (text.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
    if (yrs.length >= 2) {
      var mn = Math.min.apply(null, yrs), mx = Math.max.apply(null, yrs);
      var nowY = new Date().getFullYear();
      if (mx > nowY) mx = nowY;
      if (mn > 1970 && mx - mn > 0 && mx - mn < 50) years = mx - mn;
    }
  }

  var domains = {};
  DOMAINS.forEach(function (d) {
    var hits = [];
    var evidence = [];
    d.keywords.forEach(function (kw) {
      var re = new RegExp("(^|[^a-z0-9])" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z0-9]|$)", "i");
      if (re.test(lower)) hits.push(kw);
    });
    sentences.forEach(function (s) {
      var sl = s.toLowerCase();
      var matched = hits.filter(function (k) { return sl.indexOf(k) !== -1; });
      if (matched.length) {
        evidence.push({ text: s, n: matched.length, owned: OWNERSHIP_VERBS.test(s) });
      }
    });
    evidence.sort(function (a, b) { return (b.owned - a.owned) || (b.n - a.n); });

    var unique = hits.length;
    var owned = evidence.filter(function (e) { return e.owned; }).length;

    var lvl;
    if (unique === 0) lvl = 0;
    else if (unique <= 2) lvl = 1;
    else if (unique <= 5) lvl = 2;
    else if (unique <= 9) lvl = 3;
    else lvl = 4;

    if (lvl > 0 && owned >= 3) lvl = Math.min(4, lvl + 1);
    if (lvl >= 2 && owned === 0) lvl = lvl - 1;
    if (lvl > 0 && seniority >= 2) lvl = Math.min(4, lvl + (seniority >= 3 ? 1 : 0));

    creds.forEach(function (c) {
      if (c.domains.indexOf(d.id) !== -1 && lvl > 0) lvl = Math.min(4, lvl + c.boost);
    });

    domains[d.id] = {
      claimed: lvl,
      hits: hits,
      evidence: evidence.slice(0, 3).map(function (e) { return e.text; })
    };
  });

  return {
    seniority: seniority,
    seniorityLabel: seniorityLabel,
    credentials: creds.map(function (c) { return c.name; }),
    years: years,
    domains: domains,
    wordCount: text.split(/\s+/).filter(Boolean).length
  };
}

function buildAssessment(trackId, parsed) {
  var track = TRACK_BY_ID[trackId];
  var ranked = DOMAINS.slice().sort(function (a, b) {
    var ba = track.benchmark[a.id] || 0, bb = track.benchmark[b.id] || 0;
    if (bb !== ba) return bb - ba;
    var ca = parsed ? parsed.domains[a.id].claimed : 0;
    var cb = parsed ? parsed.domains[b.id].claimed : 0;
    return cb - ca;
  });
  var plan = [];
  ranked.slice(0, 7).forEach(function (d) { plan.push({ dom: d.id, n: 3 }); });
  ranked.slice(7).forEach(function (d) { plan.push({ dom: d.id, n: 1 }); });
  return { trackId: trackId, plan: plan, asked: [], answers: [], di: 0, qi: 0, curDiff: 2 };
}

function nextQuestion(sess) {
  while (sess.di < sess.plan.length) {
    var step = sess.plan[sess.di];
    if (sess.qi >= step.n) { sess.di++; sess.qi = 0; sess.curDiff = 2; continue; }
    var pool = (QUESTIONS_BY_DOMAIN[step.dom] || []).filter(function (q) {
      return sess.asked.indexOf(q.id) === -1;
    });
    if (!pool.length) { sess.di++; sess.qi = 0; sess.curDiff = 2; continue; }
    pool.sort(function (a, b) {
      return Math.abs(a.d - sess.curDiff) - Math.abs(b.d - sess.curDiff);
    });
    return pool[0];
  }
  return null;
}

function recordAnswer(sess, q, choice) {
  sess.asked.push(q.id);
  sess.answers.push({ id: q.id, dom: q.dom, d: q.d, choice: choice, correct: choice === q.a });
  sess.qi++;
  if (choice === q.a) sess.curDiff = Math.min(3, sess.curDiff + 1);
  else sess.curDiff = Math.max(1, sess.curDiff - 1);
}

function totalPlanned(sess) {
  return sess.plan.reduce(function (n, s) {
    var avail = (QUESTIONS_BY_DOMAIN[s.dom] || []).length;
    return n + Math.min(s.n, avail);
  }, 0);
}

function scoreAssessment(sess, parsed, trackId) {
  var track = TRACK_BY_ID[trackId];
  var byDom = {};
  sess.answers.forEach(function (a) {
    if (!byDom[a.dom]) byDom[a.dom] = { wc: 0, wt: 0, n: 0, right: 0, maxRight: 0, missedEasy: false };
    var w = a.d;
    byDom[a.dom].wt += w;
    byDom[a.dom].n++;
    if (a.correct) {
      byDom[a.dom].wc += w;
      byDom[a.dom].right++;
      byDom[a.dom].maxRight = Math.max(byDom[a.dom].maxRight, a.d);
    } else if (a.d === 1) {
      byDom[a.dom].missedEasy = true;
    }
  });

  var result = {};
  DOMAINS.forEach(function (d) {
    var claimed = parsed ? parsed.domains[d.id].claimed : 0;
    var s = byDom[d.id];
    var demonstrated = null, verified;

    if (s && s.n > 0) {
      var ratio = s.wt ? s.wc / s.wt : 0;
      var base = ratio * 4;
      if (s.maxRight >= 3) base = Math.max(base, 3);
      if (s.missedEasy) base = Math.min(base, 1.6);
      demonstrated = Math.max(0, Math.min(4, Math.round(base)));
      verified = Math.round(0.35 * claimed + 0.65 * demonstrated);
    } else {
      verified = Math.min(claimed, 2);
    }
    verified = Math.max(0, Math.min(4, verified));

    var bench = track.benchmark[d.id] || 0;
    result[d.id] = {
      claimed: claimed,
      demonstrated: demonstrated,
      level: verified,
      benchmark: bench,
      gap: Math.max(0, bench - verified),
      tested: s ? s.n : 0,
      right: s ? s.right : 0
    };
  });

  var num = 0, den = 0;
  DOMAINS.forEach(function (d) {
    var r = result[d.id];
    if (r.benchmark > 0) {
      num += r.benchmark * Math.min(r.level / r.benchmark, 1);
      den += r.benchmark;
    }
  });
  var readiness = den ? Math.round((num / den) * 100) : 0;
  var correct = sess.answers.filter(function (a) { return a.correct; }).length;

  return {
    trackId: trackId,
    domains: result,
    readiness: readiness,
    correct: correct,
    total: sess.answers.length,
    band: readiness >= 85 ? "Role ready" :
          readiness >= 70 ? "Nearly ready" :
          readiness >= 50 ? "Developing" : "Early stage"
  };
}

function buildPath(score) {
  var recs = [];
  COURSES.forEach(function (c) {
    var r = score.domains[c.dom];
    if (!r) return;
    var priority = r.gap * (r.benchmark || 1);
    var relevant = r.gap > 0 && c.level[1] >= r.level;
    if (!relevant) return;
    if (c.level[0] > r.level + 1) return;
    recs.push({ course: c, priority: priority, gap: r.gap, domain: DOMAIN_BY_ID[c.dom], result: r });
  });
  recs.sort(function (a, b) { return b.priority - a.priority; });

  var lessons = recs.reduce(function (n, r) { return n + r.course.lessonCount; }, 0);
  var cpd = recs.reduce(function (n, r) { return n + r.course.cpd; }, 0);
  var mins = 0;
  recs.forEach(function (r) {
    r.course.modules.forEach(function (m) {
      m.lessons.forEach(function (l) { mins += l.mins; });
    });
  });
  return { recs: recs, lessons: lessons, cpd: cpd, minutes: mins };
}

function esc2(t) { return String(t).replace(/[&<>"]/g, function (c) {
  return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

function radarSVG(score, size) {
  size = size || 340;
  var cx = size / 2, cy = size / 2, R = size * 0.34;
  var doms = DOMAINS.filter(function (d) { return (score.domains[d.id].benchmark || 0) > 0; });
  var n = doms.length;
  function pt(i, v) {
    var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
    var r = (v / 4) * R;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  }
  function poly(vals) {
    return vals.map(function (v, i) { return pt(i, v).join(","); }).join(" ");
  }
  var rings = "";
  [1, 2, 3, 4].forEach(function (lv) {
    rings += '<polygon points="' + poly(doms.map(function () { return lv; })) +
      '" class="rx-ring" fill="none" stroke-width="1"/>';
  });
  var spokes = "";
  doms.forEach(function (d, i) {
    var p = pt(i, 4);
    spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] +
      '" class="rx-spoke" stroke-width="1"/>';
  });
  var benchPts = poly(doms.map(function (d) { return score.domains[d.id].benchmark; }));
  var youPts = poly(doms.map(function (d) { return score.domains[d.id].level; }));
  var labels = "";
  doms.forEach(function (d, i) {
    var p = pt(i, 4.62);
    var anchor = Math.abs(p[0] - cx) < 12 ? "middle" : (p[0] > cx ? "start" : "end");
    var name = d.name.split(" ")[0];
    if (d.id === "fin") name = "Finance";
    if (d.id === "lead") name = "Leadership";
    if (d.id === "esg") name = "ESG";
    if (d.id === "dig") name = "Digital";
    if (d.id === "inv") name = "Inventory";
    if (d.id === "ops") name = "Operations";
    if (d.id === "cont") name = "Contracts";
    if (d.id === "nego") name = "Negotiation";
    if (d.id === "logi") name = "Logistics";
    if (d.id === "proc") name = "Procurement";
    labels += '<text x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="' + anchor +
      '" class="rx-label" font-size="10.5" font-weight="600">' + name + '</text>';
  });
  var pad = 58;
  return '<svg viewBox="' + (-pad) + ' -8 ' + (size + pad * 2) + " " + (size + 16) +
    '" width="100%" style="max-width:' + (size + pad) + 'px" role="img" aria-label="' +
    esc2("Competency profile: " + doms.map(function (d) {
      var r = score.domains[d.id];
      return d.name + " at level " + r.level + " of " + r.benchmark + " required";
    }).join("; ")) + '">' +
    rings + spokes +
    '<polygon points="' + benchPts + '" class="rx-bench" stroke-width="1.8" stroke-dasharray="5 4"/>' +
    '<polygon points="' + youPts + '" class="rx-you" stroke-width="2.4"/>' +
    labels + '</svg>';
}
