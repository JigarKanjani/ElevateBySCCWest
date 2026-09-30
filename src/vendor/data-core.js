/* Elevate: competency framework */

const LEVELS = [
  { n: 0, label: "Not evidenced", short: "None" },
  { n: 1, label: "Foundational", short: "Foundational" },
  { n: 2, label: "Developing", short: "Developing" },
  { n: 3, label: "Proficient", short: "Proficient" },
  { n: 4, label: "Advanced", short: "Advanced" }
];

const DOMAINS = [
  {
    id: "proc",
    name: "Procurement & Sourcing",
    icon: "\u{1F3AF}",
    blurb: "Category strategy, supplier selection, RFx design, public procurement rules.",
    keywords: ["procurement","sourcing","strategic sourcing","rfp","rfq","rfi","tender","bid","category management","supplier selection","purchasing","buyer","spend analysis","vendor selection","kraljic","e-procurement","purchase order","requisition","supplier qualification","prequalification","cfta","public procurement","merx","should-cost","sole source","single source","supply base","procure-to-pay","p2p","source-to-pay","commodity","supplier scorecard","bid evaluation","evaluation matrix"]
  },
  {
    id: "cont",
    name: "Contract Management",
    icon: "\u{1F4D1}",
    blurb: "Drafting, risk allocation, SLAs, administration, claims and renewals.",
    keywords: ["contract","contract management","contract administration","clm","sla","service level agreement","master service agreement","msa","statement of work","sow","terms and conditions","indemnity","limitation of liability","liquidated damages","force majeure","warranty","amendment","change order","renewal","contract lifecycle","legal review","dispute","claims","performance bond","holdback","contract negotiation","evergreen","termination for convenience"]
  },
  {
    id: "nego",
    name: "Negotiation & Supplier Relations",
    icon: "\u{1F91D}",
    blurb: "Preparation, value trading, supplier segmentation and relationship governance.",
    keywords: ["negotiation","negotiate","batna","zopa","supplier relationship","srm","vendor management","supplier performance","qbr","quarterly business review","scorecard","supplier development","partnership","commercial negotiation","settlement","concession","supplier onboarding","relationship management","stakeholder negotiation","cost breakdown"]
  },
  {
    id: "logi",
    name: "Logistics & Transportation",
    icon: "\u{1F69A}",
    blurb: "Modal selection, Incoterms, customs and trade compliance, freight cost control.",
    keywords: ["logistics","transportation","freight","shipping","carrier","incoterms","customs","cbsa","cusma","nafta","import","export","customs broker","ltl","truckload","ftl","intermodal","rail","ocean freight","air freight","3pl","4pl","fleet","dispatch","routing","last mile","drayage","bill of lading","trade compliance","tariff","duty","hs code","cross-border","freight audit","demurrage","detention","freight forwarder","cargo"]
  },
  {
    id: "inv",
    name: "Inventory & Demand Planning",
    icon: "\u{1F4E6}",
    blurb: "Forecasting, safety stock, replenishment policy, S&OP.",
    keywords: ["inventory","inventory management","demand planning","forecast","forecasting","safety stock","reorder point","eoq","economic order quantity","replenishment","mrp","material requirements planning","s&op","sales and operations planning","ibp","stockout","abc analysis","cycle count","min max","kanban","vmi","inventory turns","days of supply","obsolescence","slow moving","mape","planner","materials management","fill rate","service level","lead time"]
  },
  {
    id: "ops",
    name: "Operations & Warehousing",
    icon: "\u{1F3ED}",
    blurb: "Network design, warehouse flow, Lean, continuous improvement.",
    keywords: ["warehouse","warehousing","distribution centre","distribution center","operations","lean","six sigma","kaizen","5s","continuous improvement","value stream","wms","picking","packing","receiving","put away","slotting","cross-dock","cross docking","material handling","throughput","layout","network design","shop floor","production planning","capacity planning","gemba","standard work","yard management","pick rate","dock"]
  },
  {
    id: "fin",
    name: "Supply Chain Finance & Analytics",
    icon: "\u{1F4CA}",
    blurb: "TCO, cost modelling, working capital, spend analytics and reporting.",
    keywords: ["tco","total cost of ownership","cost analysis","cost modelling","cost modeling","budget","variance","savings","cost avoidance","landed cost","working capital","cash conversion","dpo","payment terms","excel","power bi","tableau","sql","analytics","dashboard","kpi","reporting","data analysis","python","financial analysis","business case","roi","npv","pivot table","forecast accuracy","cost savings","spend cube"]
  },
  {
    id: "esg",
    name: "Sustainability & ESG",
    icon: "\u{1F331}",
    blurb: "Scope 3, supplier codes, forced labour reporting, Indigenous and social procurement.",
    keywords: ["sustainability","esg","scope 3","carbon","emissions","ghg","net zero","circular","supplier code of conduct","ethical sourcing","forced labour","forced labor","modern slavery","s-211","social procurement","indigenous procurement","supplier diversity","responsible sourcing","life cycle","waste reduction","environmental","due diligence","human rights","csr","decarbonization"]
  },
  {
    id: "dig",
    name: "Digital & Technology",
    icon: "⚙️",
    blurb: "ERP, WMS, TMS, master data, automation and AI in the supply chain.",
    keywords: ["erp","sap","oracle","netsuite","dynamics","jd edwards","wms","tms","coupa","ariba","jaggaer","automation","rpa","integration","api","edi","master data","data governance","digital transformation","system implementation","artificial intelligence","machine learning","control tower","digital twin","barcode","rfid","scanner","power automate","workflow","maximo","sap mm","system upgrade"]
  },
  {
    id: "lead",
    name: "Leadership & Stakeholder Management",
    icon: "\u{1F9ED}",
    blurb: "Influencing without authority, change management, team and executive communication.",
    keywords: ["leadership","manager","supervisor","director","team lead","mentoring","coaching","stakeholder","stakeholder management","change management","cross-functional","presentation","executive","board","training","project management","pmp","influencing","communication","conflict resolution","onboarding","performance management","strategy","roadmap","direct reports","led a team"]
  }
];

