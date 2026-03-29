import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText, Plus, Download, ChevronRight, ChevronLeft, X, Check, AlertTriangle,
  Copy, Pen, Send, CheckCircle, Clock, FileSignature,
  BookOpen, Sparkles, ChevronDown, RotateCcw, Search,
  Loader2, FilePlus2, FileCheck, LayoutTemplate, Trash2,
  GripVertical, PlusCircle, ChevronUp, Mail, Shield, Star,
  FileDown, Calendar
} from "lucide-react";
import { DARK, LIGHT, API_BASE } from "../theme.js";

// ─── helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const fmt = (v) => v ? Number(v).toLocaleString("en-IN") : "0";

const STATES_LIST = [
  "Tamil Nadu", "Karnataka", "Maharashtra", "Delhi (NCT)", "Andhra Pradesh",
  "Telangana", "Kerala", "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh",
  "Punjab", "Haryana", "Madhya Pradesh", "Goa", "Bihar", "Himachal Pradesh",
  "Uttarakhand", "Jharkhand", "Chhattisgarh", "Odisha", "Assam", "Other"
];

const CAT_COLOR = {
  "Lease":        { bg: "#0d1a33", border: "#1a2e5a", text: "#60a5fa" },
  "Sale":         { bg: "#0e2a1a", border: "#1a5c32", text: "#4ade80" },
  "Deed":         { bg: "#2a1e08", border: "#5c3d10", text: "#fbbf24" },
  "Development":  { bg: "#1a0a2e", border: "#3d1a6e", text: "#c084fc" },
  "NDA":          { bg: "#1a0a2e", border: "#3d1a6e", text: "#c084fc" },
  "Authorization":{ bg: "#0a2a2a", border: "#1a5c5c", text: "#34d399" },
};

const catColor = (cat, dark) => {
  const c = CAT_COLOR[cat] || CAT_COLOR["NDA"];
  if (!dark) return { bg: "#f1f5ff", border: "#c7d0ff", text: "#4f46e5" };
  return c;
};

