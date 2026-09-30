/* Elevate challenge player: renders each challenge kind and grades it.
 *
 * Every kind is answered by tapping, typing or dragging a value — never by
 * picking one sentence out of four. Two consequences that matter:
 *
 *   - There is no "longest option" or "always B" shortcut, because for most
 *     kinds there are no options at all.
 *   - Partial credit is real. Getting three of four cards in the right bucket
 *     is worth more than getting none, so the score reflects what someone
 *     actually knows instead of collapsing to right/wrong.
 *
 * State for the in-progress answer lives on S.quizState.resp.
 */

var KIND_META = {
  spot:   { label: "Spot it",        hint: "Tap the line that is the problem." },
  sort:   { label: "Sort them",      hint: "Put every card in a bucket." },
  order:  { label: "Put them in order", hint: "Tap them in the right sequence." },
  number: { label: "Work it out",    hint: "Type your answer." },
  slider: { label: "Place it",       hint: "Drag to where you think it lands." },
  pick:   { label: "Pick two",       hint: "Choose the two that apply." }
};

function respInit(ch) {
  switch (ch.kind) {
    case "sort":   return {};
    case "order":  return [];
    case "pick":   return [];
    case "number": return "";
    case "slider": return Math.round((ch.min + ch.max) / 2 / ch.step) * ch.step;
    default:       return null;
  }
}

/* Is there enough of an answer to submit? */
function respReady(ch, r) {
  switch (ch.kind) {
    case "spot":   return r !== null && r !== undefined;
    case "sort":   return Object.keys(r || {}).length === ch.items.length;
    case "order":  return (r || []).length === ch.items.length;
    case "pick":   return (r || []).length === ch.n;
    case "number": return String(r).trim() !== "" && !isNaN(parseFloat(r));
    case "slider": return true;
  }
  return false;
}

/* Returns 0..1. Partial credit for the kinds where it is meaningful. */
function gradeChallenge(ch, r) {
  switch (ch.kind) {
    case "spot":
      return ch.ok.indexOf(r) > -1 ? 1 : 0;
    case "sort": {
      var hit = 0;
      ch.items.forEach(function (it, i) { if (r[i] === it.bucket) hit++; });
      return hit / ch.items.length;
    }
    case "order": {
      var ok = 0;
      (r || []).forEach(function (idx, pos) { if (idx === pos) ok++; });
      return ok / ch.items.length;
    }
    case "pick": {
      var good = (r || []).filter(function (i) { return ch.correct.indexOf(i) > -1; }).length;
      return good / ch.n;
    }
    case "number": {
      var v = parseFloat(r);
      if (isNaN(v)) return 0;
      var d = Math.abs(v - ch.answer);
      if (d <= ch.tolerance) return 1;
      if (d <= ch.tolerance * 3) return 0.5;
      return 0;
    }
    case "slider": {
      var dd = Math.abs(Number(r) - ch.answer);
      if (dd <= ch.tolerance) return 1;
      if (dd <= ch.tolerance * 2) return 0.5;
      return 0;
    }
  }
  return 0;
}

/* ------------------------------ renderers ----------------------------- */

function renderChallenge(ch, r, answered) {
  switch (ch.kind) {
    case "spot":   return rSpot(ch, r, answered);
    case "sort":   return rSort(ch, r, answered);
    case "order":  return rOrder(ch, r, answered);
    case "pick":   return rPick(ch, r, answered);
    case "number": return rNumber(ch, r, answered);
    case "slider": return rSlider(ch, r, answered);
  }
  return "";
}

function rSpot(ch, r, answered) {
  var d = ch.doc;
  var rows = d.blocks.map(function (b, i) {
    var cls = "docline";
    if (answered) {
      if (ch.ok.indexOf(i) > -1) cls += " is-ok";
      else if (i === r) cls += " is-bad";
    } else if (i === r) cls += " is-sel";
    return '<button class="' + cls + '" ' + (answered ? "disabled" : 'onclick="cSpot(' + i + ')"') + '>' +
      '<span class="docline-h">' + esc(b.h) + '</span>' +
      '<span class="docline-t">' + esc(b.t) + '</span></button>';
  }).join("");
  return '<div class="docmock">' +
    '<div class="docmock-h"><b>' + esc(d.title) + '</b>' +
    '<span>' + d.meta.map(esc).join(" &nbsp;·&nbsp; ") + '</span></div>' +
    rows + '</div>';
}

function rSort(ch, r, answered) {
  return '<div class="sortgrid">' + ch.items.map(function (it, i) {
    var placed = r[i];
    var state = "";
    if (answered) state = placed === it.bucket ? " is-ok" : " is-bad";
    return '<div class="sortitem' + state + '">' +
      '<div class="sortitem-l">' + esc(it.label) + '</div>' +
      '<div class="sortbtns">' + ch.buckets.map(function (b) {
        var on = placed === b.id;
        return '<button class="bucketbtn' + (on ? " on" : "") + '" ' +
          (answered ? "disabled" : 'onclick="cSort(' + i + ',\'' + b.id + '\')"') + '>' +
          esc(b.label) + '</button>';
      }).join("") + '</div>' +
      (answered && placed !== it.bucket
        ? '<div class="sortfix">Belongs in <b>' + esc(bucketLabel(ch, it.bucket)) + '</b></div>' : "") +
      '</div>';
  }).join("") + '</div>';
}
function bucketLabel(ch, id) {
  var b = ch.buckets.filter(function (x) { return x.id === id; })[0];
  return b ? b.label : id;
}