const DOMAIN_BY_ID = {};
DOMAINS.forEach(function (d) { DOMAIN_BY_ID[d.id] = d; });

const TRACKS = [
  {
    id: "sourcing",
    name: "Strategic Sourcing / Procurement Specialist",
    tagline: "Own categories, run competitive processes, deliver measurable value.",
    icon: "\u{1F3AF}",
    salary: "$72,000 - $105,000 in AB and BC",
    demand: "High demand",
    benchmark: { proc: 4, cont: 3, nego: 4, logi: 2, inv: 2, ops: 1, fin: 3, esg: 3, dig: 2, lead: 3 }
  },
  {
    id: "contracts",
    name: "Contract Management Specialist",
    tagline: "Draft, negotiate and administer the agreements the organization lives by.",
    icon: "\u{1F4D1}",
    salary: "$78,000 - $112,000 in AB and BC",
    demand: "Growing fast",
    benchmark: { proc: 3, cont: 4, nego: 4, logi: 1, inv: 1, ops: 1, fin: 3, esg: 3, dig: 2, lead: 3 }
  },
  {
    id: "planner",
    name: "Inventory & Demand Planner",
    tagline: "Hold the right stock in the right place without tying up the balance sheet.",
    icon: "\u{1F4E6}",
    salary: "$65,000 - $95,000 in AB and BC",
    demand: "Steady demand",
    benchmark: { proc: 2, cont: 1, nego: 2, logi: 3, inv: 4, ops: 3, fin: 3, esg: 1, dig: 3, lead: 2 }
  },
  {
    id: "logistics",
    name: "Logistics & Transportation Manager",
    tagline: "Move freight across borders on time, compliantly and at a defensible cost.",
    icon: "\u{1F69A}",
    salary: "$80,000 - $115,000 in AB and BC",
    demand: "High demand",
    benchmark: { proc: 2, cont: 3, nego: 3, logi: 4, inv: 3, ops: 4, fin: 3, esg: 3, dig: 3, lead: 3 }
  },
  {
    id: "analyst",
    name: "Supply Chain Analyst (Data & Digital)",
    tagline: "Turn messy operational data into decisions leadership can act on.",
    icon: "\u{1F4CA}",
    salary: "$68,000 - $98,000 in AB and BC",
    demand: "Fastest growing",
    benchmark: { proc: 2, cont: 1, nego: 1, logi: 2, inv: 3, ops: 2, fin: 4, esg: 2, dig: 4, lead: 2 }
  },
  {
    id: "leader",
    name: "Supply Chain Manager / Director",
    tagline: "Run the end-to-end function and carry it into the executive conversation.",
    icon: "\u{1F9ED}",
    salary: "$110,000 - $165,000 in AB and BC",
    demand: "Senior roles",
    benchmark: { proc: 3, cont: 3, nego: 3, logi: 3, inv: 3, ops: 3, fin: 4, esg: 3, dig: 3, lead: 4 }
  }
];

