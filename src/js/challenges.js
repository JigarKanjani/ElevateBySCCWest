/* Elevate challenge bank.
 *
 * Replaces the old multiple-choice bank, which was unusable: 98.4% of answers
 * were the longest option and 57 of 61 were option B, so it could be passed
 * without reading a single question.
 *
 * Every item here is answered by DOING something to an artefact rather than by
 * picking from a list of sentences:
 *
 *   spot   tap the thing that is wrong on a document
 *   sort   put each card into the right bucket
 *   order  put the steps in sequence
 *   number type a figure you worked out
 *   slider place a value on a scale
 *   pick   choose the N that apply, from length-matched options
 *
 * d = difficulty tier: 1 foundational, 2 applied, 3 advanced.
 */

const CHALLENGES = [

/* ---------------------------- procurement ---------------------------- */
{
  id: "proc-spot-1", dom: "proc", d: 1, kind: "spot",
  prompt: "This purchase requisition came in. Tap the line that should stop you from raising the order.",
  doc: {
    title: "Purchase Requisition #PR-4471",
    meta: ["Requester: Facilities", "Raised: 12 Mar"],
    blocks: [
      { h: "Item", t: "Industrial floor scrubber, one unit" },
      { h: "Value", t: "$74,500 before tax" },
      { h: "Supplier", t: "Named by requester: Northline Equipment Ltd" },
      { h: "Competition", t: "None. Requester states they have used this supplier before." },
      { h: "Budget", t: "Approved capital line, funds available" }
    ]
  },
  ok: [3],
  why: "Past familiarity is not a reason to skip competition. At $74,500 this needs a competitive process or a written sole-source justification on the file. The other lines are all fine."
},
{
  id: "proc-sort-1", dom: "proc", d: 2, kind: "sort",
  prompt: "Put each item where it belongs on the Kraljic matrix.",
  buckets: [
    { id: "lev", label: "Leverage" },
    { id: "bot", label: "Bottleneck" },
    { id: "str", label: "Strategic" },
    { id: "rou", label: "Routine" }
  ],
  items: [
    { label: "Office paper — many suppliers, low spend", bucket: "rou" },
    { label: "Standard steel — many suppliers, huge spend", bucket: "lev" },
    { label: "Sole-source calibration part — tiny spend, no alternative", bucket: "bot" },
    { label: "Custom engine assembly — one partner, huge spend", bucket: "str" }
  ],
  why: "The two axes are spend and supply risk. High spend with plenty of suppliers gives you leverage. Low spend with no alternative is a bottleneck: you have no commercial power but it can still stop your line."
},
{
  id: "proc-order-1", dom: "proc", d: 2, kind: "order",
  prompt: "Put a competitive sourcing process into the order it actually runs.",
  items: [
    "Define the requirement and the evaluation criteria",
    "Go to market with the RFx",
    "Evaluate against the criteria you published",
    "Award and debrief the unsuccessful bidders"
  ],
  why: "Criteria are set before you go to market, never after bids land. Evaluating against criteria you published after seeing the responses is the single fastest way to lose a procurement challenge."
},

/* ------------------------- contract management ------------------------ */
{
  id: "cont-spot-1", dom: "cont", d: 1, kind: "spot",
  prompt: "Tap the clause that puts your organisation most at risk.",
  doc: {
    title: "Services Agreement — extract",
    meta: ["Supplier: Vantage Logistics", "Term: 24 months"],
    blocks: [
      { h: "4.1 Payment", t: "Net 45 days from receipt of a correct invoice." },
      { h: "6.2 Liability", t: "Supplier's total liability is capped at the fees paid in the preceding one (1) month." },
      { h: "8.1 Termination", t: "Either party may terminate for convenience on 60 days' written notice." },
      { h: "9.3 Insurance", t: "Supplier shall maintain commercial general liability of $5,000,000." }
    ]
  },
  ok: [1],
  why: "A liability cap of one month's fees is far below the damage a logistics failure can cause. The other clauses are ordinary. Caps are usually negotiated to something like 12 months of fees, or a multiple of contract value."
},
{
  id: "cont-spot-2", dom: "cont", d: 3, kind: "spot",
  prompt: "This change order arrived. Tap the line that should not be accepted as written.",
  doc: {
    title: "Change Order #3 — Warehouse Fit-out",
    meta: ["Original contract: $1,240,000", "Change value: $96,000"],
    blocks: [
      { h: "Scope", t: "Add mezzanine racking to Bay 4 as per drawing R-12." },
      { h: "Price basis", t: "Time and materials, rates per Schedule B." },
      { h: "Schedule", t: "Contractor claims 21 days extension of time." },
      { h: "Waiver", t: "Acceptance of this change waives all Contractor claims arising to date." },
      { h: "Approval", t: "Signed by project manager within delegated authority." }
    ]
  },
  ok: [3],
  why: "A blanket waiver buried in a change order is a trap in the other direction too — it reads as protective but it can extinguish your own claims against the contractor. Waivers belong in a negotiated settlement, not stapled to a scope change."
},

/* --------------------------- negotiation ------------------------------ */
{
  id: "nego-order-1", dom: "nego", d: 1, kind: "order",
  prompt: "Put these negotiation steps in the order that gives you the strongest position.",
  items: [
    "Work out your BATNA — what you do if there is no deal",
    "Set your target and your walk-away point",
    "Open the discussion and test their position",
    "Trade concessions against things you value less"
  ],
  why: "Everything depends on knowing your alternative first. Your walk-away point comes from your BATNA, not from a feeling. People who open before doing this end up conceding to avoid an outcome they never priced."
},
{
  id: "nego-sort-1", dom: "nego", d: 2, kind: "sort",
  prompt: "Sort each move by what it actually does to your position.",
  buckets: [
    { id: "str", label: "Strengthens you" },
    { id: "wea", label: "Weakens you" }
  ],
  items: [
    { label: "Qualifying a credible second supplier first", bucket: "str" },
    { label: "Telling them your budget early to save time", bucket: "wea" },
    { label: "Bundling volume across sites before you talk", bucket: "str" },
    { label: "Letting the requirement become urgent before you start", bucket: "wea" }
  ],
  why: "Leverage is built before the conversation, not during it. Naming your budget hands over the entire bargaining range, and urgency you created yourself is leverage you gave away."
},

/* ------------------------ logistics & transport ----------------------- */
{
  id: "logi-spot-1", dom: "logi", d: 2, kind: "spot",
  prompt: "Tap the entry on this bill of lading that will cause a problem at the border.",
  doc: {
    title: "Bill of Lading — BOL-88214",
    meta: ["Shipper: Ontario Tooling Inc", "Consignee: Denver Machine Co"],
    blocks: [
      { h: "Incoterm", t: "DAP Denver, Colorado" },
      { h: "Goods", t: "Steel cutting tools, 12 cartons, 410 kg" },
      { h: "Country of origin", t: "Left blank" },
      { h: "Value", t: "USD 38,400" },
      { h: "Carrier", t: "Meridian Freight, pro number 5512-B" }
    ]
  },
  ok: [2],
  why: "Country of origin drives the CUSMA duty treatment. Leaving it blank means the shipment cannot be classified correctly, and it is the fastest route to a customs hold and a demurrage bill."
},
{
  id: "logi-number-1", dom: "logi", d: 2, kind: "number",
  prompt: "A shipment costs $4,200 in freight, $680 in duty and $320 in brokerage. It contains 800 units. What is the landed cost added per unit?",
  unit: "$ per unit", answer: 6.5, tolerance: 0.2, min: 0, max: 100,
  why: "Add the landed costs — 4,200 + 680 + 320 = $5,200 — then divide by 800 units. Quoting a unit price without this is how a cheap overseas supplier turns out to be the expensive one."
},
{
  id: "logi-order-1", dom: "logi", d: 3, kind: "order",
  prompt: "Order these Incoterms from least buyer risk to most buyer risk.",
  items: ["DDP — seller delivers duty paid", "DAP — seller delivers, buyer clears", "FOB — risk passes at origin port", "EXW — buyer collects from seller's door"],
  why: "Risk transfers to the buyer progressively earlier. Under DDP the seller carries almost everything; under EXW you own the goods from their loading dock, including export clearance you may not be able to perform."
},

/* --------------------- inventory & demand planning -------------------- */
{
  id: "inv-number-1", dom: "inv", d: 1, kind: "number",
  prompt: "You use 40 units a day. The supplier takes 7 days. You hold 60 units of safety stock. At what stock level should you reorder?",
  unit: "units", answer: 340, tolerance: 5, min: 0, max: 1000,
  why: "Reorder point = demand during lead time + safety stock = (40 × 7) + 60 = 340. Order at 340 and you hit the safety stock just as the delivery lands."
},
{
  id: "inv-slider-1", dom: "inv", d: 2, kind: "slider",
  prompt: "Demand has become much more erratic, but your lead time and service target are unchanged. What should happen to your safety stock?",
  min: -50, max: 100, step: 5, unit: "% change", answer: 45, tolerance: 25,
  labels: { low: "Cut it sharply", mid: "Leave it", high: "Raise it a lot" },
  why: "Safety stock scales with demand variability. More erratic demand at the same service level means materially more buffer — there is no way to hold service and cut the buffer at the same time."
},
{
  id: "inv-order-1", dom: "inv", d: 2, kind: "order",
  prompt: "Put the S&OP cycle into its normal monthly order.",
  items: [
    "Gather the demand forecast",
    "Test it against supply capacity",
    "Reconcile the gaps with finance",
    "Sign off one plan at the executive meeting"
  ],
  why: "The point of S&OP is a single agreed plan. Demand first, then whether you can actually supply it, then the money, then one decision everyone runs on."
},

/* ------------------------ operations & warehouse ---------------------- */
{
  id: "ops-sort-1", dom: "ops", d: 1, kind: "sort",
  prompt: "Sort each situation into whether it adds value for the customer.",
  buckets: [
    { id: "val", label: "Adds value" },
    { id: "was", label: "Waste" }
  ],
  items: [
    { label: "Assembling the product to specification", bucket: "val" },
    { label: "Moving pallets between two staging areas", bucket: "was" },
    { label: "Stock sitting three weeks waiting on a part", bucket: "was" },
    { label: "Final quality check the customer requires", bucket: "val" }
  ],
  why: "Lean asks one question: would the customer pay for this step? Transport between staging areas and inventory waiting on a shortage are classic wastes, even when they feel like normal work."
},
{
  id: "ops-order-1", dom: "ops", d: 2, kind: "order",
  prompt: "Put a receiving process into the order that protects you from paying for goods you did not get.",
  items: [
    "Check the delivery against the purchase order",
    "Count and inspect what physically arrived",
    "Record the receipt in the system",
    "Release the invoice for payment"
  ],
  why: "This is the three-way match. Payment comes last, only once the order, the physical goods and the system record agree. Releasing an invoice before the count is how overpayments happen."
},

/* ---------------------- supply chain finance -------------------------- */
{
  id: "fin-number-1", dom: "fin", d: 2, kind: "number",
  prompt: "Machine A costs $50,000 and $4,000 a year to run. Machine B costs $38,000 and $7,000 a year. Over 5 years, how much cheaper is the better option?",
  unit: "$", answer: 3000, tolerance: 100, min: 0, max: 100000,
  why: "A totals 50,000 + 20,000 = $70,000. B totals 38,000 + 35,000 = $73,000. A wins by $3,000, even though B looked $12,000 cheaper on the sticker. That gap is the whole argument for total cost of ownership."
},
{
  id: "fin-spot-1", dom: "fin", d: 2, kind: "spot",
  prompt: "Tap the line on this invoice that you should query before paying.",
  doc: {
    title: "Invoice INV-20418",
    meta: ["Supplier: Redhill Components", "PO: 4400-2291"],
    blocks: [
      { h: "Line 1", t: "1,000 bearings @ $4.10 = $4,100 (PO price $4.10)" },
      { h: "Line 2", t: "Expedite fee = $850 (not on the purchase order)" },
      { h: "Line 3", t: "Freight = $240 (PO states freight included)" },
      { h: "Terms", t: "Net 30, matches the agreement" }
    ]
  },
  ok: [2],
  why: "The PO says freight is included, so billing it again is a straight double charge. The expedite fee is worth questioning too, but it may have been agreed verbally — freight contradicts the order on its face."
},

/* --------------------------- sustainability --------------------------- */
{
  id: "esg-sort-1", dom: "esg", d: 2, kind: "sort",
  prompt: "Put each emission source in the right scope.",
  buckets: [
    { id: "s1", label: "Scope 1" },
    { id: "s2", label: "Scope 2" },
    { id: "s3", label: "Scope 3" }
  ],
  items: [
    { label: "Diesel burned by your own delivery fleet", bucket: "s1" },
    { label: "Electricity you buy for your warehouse", bucket: "s2" },
    { label: "Emissions from making the parts you buy", bucket: "s3" },
    { label: "Your employees' business flights", bucket: "s3" }
  ],
  why: "Scope 1 is what you burn, Scope 2 is the energy you buy, Scope 3 is everything else in your value chain. For most supply chain organisations Scope 3 dwarfs the other two, which is why procurement owns so much of the problem."
},
{
  id: "esg-spot-1", dom: "esg", d: 3, kind: "spot",
  prompt: "Under Canada's Bill S-211 reporting, tap the answer that creates the most exposure.",
  doc: {
    title: "Supplier self-assessment — returned",
    meta: ["Supplier: Pacific Textiles", "Tier: 1"],
    blocks: [
      { h: "Forced labour policy", t: "Yes, published and board approved." },
      { h: "Audits of own sites", t: "Annual, third party." },
      { h: "Visibility of sub-suppliers", t: "We do not track beyond our direct suppliers." },
      { h: "Grievance mechanism", t: "Anonymous hotline, available in three languages." }
    ]
  },
  ok: [2],
  why: "The risk lives below tier one. A clean policy at the top means very little if nobody can see who is actually making the goods, and S-211 asks what steps you took to identify that risk — not whether you had a policy."
},

/* --------------------------- digital ---------------------------------- */
{
  id: "dig-sort-1", dom: "dig", d: 1, kind: "sort",
  prompt: "Which system would normally own each job?",
  buckets: [
    { id: "erp", label: "ERP" },
    { id: "wms", label: "WMS" },
    { id: "tms", label: "TMS" }
  ],
  items: [
    { label: "Raising the purchase order and paying the invoice", bucket: "erp" },
    { label: "Directing a picker to a bin location", bucket: "wms" },
    { label: "Choosing the carrier and rating the load", bucket: "tms" },
    { label: "Holding the financial ledger", bucket: "erp" }
  ],
  why: "ERP is the system of record for the transaction and the money. WMS runs what happens inside the four walls. TMS decides how the load moves. Most integration pain comes from asking one of them to do another's job."
},
{
  id: "dig-spot-1", dom: "dig", d: 2, kind: "spot",
  prompt: "Tap the supplier record field that will break your spend analysis.",
  doc: {
    title: "Supplier master — record 10442",
    meta: ["Created: 2019", "Status: Active"],
    blocks: [
      { h: "Legal name", t: "Northstar Industrial Supply Ltd." },
      { h: "Duplicate check", t: "Also exists as 'Northstar Ind. Supply' (record 20881)" },
      { h: "Payment terms", t: "Net 45" },
      { h: "Tax ID", t: "Present and validated" }
    ]
  },
  ok: [1],
  why: "The same supplier under two records splits your spend in half in every report, so category strategy and volume leverage are both built on a false number. Duplicate master data quietly invalidates the analysis before anyone looks at it."
},

/* --------------------------- leadership ------------------------------- */
{
  id: "lead-order-1", dom: "lead", d: 2, kind: "order",
  prompt: "You need a reluctant operations team to adopt a new process. Order your approach.",
  items: [
    "Understand what the change costs them day to day",
    "Find the outcome they already care about",
    "Involve them in shaping how it works",
    "Agree the measure you will both judge it by"
  ],
  why: "Influencing without authority starts with their world, not your plan. You cannot connect a change to something someone values until you know what it costs them and what they already care about."
},
{
  id: "lead-pick-1", dom: "lead", d: 3, kind: "pick",
  n: 2,
  prompt: "A supplier failure will delay a customer launch. Pick the TWO things you do first.",
  opts: [
    "Tell the customer-facing team what you now know",
    "Establish the real recovery date with the supplier",
    "Write the post mortem on the root cause",
    "Draft a claim under the contract's remedy clause"
  ],
  correct: [0, 1],
  why: "In the first hour you need a real date and the people facing the customer need to hear it from you. Root cause and remedies matter, but they are worth nothing if the customer learns about the delay from somewhere else."
},
{
  id: "cont-pick-1", dom: "cont", d: 2, kind: "pick",
  n: 2,
  prompt: "Pick the TWO items that belong in the contract rather than the SLA.",
  opts: [
    "The limit on each party's liability",
    "The target response time for a P2 ticket",
    "How the agreement can be terminated",
    "The monthly service credit percentage"
  ],
  correct: [0, 2],
  why: "The contract carries the legal architecture — liability, termination, IP, indemnities. The SLA carries the performance detail that is meant to be revised without reopening the contract every time."
},
{
  id: "proc-pick-1", dom: "proc", d: 3, kind: "pick",
  n: 2,
  prompt: "A bid arrives two minutes after the deadline. Pick the TWO statements that are correct.",
  opts: [
    "The published closing time is what governs",
    "A short delay can be accepted if no one is harmed",
    "Accepting it risks a challenge from other bidders",
    "The evaluation team may decide this case on merit"
  ],
  correct: [0, 2],
  why: "Deadlines in a competitive process are the process. Accepting a late bid, however small the delay, hands every other bidder a ground for challenge and undermines the fairness the whole exercise depends on."
}

];

/* index by domain, same shape the engine already expects */
const CHALLENGES_BY_DOMAIN = {};
CHALLENGES.forEach(function (c) {
  (CHALLENGES_BY_DOMAIN[c.dom] = CHALLENGES_BY_DOMAIN[c.dom] || []).push(c);
});