function rOrder(ch, r, answered) {
  r = r || [];
  var chosen = r.map(function (idx, pos) {
    var right = idx === pos;
    return '<div class="orderrow' + (answered ? (right ? " is-ok" : " is-bad") : "") + '">' +
      '<span class="ordernum">' + (pos + 1) + '</span>' +
      '<span class="orderlbl">' + esc(ch.items[idx]) + '</span></div>';
  }).join("");
  var remaining = ch.items.map(function (t, i) {
    if (r.indexOf(i) > -1) return "";
    return '<button class="orderpick" ' + (answered ? "disabled" : 'onclick="cOrder(' + i + ')"') + '>' +
      esc(t) + '</button>';
  }).join("");
  return '<div class="orderbox">' +
    (chosen ? '<div class="orderchosen">' + chosen + '</div>' : "") +
    (remaining.replace(/\s/g, "") ? '<div class="orderpool">' + remaining + '</div>' : "") +
    (!answered && r.length ? '<button class="btn btn-ghost btn-sm" onclick="cOrderReset()">Start again</button>' : "") +
    '</div>';
}

function rPick(ch, r, answered) {
  r = r || [];
  return '<div class="pickbox">' + ch.opts.map(function (o, i) {
    var on = r.indexOf(i) > -1, good = ch.correct.indexOf(i) > -1;
    var cls = "pickopt";
    if (answered) { if (good) cls += " is-ok"; else if (on) cls += " is-bad"; }
    else if (on) cls += " on";
    return '<button class="' + cls + '" ' + (answered ? "disabled" : 'onclick="cPick(' + i + ')"') + '>' +
      '<span class="pickbox-t">' + esc(o) + '</span></button>';
  }).join("") +
  '<div class="muted" style="font-size:.82rem;margin-top:6px">' +
  (answered ? "" : r.length + " of " + ch.n + " chosen") + '</div></div>';
}

function rNumber(ch, r, answered) {
  return '<div class="numbox">' +
    '<input class="numin" type="number" inputmode="decimal" step="any" value="' + esc(String(r)) + '" ' +
    (answered ? "disabled" : 'oninput="cNum(this.value)" onkeydown="if(event.key===\'Enter\')cSubmit()"') +
    ' placeholder="0" aria-label="' + esc(ch.prompt) + '">' +
    '<span class="numunit">' + esc(ch.unit) + '</span></div>' +
    (answered ? '<div class="muted" style="font-size:.85rem;margin-top:8px">The figure was <b>' +
      ch.answer + '</b> ' + esc(ch.unit) + '.</div>' : "");
}

function rSlider(ch, r, answered) {
  var l = ch.labels || {};
  return '<div class="slidebox">' +
    '<div class="slideval">' + r + ' <span>' + esc(ch.unit) + '</span></div>' +
    '<input class="slidein" type="range" min="' + ch.min + '" max="' + ch.max + '" step="' + ch.step + '" ' +
    'value="' + r + '" ' + (answered ? "disabled" : 'oninput="cSlide(this.value)"') +
    ' aria-label="' + esc(ch.prompt) + '">' +
    '<div class="slidelbl"><span>' + esc(l.low || ch.min) + '</span>' +
    '<span>' + esc(l.mid || "") + '</span><span>' + esc(l.high || ch.max) + '</span></div>' +
    (answered ? '<div class="muted" style="font-size:.85rem;margin-top:8px">A sound answer sat near <b>' +
      ch.answer + '</b> ' + esc(ch.unit) + '.</div>' : "") +
    '</div>';
}

/* --------------------------- interactions ----------------------------- */

function cSpot(i) { S.quizState.resp = i; render(); }
function cSort(i, b) { S.quizState.resp[i] = b; render(); }
function cPick(i) {
  var r = S.quizState.resp, ch = S.quizState.q;
  var at = r.indexOf(i);
  if (at > -1) r.splice(at, 1);
  else if (r.length < ch.n) r.push(i);
  render();
}
function cOrder(i) { S.quizState.resp.push(i); render(); }
function cOrderReset() { S.quizState.resp = []; render(); }
function cNum(v) { S.quizState.resp = v; var b = el("submitbtn"); if (b) b.disabled = !respReady(S.quizState.q, v); }
function cSlide(v) {
  S.quizState.resp = Number(v);
  var o = document.querySelector(".slideval");
  if (o) o.innerHTML = v + ' <span>' + esc(S.quizState.q.unit) + '</span>';
}
