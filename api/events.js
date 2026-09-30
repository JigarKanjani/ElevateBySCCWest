/* GET /api/events
 *
 * Live workshop feed for the gap report. Reads supplychaincanada.com/events on
 * every (uncached) request, so the list is whatever is on the site right now —
 * nothing about it is hardcoded here.
 *
 * Two passes, because the data is split across two pages:
 *
 *   1. The listing carries title, date, type, location, registration deadline,
 *      province and the registration link.
 *   2. CPD credits and the time of day only exist on the individual event page,
 *      so the few events we are actually going to show get enriched from there.
 *      Events without a published CPD value simply omit it — nothing is invented.
 *
 * Responses are cached at the edge (s-maxage) so a burst of report views does
 * not turn into a burst of requests against the association's site.
 */

const cheerio = require("cheerio");

const LIST_URL = "https://www.supplychaincanada.com/events";
const UA = "ElevateBySCCWest/1.0 (+https://elevate-scc-west.vercel.app)";

/* Types worth funnelling someone to after a gap report, in preference order.
   SCMP Modules and AGMs are excluded: they are not drop-in development. PD
   Workshops and Webinars come first because they publish CPD credits, run as
   one-offs, and are the ones somebody can act on the week they get a report. */
const TYPE_TIERS = [
  ["PD Workshop", "Webinar"],
  ["Conference"],
  ["SCMP Workshop", "SMT Seminar"]
];
const LEARNING_TYPES = TYPE_TIERS.flat();

/* Map an event to the skill areas it addresses, so the report can lead with
   the workshop that closes the reader's biggest gap rather than the next one
   on the calendar. Matched against title and abstract. */
const DOMAIN_WORDS = {
  proc: ["sourcing", "procure", "rfx", "rfp", "tender", "\\bbid\\b", "category", "supplier evaluation", "supplier selection", "scoring model", "public sector"],
  cont: ["contract", "clause", "claims", "sla", "award", "terms"],
  nego: ["negotiat", "influence", "persuas", "relational", "conflict"],
  logi: ["logistic", "transport", "freight", "incoterm", "customs", "trade compliance", "import", "export", "shipping"],
  inv:  ["inventory", "demand", "forecast", "s&op", "replenish", "safety stock"],
  ops:  ["operations", "warehouse", "lean", "process", "continuous improvement", "capacity"],
  fin:  ["cost", "finance", "tco", "total cost", "working capital", "analytics", "excel", "data", "spend"],
  esg:  ["sustainab", "esg", "scope 3", "forced labour", "indigenous", "ethical", "social responsibility", "environment"],
  dig:  ["digital", "automation", "erp", "technology", "co-pilot", "copilot", "agentic", "artificial intelligence", "\\bai\\b"],
  lead: ["leadership", "communicat", "stakeholder", "change management", "team", "professionalism", "storytelling"]
};

function tagDomains(text) {
  const t = (text || "").toLowerCase();
  /* Short tokens are matched on a word boundary. Plain substring matching put
     "ai" inside "supply chain" and tagged almost everything as digital. */
  return Object.keys(DOMAIN_WORDS).filter((d) =>
    DOMAIN_WORDS[d].some((w) =>
      w.startsWith("\\b") ? new RegExp(w).test(t) : t.indexOf(w) > -1));
}

const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };

async function get(url, ms = 9000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

function parseListing(html) {
  const $ = cheerio.load(html);
  const out = [];
  $("li[data-province]").each((_, li) => {
    const $li = $(li);
    const $a = $li.find("a.event").first();
    const href = $a.attr("href");
    if (!href) return;

    const day = $a.find(".date span").first().text().trim();
    const mon = $a.find(".date").first().clone().children().remove().end().text().trim();

    // the title is the text node of div.event, before the nested .details block
    const $ev = $a.find("div.event").first();
    const title = $ev.clone().children().remove().end().text().trim();

    const details = {};
    $ev.find(".details > div").each((__, d) => {
      const $d = $(d);
      const label = $d.find("label").text().trim();
      const val = $d.clone().find("label").remove().end().text().trim();
      if (label) details[label] = val;
      else if (val) details.REGION = val;
    });

    out.push({
      title,
      url: href,
      day,
      month: mon,
      monthKey: $li.attr("data-month") || "",
      type: $li.attr("data-type") || details.TYPE || "",
      province: ($li.attr("data-province") || "").toLowerCase(),
      national: $li.attr("data-national") === "yes",
      online: $li.attr("data-online-event") === "yes",
      location: details.LOCATION || "",
      region: details.REGION || "",
      deadline: details["REGISTRATION DEADLINE"] || ""
    });
  });
  return out;
}

/* Sort key from the day + month cell, using the data-month year. */
function when(e) {
  const y = Number((e.monthKey || "").slice(0, 4)) || new Date().getFullYear();
  const m = MONTHS[e.month] ?? Number((e.monthKey || "").slice(4, 6)) - 1 ?? 0;
  return new Date(y, m, Number(e.day) || 1).getTime();
}

/* West-relevant: Alberta, BC, or anything national / online. */
function isWest(e) {
  return e.province === "ab" || e.province === "bc" || e.national || e.online ||
         /national|online/i.test(e.location);
}

/* Pull time, CPD and an abstract off the individual event page. */
async function enrich(e) {
  try {
    const html = await get(e.url);
    const $ = cheerio.load(html);
    $("script, style").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();

    const time = text.match(/Time:\s*([0-9]{1,2}:[0-9]{2}\s*[AP]M[^A-Za-z]*(?:-\s*[0-9]{1,2}:[0-9]{2}\s*[AP]M)?\s*\(?[A-Z]{2,4}\)?)/);

    /* CPD is measured in CREDITS, not hours, and the two are different numbers
       on the same page. One event reads:
           CPD CREDITS   9 Hours   5 Credits
       — nine hours of delivery earning five credits. Matching the first number
       after the "CPD" label would report 9 credits, which is simply wrong, so
       the number immediately before the word "Credit" is the only one taken.
       Anything else is left null and the UI omits it rather than guessing. */
    const near = text.match(/CPD[^.]{0,120}/i);
    const cpd  = near ? near[0].match(/([0-9]+(?:\.[0-9]+)?)\s*Credits?\b/i) : null;

    const fee  = text.match(/Member\s*\$([0-9,]+)/);

    // first substantial sentence after the title makes a serviceable brief
    let brief = "";
    const paras = $("p").map((_, p) => $(p).text().replace(/\s+/g, " ").trim()).get();
    for (const p of paras) {
      if (p.length > 80 && !/cookie|privacy|subscribe|unsubscribe/i.test(p)) { brief = p; break; }
    }
    if (brief.length > 240) brief = brief.slice(0, 237).replace(/\s+\S*$/, "") + "…";

    return {
      ...e,
      time: time ? time[1].trim() : "",
      cpd: cpd ? Number(cpd[1]) : null,
      memberFee: fee ? "$" + fee[1] : "",
      brief
    };
  } catch {
    return { ...e, time: "", cpd: null, memberFee: "", brief: "" };
  }
}

module.exports = async (req, res) => {
  const limit = Math.min(Number(req.query?.limit) || 6, 12);
  try {
    const html = await get(LIST_URL, 11000);
    const all = parseListing(html);

    const now = Date.now() - 864e5; // keep today
    const eligible = all
      .filter((e) => e.title && LEARNING_TYPES.includes(e.type))
      .filter(isWest)
      .filter((e) => when(e) >= now)
      .sort((a, b) => when(a) - when(b));

    /* Fill tier by tier so the actionable, CPD-bearing sessions lead, then
       top up from the lower tiers if there are not enough of them. */
    const picked = [];
    for (const tier of TYPE_TIERS) {
      for (const e of eligible) {
        if (picked.length >= limit) break;
        if (tier.includes(e.type) && !picked.includes(e)) picked.push(e);
      }
    }

    const events = (await Promise.all(picked.map(enrich))).map((e) => ({
      ...e,
      domains: tagDomains(e.title + " " + (e.brief || ""))
    }));

    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
    res.status(200).json({
      ok: true,
      source: LIST_URL,
      fetchedAt: new Date().toISOString(),
      total: all.length,
      count: events.length,
      events
    });
  } catch (err) {
    // Degrade rather than break the report: the UI hides the section on ok:false.
    res.setHeader("Cache-Control", "public, s-maxage=60");
    res.status(200).json({ ok: false, error: String(err.message || err), events: [] });
  }
};