const TRACK_BY_ID = {};
TRACKS.forEach(function (t) { TRACK_BY_ID[t.id] = t; });

const SENIORITY_SIGNALS = [
  { re: /\b(director|vice president|\bvp\b|head of|chief)\b/i, weight: 3, label: "Executive / Director" },
  { re: /\b(manager|team lead|supervisor|superintendent|principal)\b/i, weight: 2, label: "Management" },
  { re: /\b(specialist|analyst|coordinator|planner|buyer|officer|advisor)\b/i, weight: 1, label: "Professional" },
  { re: /\b(assistant|clerk|intern|junior|administrator|associate)\b/i, weight: 0, label: "Entry level" }
];

const CREDENTIALS = [
  { re: /\bscmp\b/i, name: "SCMP designation", domains: ["proc","cont","nego","lead"], boost: 1 },
  { re: /\bcscp\b/i, name: "APICS CSCP", domains: ["inv","logi","ops"], boost: 1 },
  { re: /\bcpim\b/i, name: "APICS CPIM", domains: ["inv","ops"], boost: 1 },
  { re: /\bp\.?\s?log\b/i, name: "P.Log designation", domains: ["logi","ops"], boost: 1 },
  { re: /\bpmp\b/i, name: "PMP", domains: ["lead"], boost: 1 },
  { re: /\bccs\b|\bcustoms specialist\b/i, name: "CCS (Customs)", domains: ["logi"], boost: 1 },
  { re: /\bsix sigma\b|\bgreen belt\b|\bblack belt\b/i, name: "Six Sigma", domains: ["ops","fin"], boost: 1 },
  { re: /\bmba\b/i, name: "MBA", domains: ["lead","fin"], boost: 1 },
  { re: /\bcpa\b/i, name: "CPA", domains: ["fin"], boost: 1 }
];

const OWNERSHIP_VERBS = /\b(led|managed|owned|negotiated|delivered|implemented|designed|built|launched|directed|established|transformed|reduced|increased|saved|achieved|awarded|oversaw|spearheaded)\b/i;

const SAMPLE_RESUME = `PRIYA RAMASWAMY
Calgary, Alberta | priya.r@email.com | 403-555-0142

PROFESSIONAL SUMMARY
Procurement professional with 7 years of experience in energy services and municipal
supply chain. Experienced in strategic sourcing, RFP development, contract
administration and supplier relationship management. SCMP candidate.

PROFESSIONAL EXPERIENCE

Senior Buyer, Northgate Energy Services, Calgary, AB
March 2022 to Present
- Manage a $14M annual category portfolio covering MRO, field services and rentals
- Lead end-to-end RFP and RFQ processes including scope development, evaluation
  matrix design and supplier selection recommendations
- Negotiated master service agreements, rate schedules and renewal terms with
  a supply base of 60+ vendors
- Administer contracts post-award including change orders, holdback release and
  performance scorecards reviewed at quarterly business reviews
- Built a spend analysis dashboard in Power BI that identified $900K in duplicate
  vendor spend across three business units
- Support ESG reporting by collecting supplier code of conduct attestations

Procurement Coordinator, City of Red Deer, Red Deer, AB
June 2019 to February 2022
- Ran public tenders on the Alberta Purchasing Connection in compliance with
  CFTA and NWPTA open tendering obligations
- Prepared purchase orders, requisitions and vendor prequalification packages
- Coordinated with legal on terms and conditions, insurance and bonding requirements
- Maintained vendor master data in JD Edwards and reconciled invoice discrepancies

Inventory Clerk, Parkland Distribution, Red Deer, AB
August 2017 to May 2019
- Performed cycle counts and reconciled stock variances in the warehouse management system
- Processed receiving, put away and picking documentation

EDUCATION AND CREDENTIALS
SCMP Program, in progress, Supply Chain Canada
Bachelor of Commerce, University of Calgary, 2017
Advanced Excel, Power BI

SKILLS
Strategic sourcing, RFP, RFQ, contract administration, negotiation, supplier
performance, spend analysis, Power BI, Excel, JD Edwards, public procurement`;