// ─── templates ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "res_lease", cat: "Lease", icon: "🏠", name: "Residential Lease Agreement",
    desc: "Standard rental agreement for flats, houses, and independent floors.",
    fields: [
      { k: "landlord_name", l: "Landlord Full Name",       t: "text",   p: "e.g. Rajesh Kumar" },
      { k: "tenant_name",   l: "Tenant Full Name",         t: "text",   p: "e.g. Priya Sharma" },
      { k: "property_addr", l: "Property Address",         t: "area",   p: "Full address including city, state, pincode" },
      { k: "rent",          l: "Monthly Rent (₹)",         t: "number", p: "e.g. 25000" },
      { k: "deposit",       l: "Security Deposit (₹)",     t: "number", p: "e.g. 75000" },
      { k: "start_date",    l: "Lease Start Date",         t: "date" },
      { k: "months",        l: "Duration (months)",        t: "number", p: "e.g. 11" },
      { k: "notice",        l: "Notice Period (days)",     t: "number", p: "e.g. 30" },
      { k: "state",         l: "State",                    t: "state" },
    ],
    gen: (f) => `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement is entered into on ${today()}.

PARTIES
Landlord: ${f.landlord_name || "[Landlord Name]"}
Tenant:   ${f.tenant_name || "[Tenant Name]"}

PROPERTY
${f.property_addr || "[Property Address]"}

TERM
Start Date: ${f.start_date || "[Date]"}  |  Duration: ${f.months || "11"} months
This is a Leave and License Agreement — the Tenant shall vacate on expiry without further notice.

RENT & DEPOSIT
Monthly Rent:      ₹${fmt(f.rent)} (due on 1st of each month)
Security Deposit:  ₹${fmt(f.deposit)} (refundable within 30 days of vacating)
Late payment: 1% per month interest after 5-day grace period.

NOTICE PERIOD
Either party must give ${f.notice || "30"} days' written notice to terminate.

TENANT OBLIGATIONS
1. Use premises only for residential purposes.
2. Not sublet or assign without written consent.
3. Maintain premises in good condition.
4. Not carry out structural modifications without prior written consent.
5. Allow Landlord inspection with 24-hour prior notice.
6. Pay all utility bills (electricity, water, gas) directly.
7. Vacate without additional notice on expiry of lease term.

LANDLORD OBLIGATIONS
1. Ensure peaceful possession and quiet enjoyment.
2. Carry out major structural repairs.
3. Refund security deposit within 30 days of vacating.

GOVERNING LAW
This Agreement is governed by the laws of ${f.state || "India"} and applicable central legislation.
Disputes shall be resolved through mediation then courts of competent jurisdiction.

SIGNATURES

Landlord: ____________________________   Date: ___________
${f.landlord_name || "[Landlord Name]"}

Tenant:   ____________________________   Date: ___________
${f.tenant_name || "[Tenant Name]"}

Witness 1: ___________________________   Date: ___________
Witness 2: ___________________________   Date: ___________
`,
  },
  {
    id: "com_lease", cat: "Lease", icon: "🏢", name: "Commercial Lease Agreement",
    desc: "For offices, shops, showrooms, warehouses. Includes CAM charges, lock-in, and escalation.",
    fields: [
      { k: "lessor",     l: "Lessor (Landlord) Name",  t: "text",   p: "Individual or Company" },
      { k: "lessee",     l: "Lessee (Tenant) Name",    t: "text",   p: "Individual or Company" },
      { k: "addr",       l: "Premises Address",        t: "area",   p: "Full address with floor/unit" },
      { k: "use",        l: "Permitted Use",           t: "text",   p: "e.g. IT Office, Retail, Warehouse" },
      { k: "rent",       l: "Monthly Base Rent (₹)",   t: "number", p: "e.g. 150000" },
      { k: "cam",        l: "CAM Charges (₹/month)",   t: "number", p: "e.g. 15000" },
      { k: "deposit",    l: "Security Deposit (₹)",    t: "number", p: "e.g. 450000" },
      { k: "start",      l: "Commencement Date",       t: "date" },
      { k: "years",      l: "Duration (years)",        t: "number", p: "e.g. 3" },
      { k: "lockin",     l: "Lock-In Period (months)", t: "number", p: "e.g. 12" },
      { k: "escalation", l: "Annual Escalation (%)",   t: "number", p: "e.g. 5" },
    ],
    gen: (f) => `COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement is executed on ${today()}.

PARTIES
Lessor: ${f.lessor || "[Lessor Name]"}
Lessee: ${f.lessee || "[Lessee Name]"}

PREMISES
${f.addr || "[Premises Address]"}
Permitted Use: ${f.use || "[Permitted Use]"}

TERM
Commencement: ${f.start || "[Date]"}  |  Duration: ${f.years || "3"} year(s)
Lock-In Period: ${f.lockin || "12"} months — neither party may terminate during this period.

FINANCIALS
Base Monthly Rent:    ₹${fmt(f.rent)}
CAM / Maintenance:    ₹${fmt(f.cam)}/month
Security Deposit:     ₹${fmt(f.deposit)} (refundable, interest-free)
Annual Escalation:    ${f.escalation || "5"}% per annum on base rent.
Payment Due:          5th of each calendar month. GST applicable.

FIT-OUT PERIOD
30 rent-free days from handing over possession. CAM charges applicable during this period.

TERMINATION
After lock-in: either party may terminate with 3 months' written notice.
Early exit during lock-in: pay rent for remaining lock-in period.

LESSEE OBLIGATIONS
1. Use premises solely for the stated permitted purpose.
2. Not sublease without prior written consent of Lessor.
3. Maintain premises; return in original condition (fair wear and tear excepted).
4. Obtain all required licenses and comply with all regulations.
5. Not make structural alterations without written approval.

LESSOR OBLIGATIONS
1. Provide premises in habitable, fit-for-use condition.
2. Maintain structural integrity and common areas.
3. Refund deposit within 45 days of vacating after settling dues.

DISPUTE RESOLUTION
Disputes shall be referred to arbitration under the Arbitration and Conciliation Act 1996.

SIGNATURES

Lessor: ____________________________   Date: ___________
${f.lessor || "[Lessor Name]"}

Lessee: ____________________________   Date: ___________
${f.lessee || "[Lessee Name]"}

Witness 1: _________________________   Date: ___________
Witness 2: _________________________   Date: ___________
`,
  },
  {
    id: "leave_license", cat: "Lease", icon: "🔑", name: "Leave & License Agreement",
    desc: "Short-term permissive occupation — commonly used in Maharashtra. Creates license, not tenancy.",
    fields: [
      { k: "licensor",  l: "Licensor Name",           t: "text",   p: "Property owner's full name" },
      { k: "licensee",  l: "Licensee Name",           t: "text",   p: "Occupant's full name" },
      { k: "addr",      l: "Licensed Premises",       t: "area",   p: "Flat/plot address with pincode" },
      { k: "fee",       l: "Monthly License Fee (₹)", t: "number", p: "e.g. 35000" },
      { k: "deposit",   l: "Refundable Deposit (₹)",  t: "number", p: "e.g. 105000" },
      { k: "start",     l: "Commencement Date",       t: "date" },
      { k: "months",    l: "Duration (months)",       t: "number", p: "e.g. 11" },
    ],
    gen: (f) => `LEAVE AND LICENSE AGREEMENT

This Leave and License Agreement is executed on ${today()}.

PARTIES
Licensor: ${f.licensor || "[Licensor]"}
Licensee: ${f.licensee || "[Licensee]"}

PREMISES
${f.addr || "[Premises Address]"}

IMPORTANT: This Agreement creates a License under Section 52 of the Indian Easements Act 1882 and NOT a tenancy. The Licensor retains full ownership and possession at all times.

LICENSE FEE & DEPOSIT
Monthly License Fee:     ₹${fmt(f.fee)} (due 1st of each month)
Refundable Deposit:      ₹${fmt(f.deposit)} (refunded within 30 days of vacating)

PERIOD
From: ${f.start || "[Date]"}  |  Duration: ${f.months || "11"} months
The License automatically stands revoked on expiry. The Licensee MUST vacate without any further notice.

CONDITIONS
1. Use only for residential/personal purposes. Sub-licensing strictly prohibited.
2. Pay all utility charges directly.
3. No structural alterations permitted.
4. The Licensor may revoke on 30 days' notice at any time.
5. On expiry or revocation, peaceful surrender of possession is required.

SIGNATURES

Licensor: ____________________________   Date: ___________
${f.licensor || "[Licensor]"}

Licensee: ____________________________   Date: ___________
${f.licensee || "[Licensee]"}

Witness 1: ___________________________   Date: ___________
Witness 2: ___________________________   Date: ___________
`,
  },
  {
    id: "sale_agree", cat: "Sale", icon: "📋", name: "Agreement to Sell",
    desc: "Pre-sale binding agreement between buyer and seller before execution of the final sale deed.",
    fields: [
      { k: "seller",   l: "Seller Full Name",              t: "text",   p: "e.g. Suresh Pillai" },
      { k: "buyer",    l: "Buyer Full Name",               t: "text",   p: "e.g. Anita Nair" },
      { k: "property", l: "Property Description",          t: "area",   p: "Survey No, Village/City, District, State" },
      { k: "area",     l: "Property Area",                 t: "text",   p: "e.g. 1200 sq. ft." },
      { k: "price",    l: "Total Sale Price (₹)",          t: "number", p: "e.g. 5000000" },
      { k: "advance",  l: "Advance / Token Amount (₹)",    t: "number", p: "e.g. 500000" },
      { k: "deadline", l: "Sale Deed Execution Deadline",  t: "date" },
      { k: "state",    l: "State",                         t: "state" },
    ],
    gen: (f) => `AGREEMENT TO SELL

This Agreement to Sell is executed on ${today()}.

PARTIES
Vendor (Seller):    ${f.seller || "[Seller Name]"}
Purchaser (Buyer):  ${f.buyer || "[Buyer Name]"}

PROPERTY
${f.property || "[Property Description]"}
Area: ${f.area || "[Area]"}

CONSIDERATION
Total Sale Price:    ₹${fmt(f.price)}
Advance Paid Today:  ₹${fmt(f.advance)} (acknowledged by Vendor)
Balance Payable:     ₹${fmt((Number(f.price) || 0) - (Number(f.advance) || 0))} on execution of Sale Deed.

EXECUTION DATE
The Vendor shall execute the Sale Deed on or before ${f.deadline || "[Date]"} upon receipt of the full balance.

VENDOR WARRANTIES
1. Property is free from all encumbrances, liens, mortgages, and prior agreements.
2. All original title documents will be handed over at Sale Deed execution.
3. All property tax and dues will be paid up to the date of possession.
4. No third-party interest will be created on the property.

PURCHASER OBLIGATIONS
1. Pay balance consideration on the agreed date.
2. Bear stamp duty and registration charges for the Sale Deed.
3. Deduct TDS at 1% for property above ₹50 lakhs (Form 26QB).

DEFAULT
Vendor defaults: Advance returned 2× to Purchaser; Purchaser may seek specific performance.
Purchaser defaults: Advance forfeited at Vendor's discretion.

GOVERNING LAW
Transfer of Property Act 1882 and laws of ${f.state || "India"}.

SIGNATURES

Vendor: ____________________________   Date: ___________
${f.seller || "[Seller]"}

Purchaser: _________________________   Date: ___________
${f.buyer || "[Buyer]"}

Witness 1: _________________________   Date: ___________
Witness 2: _________________________   Date: ___________
`,
  },
  {
    id: "gift_deed", cat: "Deed", icon: "🎁", name: "Gift Deed",
    desc: "Transfer of immovable property without consideration. Must be registered to be valid.",
    fields: [
      { k: "donor",    l: "Donor Name",                   t: "text",   p: "Person gifting the property" },
      { k: "donee",    l: "Donee Name",                   t: "text",   p: "Person receiving the gift" },
      { k: "relation", l: "Relationship",                 t: "text",   p: "e.g. Father, Spouse, Son" },
      { k: "property", l: "Property Description",         t: "area",   p: "Survey/Door/Plot number, area, location" },
      { k: "value",    l: "Approximate Market Value (₹)", t: "number", p: "For stamp duty calculation" },
      { k: "state",    l: "State",                        t: "state" },
    ],
    gen: (f) => `GIFT DEED

This Gift Deed is executed on ${today()}.

PARTIES
Donor: ${f.donor || "[Donor]"} (hereinafter "the Donor")
Donee: ${f.donee || "[Donee]"} (hereinafter "the Donee")
Relationship: The Donee is the ${f.relation || "[Relationship]"} of the Donor.

RECITALS
The Donor is the absolute owner of the property described herein and desires to gift the same to the Donee out of love, affection, and goodwill, WITHOUT ANY CONSIDERATION.

PROPERTY GIFTED
${f.property || "[Property Description]"}
Approximate Market Value: ₹${fmt(f.value)}

GIFT
The Donor hereby freely and voluntarily GIVES, GRANTS, TRANSFERS, and CONVEYS all rights, title, interest, and ownership in the above property to the Donee absolutely and forever.

ACCEPTANCE
The Donee hereby accepts this gift during the lifetime of the Donor.

DONOR REPRESENTATIONS
1. Clear and marketable title; free from all encumbrances.
2. Not executed under any coercion or undue influence.
3. This gift is irrevocable except as permitted by law.

STAMP DUTY NOTE
Stamp duty payable as per ${f.state || "applicable state"} laws. Reduced rates apply for family gifts.
Registration is COMPULSORY under Section 17 of the Registration Act 1908.

SIGNATURES

Donor: ____________________________    Date: ___________
${f.donor || "[Donor]"}

Donee (Acceptance): ________________   Date: ___________
${f.donee || "[Donee]"}

Witness 1: _________________________   Date: ___________
Witness 2: _________________________   Date: ___________
`,
  },
  {
    id: "mortgage", cat: "Deed", icon: "🏦", name: "Simple Mortgage Deed",
    desc: "Transfer of interest in immovable property as security for a loan. Mortgagor retains possession.",
    fields: [
      { k: "mortgagor", l: "Mortgagor Name (Borrower)",  t: "text",   p: "Person borrowing the money" },
      { k: "mortgagee", l: "Mortgagee Name (Lender)",    t: "text",   p: "Person lending the money" },
      { k: "loan",      l: "Loan Amount (₹)",            t: "number", p: "e.g. 2000000" },
      { k: "rate",      l: "Interest Rate (% p.a.)",     t: "number", p: "e.g. 10" },
      { k: "tenure",    l: "Repayment Period (months)",  t: "number", p: "e.g. 60" },
      { k: "property",  l: "Mortgaged Property",         t: "area",   p: "Survey no., area, location" },
      { k: "state",     l: "State",                      t: "state" },
    ],
    gen: (f) => `SIMPLE MORTGAGE DEED

This Simple Mortgage Deed is executed on ${today()}.

PARTIES
Mortgagor (Borrower): ${f.mortgagor || "[Mortgagor]"}
Mortgagee (Lender):   ${f.mortgagee || "[Mortgagee]"}

LOAN
Principal Amount: ₹${fmt(f.loan)}
Interest Rate:    ${f.rate || "[Rate]"}% per annum
Repayment:        ${f.tenure || "[Tenure]"} months from date of execution.
Default interest: 2% per month above contracted rate on overdue amounts.

MORTGAGED PROPERTY
${f.property || "[Property Description]"}

MORTGAGE TYPE
This is a Simple Mortgage under Section 58(b) of the Transfer of Property Act 1882.
The Mortgagor retains possession of the property. Only security interest is transferred.
The Mortgagee has the right to sell the property through court proceedings upon default.

MORTGAGOR OBLIGATIONS
1. Pay all instalments on the agreed dates.
2. Maintain the property in good condition.
3. Not create any further encumbrance without mortgagee's consent.
4. Pay all property tax and government dues.
5. Keep the property adequately insured.

REDEMPTION
Upon full repayment, the Mortgagee shall execute a Reconveyance Deed releasing the mortgage.
The right of redemption cannot be clogged or fettered (Transfer of Property Act, Sec 60).

GOVERNING LAW
Transfer of Property Act 1882, laws of ${f.state || "India"}.

SIGNATURES

Mortgagor: __________________________   Date: ___________
${f.mortgagor || "[Mortgagor]"}

Mortgagee: __________________________   Date: ___________
${f.mortgagee || "[Mortgagee]"}

Witness 1: __________________________   Date: ___________
Witness 2: __________________________   Date: ___________
`,
  },
  {
    id: "partition", cat: "Deed", icon: "⚖️", name: "Partition Deed",
    desc: "Divides jointly-held property among co-owners. Ends co-ownership. Must be registered.",
    fields: [
      { k: "party_a",  l: "Party A Name",                t: "text", p: "First co-owner" },
      { k: "party_b",  l: "Party B Name",                t: "text", p: "Second co-owner" },
      { k: "party_c",  l: "Party C Name (if any)",       t: "text", p: "Third co-owner (leave blank if only 2)" },
      { k: "property", l: "Property Description",        t: "area", p: "Full description of the jointly held property" },
      { k: "share_a",  l: "Share of Party A",            t: "text", p: "e.g. Eastern portion / 50%" },
      { k: "share_b",  l: "Share of Party B",            t: "text", p: "e.g. Western portion / 50%" },
      { k: "state",    l: "State",                       t: "state" },
    ],
    gen: (f) => `PARTITION DEED

This Partition Deed is executed on ${today()}.

PARTIES
Party A: ${f.party_a || "[Party A]"}
Party B: ${f.party_b || "[Party B]"}${f.party_c ? `\nParty C: ${f.party_c}` : ""}

RECITALS
All parties are co-owners of the property described below and have mutually agreed to partition the same.

PROPERTY (Joint)
${f.property || "[Property Description]"}

PARTITION
By mutual consent, the property is partitioned as follows:

Party A — ${f.party_a || "[Party A]"} shall hold:
${f.share_a || "[Share A description]"}

Party B — ${f.party_b || "[Party B]"} shall hold:
${f.share_b || "[Share B description]"}${f.party_c ? `\n\nParty C — ${f.party_c} shall hold:\n[Share C description]` : ""}

EFFECT OF PARTITION
1. This partition is final and binding.
2. Each party relinquishes all rights over the other's share.
3. Each party is responsible for their own property tax from the date of partition.
4. Common passageways and amenities (if any) shall be shared equally.

REGISTRATION & STAMP DUTY
This Partition Deed must be compulsorily registered. Stamp duty payable on the separated share as per ${f.state || "applicable state"} Stamp Act.

SIGNATURES

Party A: ____________________________   Date: ___________
${f.party_a || "[Party A]"}

Party B: ____________________________   Date: ___________
${f.party_b || "[Party B]"}${f.party_c ? `\n\nParty C: ____________________________   Date: ___________\n${f.party_c}` : ""}

Witness 1: _________________________   Date: ___________
Witness 2: _________________________   Date: ___________
`,
  },
  {
    id: "jda", cat: "Development", icon: "🏗️", name: "Joint Development Agreement",
    desc: "Agreement between landowner and developer for development of land. Defines revenue sharing, timelines, and area allocation.",
    fields: [
      { k: "owner",     l: "Landowner Name",              t: "text",   p: "Full name / Company" },
      { k: "developer", l: "Developer Name",              t: "text",   p: "Full name / Company" },
      { k: "land",      l: "Land Description",            t: "area",   p: "Survey no., area, location" },
      { k: "land_area", l: "Land Area",                   t: "text",   p: "e.g. 2400 sq.ft / 0.5 acres" },
      { k: "owner_pct", l: "Owner's Share (%)",           t: "number", p: "e.g. 40" },
      { k: "dev_pct",   l: "Developer's Share (%)",       t: "number", p: "e.g. 60" },
      { k: "timeline",  l: "Project Completion (months)", t: "number", p: "e.g. 36" },
      { k: "state",     l: "State",                       t: "state" },
    ],
    gen: (f) => `JOINT DEVELOPMENT AGREEMENT

This Joint Development Agreement (JDA) is executed on ${today()}.

PARTIES
Landowner: ${f.owner || "[Owner]"} (hereinafter "Owner")
Developer: ${f.developer || "[Developer]"} (hereinafter "Developer")

LAND
${f.land || "[Land Description]"}
Total Area: ${f.land_area || "[Area]"}

DEVELOPMENT RIGHTS
The Owner grants development rights to the Developer to develop the above land.
The Developer shall construct the project at its own cost and expense.

AREA SHARING
Owner's Allocation:    ${f.owner_pct || "[%]"}% of total developed area
Developer's Share:     ${f.dev_pct || "[%]"}% of total developed area
Sharing basis: Built-up area after deducting common areas and statutory deductions.

TIMELINE
Project Completion:    ${f.timeline || "[months]"} months from BDA/RERA approval date.
Possession Handover:   Within 30 days of OC (Occupancy Certificate).
Delay penalty:         ₹5 per sq.ft. per month on Owner's allocation if delayed beyond 6 months.

DEVELOPER OBLIGATIONS
1. Obtain all approvals (RERA, building plan, BDA/GHMC/BBMP).
2. Construct as per sanctioned plan and agreed specifications.
3. Register RERA project and maintain escrow account (70% of collections).
4. Handover Owner's portion on receipt of OC.
5. Not mortgage the land or Owner's share without Owner's consent.

OWNER OBLIGATIONS
1. Execute all documents required for approvals and construction.
2. Not interfere with construction activities.
3. Not create any encumbrance on the land during development.

DISPUTE RESOLUTION
Arbitration under the Arbitration and Conciliation Act 1996, ${f.state || "India"}.

SIGNATURES

Owner: ______________________________   Date: ___________
${f.owner || "[Owner]"}

Developer: _________________________    Date: ___________
${f.developer || "[Developer]"}

Witness 1: _________________________    Date: ___________
Witness 2: _________________________    Date: ___________
`,
  },
  {
    id: "nda", cat: "NDA", icon: "🔒", name: "Non-Disclosure Agreement",
    desc: "Protects confidential information in property negotiations, joint ventures, or business dealings.",
    fields: [
      { k: "party_a", l: "Disclosing Party",              t: "text",   p: "Company or individual sharing info" },
      { k: "party_b", l: "Receiving Party",               t: "text",   p: "Company or individual receiving info" },
      { k: "purpose", l: "Purpose of Disclosure",         t: "text",   p: "e.g. Property joint venture evaluation" },
      { k: "years",   l: "Confidentiality Duration (yrs)", t: "number", p: "e.g. 3" },
      { k: "state",   l: "Governing State",               t: "state" },
    ],
    gen: (f) => `NON-DISCLOSURE AGREEMENT

This NDA is entered into on ${today()}.

PARTIES
Disclosing Party: ${f.party_a || "[Party A]"}
Receiving Party:  ${f.party_b || "[Party B]"}

PURPOSE
${f.purpose || "[Purpose of disclosure]"}

CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information including financial data, property documents, business strategies, negotiations, technical data, or legal documents disclosed in any form.

OBLIGATIONS
1. Keep all Confidential Information strictly confidential.
2. Not disclose to any third party without prior written consent.
3. Use only for the stated purpose.
4. Protect with reasonable care (minimum standard of own confidential data).
5. Promptly notify of any unauthorised disclosure.

EXCLUSIONS
This NDA does not apply to: publicly known information; information already known to Receiving Party; information from third parties without breach; disclosures required by law (with advance notice).

DURATION
Obligation of confidentiality: ${f.years || "3"} year(s) from date of execution.

REMEDIES
Breach may cause irreparable harm. Disclosing Party may seek injunctive relief in addition to monetary damages.

GOVERNING LAW
Laws of India; jurisdiction in courts of ${f.state || "[City/State]"}.

SIGNATURES

Disclosing Party: ___________________   Date: ___________
${f.party_a || "[Party A]"}

Receiving Party: ____________________   Date: ___________
${f.party_b || "[Party B]"}
`,
  },
  {
    id: "poa", cat: "Authorization", icon: "✍️", name: "Power of Attorney (Property)",
    desc: "Authorizes another person to act on your behalf for property transactions.",
    fields: [
      { k: "principal", l: "Principal Name (Authoriser)", t: "text", p: "Person granting the power" },
      { k: "agent",     l: "Agent / Attorney Name",       t: "text", p: "Person receiving the authority" },
      { k: "relation",  l: "Relationship",                t: "text", p: "e.g. Son, Spouse, Authorized Representative" },
      { k: "property",  l: "Property Details",            t: "area", p: "Description of property for which authority is given" },
      { k: "powers",    l: "Powers Granted",              t: "text", p: "e.g. Sale, Purchase, Lease, Registration" },
      { k: "state",     l: "State",                       t: "state" },
    ],
    gen: (f) => `POWER OF ATTORNEY (PROPERTY)

This Power of Attorney is executed on ${today()}.

PRINCIPAL
${f.principal || "[Principal Name]"} (hereinafter "the Principal")

AGENT / ATTORNEY
${f.agent || "[Agent Name]"} (hereinafter "the Attorney-in-Fact")
Relationship: ${f.relation || "[Relationship]"} of the Principal

PROPERTY
${f.property || "[Property Description]"}

AUTHORITY GRANTED
The Principal hereby authorizes the Attorney-in-Fact to act on the Principal's behalf for the following:
${f.powers || "[Powers granted — sale, purchase, lease, registration, etc.]"}

This authority includes the power to:
1. Sign and execute any documents related to the above property.
2. Appear before any Sub-Registrar, Court, Revenue authority, or Government office.
3. Receive and pay consideration on behalf of the Principal.
4. Apply for mutations, encumbrance certificates, and other revenue records.
5. Engage legal counsel and take all necessary legal steps.

LIMITATION
This Power of Attorney is limited to the property and powers described above.
This Power of Attorney ${f.principal ? "may be revoked by the Principal at any time by written notice." : "[revocability terms]"}

GOVERNING LAW
This document is governed by the Powers of Attorney Act 1882 and laws of ${f.state || "India"}.

SIGNATURES

Principal: ____________________________   Date: ___________
${f.principal || "[Principal Name]"}

Attorney: _____________________________   Date: ___________
${f.agent || "[Agent Name]"}

Witness 1: ____________________________   Date: ___________
Witness 2: ____________________________   Date: ___________

(Notarization / Attestation recommended for use abroad)
`,
  },
  {
    id: "relinquishment", cat: "Deed", icon: "🤝", name: "Relinquishment Deed",
    desc: "Co-owner gives up their share in a property in favour of another co-owner. Common in inheritance situations.",
    fields: [
      { k: "relinguisher",  l: "Relinquishing Party Name",   t: "text", p: "Person giving up share" },
      { k: "recipient",     l: "Beneficiary Name",           t: "text", p: "Person receiving the share" },
      { k: "relation",      l: "Relationship",               t: "text", p: "e.g. Brother, Sister, Spouse" },
      { k: "property",      l: "Property Description",       t: "area", p: "Survey no., area, location, registration details" },
      { k: "share",         l: "Share Being Relinquished",   t: "text", p: "e.g. 50% undivided share" },
      { k: "consideration", l: "Consideration (₹ or 'Nil')", t: "text", p: "Amount paid or 'Nil' for family gift" },
      { k: "state",         l: "State",                      t: "state" },
    ],
    gen: (f) => `RELINQUISHMENT DEED

This Relinquishment Deed is executed on ${today()}.

PARTIES
Relinquishing Party: ${f.relinguisher || "[Relinquishing Party]"}
Beneficiary:         ${f.recipient || "[Beneficiary]"}
Relationship:        ${f.relation || "[Relationship]"}

PROPERTY
${f.property || "[Property Description]"}

RELINQUISHMENT
The Relinquishing Party hereby freely and voluntarily relinquishes, releases, and gives up their share of:

${f.share || "[Undivided share description]"}

in the above property in favour of the Beneficiary.

CONSIDERATION
Consideration paid/received: ${f.consideration || "Nil"} (${f.consideration && f.consideration !== "Nil" ? "acknowledged" : "this relinquishment is without any monetary consideration"})

EFFECT
1. Upon registration of this deed, the Relinquishing Party shall have no further right, title, or claim over the relinquished share.
2. The Beneficiary shall become the sole absolute owner of the entire property.
3. This relinquishment is irrevocable.

REPRESENTATIONS
1. The Relinquishing Party has legal right and capacity to relinquish the said share.
2. The property is free from encumbrances created by the Relinquishing Party.
3. No coercion, fraud, or undue influence has been exercised.

STAMP DUTY
Stamp duty on relinquishment deed is payable as per ${f.state || "applicable state"} Stamp Act.
Registration at Sub-Registrar office is mandatory.

SIGNATURES

Relinquishing Party: _________________   Date: ___________
${f.relinguisher || "[Relinquishing Party]"}

Beneficiary: ________________________    Date: ___________
${f.recipient || "[Beneficiary]"}

Witness 1: __________________________    Date: ___________
Witness 2: __________________________    Date: ___________
`,
  },
];

