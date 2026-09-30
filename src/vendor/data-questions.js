/* Elevate assessment bank. d = difficulty tier: 1 foundational, 2 applied, 3 advanced */

const QUESTIONS = [
{ id:"proc1", dom:"proc", d:1,
  q:"A requisition arrives for an item your organization buys often, from a supplier already under an agreed rate schedule. What is the correct next step?",
  opts:["Issue a new competitive RFQ to test the market","Release against the existing agreement using a call-up or release order","Sole-source it with a written justification memo","Escalate to the procurement manager for approval"],
  a:1, why:"When a properly competed standing agreement exists, releasing against it is the intended mechanism. Re-tendering repeats work already done, and a sole-source justification is unnecessary because the agreement was competitively awarded." },

{ id:"proc2", dom:"proc", d:1,
  q:"What primarily distinguishes an RFP from an RFQ?",
  opts:["An RFP is used above a dollar threshold and an RFQ below it","An RFP evaluates proposed solutions on qualitative criteria as well as price, while an RFQ compares price against a fixed, defined specification","An RFP is legally binding and an RFQ is not","An RFP is for services and an RFQ is for goods"],
  a:1, why:"The dividing line is the certainty of the requirement. When you can specify exactly what you need, you ask for a quote. When you want suppliers to propose how to solve the problem, you ask for a proposal and evaluate methodology, experience and price together." },

{ id:"proc3", dom:"proc", d:2,
  q:"In the Kraljic matrix, a component with high supply risk but low annual spend falls into which quadrant, and what is the usual strategy?",
  opts:["Leverage: consolidate volume and tender aggressively","Bottleneck: secure supply continuity, dual-source or hold buffer stock","Strategic: build a deep collaborative partnership","Routine: automate the transaction and reduce process cost"],
  a:1, why:"Bottleneck items will stop your operation if they fail to arrive, but they are too small to give you commercial leverage. The strategy is assurance of supply rather than price pressure: qualify a second source, negotiate a stocking agreement, or carry inventory." },

{ id:"proc4", dom:"proc", d:2,
  q:"A public sector buyer in Alberta is procuring consulting services valued at $130,000. Under the Canadian Free Trade Agreement, what obligation is most likely triggered?",
  opts:["No obligation, services are exempt from the CFTA","Open competitive tendering must be posted on an electronic tendering system accessible to suppliers from all provinces","The contract must be awarded to an Alberta-based supplier where one is qualified","Three written quotes are sufficient regardless of value"],
  a:1, why:"CFTA service thresholds for provincial entities sit well below this value, so the procurement must be openly posted and cannot discriminate by province of origin. Local preference is exactly what the agreement prohibits." },

{ id:"proc5", dom:"proc", d:2,
  q:"You are building an evaluation matrix for an RFP. Which practice most undermines a defensible award?",
  opts:["Publishing the weighting of each criterion in the RFP document","Adding a new evaluation criterion after proposals are received because a submission raised an issue you had not considered","Using a consensus scoring meeting after individual evaluator scoring","Requiring evaluators to document a written rationale for each score"],
  a:1, why:"Changing the rules after bids are in is the most common source of successful bid challenges. Every proponent priced and wrote to the published criteria; introducing a new one retroactively means they were not competing on the same basis." },

{ id:"proc6", dom:"proc", d:3,
  q:"Your should-cost model for a fabricated part lands at $180. Every one of five qualified suppliers quotes between $255 and $270. What is the most professionally sound interpretation?",
  opts:["The suppliers are colluding and the matter should go to the Competition Bureau","Your model is likely missing real cost drivers such as tooling amortization, minimum run quantities, scrap rates or current input prices","Award to the $255 supplier and demand they meet $180 at renewal","Redesign the part to eliminate the cost gap"],
  a:1, why:"When an independent market clusters tightly and well above your model, the market is usually telling you something your model does not know. Tight clustering is normal in a competitive market with similar cost structures. Investigate your assumptions before alleging collusion." },

{ id:"proc7", dom:"proc", d:3,
  q:"A category has one incumbent with 90% share, deep technical integration into your operation, and switching costs estimated at 18 months of effort. What sourcing approach creates real leverage?",
  opts:["Run a full open tender and be prepared to switch on price alone","Build a credible, staged alternative: qualify a second source on a small scope first, so the threat of moving becomes real before you negotiate","Accept the incumbent's pricing and focus on service levels instead","Issue an RFI to the market to signal you are looking"],
  a:1, why:"Leverage is only real if you can actually act on it, and the incumbent knows whether you can. A tender you cannot follow through on is quickly recognized as theatre. Qualifying an alternative at small scale converts a bluff into a genuine option, which changes the negotiation before it starts." },

{ id:"proc8", dom:"proc", d:3,
  q:"You inherit a category with 140 suppliers and $22M spend. First analytical move?",
  opts:["Issue an RFP to consolidate to a single supplier","Build a spend cube segmenting by supplier, sub-category and business unit to find where the money and fragmentation actually sit","Meet each of the top 20 suppliers","Negotiate a 5% reduction across all suppliers"],
  a:1, why:"Without segmentation you cannot tell whether the opportunity is fragmentation, maverick spend, price variance for the same item or genuinely distinct requirements. The analysis tells you which lever to pull, and a typical cube reveals that a small share of suppliers carries most of the spend." },

{ id:"cont1", dom:"cont", d:1,
  q:"What is the primary function of a limitation of liability clause?",
  opts:["To prevent either party from terminating the contract early","To cap the financial exposure a party faces if things go wrong","To guarantee the supplier's performance through a bond","To set out how disputes will be escalated"],
  a:1, why:"It places a ceiling on damages. The critical practical question is whether the cap is proportionate to the risk the contract actually carries, because a cap set at the contract value may be trivial next to the loss a failure could cause." },

{ id:"cont2", dom:"cont", d:1,
  q:"A statement of work should primarily define:",
  opts:["The commercial terms and payment schedule","The scope, deliverables, acceptance criteria and schedule of the work","The parties' insurance and indemnity obligations","The governing law and dispute resolution process"],
  a:1, why:"The SOW answers what will be delivered, to what standard, and by when. Commercial and legal terms live in the master agreement, which is why a well-built MSA plus SOW structure lets you add work without renegotiating legal terms each time." },

{ id:"cont3", dom:"cont", d:2,
  q:"A three-year services contract contains an evergreen renewal clause with a 60-day notice window. What is the main risk to manage?",
  opts:["The supplier can raise prices at any time","The contract auto-renews for a further term if nobody diarizes the notice date, removing your chance to re-compete or renegotiate","Evergreen clauses are unenforceable in Canada","The contract cannot be terminated for convenience"],
  a:1, why:"Evergreen clauses fail quietly. The renewal happens because a date passed unnoticed, and the organization loses its leverage without anyone making a decision. Contract calendars with alerts well ahead of the notice window are the control." },

{ id:"cont4", dom:"cont", d:2,
  q:"Liquidated damages are most likely to be unenforceable when:",
  opts:["They are expressed as a daily rate","The amount is a punitive figure bearing no reasonable relationship to the loss the parties anticipated at the time of contracting","They exceed 5% of contract value","They are applied to a subcontractor"],
  a:1, why:"Canadian courts distinguish a genuine pre-estimate of loss from a penalty designed to compel performance. If the figure cannot be connected to anticipated damage, relief against it becomes available. Documenting how the rate was calculated at drafting protects the clause." },

{ id:"cont5", dom:"cont", d:2,
  q:"Under a fixed-price contract, the supplier submits a change order for work they claim is out of scope. Your first step?",
  opts:["Reject it, since fixed price means fixed price","Compare the claimed work against the SOW and the agreed baseline to establish whether it was in the original scope","Approve it to maintain the relationship","Escalate to legal immediately"],
  a:1, why:"Change orders are a scope question before they are a commercial one. If the work genuinely sits outside the baseline, it is a legitimate change. If it does not, you need the documented comparison to say so. Either way the SOW is the reference point." },

{ id:"cont6", dom:"cont", d:3,
  q:"A supplier has missed service levels for four consecutive months. The contract provides service credits but no termination right for chronic underperformance. What is the strategic lesson?",
  opts:["Service credits are always insufficient and should be removed","Credits compensate for failure but do not compel improvement; the contract needed a cumulative-breach trigger converting repeated misses into a right to remedy or exit","The supplier should be terminated for convenience regardless","SLAs should not be used for services contracts"],
  a:1, why:"Credits price failure rather than preventing it, and a supplier may rationally accept them as a cost of doing business. Mature agreements ladder the consequences: credits, then a mandatory remediation plan, then a termination right once a defined threshold of misses is crossed." },

{ id:"cont7", dom:"cont", d:3,
  q:"You are assessing indemnity language proposed by a supplier: they will indemnify you only for direct damages caused by their gross negligence or wilful misconduct. What is the practical concern?",
  opts:["Gross negligence is not a recognized concept in Canadian law","The threshold is so high that ordinary negligence, which causes most real-world losses, is excluded from the indemnity","Indemnities should never be mutual","This language is standard and needs no review"],
  a:1, why:"Most damage in commercial relationships comes from ordinary carelessness, not from gross negligence or deliberate wrongdoing. An indemnity keyed to that high threshold looks protective while covering very little of what actually happens." },

{ id:"cont8", dom:"cont", d:3,
  q:"Your organization holds 400 active contracts with no central repository. What delivers the most value first?",
  opts:["Procuring a contract lifecycle management platform","Building a contract register capturing counterparty, value, expiry, renewal notice date and owner, so the portfolio becomes visible before tooling decisions are made","Renegotiating the ten largest contracts","Standardizing all templates"],
  a:1, why:"A platform implemented over an unknown portfolio just digitizes the confusion, and you cannot specify the tool sensibly until you know what it must hold. The register is low cost, immediately prevents missed renewals, and becomes the migration data set later." },

{ id:"nego1", dom:"nego", d:1,
  q:"Your BATNA is:",
  opts:["The lowest price you are willing to accept","Your best alternative if this negotiation produces no agreement","The opening offer you table","The midpoint between the two positions"],
  a:1, why:"BATNA is what you walk away to, not what you walk away at. It is the source of your real leverage, and strengthening it before you sit down changes the negotiation more than any tactic used inside the room." },

{ id:"nego2", dom:"nego", d:1,
  q:"A supplier opens with a price far above your target. The most productive response is to:",
  opts:["Counter immediately with an equally extreme low anchor","Ask how the price was constructed and what drives each component","Walk out to signal displeasure","Split the difference to move quickly"],
  a:1, why:"Understanding the cost structure gives you something to negotiate about beyond the single number. It surfaces which elements are genuinely fixed and which reflect assumptions about volume, risk or terms that you may be able to change." },

{ id:"nego3", dom:"nego", d:2,
  q:"In supplier segmentation, which relationship justifies investing in joint improvement projects and executive sponsorship?",
  opts:["A transactional supplier of commodity office products","A strategic supplier whose capability materially affects your competitive position and which would be difficult to replace","Any supplier with annual spend above $100,000","The supplier offering the lowest price"],
  a:1, why:"Relationship investment costs real management time, so it needs to be rationed. The test is business impact and switching difficulty, not spend alone. A high-spend commodity supplier may warrant hard tendering rather than partnership." },

{ id:"nego4", dom:"nego", d:2,
  q:"You need a 6% price reduction. The supplier says their margin will not allow it. Which move most likely creates value for both sides?",
  opts:["Repeat the demand with a deadline","Explore trades outside unit price: longer term, volume commitment, forecast sharing, extended payment terms, or reduced customization","Threaten to tender the business","Accept their position and close"],
  a:1, why:"Insisting on price alone makes it a zero-sum split. Terms that reduce the supplier's own cost or risk let them fund a lower price without losing margin, which is how a durable reduction is reached rather than one clawed back through service." },

{ id:"nego5", dom:"nego", d:2,
  q:"Which preparation step most improves negotiation outcomes?",
  opts:["Rehearsing your opening statement","Mapping your BATNA, your walk-away point, the supplier's likely alternatives and pressures, and the full set of tradeable variables","Deciding your target price","Arranging for a senior executive to attend"],
  a:1, why:"Most negotiations are decided by the preparation rather than the conversation. Knowing the supplier's alternatives and pressures tells you what leverage you actually hold, and listing tradeables in advance stops you from reducing the discussion to price under time pressure." },

{ id:"nego6", dom:"nego", d:3,
  q:"Mid-contract, a sole-source supplier demands a 20% increase citing input costs, with 30 days' notice. Your operation stops without them. Best approach?",
  opts:["Refuse and invoke the contract price","Pay it to protect continuity","Buy time with a short bridging arrangement while you verify the input cost claim against published indices and begin qualifying an alternative","Escalate immediately to litigation"],
  a:2, why:"You have no leverage today, so the task is to create some without stopping the operation. A bridge preserves supply, verification tests whether the claim is genuine or opportunistic, and starting qualification changes your position at the next conversation rather than this one." },

{ id:"nego7", dom:"nego", d:3,
  q:"A supplier proposes a gainshare model on a five-year logistics contract. What most determines whether it works?",
  opts:["The percentage split of the savings","A clear, jointly agreed and auditable baseline, since without it both parties will later disagree about what was actually saved","The length of the contract","Whether a third party administers it"],
  a:1, why:"Gainshare arrangements fail at measurement far more often than at intent. If the baseline is loose, every year becomes an argument about attribution, and the mechanism designed to align the parties becomes the thing that divides them." },

{ id:"logi1", dom:"logi", d:1,
  q:"Under Incoterms 2020 DAP (Delivered at Place), who bears the cost and risk of import customs clearance?",
  opts:["The seller","The buyer","Shared equally","The carrier"],
  a:1, why:"DAP places delivery at the named destination with the seller carrying transport risk to that point, but import clearance, duties and taxes remain the buyer's responsibility. DDP is the term that shifts import clearance to the seller." },

{ id:"logi2", dom:"logi", d:1,
  q:"A bill of lading serves as all of the following EXCEPT:",
  opts:["A receipt for the goods","Evidence of the contract of carriage","A document of title in negotiable form","Proof that customs duties have been paid"],
  a:3, why:"Duty payment is evidenced by customs accounting documents, not the bill of lading. Confusing the two causes real problems at the border, because the BOL says nothing about whether the shipment has been released by customs." },

{ id:"logi3", dom:"logi", d:2,
  q:"Goods manufactured in Mexico are shipped to Alberta. To claim preferential duty treatment under CUSMA, what is required?",
  opts:["A commercial invoice showing Mexican origin","The goods must satisfy the agreement's rules of origin, and a valid certification of origin must support the claim","Shipment must travel by rail","A CBSA ruling obtained in advance"],
  a:1, why:"Country of manufacture on an invoice is not the same as qualifying under the rules of origin, which turn on tariff shift or regional value content. The certification supports the claim, and the importer carries the burden of proof if CBSA verifies it." },

{ id:"logi4", dom:"logi", d:2,
  q:"Your LTL carrier invoices show frequent reweigh and reclass charges. Most likely root cause?",
  opts:["The carrier is overbilling systematically","Inaccurate dimensions, weights or freight class on the bill of lading at origin","Fuel surcharge volatility","Insufficient insurance coverage"],
  a:1, why:"Reweighs and reclasses are the carrier correcting what was declared. The fix is upstream: accurate dimensioning and correct class assignment at shipping, because disputing each charge after the fact is expensive and rarely successful." },

{ id:"logi5", dom:"logi", d:2,
  q:"Demurrage and detention differ in that:",
  opts:["Demurrage applies to rail and detention to trucking","Demurrage is charged for cargo or equipment held at the terminal beyond free time, while detention is charged for equipment held outside the terminal beyond free time","They are interchangeable terms","Detention applies only to international shipments"],
  a:1, why:"The distinction is location. Container sitting at the port past free time is demurrage; container out at your yard past free time is detention. Knowing which you are incurring tells you whether the problem is terminal throughput or your own unloading capacity." },

{ id:"logi6", dom:"logi", d:3,
  q:"Freight costs rose 14% year over year while volume was flat. Which analysis most likely identifies the cause?",
  opts:["Renegotiating rates with the incumbent carrier","Decomposing the change into rate, mode mix, accessorial charges, lane mix and shipment size to isolate which factor moved","Switching to a different 3PL","Consolidating to a single carrier"],
  a:1, why:"A single headline number hides several independent drivers. If the cause is a shift from truckload to LTL because order sizes fell, a rate negotiation solves nothing. Decomposition tells you whether the problem is commercial, operational or a change in demand pattern." },

{ id:"logi7", dom:"logi", d:3,
  q:"You are designing a distribution network for Alberta and BC. Which factor is most often underestimated?",
  opts:["Warehouse rent per square foot","Mountain corridor transit reliability and seasonal closures, which affect service commitments and required buffer inventory far more than facility cost","Labour availability","Property tax rates"],
  a:1, why:"Facility cost is visible and easy to model, so it gets modelled. Transit reliability through the mountain corridors drives safety stock and service failures, and a network optimized purely on landed facility cost can produce a design that cannot hold its service promise in February." },

{ id:"inv1", dom:"inv", d:1,
  q:"Safety stock exists primarily to:",
  opts:["Reduce the number of purchase orders raised","Buffer against variability in demand and in supply lead time during the replenishment period","Lower the unit price through larger orders","Satisfy accounting requirements"],
  a:1, why:"Safety stock covers uncertainty, not average demand. Cycle stock covers the expected demand between orders. Sizing safety stock without measuring the variability it is meant to absorb is the most common planning error." },

{ id:"inv2", dom:"inv", d:1,
  q:"In ABC analysis, A items are typically:",
  opts:["The physically largest items","The small share of items accounting for the large share of annual consumption value","The items with the longest lead time","The newest items in the catalogue"],
  a:1, why:"ABC segments by annual consumption value so that scarce planning attention goes where the money is. A items get tight control and frequent review; C items get simple rules, because managing them individually costs more than they carry." },

{ id:"inv3", dom:"inv", d:2,
  q:"Doubling the lead time, with demand variability unchanged, affects the safety stock requirement how?",
  opts:["It doubles","It increases by roughly the square root of the lead time ratio, so about 41% for a doubling","It stays the same","It halves"],
  a:1, why:"Safety stock scales with the square root of lead time under standard assumptions because variability accumulates as a standard deviation, not linearly. This is also why lead time reduction is such a powerful lever: shortening it cuts required buffer more than most people expect." },

{ id:"inv4", dom:"inv", d:2,
  q:"Forecast accuracy is reported as MAPE of 35%. Bias is near zero. What does this tell you?",
  opts:["The forecast is systematically too high","The forecast is not consistently over or under, but individual period errors are large, so the response is buffer sizing and lead time reduction rather than correcting a tilt","The forecast method should be abandoned","MAPE below 50% is acceptable in all cases"],
  a:1, why:"Bias and accuracy are separate diagnostics. Zero bias means no systematic tilt to correct, so chasing the model is unlikely to help. Large random error is managed through buffers, postponement and shorter lead times." },

{ id:"inv5", dom:"inv", d:2,
  q:"The core purpose of an S&OP process is to:",
  opts:["Produce a more accurate statistical forecast","Reconcile demand, supply, inventory and financial plans into one agreed operating plan with decisions made at executive level","Set annual budgets","Review supplier performance"],
  a:1, why:"S&OP is a decision forum, not a forecasting exercise. Its value comes from resolving the conflicts between what sales expects, what operations can deliver and what finance has committed to, before those conflicts surface as shortages or excess." },

{ id:"inv6", dom:"inv", d:3,
  q:"Inventory turns improved from 4 to 6 but stockouts rose from 2% to 9%. How should this be reported?",
  opts:["As a clear success given the working capital release","As a warning that inventory was cut faster than lead time or variability was reduced, so the working capital gain was funded by lost service","As unrelated metrics","As a forecasting failure"],
  a:1, why:"Turns and service move against each other unless the underlying variability or lead time changed. Reporting the turns gain alone misrepresents what happened, and the lost margin on unfilled demand often exceeds the carrying cost saved." },

{ id:"inv7", dom:"inv", d:3,
  q:"A critical spare has 26-week lead time, unpredictable failure and $180,000 unit cost. Holding one costs roughly $25,000 a year. Downtime runs $400,000 per week. How should the decision be framed?",
  opts:["Do not stock it, since the unit cost exceeds annual carrying cost","Frame it as risk economics: expected downtime cost times failure probability against the annual carrying cost, and consider a shared pool or supplier stocking agreement","Stock three units to be safe","Negotiate the lead time down to four weeks"],
  a:1, why:"Classical EOQ logic does not apply to unpredictable critical spares. One week of downtime dwarfs sixteen years of carrying cost, which usually justifies stocking, but a consignment or pooled arrangement with the OEM or a peer operator can deliver the same protection at lower cost." },

{ id:"ops1", dom:"ops", d:1,
  q:"In Lean thinking, which of the following is NOT one of the classic wastes?",
  opts:["Waiting","Overproduction","Standardization","Excess motion"],
  a:2, why:"Standardization is a countermeasure to waste rather than a waste itself. Standard work establishes the current best-known method so that deviation becomes visible and improvement has a baseline to move from." },

{ id:"ops2", dom:"ops", d:1,
  q:"Cross-docking is most appropriate when:",
  opts:["Inventory must be held for long periods","Inbound volume is pre-allocated to known outbound destinations and can move across the dock with minimal storage","SKU count is very high and demand erratic","Products require kitting and assembly"],
  a:1, why:"Cross-docking removes putaway and picking entirely, but it depends on knowing the destination before the freight arrives. Without reliable allocation and synchronized inbound timing, it degrades into congested staging." },

{ id:"ops3", dom:"ops", d:2,
  q:"Pickers walk excessively in your DC. Which intervention addresses the root cause most directly?",
  opts:["Increasing the number of pickers","Re-slotting so high-velocity SKUs sit in the most accessible locations, and batching or zoning picks to shorten travel","Adding a second shift","Purchasing faster forklifts"],
  a:1, why:"Travel commonly accounts for half of picking labour. Slotting by velocity and reducing trips per line attack that directly, whereas adding people scales the waste rather than removing it." },

{ id:"ops4", dom:"ops", d:2,
  q:"A value stream map shows total lead time of 22 days with 4 hours of value-added time. What does this indicate?",
  opts:["The process is highly efficient","Almost all elapsed time is queueing, batching and waiting, so the improvement opportunity lies in flow rather than in speeding up individual tasks","More staff are required","The map was drawn incorrectly"],
  a:1, why:"A value-added ratio this low is common and it points the improvement effort at the gaps between steps. Making each task faster changes four hours; removing queue and batch delay changes the other twenty-one days." },

{ id:"ops5", dom:"ops", d:3,
  q:"Your DC hits 99.2% pick accuracy but customer complaints about wrong items are rising. Most likely explanation?",
  opts:["The accuracy metric is being falsified","Accuracy is measured at the line level while errors concentrate in a few high-volume SKUs or in packing and shipping, which sit outside the metric","Customers are mistaken","99.2% is inadequate in all industries"],
  a:1, why:"An aggregate figure can look healthy while errors cluster where they do the most damage, and a metric scoped to picking will not see a packing or labelling failure. Segmenting errors by SKU, shift, zone and process step is what locates the real source." },

{ id:"fin1", dom:"fin", d:1,
  q:"Total cost of ownership differs from purchase price because it includes:",
  opts:["Only the purchase price and freight","Acquisition, operating, maintenance, quality, inventory carrying and disposal costs over the asset or service life","The supplier's profit margin","The budgeted amount for the category"],
  a:1, why:"TCO captures what the decision actually costs the organization over time. The lowest-price option frequently carries the highest TCO once downtime, consumables, training and disposal are counted." },

{ id:"fin2", dom:"fin", d:1,
  q:"Cost savings and cost avoidance differ in that:",
  opts:["Savings are larger than avoidance","Savings reduce spend against a comparable prior baseline and show in the budget, while avoidance prevents an increase that would otherwise have occurred","Avoidance is not a legitimate measure","They are the same thing"],
  a:1, why:"Finance can usually see a saving in the budget; avoidance requires you to evidence the counterfactual. Both are real, but reporting avoidance as if it were budget-reducing saving is what erodes finance's trust in procurement numbers." },

{ id:"fin3", dom:"fin", d:2,
  q:"Extending supplier payment terms from 30 to 60 days primarily:",
  opts:["Reduces the unit price paid","Improves your working capital position by increasing days payable outstanding, while pushing the financing cost onto the supplier","Reduces inventory carrying cost","Has no financial effect"],
  a:1, why:"It moves cash, not cost. The supplier may price the extra financing back into the rate, particularly a smaller supplier with higher borrowing costs, so the benefit is not always free and can strain suppliers you depend on." },

{ id:"fin4", dom:"fin", d:2,
  q:"You are building a business case for a WMS. Which element most often makes or breaks credibility with finance?",
  opts:["The technology architecture diagram","A benefit baseline that finance recognizes, with benefits traceable to line items they can verify afterwards","The vendor's reference list","The implementation timeline"],
  a:1, why:"Finance discounts benefits they cannot audit. Tying each claimed benefit to a measurable current-state figure, and agreeing in advance how it will be tracked, is what turns a proposal into an approved one." },

{ id:"fin5", dom:"fin", d:3,
  q:"Landed cost from an overseas supplier is 12% below the domestic alternative. What consideration most often reverses that conclusion?",
  opts:["Supplier relationship quality","The working capital and risk cost of a longer pipeline: additional in-transit and safety stock, currency exposure, and reduced ability to respond to demand change","Time zone differences","Language barriers"],
  a:1, why:"Landed cost is a per-unit view that ignores what the longer pipeline ties up and exposes. Once the extra inventory, FX risk and lost flexibility are priced, a 12% gap frequently narrows or disappears." },

{ id:"fin6", dom:"fin", d:3,
  q:"Your spend dashboard shows the same part number bought at prices ranging from $42 to $71 across four sites. Before acting, you should verify:",
  opts:["That the highest-paying site is at fault","Whether the part numbers genuinely refer to identical items, and whether volume, urgency, freight terms or service differ by site","That all sites use the same supplier","The dashboard refresh schedule"],
  a:1, why:"Price variance findings collapse under scrutiny more often than any other analysis, usually because the item master is inconsistent or one site is buying expedited in small quantities. Verifying comparability before presenting protects your credibility." },

{ id:"esg1", dom:"esg", d:1,
  q:"Scope 3 emissions are:",
  opts:["Direct emissions from owned sources","Indirect emissions from purchased energy","Indirect emissions across the value chain, including purchased goods and services, transportation and end-of-life","Emissions offset through credit purchases"],
  a:2, why:"Scope 3 is where most organizations carry the majority of their footprint, and most of it sits in the supply base. That is why emissions targets quickly become a procurement problem rather than a facilities one." },

{ id:"esg2", dom:"esg", d:2,
  q:"Canada's supply chain forced labour reporting legislation (Bill S-211) requires covered entities to:",
  opts:["Certify their supply chains are free of forced labour","Report annually on the steps taken to prevent and reduce the risk of forced and child labour in their supply chains","Audit every supplier annually","Cease importing from specified countries"],
  a:1, why:"The obligation is transparency about process rather than a guarantee of outcome. Reports must be approved by the governing body and published, which makes the accuracy of what procurement can evidence a governance matter." },

{ id:"esg3", dom:"esg", d:2,
  q:"A supplier code of conduct is most effective when:",
  opts:["It is signed at onboarding and filed","It is backed by risk-based verification, defined consequences and a remediation pathway rather than treated as a one-time attestation","It is as long and detailed as possible","It applies only to overseas suppliers"],
  a:1, why:"An unverified attestation transfers paperwork rather than risk, and provides little defence if a problem surfaces. Risk-based verification concentrates limited assurance effort where the exposure genuinely sits." },

{ id:"esg4", dom:"esg", d:3,
  q:"Your organization commits to a 30% Scope 3 reduction. Procurement's most material first action?",
  opts:["Requiring all suppliers to publish net zero commitments","Establishing a spend-based emissions baseline to identify which categories and suppliers actually drive the footprint, then engaging those specifically","Switching to recycled office supplies","Offsetting the full footprint"],
  a:1, why:"Scope 3 is highly concentrated, and a small number of categories typically carry most of the emissions. Broad supplier mandates spread effort evenly across a very uneven problem and rarely move the number." },

{ id:"dig1", dom:"dig", d:1,
  q:"In an ERP context, master data refers to:",
  opts:["Transactional records such as purchase orders and invoices","The core reference records the system depends on, such as item, supplier, and location records","Backup copies of the database","Reporting dashboards"],
  a:1, why:"Master data is the foundation every transaction references. Duplicate suppliers, inconsistent units of measure or stale item records will corrupt every downstream report no matter how good the analytics layer is." },

{ id:"dig2", dom:"dig", d:2,
  q:"An ERP implementation is running late and over budget. Root cause most commonly is:",
  opts:["Insufficient software licences","Underestimated data cleansing and process redesign, plus customization to preserve existing ways of working","Poor server performance","Inadequate vendor support"],
  a:1, why:"The software rarely fails. Projects fail on dirty data, on undocumented processes surfacing late, and on customizing the system to match current practice instead of deciding whether current practice should change." },

{ id:"dig3", dom:"dig", d:2,
  q:"The strongest early use of AI in a procurement function is typically:",
  opts:["Autonomous supplier selection and award","Classifying and cleansing spend data, extracting terms from contracts, and drafting documents for human review","Replacing category managers","Setting negotiation strategy independently"],
  a:1, why:"The value sits where the work is high-volume, pattern-based and verifiable by a human. Decisions with commercial, legal or fairness consequences need an accountable person, which matters even more in the public and association context." },

{ id:"dig4", dom:"dig", d:3,
  q:"You are evaluating a source-to-pay platform. Which factor most predicts realized value?",
  opts:["Breadth of the feature list","User adoption, driven by process fit and integration with the systems people already work in","The vendor's market share","Implementation speed"],
  a:1, why:"Unused capability delivers nothing, and adoption is where most implementations quietly fail. If the tool adds steps rather than removing them, users route around it and maverick spend reappears in a new form." },

{ id:"lead1", dom:"lead", d:1,
  q:"Influencing without authority depends most on:",
  opts:["Escalating to senior management when blocked","Understanding what each stakeholder is measured on and framing your proposal in those terms","Referring to policy requirements","Persistence in follow-up"],
  a:1, why:"People act on their own objectives. A sourcing change framed as procurement savings lands differently with an operations manager measured on uptime than the same change framed as reduced downtime risk." },

{ id:"lead2", dom:"lead", d:2,
  q:"Your category strategy is technically sound but operations resists it. Most effective response?",
  opts:["Present the analysis again in more detail","Find out what risk or workload the change creates for them and address it directly in the plan","Escalate to the executive sponsor","Implement it as policy"],
  a:1, why:"Resistance is usually information rather than obstruction. Repeating the analysis addresses a comprehension problem that probably does not exist, while the actual objection, often an unfunded burden landing on their team, goes unanswered." },

{ id:"lead3", dom:"lead", d:2,
  q:"Presenting supply chain performance to an executive audience, you should lead with:",
  opts:["The methodology used to gather the data","The decision required or the business implication, with supporting detail available but not leading","A full metric dashboard","Supplier-by-supplier detail"],
  a:1, why:"Executives are allocating attention across many areas. Opening with the implication and the ask lets them engage at the level where their input matters, and the detail is there when they want to test it." },

{ id:"lead4", dom:"lead", d:3,
  q:"You are leading a change that removes local purchasing autonomy from five sites. What most determines success?",
  opts:["The quality of the new policy document","Involving site representatives in designing the model so legitimate local requirements are built in, rather than announcing a finished design","Executive mandate and enforcement","Speed of rollout"],
  a:1, why:"Centralization fails when it is experienced as something done to people who understand a local constraint you did not model. Participation surfaces those constraints while they can still be designed for, and builds the advocacy that enforcement alone never produces." },

{ id:"lead5", dom:"lead", d:3,
  q:"A high performer on your team is frustrated that their process improvement ideas go nowhere. Best first action?",
  opts:["Advise them to be patient","Understand where the ideas stall, then give them a scoped improvement to own end to end with a clear decision path","Assign them to a project team","Offer a compensation adjustment"],
  a:1, why:"Frustration of this kind is almost always about agency rather than reward, and it is the most common reason capable people leave. Ownership of a real change with a clear path to a decision addresses the actual cause." }
];

const QUESTIONS_BY_DOMAIN = {};
QUESTIONS.forEach(function (q) {
  if (!QUESTIONS_BY_DOMAIN[q.dom]) QUESTIONS_BY_DOMAIN[q.dom] = [];
  QUESTIONS_BY_DOMAIN[q.dom].push(q);
});