// ─── Custom Date Picker ───────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function DatePicker({ value, onChange, dark, D }) {
  const [open, setOpen]         = useState(false);
  const [pos,  setPos]          = useState({ top: 0, left: 0, width: 0 });
  const [viewYear,  setViewYear]  = useState(() => value ? parseInt(value.split("-")[0]) : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split("-")[1]) - 1 : new Date().getMonth());
  const triggerRef = useRef(null);

  const openCalendar = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const calH = 210;
    const spaceBelow = window.innerHeight - r.bottom;
    const above = spaceBelow < calH + 8;
    setPos({
      top:   above ? r.top + window.scrollY - calH - 6 : r.bottom + window.scrollY + 6,
      left:  r.left + window.scrollX,
      width: r.width,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        !document.getElementById("dp-portal")?.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedDate  = value ? new Date(value + "T00:00:00") : null;
  const displayValue  = selectedDate
    ? selectedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDay = (d) => {
    if (!d) return;
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (d) => d && selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === d;

  const isToday = (d) => {
    if (!d) return false;
    const t = new Date();
    return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d;
  };

  const calendar = open ? createPortal(
    <div id="dp-portal" style={{
      position: "absolute",
      top: pos.top, left: pos.left, width: 196,
      zIndex: 99999,
      background: dark ? "#161b22" : "#ffffff",
      border: `1px solid ${dark ? "rgba(79,110,247,0.4)" : "#d1d5db"}`,
      borderRadius: 10,
      boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.7)" : "0 8px 24px rgba(0,0,0,0.15)",
      padding: "8px", userSelect: "none",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <button onClick={prevMonth} style={{
          width: 20, height: 20, borderRadius: 5, border: "none", cursor: "pointer",
          background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
          color: D.text, display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronLeft size={11} /></button>
        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: D.text }}>
          {MONTHS[viewMonth].slice(0,3)} {viewYear}
        </span>
        <button onClick={nextMonth} style={{
          width: 20, height: 20, borderRadius: 5, border: "none", cursor: "pointer",
          background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
          color: D.text, display: "flex", alignItems: "center", justifyContent: "center",
        }}><ChevronRight size={11} /></button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.52rem", fontWeight: 700, color: D.textSubtle }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1 }}>
        {cells.map((d, i) => (
          <button key={i} onClick={() => selectDay(d)} style={{
            height: 22, width: "100%", borderRadius: 5, border: "none",
            cursor: d ? "pointer" : "default", fontSize: "0.6rem",
            fontWeight: isSelected(d) ? 700 : isToday(d) ? 600 : 400,
            background: isSelected(d)
              ? "linear-gradient(135deg,#4f6ef7,#7c3aed)"
              : isToday(d)
                ? dark ? "rgba(79,110,247,0.18)" : "rgba(79,110,247,0.1)"
                : "transparent",
            color: isSelected(d) ? "#fff" : isToday(d) ? "#4f6ef7" : d ? D.text : "transparent",
            transition: "background 0.1s",
          }}>{d || ""}</button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 5, borderTop: `1px solid ${D.border}` }}>
        <button onClick={() => { onChange(""); setOpen(false); }} style={{
          fontSize: "0.55rem", color: D.textMuted, background: "none", border: "none", cursor: "pointer", padding: "1px 4px",
        }}>Clear</button>
        <button onClick={() => {
          const t = new Date();
          setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); selectDay(t.getDate());
        }} style={{
          fontSize: "0.55rem", color: "#4f6ef7", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "1px 4px",
        }}>Today</button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div ref={triggerRef} onClick={openCalendar}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer"
        style={{
          background: D.surfaceAlt,
          border: `1px solid ${open ? "#4f6ef7" : D.border}`,
          color: displayValue ? D.text : D.textSubtle,
          transition: "border-color 0.15s",
        }}>
        <span>{displayValue || "dd · mm · yyyy"}</span>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: open ? "rgba(79,110,247,0.2)" : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          transition: "background 0.15s",
        }}>
          <Calendar size={12} style={{ color: open ? "#4f6ef7" : D.textMuted }} />
        </div>
      </div>
      {calendar}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DraftPage({ dark, token, onDocCreated, toast, onPageContext }) {
  const D = dark ? DARK : LIGHT;

  const [view,     setView]     = useState("gallery"); // gallery|builder|preview
  const [tpl,      setTpl]      = useState(null);
  const [form,     setForm]     = useState({});
  const [docText,  setDocText]  = useState("");
  const [editing,  setEditing]  = useState(false);
  const [editText, setEditText] = useState("");

  const [sections,     setSections]     = useState([]);
  const [newSecTitle,  setNewSecTitle]  = useState("");
  const [newSecBody,   setNewSecBody]   = useState("");
  const [showAddSec,   setShowAddSec]   = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult,  setAiResult]  = useState(null);
  const [aiError,   setAiError]   = useState("");

  const [signStep,  setSignStep]  = useState("idle"); // idle|compose|sending|sent|error
  const [signName,  setSignName]  = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signMsg,   setSignMsg]   = useState("");
  const [signErr,   setSignErr]   = useState("");

  const [dlLoading, setDlLoading] = useState("");
  const [copied,    setCopied]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const [catFilter, setCatFilter] = useState("All");
  const [searchQ,   setSearchQ]   = useState("");

  const categories = ["All", ...Array.from(new Set(TEMPLATES.map(t => t.cat)))];
  const filtered   = TEMPLATES.filter(t => {
    if (catFilter !== "All" && t.cat !== catFilter) return false;
    if (searchQ && !t.name.toLowerCase().includes(searchQ.toLowerCase()) &&
        !t.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const activeText = editing ? editText : docText;

  // ── generate doc ──────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    let base = tpl.gen(form);
    if (sections.length > 0) {
      const extra = sections.map(s => `${s.title.toUpperCase()}\n${s.content}`).join("\n\n");
      if (base.includes("SIGNATURES")) {
        base = base.replace("SIGNATURES", extra + "\n\nSIGNATURES");
      } else {
        base += "\n\n" + extra;
      }
    }
    setDocText(base);
    setEditText(base);
    setAiResult(null);
    setAiError("");
    setSignStep("idle");
    setView("preview");
    if (onPageContext) onPageContext(`Draft Preview — ${tpl.name}\n\n${base}`);
  }, [tpl, form, sections, onPageContext]);

  // ── AI analyse ────────────────────────────────────────────
  const handleAnalyse = useCallback(async () => {
    setAiLoading(true); setAiResult(null); setAiError("");
    try {
      const res = await fetch(`${API_BASE}/analyse-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: activeText }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResult(data);
    } catch (e) {
      setAiError(e.message || "Analysis failed — please try again.");
    }
    setAiLoading(false);
  }, [activeText, token]);

  // ── download PDF ──────────────────────────────────────────
  const handleDownloadPdf = useCallback(async () => {
    setDlLoading("pdf");
    try {
      const res = await fetch(`${API_BASE}/export-doc-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: tpl?.name || "Document", content: activeText }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${tpl?.name || "Document"}.pdf`; a.click();
    } catch (e) { alert("PDF download failed: " + e.message); }
    setDlLoading("");
  }, [activeText, token, tpl]);

  // ── download DOCX ─────────────────────────────────────────
  const handleDownloadDocx = useCallback(async () => {
    setDlLoading("docx");
    try {
      const res = await fetch(`${API_BASE}/export-doc-docx`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title: tpl?.name || "Document", content: activeText }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${tpl?.name || "Document"}.docx`; a.click();
    } catch (e) { alert("DOCX download failed: " + e.message); }
    setDlLoading("");
  }, [activeText, token, tpl]);

  // ── download TXT ──────────────────────────────────────────
  const handleDownloadTxt = () => {
    const blob = new Blob([activeText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${tpl?.name || "Document"}.txt`; a.click();
  };

  // ── copy ──────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(activeText);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // ── send sign request ─────────────────────────────────────
  const handleSendSign = useCallback(async () => {
    if (!signEmail || !signName) { setSignErr("Name and email are required."); return; }
    setSignStep("sending"); setSignErr("");
    try {
      const res = await fetch(`${API_BASE}/send-sign-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          to_email:    signEmail,
          to_name:     signName,
          from_name:   "LegalEase AI User",
          doc_title:   tpl?.name || "Legal Document",
          message:     signMsg,
          doc_content: activeText,
        }),
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Send failed");
      setSignStep("sent");
      if (onDocCreated) {
        onDocCreated({
          id: Date.now(), type: "document",
          name: tpl?.name || "Document",
          templateId: tpl?.id,
          category: tpl?.cat,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          aiScore: aiResult?.risk_score ?? null,
          aiLabel: aiResult?.risk_level ?? null,
          aiAnalysis: aiResult ? {
            summary: aiResult.summary || "",
            pros: aiResult.pros || [],
            cons: aiResult.cons || [],
            legal_terms: aiResult.legal_terms || [],
            risk_score: aiResult.risk_score,
            risk_level: aiResult.risk_level,
          } : null,
          signStatus: "Sent for signing",
          signTo: signEmail,
          content: activeText,
          docContent: activeText,
        });
      }
    } catch (e) {
      setSignErr(e.message || "Failed to send email.");
      setSignStep("compose");
    }
  }, [signEmail, signName, signMsg, activeText, token, tpl, aiResult, onDocCreated]);

  // ── save draft ────────────────────────────────────────────
  const handleSaveDraft = useCallback(() => {
    if (!onDocCreated) return;
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      onDocCreated({
        id: Date.now(), type: "document",
        name: tpl?.name || "Document",
        templateId: tpl?.id,
        category: tpl?.cat,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        aiScore: aiResult?.risk_score ?? null,
        aiLabel: aiResult?.risk_level ?? null,
        aiAnalysis: aiResult ? {
          summary: aiResult.summary || "",
          pros: aiResult.pros || [],
          cons: aiResult.cons || [],
          legal_terms: aiResult.legal_terms || [],
          risk_score: aiResult.risk_score,
          risk_level: aiResult.risk_level,
        } : null,
        signStatus: "Draft",
        content: activeText,
        docContent: activeText,
      });
      setSaving(false);
      setSaved(true);
      if (toast) toast("Document saved to History!", "success");
      setTimeout(() => setSaved(false), 2500);
    }, 700);
  }, [onDocCreated, tpl, aiResult, activeText, toast]);

  const reset = () => {
    setView("gallery"); setTpl(null); setForm({});
    setDocText(""); setEditText(""); setEditing(false);
    setSections([]); setNewSecTitle(""); setNewSecBody(""); setShowAddSec(false);
    setAiResult(null); setAiError("");
    setSignStep("idle"); setSignName(""); setSignEmail(""); setSignMsg(""); setSignErr("");
    setDlLoading("");
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: D.bg }}>

      {/* ── Top bar ── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4"
        style={{ borderBottom: `1px solid ${D.border}`, background: D.surface }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {view !== "gallery" && (
              <button onClick={reset}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
                style={{ background: D.surfaceAlt, color: D.textMuted }}>
                <RotateCcw size={14} />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold" style={{ color: D.text }}>
                {view === "gallery" ? "Draft Studio" : view === "builder" ? `New: ${tpl?.name}` : tpl?.name}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>
                {view === "gallery" ? "Create, analyse, sign & download legal documents"
                  : view === "builder" ? "Fill in details — add custom sections below"
                  : "Review · Edit · Analyse · Sign · Download"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* New Draft button — always visible so user can start fresh any time */}
            {view !== "gallery" && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80 active:scale-[.97]"
                style={{ background: dark ? "#0d1233" : "#eef0ff", color: "#4f6ef7", border: `1px solid ${dark ? "#1a2e5a" : "#c7d0ff"}` }}>
                <FilePlus2 size={12} /> New Draft
              </button>
            )}

            {view === "preview" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleAnalyse} disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }}>
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Analyse
              </button>
              <DownloadBtn dark={dark} D={D} dlLoading={dlLoading}
                onPdf={handleDownloadPdf} onDocx={handleDownloadDocx}
                onTxt={handleDownloadTxt} onCopy={handleCopy} copied={copied} />
              <button onClick={() => setSignStep(s => s === "idle" ? "compose" : s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e", border: `1px solid ${dark ? "#1a5c32" : "#86efac"}` }}>
                <Send size={12} /> Get Signed
              </button>
              <button onClick={handleSaveDraft} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-70"
                style={{
                  background: saved
                    ? (dark ? "#0e2a1a" : "#dcfce7")
                    : D.surfaceAlt,
                  color: saved ? "#22c55e" : saving ? "#a855f7" : D.textMuted,
                  border: `1px solid ${saved ? (dark ? "#1a5c32" : "#86efac") : saving ? "#a855f7" : D.border}`,
                  transform: saving ? "scale(0.95)" : "scale(1)",
                }}>
                {saving
                  ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                  : saved
                    ? <><CheckCircle size={12} /> Saved!</>
                    : <><Star size={12} /> Save</>
                }
              </button>
            </div>
          )}
          </div>{/* end: flex items-center gap-2 flex-wrap wrapper */}
        </div>

        {view !== "gallery" && (
          <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: D.textSubtle }}>
            <button onClick={reset} className="hover:underline" style={{ color: D.textMuted }}>Templates</button>
            <ChevronRight size={11} />
            {view === "builder" && <span style={{ color: "#4f6ef7" }}>{tpl?.name}</span>}
            {view === "preview" && (
              <><span style={{ color: D.textMuted }}>{tpl?.name}</span>
              <ChevronRight size={11} /><span style={{ color: "#4f6ef7" }}>Preview</span></>
            )}
          </div>
        )}
      </div>

      {/* ═══ GALLERY ═══ */}
      {view === "gallery" && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">

            {/* ── New Draft CTA banner ── */}
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl border mb-6"
              style={{
                background: dark
                  ? "linear-gradient(135deg, #0d1233 0%, #150e2a 100%)"
                  : "linear-gradient(135deg, #eef0ff 0%, #f5f3ff 100%)",
                borderColor: dark ? "#1a2e5a" : "#c7d0ff",
              }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", boxShadow: "0 4px 16px rgba(79,110,247,0.35)" }}>
                  <FilePlus2 size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: D.text }}>Create a New Legal Document</p>
                  <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>
                    Pick a template below · Fill in details · AI-analyse · Sign &amp; Download
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  {["🏠", "🏢", "📜", "🔒"].map(icon => (
                    <span key={icon} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                      style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(79,110,247,0.1)" }}>
                      {icon}
                    </span>
                  ))}
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                    style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(79,110,247,0.1)", color: D.textMuted }}>
                    +{TEMPLATES.length - 4}
                  </span>
                </div>
                <button
                  onClick={() => document.getElementById("draft-template-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-[.97]"
                  style={{ background: "linear-gradient(135deg, #4f6ef7, #6d28d9)", color: "#fff", boxShadow: "0 2px 12px rgba(79,110,247,.3)" }}>
                  <Plus size={12} /> Pick Template
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 min-w-[180px]"
                style={{ background: D.surface, borderColor: D.border }}>
                <Search size={13} style={{ color: D.textSubtle }} />
                <input className="bg-transparent outline-none text-xs flex-1" style={{ color: D.text }}
                  placeholder="Search templates…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={catFilter === c
                      ? { background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }
                      : { background: D.surfaceAlt, color: D.textMuted, border: `1px solid ${D.border}` }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: LayoutTemplate, label: "Templates",   value: TEMPLATES.length, color: "#4f6ef7", bg: dark ? "#0d1233" : "#eef0ff" },
                { icon: Sparkles,       label: "AI Analysis", value: "Groq LLM",        color: "#a855f7", bg: dark ? "#1a0d2e" : "#faf5ff" },
                { icon: FileSignature,  label: "E-Sign",      value: "Real Email",       color: "#22c55e", bg: dark ? "#0e2a1a" : "#dcfce7" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border" style={{ background: D.surface, borderColor: D.border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <p className="text-lg font-bold" style={{ color: D.text }}>{s.value}</p>
                  <p className="text-xs" style={{ color: D.textMuted }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div id="draft-template-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(t => {
                const cc = catColor(t.cat, dark);
                return (
                  <div key={t.id}
                    className="rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-xl group"
                    style={{ background: D.surface, borderColor: D.border }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#4f6ef7"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = D.border}
                    onClick={() => { setTpl(t); setForm({}); setSections([]); setView("builder"); }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ background: cc.bg, border: `1px solid ${cc.border || cc.bg}` }}>
                        {t.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ background: cc.bg, color: cc.text }}>{t.cat}</span>
                        <h3 className="text-sm font-bold mt-1 leading-snug" style={{ color: D.text }}>{t.name}</h3>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: D.textMuted }}>{t.desc}</p>
                    <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#4f6ef7" }}>
                      Use Template <ChevronRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl p-4 border"
              style={{ background: dark ? "#0d1a33" : "#eff6ff", borderColor: dark ? "#1a2e5a" : "#bfdbfe" }}>
              <div className="flex items-center gap-3">
                <BookOpen size={16} style={{ color: "#3b82f6" }} />
                <p className="text-xs" style={{ color: dark ? "#93c5fd" : "#1d4ed8" }}>
                  All templates follow standard Indian legal formats. You can add custom sections in the builder and edit the final document before downloading or sending for signature.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BUILDER ═══ */}
      {view === "builder" && tpl && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-4">

            <div className="rounded-2xl border overflow-hidden" style={{ background: D.surface, borderColor: D.border }}>
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${D.border}` }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tpl.icon}</span>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: D.text }}>{tpl.name}</h2>
                    <p className="text-xs" style={{ color: D.textMuted }}>{tpl.desc}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {tpl.fields.map(f => (
                  <div key={f.k}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: D.textMuted }}>{f.l}</label>
                    {f.t === "area" ? (
                      <textarea rows={3} className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
                        style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
                        placeholder={f.p} value={form[f.k] || ""}
                        onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} />
                    ) : f.t === "state" ? (
                      <select className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                        style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
                        value={form[f.k] || ""} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}>
                        <option value="">— Select State —</option>
                        {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : f.t === "date" ? (
                      <DatePicker dark={dark} D={D}
                        value={form[f.k] || ""}
                        onChange={v => setForm(p => ({ ...p, [f.k]: v }))} />
                    ) : (
                      <input type={f.t}
                        className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                        style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
                        placeholder={f.p} value={form[f.k] || ""}
                        onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* custom sections */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: D.surface, borderColor: D.border }}>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: `1px solid ${D.border}`, background: D.surfaceAlt }}>
                <div className="flex items-center gap-2">
                  <PlusCircle size={13} style={{ color: "#a855f7" }} />
                  <span className="text-xs font-bold" style={{ color: D.text }}>Custom Sections</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: dark ? "#1a0d2e" : "#faf5ff", color: "#a855f7" }}>{sections.length}</span>
                </div>
                <button onClick={() => setShowAddSec(s => !s)}
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "#a855f7" }}>
                  {showAddSec ? <ChevronUp size={13} /> : <Plus size={13} />}
                  {showAddSec ? "Close" : "Add Section"}
                </button>
              </div>

              {showAddSec && (
                <div className="p-5 space-y-3" style={{ borderBottom: `1px solid ${D.border}` }}>
                  <input className="w-full px-3 py-2.5 rounded-xl text-xs outline-none"
                    style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
                    placeholder="Section title (e.g. SPECIAL CONDITIONS, PARKING, PET POLICY)"
                    value={newSecTitle} onChange={e => setNewSecTitle(e.target.value)} />
                  <textarea rows={4} className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
                    style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
                    placeholder="Section content…"
                    value={newSecBody} onChange={e => setNewSecBody(e.target.value)} />
                  <button
                    disabled={!newSecTitle.trim() || !newSecBody.trim()}
                    onClick={() => {
                      setSections(p => [...p, { title: newSecTitle.trim(), content: newSecBody.trim() }]);
                      setNewSecTitle(""); setNewSecBody(""); setShowAddSec(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
                    <Plus size={12} /> Add Section
                  </button>
                </div>
              )}

              {sections.length > 0 && (
                <div className="divide-y" style={{ borderColor: D.border }}>
                  {sections.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <GripVertical size={14} style={{ color: D.textSubtle }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: D.text }}>{s.title}</p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: D.textMuted }}>{s.content}</p>
                      </div>
                      <button onClick={() => setSections(p => p.filter((_, j) => j !== i))}
                        style={{ color: "#f87171" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {sections.length === 0 && !showAddSec && (
                <div className="px-5 py-4 text-xs text-center" style={{ color: D.textSubtle }}>
                  Add custom clauses — parking, pets, special conditions, etc.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={reset}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                style={{ background: D.surfaceAlt, color: D.textMuted }}>
                Cancel
              </button>
              <button onClick={handleGenerate}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }}>
                <FilePlus2 size={13} /> Generate Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PREVIEW ═══ */}
      {view === "preview" && (
        <div className="flex-1 overflow-hidden flex">

          {/* left: document */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: `1px solid ${D.border}` }}>
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
              style={{ background: D.surface, borderBottom: `1px solid ${D.border}` }}>
              <span className="text-xs font-bold" style={{ color: D.textMuted }}>
                {editing ? "✏️ Editing" : "📄 Preview"}
              </span>
              <button onClick={() => { setEditing(e => !e); if (!editing) setEditText(docText); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                style={editing
                  ? { background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e" }
                  : { background: D.surfaceAlt, color: D.textMuted }}>
                <Pen size={11} />{editing ? "Done" : "Edit"}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {editing ? (
                <textarea className="w-full h-full outline-none resize-none text-xs leading-relaxed font-mono rounded-xl p-4"
                  style={{ background: D.surfaceAlt, color: D.text, border: `1px solid ${D.border}`, minHeight: "500px" }}
                  value={editText} onChange={e => { setEditText(e.target.value); setDocText(e.target.value); }} />
              ) : (
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-4 rounded-xl"
                  style={{ background: D.surfaceAlt, color: D.text, border: `1px solid ${D.border}` }}>
                  {docText}
                </pre>
              )}
            </div>
          </div>

          {/* right: panel */}
          <div className="w-80 flex flex-col overflow-hidden flex-shrink-0" style={{ background: D.surface }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* AI Analysis */}
              <PanelBox title="AI Analysis" icon={<Sparkles size={13} style={{ color: "#a855f7" }} />} dark={dark} D={D}
                badge={aiResult ? <RiskTag label={aiResult.risk_level} score={aiResult.risk_score} /> : null}>
                {aiLoading && (
                  <div className="flex items-center gap-3 p-4">
                    <Loader2 size={16} className="animate-spin" style={{ color: "#a855f7" }} />
                    <span className="text-xs" style={{ color: D.textMuted }}>Analysing via Groq LLM…</span>
                  </div>
                )}
                {!aiLoading && aiError && (
                  <div className="p-4">
                    <p className="text-xs text-red-400">{aiError}</p>
                    <button onClick={handleAnalyse} className="mt-2 text-xs text-blue-400 underline">Retry</button>
                  </div>
                )}
                {!aiLoading && !aiResult && !aiError && (
                  <div className="p-4 text-center">
                    <p className="text-xs mb-3" style={{ color: D.textMuted }}>Get instant risk analysis via Groq LLM</p>
                    <button onClick={handleAnalyse}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold mx-auto hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }}>
                      <Sparkles size={12} /> Analyse Now
                    </button>
                  </div>
                )}
                {aiResult && !aiLoading && (
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase" style={{ color: D.textSubtle }}>Risk Score</span>
                        <span className="text-sm font-bold" style={{ color: scoreColor(aiResult.risk_score) }}>
                          {aiResult.risk_score}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: D.surfaceAlt }}>
                        <div className="h-full rounded-full" style={{ width: `${aiResult.risk_score}%`, background: scoreColor(aiResult.risk_score) }} />
                      </div>
                    </div>
                    {aiResult.summary && (
                      <p className="text-xs leading-relaxed" style={{ color: D.textMuted }}>{aiResult.summary?.slice(0, 200)}…</p>
                    )}
                    {aiResult.pros?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: D.textSubtle }}>Strong Points</p>
                        {aiResult.pros.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1.5">
                            <CheckCircle size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
                            <span className="text-xs" style={{ color: D.textMuted }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {aiResult.cons?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: D.textSubtle }}>Risk Points</p>
                        {aiResult.cons.slice(0, 3).map((c, i) => (
                          <div key={i} className="flex items-start gap-2 mb-1.5">
                            <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: "#f87171" }} />
                            <span className="text-xs" style={{ color: D.textMuted }}>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </PanelBox>

              {/* E-Sign */}
              <PanelBox title="E-Sign Request" icon={<Mail size={13} style={{ color: "#22c55e" }} />} dark={dark} D={D}>
                {signStep === "idle" && (
                  <div className="p-4 text-center">
                    <p className="text-xs mb-3" style={{ color: D.textMuted }}>
                      Send to the other party for review & signature. A PDF is attached automatically.
                    </p>
                    <button onClick={() => setSignStep("compose")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold mx-auto hover:opacity-90"
                      style={{ background: dark ? "#0e2a1a" : "#dcfce7", color: "#22c55e", border: `1px solid ${dark ? "#1a5c32" : "#86efac"}` }}>
                      <Send size={12} /> Request Signature
                    </button>
                  </div>
                )}
                {(signStep === "compose" || signStep === "error") && (
                  <div className="p-4 space-y-3">
                    <Field label="Recipient Name" dark={dark} D={D}
                      value={signName} onChange={e => setSignName(e.target.value)} placeholder="Full name" />
                    <Field label="Recipient Email" dark={dark} D={D} type="email"
                      value={signEmail} onChange={e => setSignEmail(e.target.value)} placeholder="email@example.com" />
                    <Field label="Message (optional)" dark={dark} D={D} area
                      value={signMsg} onChange={e => setSignMsg(e.target.value)} placeholder="Add a note…" rows={2} />
                    {signErr && <p className="text-xs" style={{ color: "#f87171" }}>{signErr}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => { setSignStep("idle"); setSignErr(""); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                        style={{ background: D.surfaceAlt, color: D.textMuted }}>Cancel</button>
                      <button onClick={handleSendSign} disabled={!signEmail || !signName}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff" }}>
                        <Send size={11} /> Send
                      </button>
                    </div>
                  </div>
                )}
                {signStep === "sending" && (
                  <div className="flex items-center gap-3 p-4">
                    <Loader2 size={16} className="animate-spin" style={{ color: "#22c55e" }} />
                    <span className="text-xs" style={{ color: D.textMuted }}>Sending email with PDF attachment…</span>
                  </div>
                )}
                {signStep === "sent" && (
                  <div className="p-4 text-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: dark ? "#0e2a1a" : "#dcfce7" }}>
                      <CheckCircle size={20} style={{ color: "#22c55e" }} />
                    </div>
                    <p className="text-xs font-bold mb-1" style={{ color: "#22c55e" }}>Email Sent!</p>
                    <p className="text-[11px]" style={{ color: D.textMuted }}>
                      Signing request + PDF sent to <strong style={{ color: D.text }}>{signName}</strong>
                    </p>
                    <div className="flex items-center gap-1.5 justify-center mt-3 px-3 py-1.5 rounded-xl"
                      style={{ background: D.surfaceAlt }}>
                      <Clock size={11} style={{ color: D.textSubtle }} />
                      <span className="text-[10px]" style={{ color: D.textMuted }}>Awaiting signature</span>
                    </div>
                    <button onClick={() => { setSignStep("idle"); setSignEmail(""); setSignName(""); setSignMsg(""); }}
                      className="mt-3 text-xs underline" style={{ color: "#4f6ef7" }}>Send to another person</button>
                  </div>
                )}
              </PanelBox>

              {/* Download */}
              <PanelBox title="Download" icon={<FileDown size={13} style={{ color: "#4f6ef7" }} />} dark={dark} D={D}>
                <div className="p-3 space-y-2">
                  {[
                    { label: "PDF Document",     key: "pdf",  action: handleDownloadPdf,  color: "#ef4444" },
                    { label: "Word DOCX",         key: "docx", action: handleDownloadDocx, color: "#2563eb" },
                    { label: "Plain Text (.txt)", key: "txt",  action: handleDownloadTxt,  color: "#16a34a" },
                    { label: copied ? "Copied!" : "Copy Text", key: "copy", action: handleCopy, color: "#f59e0b" },
                  ].map(d => (
                    <button key={d.key} onClick={d.action} disabled={!!dlLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ background: D.surfaceAlt, color: D.textMuted }}>
                      {dlLoading === d.key
                        ? <Loader2 size={12} className="animate-spin" style={{ color: d.color }} />
                        : d.key === "copy"
                          ? <Copy size={12} style={{ color: d.color }} />
                          : <FileDown size={12} style={{ color: d.color }} />
                      }
                      {d.label}
                      {d.key === "copy" && copied && <Check size={11} className="ml-auto" style={{ color: "#22c55e" }} />}
                    </button>
                  ))}
                </div>
              </PanelBox>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── shared components ────────────────────────────────────────────────────────
function PanelBox({ title, icon, dark, D, badge, children }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: D.border }}>
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: D.surfaceAlt, borderBottom: `1px solid ${D.border}` }}>
        <div className="flex items-center gap-2">{icon}<span className="text-xs font-bold" style={{ color: D.text }}>{title}</span></div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Field({ label, dark, D, value, onChange, placeholder, type = "text", area, rows = 2 }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: D.textSubtle || "#484f58" }}>{label}</label>
      {area
        ? <textarea rows={rows} className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
            style={{ background: D.bg, border: `1px solid ${D.border}`, color: D.text }}
            placeholder={placeholder} value={value} onChange={onChange} />
        : <input type={type} className="w-full px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: D.bg, border: `1px solid ${D.border}`, color: D.text }}
            placeholder={placeholder} value={value} onChange={onChange} />
      }
    </div>
  );
}

function RiskTag({ label, score }) {
  const color = score > 60 ? "#f87171" : score > 35 ? "#fbbf24" : "#4ade80";
  const bg    = score > 60 ? "#2a0d0d" : score > 35 ? "#2a1e08" : "#0e2a1a";
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{label} {score}/100</span>;
}

function scoreColor(s) { return s > 60 ? "#f87171" : s > 35 ? "#fbbf24" : "#4ade80"; }

function DownloadBtn({ dark, D, dlLoading, onPdf, onDocx, onTxt, onCopy, copied }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
        style={{ background: D.surfaceAlt, color: D.textMuted, border: `1px solid ${D.border}` }}>
        <Download size={12} /> Download <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-xl overflow-hidden z-50"
          style={{ background: D.surface, borderColor: D.border }}>
          {[
            { label: "PDF",  action: () => { onPdf();  setOpen(false); }, key: "pdf",  color: "#ef4444" },
            { label: "DOCX", action: () => { onDocx(); setOpen(false); }, key: "docx", color: "#2563eb" },
            { label: "TXT",  action: () => { onTxt();  setOpen(false); }, key: "txt",  color: "#16a34a" },
            { label: copied ? "Copied!" : "Copy Text", action: () => { onCopy(); setOpen(false); }, key: "copy", color: "#f59e0b" },
          ].map(d => (
            <button key={d.key} onClick={d.action} disabled={!!dlLoading && dlLoading !== d.key}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors disabled:opacity-50"
              style={{ color: D.textMuted }}
              onMouseEnter={e => { e.currentTarget.style.background = D.surfaceAlt; e.currentTarget.style.color = D.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = D.textMuted; }}>
              {dlLoading === d.key
                ? <Loader2 size={11} className="animate-spin" style={{ color: d.color }} />
                : <FileDown size={11} style={{ color: d.color }} />
              }
              {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}