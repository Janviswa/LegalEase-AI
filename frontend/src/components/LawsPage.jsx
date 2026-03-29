import { useState, useRef, useEffect } from "react";
import {
  MapPin, ChevronDown, Search, X, BookOpen,
  Scale, AlertTriangle, FileText, Home, Landmark,
  Leaf, Users, Building2, Gavel, ScrollText,
  ChevronRight, Star, Info, Plus, Minus
} from "lucide-react";
import { DARK, LIGHT } from "../theme.js";

// ─────────────────────────────────────────────────────────────
// STATES LIST
// ─────────────────────────────────────────────────────────────
const STATES = [
  "All India (Central Laws)",
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi (NCT)","Jammu & Kashmir","Ladakh",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli",
  "Daman & Diu","Lakshadweep","Puducherry"
];

const CATEGORIES = [
  { id: "all",          label: "All Laws",          icon: BookOpen  },
  { id: "transfer",     label: "Property Transfer", icon: Home      },
  { id: "registration", label: "Registration",      icon: FileText  },
  { id: "tenancy",      label: "Tenancy & Rent",    icon: Building2 },
  { id: "rera",         label: "Real Estate/RERA",  icon: Landmark  },
  { id: "acquisition",  label: "Land Acquisition",  icon: Scale     },
  { id: "agricultural", label: "Agricultural",      icon: Leaf      },
  { id: "tribal",       label: "Tribal & Forest",   icon: Users     },
  { id: "dispute",      label: "Disputes",          icon: Gavel     },
  { id: "succession",   label: "Succession",        icon: ScrollText},
];

// ─────────────────────────────────────────────────────────────
// LAW DATA  — sections are now objects with { title, content }
// ─────────────────────────────────────────────────────────────
const ALL_LAWS = {
  "All India (Central Laws)": [
    {
      id: 1, category: "transfer", icon: Home,
      name: "Transfer of Property Act",
      year: 1882,
      short: "Governs all transfers of immovable property between living persons — sales, mortgages, leases, exchanges, gifts, and actionable claims.",
      sections: [
        { title: "Sale (Sec 54–57)", content: "A sale is defined as the transfer of ownership of property in exchange for a price. Sec 54 requires that a sale of tangible immovable property above ₹100 must be made by a registered instrument. The seller must have a valid title and must deliver possession to the buyer. The buyer must pay the agreed price and accept delivery." },
        { title: "Mortgage (Sec 58–104)", content: "A mortgage is the transfer of an interest in immovable property as security for a loan. Six types exist: Simple Mortgage, Mortgage by Conditional Sale, Usufructuary Mortgage, English Mortgage, Mortgage by Deposit of Title Deeds (Equitable Mortgage), and Anomalous Mortgage. The mortgagor retains ownership; only security interest passes. Redemption right cannot be clogged." },
        { title: "Lease (Sec 105–117)", content: "A lease is a transfer of the right to enjoy property for a term in return for rent. Leases above one year must be made by a registered instrument. The lessee must pay rent, keep the property in good repair, and not sublet without permission unless allowed. The lessor must ensure quiet enjoyment and make necessary repairs." },
        { title: "Gift (Sec 122–129)", content: "A gift is a transfer of property without consideration. It must be accepted by the donee during the donor's lifetime. A gift of immovable property must be registered. Gifts made under coercion, fraud, or undue influence can be set aside. Onerous gifts — where conditions are attached — bind the donee to fulfill those conditions." },
        { title: "Exchange (Sec 118–121)", content: "An exchange is a mutual transfer of ownership of one thing for the ownership of another. Unlike sale, no money passes. Both parties must have transferable title. If one party's title fails, the other can seek compensation or rescission. The same rules as sale apply to exchanges of immovable property." },
      ],
      watchFor: "Conditions of sale, mortgage type, lease renewal rights, and gift revocability clauses.",
    },
    {
      id: 2, category: "registration", icon: FileText,
      name: "Registration Act",
      year: 1908,
      short: "Makes registration compulsory for documents related to immovable property above ₹100 value. An unregistered document cannot be admitted as evidence.",
      sections: [
        { title: "Compulsory Registration (Sec 17)", content: "All instruments of sale, gift, exchange, mortgage, or lease of immovable property for a term exceeding one year must be compulsorily registered. Failure to register makes the document void and inadmissible as evidence of the transaction. It cannot confer title on the buyer even if possession is transferred." },
        { title: "Optional Registration (Sec 18)", content: "Documents such as agreements to sell (below one year lease), wills, and powers of attorney may be optionally registered. Optional registration provides evidentiary strength in court — it creates a presumption of authenticity and establishes priority over later unregistered documents." },
        { title: "Time Limit (Sec 23)", content: "Every document subject to registration must be presented to the Sub-Registrar within four months from the date of its execution. If all parties cannot present simultaneously, Sec 26 allows presentation within four months with a reasonable excuse. Late registration is allowed within another four months with a penalty up to ten times the registration fee." },
        { title: "Penalties for Unregistered Documents (Sec 49 & 77)", content: "An unregistered document that ought to be registered cannot be used to affect any immovable property or be received as evidence of any transaction affecting such property. Sec 77 allows an aggrieved party to apply to a civil court for an order of compulsory registration if the executing party refuses to register." },
      ],
      watchFor: "Ensure all sale deeds, gift deeds, and lease deeds over 12 months are registered. Unregistered agreements are unenforceable.",
    },
    {
      id: 3, category: "registration", icon: FileText,
      name: "Indian Stamp Act",
      year: 1899,
      short: "Requires payment of stamp duty on property documents. Inadequate stamp duty makes the document inadmissible in court.",
      sections: [
        { title: "Instruments Chargeable (Sec 3)", content: "Every instrument listed in the Schedule must bear stamp duty proportionate to the value of the transaction. Instruments include sale deeds, gift deeds, mortgage deeds, lease deeds, and partition deeds. Duty must be paid either by affixing impressed stamps or through e-stamping via SHCIL (Stock Holding Corporation of India)." },
        { title: "Valuation for Stamp Duty (Sec 27)", content: "The consideration stated in the instrument must reflect the full market value or the circle rate (guideline value) fixed by the state government — whichever is higher. Understating value to reduce stamp duty is a fraud and can result in the document being impounded and the transaction being reopened for assessment." },
        { title: "Penalties (Sec 35–40)", content: "An instrument not duly stamped cannot be admitted in evidence. Sec 35 requires that before admission, the instrument must be stamped on payment of duty plus a penalty of 2% per month up to a maximum of ten times the original duty. The instrument can be impounded by any officer who sees it and must be sent to the Collector for adjudication." },
        { title: "Adjudication (Sec 31)", content: "Any person can approach the Collector before executing an instrument to determine the proper stamp duty payable. The Collector's certificate of adjudication protects the person from any future demand. This is especially useful in complex transactions like development agreements, partition deeds, and amalgamation instruments." },
      ],
      watchFor: "Check that stamp duty is paid at correct circle rate. Underpayment attracts 10× penalty plus back-duty.",
    },
    {
      id: 4, category: "rera", icon: Landmark,
      name: "Real Estate (Regulation & Development) Act — RERA",
      year: 2016,
      short: "Regulates residential real estate projects, protects buyers, mandates project registration with RERA authority, and establishes adjudicating mechanisms.",
      sections: [
        { title: "Registration of Projects (Sec 3–8)", content: "All residential projects with more than 8 apartments or covering more than 500 sq. meters must be registered with the state RERA authority before advertising, selling, or accepting any booking amount. The promoter must submit the sanctioned plan, layout plan, project completion schedule, and escrow account details at registration." },
        { title: "Rights of Allottees (Sec 19)", content: "Allottees have the right to obtain all information relating to the project including the approved plans, layout plans, and specifications. They have the right to know about any changes made to the sanctioned plans. The allottee also has the right to claim possession as per the registered agreement and to receive a refund with interest if the promoter delays possession." },
        { title: "Obligations of Promoters (Sec 11–18)", content: "Promoters must deposit 70% of the amounts realised from allottees into a separate escrow account to be used only for construction and land cost. They must update the RERA website quarterly. They cannot alter the sanctioned plans without written consent of 2/3 allottees. Structural defects found within 5 years of possession must be rectified free of cost." },
        { title: "Real Estate Agent Registration (Sec 9)", content: "Real estate agents facilitating transactions in RERA-registered projects must themselves be registered with RERA. They cannot facilitate any transaction involving an unregistered project. Every agent must maintain accounts and records and is liable for any false statement made to the buyer." },
      ],
      watchFor: "Verify RERA registration number of project. Builder must deposit 70% of funds in escrow. Possession date must be specified in the agreement.",
    },
    {
      id: 5, category: "acquisition", icon: Scale,
      name: "Right to Fair Compensation & Transparency in Land Acquisition Act (RFCTLARR)",
      year: 2013,
      short: "Replaced the colonial Land Acquisition Act 1894. Mandates social impact assessment, 80% landowner consent for private projects, and fair compensation at market rate plus solatium.",
      sections: [
        { title: "Social Impact Assessment (Sec 4–9)", content: "Before any land acquisition, a Social Impact Assessment (SIA) must be conducted in consultation with the gram sabha. The SIA evaluates the impact on livelihoods, public and community property, infrastructure, and environment. An independent multi-disciplinary expert group reviews the SIA report." },
        { title: "Consent Requirement (Sec 2(2))", content: "For acquisition for PPP projects, prior consent of at least 70% of affected families is required. For private companies, prior consent of 80% of affected families is required. Consent must be obtained through a consultative process. This requirement does not apply to acquisition for government use." },
        { title: "Compensation (Sec 26–30)", content: "Compensation is calculated at market value multiplied by a factor of one to two depending on urban/rural land. Additionally, solatium of 100% of the computed market value is added. The total compensation is therefore 2× to 4× the market value. Compensation must be paid before taking possession." },
        { title: "Rehabilitation & Resettlement (Sec 31–46)", content: "Displaced families are entitled to rehabilitation and resettlement benefits including housing, employment, or one-time payment, skill development, and a monthly subsistence allowance. The R&R scheme must be developed in consultation with the affected community and implemented before the second notification for acquisition." },
      ],
      watchFor: "If government acquires land near your property, verify SIA has been done and consent obtained. Check your compensation entitlement carefully.",
    },
    {
      id: 6, category: "transfer", icon: Home,
      name: "Indian Easements Act",
      year: 1882,
      short: "Defines easement rights — the right to use another's property for a specific purpose such as right of way, light, air, or water. Also covers licenses.",
      sections: [
        { title: "Easement Definition & Types (Sec 4)", content: "An easement is a right which the owner or occupier of land possesses for the beneficial enjoyment of that land, to do and continue to do something, or to prevent and continue to prevent something being done, in or upon other land not his own. Types include: Right of Way (access over another's land), Right of Light and Air (to receive light through windows), Right of Water (to draw water or drain water across another's land)." },
        { title: "Acquisition of Easement (Sec 8–18)", content: "Easements can be acquired by: (1) Grant — expressly mentioned in a sale deed or agreement; (2) Reservation — seller retains right over sold land; (3) Implied Necessity — where a plot is landlocked and the only access is through the seller's land; (4) Prescription — continuous uninterrupted use for 20 years as of right, openly, without consent and without interruption." },
        { title: "Extinction of Easement (Sec 37–47)", content: "Easements cease to exist when: the dominant and servient tenements come under one ownership; the easement is expressly released by deed; the dominant owner gives up the right permanently; the purpose for which it was acquired ceases to exist; or the servient land is acquired by the government for public purposes." },
        { title: "Licenses (Sec 52–64)", content: "A license is permission to do something on another's land which would otherwise be a trespass. Unlike an easement, a license is personal, non-transferable, and revocable. A leave and license agreement for property use is governed by this chapter. Once revoked, the licensee must vacate. A licensee cannot sue for trespass." },
      ],
      watchFor: "Right-of-way and access road clauses. Check if any easement rights burden the property you are purchasing.",
    },
    {
      id: 7, category: "dispute", icon: Gavel,
      name: "Specific Relief Act",
      year: 1963,
      short: "Allows courts to compel specific performance of contracts related to immovable property. A buyer can sue for actual transfer, not just damages.",
      sections: [
        { title: "Specific Performance (Sec 10–25)", content: "Specific performance is available as a matter of right (not discretion) after the 2018 amendment, where the court is satisfied that monetary compensation is not an adequate remedy. For agreements to sell immovable property, the buyer can obtain a court decree directing the seller to execute and register the sale deed rather than paying compensation. This removes the seller's ability to refuse by offering damages." },
        { title: "Who Cannot Obtain Specific Performance (Sec 16)", content: "A party who has not performed or is not willing to perform their part of the contract cannot seek specific performance. The plaintiff must prove readiness and willingness to perform their obligations (e.g., pay the balance consideration). Persons who obtained the agreement by fraud or undue influence are also barred from seeking specific performance." },
        { title: "Rescission of Contract (Sec 27–30)", content: "A person entitled to specific performance may also claim rescission — cancellation of the agreement. Rescission is granted when the other party's breach is so fundamental that the contract should be treated as void. Upon rescission, parties must restore any benefits received. The court may award compensation on rescission." },
        { title: "Injunctions (Sec 36–42)", content: "Courts can grant injunctions to prevent a party from doing an act in breach of a contract or obligation. A temporary injunction can be obtained immediately to maintain status quo (e.g., preventing a seller from selling to a third party). A permanent injunction can be made part of the final decree." },
      ],
      watchFor: "Agreement to sell clauses. If seller refuses to execute sale deed, this Act allows court to order registration directly.",
    },
    {
      id: 8, category: "dispute", icon: Gavel,
      name: "Limitation Act",
      year: 1963,
      short: "Prescribes time limits for legal action. For immovable property suits, typically 12 years for possession and 3 years for contract enforcement.",
      sections: [
        { title: "Limitation Periods for Property (Schedule)", content: "Key time limits: Suit for possession of immovable property based on title — 12 years from when possession becomes adverse. Suit for specific performance of a contract — 3 years from the date fixed for performance, or date of refusal. Suit for cancellation of instrument — 3 years from when facts entitling plaintiff to have it cancelled become known." },
        { title: "Condonation of Delay (Sec 5)", content: "Courts can condone delay in filing appeals (not original suits) if the applicant shows sufficient cause for the delay. Sufficient cause means circumstances beyond the control of the party — illness, natural calamity, bona fide mistake of legal counsel. Ignorance of law alone is not sufficient cause. Courts have discretion and consider prejudice to the opposing party." },
        { title: "Adverse Possession (Sec 27)", content: "If a person possesses immovable property continuously, openly, and adversely for 12 years, the rightful owner's right to sue for possession is extinguished. The adverse possessor can then claim ownership. Key requirements: possession must be hostile, open, continuous, and without the owner's permission. This protects long-term possessors from eviction claims." },
        { title: "When Limitation Begins (Sec 12–24)", content: "Time generally begins when the right to sue first accrues. For money recovery from sale of property, time starts from the date payment becomes due. For fraud cases, time starts when the plaintiff discovered the fraud or could with due diligence have discovered it. The period spent in court proceedings does not count towards limitation." },
      ],
      watchFor: "Agreement to sell must be acted upon within 3 years. Long possession without title may create adverse possession claims against you.",
    },
    {
      id: 9, category: "tenancy", icon: Building2,
      name: "Model Tenancy Act",
      year: 2021,
      short: "Central model framework for tenancy. Establishes Rent Authority, limits security deposit to 2 months, and defines landlord/tenant obligations.",
      sections: [
        { title: "Written Tenancy Agreement (Sec 4)", content: "Every tenancy must be based on a written agreement executed between the landlord and tenant. The agreement must specify the rent amount, payment schedule, security deposit amount, duration, and conditions for renewal. Both parties must submit an intimation to the Rent Authority within two months of execution." },
        { title: "Security Deposit Cap (Sec 11)", content: "For residential premises, the security deposit cannot exceed two months' rent. For non-residential premises, it cannot exceed six months' rent. The deposit must be refunded within one month of vacating, after deducting dues if any. Failure to refund within one month makes the landlord liable to pay simple interest at the prevailing bank rate." },
        { title: "Rent Authority & Rent Court (Sec 28–33)", content: "Each district has a Rent Authority (typically an officer of Revenue Department) who maintains a register of all tenancy agreements, resolves disputes about rent, security deposit, and essential services, and issues orders for restoration of essential services. A Rent Court handles eviction petitions and appeals from the Rent Authority." },
        { title: "Eviction Grounds (Sec 21)", content: "A landlord can file for eviction only on grounds specified in the Act: non-payment of rent for two months, sub-letting without permission, misuse of premises, damage to property, use for unlawful purposes, the landlord requiring it for personal use or reconstruction, or expiry of the tenancy period. The tenant must be given notice before filing the eviction petition." },
      ],
      watchFor: "Security deposit should not exceed 2 months rent. Notice period for vacating must be mutually agreed in writing.",
    },
    {
      id: 10, category: "succession", icon: ScrollText,
      name: "Hindu Succession Act",
      year: 1956,
      short: "Governs inheritance of property for Hindus, Buddhists, Jains, and Sikhs. Equal inheritance rights for daughters since the 2005 amendment.",
      sections: [
        { title: "Daughters as Coparceners (Sec 6)", content: "The 2005 amendment granted daughters equal coparcenary rights in ancestral property as sons — this was confirmed with retrospective effect by the Supreme Court in Vineeta Sharma v. Rakesh Sharma (2020). A daughter born before 2005 also has equal rights. Upon a coparcener's death, their share passes to their own heirs including daughters." },
        { title: "Class I Heirs (Sec 8 & Schedule)", content: "Class I heirs include: son, daughter, widow, mother, son of a predeceased son, daughter of a predeceased son, widow of a predeceased son, son/daughter of a predeceased daughter. Class I heirs take to the exclusion of all other heirs. Among Class I heirs, property is divided equally, but a widow takes her share plus the share of predeceased husband." },
        { title: "Self-Acquired vs Ancestral Property", content: "A person has full testamentary freedom over self-acquired property — they can will it to anyone. In ancestral property (joint family property received through inheritance from male ancestors up to 3 generations), coparceners have a birthright. The 2005 amendment includes daughters as coparceners with equal rights to demand partition." },
        { title: "Testamentary Succession", content: "A Hindu can make a will to dispose of their separate property and their interest in joint family property. A will must be in writing and signed by the testator and attested by two witnesses. Wills are governed by the Indian Succession Act 1925. An unregistered will is valid but vulnerable to challenge. Registration makes it significantly more secure." },
      ],
      watchFor: "Check for multiple heirs in ancestral property. All legal heirs must consent to sale. Daughters have equal share since 2005 — their NOC is mandatory.",
    },
    {
      id: 11, category: "tribal", icon: Users,
      name: "Scheduled Tribes & Other Traditional Forest Dwellers (Recognition of Forest Rights) Act",
      year: 2006,
      short: "Recognises land rights of tribal and forest-dwelling communities. Protects against eviction from forest land without proper process.",
      sections: [
        { title: "Forest Rights (Sec 3)", content: "The Act recognises: Individual Forest Rights (IFR) — right to live on and cultivate forest land that has been occupied before 13 December 2005; Community Forest Rights (CFR) — right of the community to protect, manage, and govern forest resources; and Developmental Rights — right to infrastructure facilities within forest land for basic amenities." },
        { title: "Gram Sabha Powers", content: "The gram sabha (village assembly) is the nodal body for determining who is eligible for forest rights. It receives and verifies claims, prepares a record of forest rights, and passes resolutions. The Forest Rights Committee is constituted by the gram sabha. Decisions of the gram sabha are forwarded to the Sub-Divisional Level Committee for vetting." },
        { title: "Recognition Process (Sec 6)", content: "A claimant must file a claim with the gram sabha along with evidence of occupation (photographs, ration cards, voter ID, testimonials from elders). The gram sabha verifies and forwards to SDLC, then DLC (District Level Committee), and finally to the state government for final notification. The process has defined timelines at each level." },
        { title: "Protection Against Eviction", content: "No member of a forest dwelling community can be evicted from forest land until the process for recognising forest rights is complete. Any eviction before this process is illegal. States that carried out evictions before completing the process were directed by the Supreme Court to file compliance reports." },
      ],
      watchFor: "If property is near forest land, verify no tribal rights claims exist. Forest land cannot be transferred without Gram Sabha consent.",
    },
    {
      id: 12, category: "transfer", icon: AlertTriangle,
      name: "Prevention of Benami Transactions Act",
      year: "1988/2016",
      short: "Prohibits property purchased in another person's name to conceal real ownership. Violators face imprisonment and property confiscation.",
      sections: [
        { title: "What is a Benami Transaction (Sec 2)", content: "A benami transaction is one where property is transferred to one person (benamidar) but the consideration is paid by another person (beneficial owner) for whose benefit the property is held. It also covers property held in a fictitious name. Common examples: property in spouse/child/relative's name to avoid income tax or creditors, and properties held in the name of employees or associates." },
        { title: "Prohibited Transactions (Sec 3)", content: "No person shall enter into any benami transaction. The benamidar is prohibited from re-transferring the property to the beneficial owner or any other person. Any transaction found to be benami is void and the property is liable to confiscation. The prohibition applies to all persons regardless of nationality." },
        { title: "Confiscation of Benami Property (Sec 5–8)", content: "Upon finding a prima facie case, the Initiating Officer can attach the benami property for up to 90 days while investigation is conducted. The matter is then referred to the Adjudicating Authority which gives notice, hears the parties, and confirms or releases the attachment. Confirmed benami property is confiscated by the Central Government without compensation." },
        { title: "Penalties (Sec 53–55)", content: "Any person who enters into a benami transaction to defeat any court decree or order is punishable with rigorous imprisonment of 1–7 years and a fine up to 25% of the property value. Any person who provides false information to any authority under the Act is punishable with imprisonment of 6 months to 5 years and a fine up to 10% of the property value." },
      ],
      watchFor: "Verify actual ownership matches registered name. Power of attorney sales and cash-funded transactions are closely scrutinised under this Act.",
    },
    {
      id: 13, category: "transfer", icon: Scale,
      name: "Foreign Exchange Management Act (FEMA) — Property Provisions",
      year: 1999,
      short: "Regulates acquisition and transfer of immovable property by NRIs, PIOs, and foreign nationals. Residential property is permitted; agricultural land is restricted.",
      sections: [
        { title: "NRI / PIO Acquisition Rights (Sec 6)", content: "A Non-Resident Indian (NRI) or Person of Indian Origin (PIO) can acquire any immovable property in India (other than agricultural land, plantation property, or farmhouse) by way of purchase, or by inheritance from a resident, or by gift from a relative. No RBI permission is required for such acquisition. Repatriation of sale proceeds is allowed subject to limits." },
        { title: "Foreign National Restrictions", content: "A citizen of a foreign country (other than Pakistan, Bangladesh) residing outside India cannot acquire immovable property in India without RBI permission. A citizen of Pakistan or Bangladesh requires prior approval of the RBI even for inheritance. Foreign nationals employed in India on a valid visa can acquire property for residential use only for the duration of stay." },
        { title: "Agricultural Land Restrictions", content: "NRIs and PIOs cannot purchase agricultural land, plantation property, or farmhouse in India. However, they can inherit such property. Sale of such inherited agricultural property to a resident Indian is permitted. A foreign company having a branch office in India cannot acquire agricultural land even if it is incidentally required for business." },
        { title: "Repatriation Rules", content: "Proceeds from sale of immovable property can be repatriated abroad subject to: (1) Property was acquired by foreign exchange (not rupee funds); (2) Maximum of two residential properties; (3) After a lock-in period of three years for properties acquired from NRI/PIO sellers. Repatriation is allowed up to the amount originally paid in foreign exchange." },
      ],
      watchFor: "NRI/foreign buyer must disclose FEMA compliance in the sale deed. Agricultural land sold to a foreign national is void.",
    },
    {
      id: 14, category: "transfer", icon: Scale,
      name: "Indian Contract Act — Property Agreements",
      year: 1872,
      short: "Foundation of all agreement to sell, sale deed, and joint development agreement enforceability. Defines valid contracts, breach remedies, and void agreements.",
      sections: [
        { title: "Valid Contract Essentials (Sec 2–10)", content: "A valid contract requires: (1) Offer and acceptance — clear proposal and unconditional acceptance; (2) Consideration — something of value exchanged (token advance, full price); (3) Capacity — both parties must be adults of sound mind; (4) Free consent — not obtained by coercion, undue influence, fraud, misrepresentation, or mistake; (5) Lawful object — the purpose must be legal." },
        { title: "Free Consent (Sec 14–22)", content: "Consent is not free if obtained by: Coercion (threatening to commit a crime unless party agrees); Undue influence (one party dominates the will of the other — e.g., elderly parent pressured by son); Fraud (false representation of a material fact); Misrepresentation (innocent but false statement); or Mistake (both parties wrong about a fundamental fact). Such contracts are voidable at the option of the aggrieved party." },
        { title: "Void and Voidable Agreements (Sec 23–30)", content: "An agreement is void if: its object or consideration is unlawful; it is made in restraint of trade or marriage; it is by way of wager; or it is contingent on an impossible event. A voidable contract is valid until the aggrieved party repudiates it. Upon repudiation, benefits must be restored. Agreements to sell black money properties or benami transactions are void." },
        { title: "Breach & Remedies (Sec 73–75)", content: "Upon breach, the innocent party may: (1) Sue for compensation for actual loss caused (Sec 73); (2) Sue for specific performance under the Specific Relief Act; (3) Rescind the contract and recover the earnest money or advance paid; (4) Claim compensation for consequential losses foreseeable at the time of contracting. The party claiming compensation must mitigate their loss." },
      ],
      watchFor: "Agreement must have free consent, lawful consideration, and lawful object. Agreements under coercion, fraud, or undue influence are voidable.",
    },
    {
      id: 15, category: "rera", icon: Landmark,
      name: "National Building Code of India",
      year: 2016,
      short: "Sets minimum standards for construction, structural safety, fire safety, sanitation, and accessibility. Non-compliance leads to occupancy certificate denial.",
      sections: [
        { title: "Structural Safety Requirements", content: "The NBC mandates that all buildings must be designed by a licensed structural engineer and must comply with seismic zone requirements. The building must withstand dead loads, live loads, wind loads, and earthquake forces as per the applicable IS codes. Structural drawings must be certified and submitted for building plan approval." },
        { title: "Fire Safety (Part 4)", content: "Buildings above a certain height must have fire escape staircases, fire lifts, smoke detection systems, sprinkler systems, and fire-fighting equipment. The NBC specifies minimum corridor widths, staircase dimensions, and travel distances to exits. High-rise buildings (above 15 meters) require a NOC from the Fire Department before occupancy." },
        { title: "Occupancy Certificate", content: "No building can be occupied without an Occupancy Certificate (OC) from the local authority. The OC certifies that the building has been constructed as per the approved plan and complies with NBC standards. Purchasing a flat without OC means the buyer cannot legally occupy it and may face demolition orders for non-compliant constructions." },
        { title: "Accessibility (Part 8, Sec 8)", content: "The NBC 2016 mandates barrier-free access for persons with disabilities in all buildings open to the public. Requirements include ramps with handrails, accessible toilets, tactile paths, lifts with Braille controls, and accessible parking. Residential buildings with more than 20 dwelling units must have at least one accessible unit." },
      ],
      watchFor: "Occupancy Certificate must be obtained after construction. Buildings without OC are technically illegal to occupy and difficult to sell or mortgage.",
    },
    {
      id: 16, category: "agricultural", icon: Leaf,
      name: "Environment Protection Act — Land Use",
      year: 1986,
      short: "Restricts development on ecologically sensitive land. Coastal Regulation Zone (CRZ) and Eco-Sensitive Zone (ESZ) rules strictly apply.",
      sections: [
        { title: "Environmental Clearance (EC)", content: "Projects involving significant land use change — such as townships, industrial areas, mining, river valley projects — require prior Environmental Clearance from the Ministry of Environment, Forest and Climate Change (MoEFCC) or the State Environment Impact Assessment Authority (SEIAA) depending on project size. Construction without EC is liable to be demolished." },
        { title: "Coastal Regulation Zone (CRZ)", content: "CRZ Notification 2019 classifies coastal areas into CRZ-I (ecologically sensitive, no construction), CRZ-II (developed areas, limited construction), CRZ-III (rural areas, restricted construction), and CRZ-IV (islands). The High Tide Line (HTL) and Low Tide Line (LTL) define the CRZ boundary. No construction is permitted within 200 meters of HTL in CRZ-I." },
        { title: "Eco-Sensitive Zones (ESZ)", content: "Areas within 10 km around National Parks and Wildlife Sanctuaries are notified as Eco-Sensitive Zones. Commercial mining, large-scale industries, commercial use of natural water, and construction of hotels and resorts are prohibited in ESZ. Residential buildings are permitted but with restrictions on height and density." },
        { title: "Hazardous Waste & Contaminated Land", content: "The Hazardous Waste Management Rules prohibit industrial waste disposal on land without proper treatment. A buyer of industrial land must conduct environmental due diligence — soil testing for contamination is advisable. Contaminated land cannot be used for residential purposes without government clearance and remediation." },
      ],
      watchFor: "Properties near coast, rivers, forests, or hills need environmental clearance. CRZ-I land cannot be developed at all.",
    },
  ],

  "Tamil Nadu": [
    {
      id: 101, category: "registration", icon: FileText,
      name: "Tamil Nadu Registration Department — Guideline Value System",
      year: 2024,
      short: "Sets minimum market values (guideline values) for land and buildings across Tamil Nadu districts for stamp duty calculation. Updated annually.",
      sections: [
        { title: "What is Guideline Value?", content: "Guideline value (also called ready reckoner rate) is the minimum value fixed by the Tamil Nadu Registration Department for each survey number and street. It is the basis for calculating stamp duty, registration fees, and tax on property transactions. It is updated annually and published in the Tamil Nadu Registration Department website and displayed at Sub-Registrar Offices." },
        { title: "Urban vs Rural Classification", content: "Urban areas are assigned guideline values per square foot (for residential, commercial, or industrial use). Rural/agricultural areas are assigned values per acre or ground. When agricultural land is converted to non-agricultural use, a higher non-agricultural rate applies. Metropolitan areas like Chennai have higher guideline values revised more frequently." },
        { title: "Apartment & Flat Valuation Rules", content: "For apartments, the guideline value is assigned per square foot of the flat's built-up area including common areas proportionate to the flat's undivided share. The land component value is computed separately based on the undivided share of land (UDS). Both are added together to arrive at the total guideline value for stamp duty computation." },
        { title: "Consequences of Undervaluation", content: "If the sale deed mentions a value lower than the guideline value, the Sub-Registrar will assess stamp duty and registration fees on the guideline value. A demand notice for deficit stamp duty plus a penalty up to 25% can be issued. The matter is referred to the Collector for adjudication under the Indian Stamp Act." },
      ],
      watchFor: "Sale value in deed must be at or above guideline value. Under-valuation attracts demand notice and penalty from the Sub-Registrar's Office (SRO).",
    },
    {
      id: 102, category: "agricultural", icon: Leaf,
      name: "Tamil Nadu Land Reforms (Fixation of Ceiling on Land) Act",
      year: 1961,
      short: "Fixes a ceiling on agricultural land holdings per family unit in Tamil Nadu. Surplus land is acquired by the government and redistributed.",
      sections: [
        { title: "Ceiling Limits (Sec 5)", content: "The ceiling limit for a family unit (husband, wife, and 3 minor children) is: 15 standard acres for wetland (irrigated), 30 standard acres for dry land, or an equivalent combination. Each additional minor child above 3 is entitled to 5 standard acres extra up to a maximum of 20 additional acres. Individual members hold land in their own name but the ceiling applies at the family unit level." },
        { title: "Exemptions (Sec 9)", content: "Certain categories are exempt from ceiling: land used for institutions maintained for charitable/educational purposes; land held by government/corporation; land used for industrial purposes under certain conditions; land under co-operative farming societies. The exemption must be applied for and approved by the Collector." },
        { title: "Surplus Land Acquisition", content: "Land in excess of the ceiling is surrendered or acquired by the state government. The owner must file a declaration with the Collector. The Collector determines the surplus after considering exemptions. Compensation for acquired surplus land is paid at rates much below market value — as determined under the Act. Acquired land is redistributed to landless agricultural laborers and SC/ST communities." },
        { title: "Implications for Buyers", content: "Before purchasing agricultural land, verify that no Ceiling Surplus proceedings are pending against the seller. A search with the Collector's office and Tamil Nadu Land Reforms Tribunal is essential. If ceiling proceedings are pending and land is in excess, the buyer will lose the land without compensation after purchase." },
      ],
      watchFor: "Purchasing agricultural land in bulk — verify no ceiling proceedings are pending. Verify that patta is in seller's name without encumbrances.",
    },
    {
      id: 103, category: "registration", icon: ScrollText,
      name: "Tamil Nadu Patta Chitta & Adangal System",
      year: "-",
      short: "Patta (Record of Rights) and Chitta (tax record) are official ownership documents for land in Tamil Nadu. Adangal shows crop and possession details.",
      sections: [
        { title: "Patta — Record of Rights", content: "Patta is the fundamental title document for agricultural land in Tamil Nadu. It shows the survey number, extent of land, owner's name, classification of land (wetland/dry), and any encumbrances noted. It is issued by the Tahsildar and is maintained in the Village Administrative Officer's records. Patta in seller's name is the minimum proof of ownership required before purchase." },
        { title: "Chitta — Tax Record", content: "Chitta records the assessment (tax) details for each piece of land. It shows who is liable to pay the land revenue to the government. While Patta shows ownership, Chitta shows the liability. Together they confirm both ownership and tax status. Discrepancy between patta holder and chitta holder indicates a title dispute and must be resolved before purchase." },
        { title: "Adangal — Crop & Possession Register", content: "Adangal (also called Pahani in other states) records the actual use of land: whether the land is being cultivated or lying fallow, who is actually in possession, what crops are grown, and whether any tenancy exists. It is updated every agricultural season. Adangal records a tenant's cultivation details which can be used to claim tenancy rights." },
        { title: "FMB — Field Measurement Book & Digital Access", content: "The Field Measurement Book (FMB) sketch shows the physical boundaries of each survey number, its shape, area, and neighboring survey numbers. It is essential for identifying the actual physical land corresponding to a survey number. All these records — Patta, Chitta, Adangal, and FMB — are now available digitally through the TN e-Sevai portal and ESERVICES.TN.GOV.IN." },
      ],
      watchFor: "Insist on Patta in seller's name before purchase. After registration, immediately apply for Patta transfer at Taluk office. Mismatch between Patta and EC is a serious red flag.",
    },
    {
      id: 104, category: "tenancy", icon: Building2,
      name: "Tamil Nadu Buildings (Lease & Rent Control) Act",
      year: 1960,
      short: "Governs rent, eviction, and rights of landlords and tenants for residential and commercial buildings in Tamil Nadu. Protects tenants from arbitrary eviction.",
      sections: [
        { title: "Fair Rent Fixation (Sec 4)", content: "The Act prescribes a formula for calculating fair rent based on the annual cost of construction divided by a fixed factor. Where the rent agreed exceeds the fair rent, a tenant can apply to the Rent Controller for fixation of fair rent. The fair rent controller can revise rent upward for improvements made by the landlord but downward if rent is unreasonably high." },
        { title: "Grounds for Eviction (Sec 10)", content: "Eviction can only be ordered by the Rent Controller on these specific grounds: (1) Non-payment of rent after notice; (2) Subletting without written consent; (3) Use of premises for purposes other than agreed; (4) Causing nuisance or annoyance to neighbours; (5) Wilful damage; (6) Denial of landlord's title; (7) Landlord requires it for personal occupation; (8) Landlord requires it for demolition and reconstruction." },
        { title: "Sub-Tenancy (Sec 13)", content: "A tenant cannot sublet the premises or part of it to a sub-tenant without the written consent of the landlord. If the main tenant vacates the premises and only the sub-tenant remains, and the sub-tenancy was with the landlord's written consent, the sub-tenant is protected under the Act and cannot be evicted without following the same eviction process." },
        { title: "Protection & Deposit Rules (Sec 14 & 18)", content: "Advance rent cannot exceed three months for residential premises and six months for non-residential. The tenant can apply for repairs if the landlord neglects essential maintenance. Landlord cannot cut off water, electricity, or access to essential services to coerce a tenant to vacate — such action is a criminal offence under the Act." },
      ],
      watchFor: "Landlord can only evict on specified grounds — court order is mandatory. No self-help eviction is permitted under this Act.",
    },
    {
      id: 105, category: "rera", icon: Landmark,
      name: "Tamil Nadu Real Estate Regulatory Authority (TNRERA)",
      year: 2017,
      short: "Tamil Nadu's implementation of central RERA. All residential projects with 8+ apartments or 500 sqm+ must register with TNRERA before sale.",
      sections: [
        { title: "Mandatory Project Registration", content: "All promoters of residential projects with 8 or more apartments or a land area of 500 sq. meters or more must register with TNRERA before advertising, marketing, booking, selling, or offering any apartment for sale. Ongoing projects that had not obtained completion certificate before RERA came into force must also register. Penalty for non-registration: up to 10% of project cost." },
        { title: "Buyer Protections Under TNRERA", content: "A buyer can file a complaint against a promoter for: delay in possession beyond the date agreed in the Agreement for Sale; failure to complete the project; alteration of plans without consent; failure to rectify structural defects within 5 years of possession; failure to provide promised amenities. TNRERA orders are enforceable like a civil court decree." },
        { title: "TNRERA Complaint Portal", content: "Complaints can be filed online at tnrera.in. The complaint is heard by the Authority (TNRERA Chairman and Members) or referred to the Adjudicating Officer for compensation claims. The Authority must dispose of complaints within 60 days of filing. Interest on delayed possession is calculated at SBI MCLR + 2% per month." },
        { title: "Escrow & Completion Certificate", content: "The promoter must open a separate escrow account with a scheduled bank and deposit 70% of the amounts received from allottees. Withdrawals from this account can only be made in proportion to the percentage of completion certified by an engineer, architect, and chartered accountant. The promoter must obtain Completion Certificate (CC) and Occupancy Certificate (OC) before handing over possession." },
      ],
      watchFor: "Verify project registration on tnrera.in before booking. Check for complaints filed against builder. Demand CC and OC before taking possession.",
    },
    {
      id: 106, category: "agricultural", icon: Leaf,
      name: "Tamil Nadu Agricultural Lands (Record of Tenancy Rights) Act",
      year: 1969,
      short: "Requires recording of tenancy rights in agricultural land. Protects cultivating tenants' possession rights.",
      sections: [
        { title: "Tenancy Record (Sec 3)", content: "Every landlord of agricultural land is required to furnish a list of all tenants cultivating any part of their land to the prescribed authority. The authority maintains a Register of Tenant Cultivators. Once a tenant's name is recorded in this register, their possession is recognised as legal tenancy and they get protection against arbitrary eviction." },
        { title: "Tenants' Rights", content: "A tenant cultivator in actual possession whose name is recorded in the tenancy register has the right to continue cultivation as long as they pay the agreed rent. The landlord cannot evict the tenant without approaching the prescribed authority. The tenant is entitled to notice before eviction and has the right to appeal." },
        { title: "Eviction Restrictions", content: "A tenant cultivator cannot be evicted during the crop season. Notice of eviction must be given at least three months before the date of intended eviction. Grounds for eviction are limited: non-payment of rent, personal cultivation by the landlord, or the land being required for a purpose other than agriculture." },
        { title: "Revenue Records Update", content: "After a tenancy agreement ends and the land is taken back by the landlord, the revenue records (Adangal) must be updated to remove the tenant's entry. This is done through an application to the Tahsildar. Failure to update can result in the tenant's heirs claiming tenancy rights years later." },
      ],
      watchFor: "If agricultural land is sold, verify no cultivating tenant has an outstanding claim in the tenancy register. Revenue records must show clear possession.",
    },
    {
      id: 107, category: "registration", icon: Building2,
      name: "Tamil Nadu Apartment Ownership Act",
      year: 1994,
      short: "Governs ownership, management, and maintenance of apartment complexes in Tamil Nadu. Establishes Association of Apartment Owners.",
      sections: [
        { title: "Undivided Share (UDS) of Land", content: "Under this Act, each apartment owner holds an undivided share in the land underlying the building proportionate to their flat's area. The UDS is crucial because land ownership in India is more secure than building ownership. The sale deed must clearly specify the UDS in square feet and survey number. UDS is a critical factor in the overall property valuation." },
        { title: "Declaration & Registration (Sec 7)", content: "The promoter must submit a Declaration to the Registrar before or at the time of the first sale of any apartment. The Declaration must contain: the description of the land with survey numbers, description of the building, percentage of undivided interest of each apartment in the common areas, and proposed rules for the Association." },
        { title: "Association of Apartment Owners (Sec 14)", content: "All apartment owners in a complex are automatically members of the Association of Apartment Owners. The Association is governed by bye-laws and is responsible for maintenance and management of common areas and facilities. The Association can levy maintenance charges (common area maintenance or CAM) on each owner." },
        { title: "Maintenance Fund (Sec 15)", content: "The Association must maintain a common area maintenance fund. Owners who default in payment of maintenance charges can have their access to common amenities suspended. The Association can also approach a civil court for recovery. The Association can enter into contracts for maintenance services, security, and utilities for the entire complex." },
      ],
      watchFor: "Check if apartment association is formed and registered. Verify UDS (undivided share) in land is correctly specified in the sale deed — it must be present.",
    },
    {
      id: 108, category: "registration", icon: Landmark,
      name: "Tamil Nadu Town & Country Planning Act",
      year: 1971,
      short: "Controls land use, building construction, and urban development planning in Tamil Nadu. Regulates land use conversion.",
      sections: [
        { title: "Master Plan Zoning", content: "Each urban local body and planning area in Tamil Nadu has a Master Plan prepared by the DTCP (Directorate of Town and Country Planning) or CMDA (Chennai Metropolitan Development Authority). The Master Plan classifies every plot of land into a zone: Residential, Commercial, Industrial, Agricultural, Institutional, Open Space, or Special Purpose. Land use must conform to the zone classification." },
        { title: "Layout Approval (Sec 47)", content: "Any person proposing to sub-divide land into plots for sale must obtain layout approval from the local planning authority (DTCP/CMDA) or local body. The layout must provide for roads, open spaces, and utility reservations as specified. Selling plots without layout approval is illegal and purchasers of such plots face denial of building plan approval." },
        { title: "Land Use Conversion (Sec 116)", content: "Agricultural land cannot be used for non-agricultural purposes without prior conversion order from the competent authority (Collector/DTCP). Constructing a building on agricultural land without conversion is a violation. The conversion fee is levied at a percentage of guideline value. After conversion, the land classification in revenue records must be updated." },
        { title: "DTCP & CMDA Approvals", content: "All building constructions require plan approval from the local body or DTCP/CMDA within their jurisdiction. For multi-storey residential buildings above specified floor area, environmental clearance is also required. Buildings must be certified complete and Completion Certificate (CC) obtained before applying for services like electricity and water connection." },
      ],
      watchFor: "Verify layout is DTCP/CMDA approved before buying a plot. Agricultural land requires conversion order before construction. Always check land is not in a no-construction zone.",
    },
    {
      id: 109, category: "dispute", icon: FileText,
      name: "Tamil Nadu Stamp Act (State Amendments)",
      year: 2023,
      short: "Tamil Nadu-specific stamp duty rates. Recently revised in 2023. Rates differ for residential, commercial, agricultural, and gift transfers.",
      sections: [
        { title: "Current Stamp Duty Rates (2023)", content: "Sale deed: 7% of the property value. Gift deed to family members (spouse/children/parents): 1% subject to a maximum of ₹25,000 for residential property. Gift deed to others: 7%. Settlement deed to family: 1% (max ₹25,000 residential). Settlement deed to others: 7%. Exchange deed: 7% on the higher value property. Partition deed: 1% on separated share." },
        { title: "Registration Fees", content: "Registration fee is 1% of property value subject to a maximum of ₹4 lakhs per document. This is charged in addition to stamp duty. For properties registered in the name of a woman, the registration fee is 0.5% up to a maximum of ₹2 lakhs. The combined cost (stamp duty + registration fee) in Tamil Nadu can range from 8–9% of the property value." },
        { title: "Market Value Assessment", content: "If the Sub-Registrar believes the stated consideration in the sale deed is below the actual market value, they can refer the matter to the Collector for market value assessment under Section 47-A of the Indian Stamp Act (as amended in Tamil Nadu). The Collector can demand additional stamp duty if the assessed market value is higher than the stated consideration." },
        { title: "Penalty Provisions", content: "Insufficient stamp duty attracts a penalty of 2% per month on the deficit from the date of execution, subject to a maximum of 10 times the duty. If a document executed outside Tamil Nadu is brought into the state and relates to property in Tamil Nadu, it must be stamped as per Tamil Nadu rates within 3 months of receipt." },
      ],
      watchFor: "Current stamp duty is 7% for sale. Add 1% registration fee. Compute on guideline value or actual sale value — whichever is higher.",
    },
    {
      id: 110, category: "agricultural", icon: ScrollText,
      name: "Tamil Nadu Abolition of Zamindari, Inam & Village Service Tenure Acts",
      year: "1948–1963",
      short: "Abolished Zamindari and Inam land tenure systems. Converted to ryotwari tenure. Land now held directly under government grant.",
      sections: [
        { title: "Abolition of Zamindari (1948)", content: "The Tamil Nadu Estates (Abolition and Conversion into Ryotwari) Act 1948 abolished all Zamindari estates. The estate land vested in the government and was then settled with ryots (cultivating tenants and occupants) through ryotwari patta. Zamindars were compensated. Former Zamindari land now appears in records as ryotwari patta with the settled holder's name." },
        { title: "Inam Abolition (1963)", content: "The Tamil Nadu Inams (Abolition and Conversion into Ryotwari) Act 1963 abolished Inam land tenures — grants of land made by the government in lieu of services. The land vested in the government and was re-settled with the actual cultivators. Some Inam lands were converted into full ownership rights; others became service tenures or trust lands." },
        { title: "Ryotwari Patta System", content: "Under ryotwari, each cultivator holds land directly under the government by a patta (certificate of holding). The ryot pays land revenue directly to the government. This is the predominant form of land tenure in Tamil Nadu today. All Zamindari and Inam lands have been converted to ryotwari patta, though the conversion process is still incomplete for some parcels." },
        { title: "Title Issues with Old Inam Land", content: "Inam lands that were not properly settled may still show the original grantee's name in old records but the actual possession may be with descendants or purchasers. Such lands have unclear titles. Before purchasing, check whether the ryotwari patta has been issued properly. Lands with old inam descriptions in the parent documents must be thoroughly verified by a lawyer." },
      ],
      watchFor: "Old inam land may have disputed title. Check whether ryotwari patta has been properly issued to current owner's lineage before purchasing.",
    },
    {
      id: 111, category: "tribal", icon: Users,
      name: "Tamil Nadu SC/ST (Prevention of Atrocities) Act — Land Provisions",
      year: 1989,
      short: "Prevents forcible dispossession of SC/ST communities from their land. Transfer of SC/ST allotted land requires Collector permission.",
      sections: [
        { title: "Land Dispossession as an Offence", content: "The Prevention of Atrocities Act makes it a specific offence for a non-SC/ST person to wrongfully occupy or cultivate land owned by or allotted to an SC/ST person. This offence is cognisable and non-bailable, and the accused must be arrested without warrant. Mere purchase of such land from an SC/ST person who was under duress can attract prosecution." },
        { title: "Allotted Land Transfer Restriction", content: "Land allotted by the government to SC/ST persons under any scheme cannot be transferred to a non-SC/ST person without prior written permission from the Collector. Any transfer made without such permission is void ab initio — it is as if the transfer never happened. The purchaser loses the money paid and the land reverts to the SC/ST original owner." },
        { title: "Collector's Permission Process", content: "To obtain Collector permission for transfer of SC/ST allotted land, an application must be made showing: (1) the need for the transfer; (2) that the SC/ST owner is making a free and voluntary decision; (3) that the consideration is fair. The Collector must satisfy themselves that the SC/ST person is not being exploited before granting permission." },
        { title: "How to Identify SC/ST Allotted Land", content: "SC/ST allotted land is identifiable from the patta — it will show the type of allotment (housing board allotment, Housing Scheme patta, or Special Register patta). Revenue records may note it as 'Adi Dravidar Land' or with the original scheme under which it was allotted. A search of Revenue Department records at the Taluk office before purchase is essential." },
      ],
      watchFor: "Purchasing land from SC/ST seller — verify transfer is with proper Collector permission. Without it, the sale is void and the buyer loses money.",
    },
    {
      id: 112, category: "tenancy", icon: Building2,
      name: "Tamil Nadu City Tenants' Protection Act",
      year: 1921,
      short: "Protects tenants in Tamil Nadu urban areas who have constructed buildings on another's land. Gives statutory right of occupancy.",
      sections: [
        { title: "Who is a Protected Tenant (Sec 3)", content: "A city tenant is a person who holds land in a city or town under a lease and has erected a building on it with the express or implied permission of the landlord. Such a tenant acquires a statutory right of occupancy — the right to remain in possession — even if the lease expires, as long as they pay the agreed rent." },
        { title: "Right to Purchase the Land (Sec 9)", content: "A protected city tenant has the right of pre-emption — if the landlord decides to sell the land, the tenant has the first right to purchase it at the same price offered by any third party. The landlord must give notice of the proposed sale price to the tenant. Failure to give such notice allows the tenant to challenge the sale." },
        { title: "Eviction Protection", content: "A city tenant can only be evicted on specific grounds: (1) Non-payment of rent; (2) Subletting without consent; (3) Misuse of premises; (4) Landlord requires the land for personal construction (but must provide alternative land in certain cases). The tenant must be given 3 months notice before filing an eviction petition." },
        { title: "Practical Impact on Buyers", content: "When purchasing land in urban Tamil Nadu, check if any part of the land has a building constructed by a tenant. If such a structure exists and the tenant qualifies as a City Tenant, the land cannot be cleared for new construction without going through a lengthy court eviction process. This significantly affects the usability and value of the land." },
      ],
      watchFor: "If land has tenants who have built structures, they may have statutory rights under this Act. Such tenants cannot be easily evicted and have first right to purchase.",
    },
  ],


  "Andhra Pradesh": [
    { id:201, category:"registration", icon:FileText, name:"Andhra Pradesh Rights in Land and Pattadar Passbooks Act", year:1971,
      short:"Provides Pattadar Passbooks and Title Deeds to landowners in Andhra Pradesh. Passbook is the primary proof of ownership for agricultural land.",
      sections:[
        {title:"Pattadar Passbook & Title Deed",content:"Every landowner in AP receives a Pattadar Passbook (containing ownership details) and a Title Deed (legal document of ownership). These are issued by the Revenue Department through MeeSeva centres. The passbook records survey number, extent, classification, encumbrances, and any mortgage. Banks accept the passbook as security for agricultural loans."},
        {title:"Mutations & Transfer Entries",content:"After purchase, the buyer must apply for mutation at the Mandal Revenue Office (MRO). The Revenue Divisional Officer (RDO) approves mutations. AP has implemented Dharani portal for online mutation and registration in a single window — both are done simultaneously at the Sub-Registrar's office since 2020."},
        {title:"Dharani Portal Integration",content:"AP's Dharani portal (dharani.ap.gov.in) integrates land records with registration. All agricultural land transactions are done exclusively through Dharani. The system prevents fraudulent registrations by cross-checking ownership at the time of deed submission. Citizens can view their passbooks, register transactions, and apply for mutations online."},
        {title:"Encumbrance Certificate in AP",content:"The Encumbrance Certificate (EC) in AP is now integrated with Dharani and IGRS (Integrated Grievances and Registration System). EC shows all registered transactions on a property for the last 30 years. AP has moved to a 12-digit unique land parcel ID system linking survey numbers, Pattadar details, and satellite mapping."},
      ],
      watchFor:"Verify Pattadar Passbook is in seller's name before purchase. Use Dharani portal to check encumbrances. Agricultural land — do all formalities through Dharani portal only."},
    { id:202, category:"agricultural", icon:Leaf, name:"Andhra Pradesh Land Reforms (Ceiling on Agricultural Holdings) Act", year:1973,
      short:"Fixes ceiling on agricultural land holdings in AP. Surplus land is acquired and redistributed to landless laborers and SC/ST communities.",
      sections:[
        {title:"Ceiling Limits",content:"The ceiling for a family unit (4 members) is: 54 acres for dry land, 27 acres for wet (irrigated) land, or a combination. For families larger than 4 members, an additional 9 acres (dry) or 4.5 acres (wet) per additional member up to a maximum of 18 additional acres (dry) or 9 acres (wet). Lands held benami are aggregated for computing ceiling."},
        {title:"Exemptions",content:"Exemptions include: land held by co-operative farming societies, educational/charitable trusts, government undertakings, and plantation crops like coconut, cashew, and mango orchards above a specified area. Exemptions must be applied for within prescribed time limits."},
        {title:"Surplus Declaration & Redistribution",content:"The landowner must declare surplus land to the Ceiling Tribunal. Once declared surplus, the government acquires it at low statutory rates and distributes it to landless laborers, SC/ST persons, and backward classes. Assigned land is non-transferable for a period of 10 years from assignment."},
        {title:"Verification Before Purchase",content:"Search at the AP Ceiling Tribunal and Revenue Court is essential before purchasing agricultural land in bulk. Any pending ceiling proceedings automatically attach to the land even after sale. The buyer loses the land without compensation if proceedings conclude against the land."},
      ],
      watchFor:"Check ceiling tribunal records before bulk agricultural land purchase. Assigned land to SC/ST or poor families cannot be purchased for 10 years from assignment."},
    { id:203, category:"rera", icon:Landmark, name:"Andhra Pradesh Real Estate Regulatory Authority (AP RERA)", year:2017,
      short:"AP's implementation of central RERA governing residential and commercial real estate projects. All projects above threshold must register with AP RERA before sale.",
      sections:[
        {title:"Project Registration",content:"All residential projects with 8 or more apartments or plot area of 500 sq.m or more must register with AP RERA at aprera.gov.in before marketing or selling. All ongoing projects that had not received completion certificate before RERA came into force were required to register within 3 months of RERA becoming effective in AP."},
        {title:"Buyer Protections",content:"AP RERA provides: right to obtain all project information; right to claim possession on the agreed date; right to claim interest at SBI MCLR + 2% per month for delay; right to claim refund if possession is not given within agreed time; right to approach AP RERA for complaints against promoters and agents."},
        {title:"Promoter Obligations",content:"Promoters in AP must deposit 70% of receivables in a designated escrow bank account. They must update the AP RERA website quarterly with project progress. Changes to sanctioned plans require written consent of 2/3 allottees. Structural defects within 5 years of possession handover must be rectified free of cost."},
        {title:"Complaints & Adjudication",content:"Complaints can be filed online at aprera.gov.in. The Authority must dispose of complaints within 60 days. The Adjudicating Officer handles compensation claims. Orders of AP RERA are executable as civil court decrees. Non-compliance with RERA orders attracts imprisonment up to 3 years."},
      ],
      watchFor:"Verify AP RERA registration on aprera.gov.in before booking. Check complaint history of the builder. Insist on escrow account details and possession date in the agreement."},
    { id:204, category:"tenancy", icon:Building2, name:"Andhra Pradesh Buildings (Lease, Rent & Eviction) Control Act", year:1960,
      short:"Governs rent, eviction, and tenant-landlord relationships in AP urban areas. Protects tenants from arbitrary rent hikes and eviction.",
      sections:[
        {title:"Fair Rent",content:"The Rent Controller can fix fair rent on application by either tenant or landlord. Fair rent is calculated based on the construction cost and depreciation formula. Landlords cannot unilaterally increase rent beyond the fair rent fixed. Any rent paid in excess of fair rent can be recovered by the tenant."},
        {title:"Eviction Grounds",content:"Eviction from AP buildings is allowed only for: non-payment of rent after 15-day notice; sub-letting without consent; misuse for purposes other than agreed; causing nuisance; wilful damage; denial of landlord's title; bona fide personal requirement of the landlord; requirement for demolition and reconstruction with municipal approval."},
        {title:"Deposit & Advance",content:"Advance rent or security deposit cannot exceed 3 months rent for residential premises and 6 months for non-residential. Any amount paid in excess can be adjusted against future rent. The landlord must give a proper receipt for all rent and advance payments. Electronic payment records serve as valid receipts."},
        {title:"Sub-Tenancy Protection",content:"Sub-tenants who have been in possession with the landlord's written consent are protected under the Act. On vacation by the main tenant, the sub-tenant can apply to the Rent Controller for protection of their possession. The Rent Controller may direct that the sub-tenancy be recognised as a direct tenancy with the landlord."},
      ],
      watchFor:"All evictions in AP require Rent Controller's order. Self-help eviction (disconnecting utilities, forcible lock-out) is a criminal offence. Advance beyond 3 months is illegal."},
  ],

  "Karnataka": [
    { id:301, category:"registration", icon:FileText, name:"Karnataka Land Revenue Act", year:1964,
      short:"Comprehensive land revenue administration law for Karnataka. Governs land records (RTC/Pahani), mutations, land conversions, and survey operations.",
      sections:[
        {title:"RTC — Record of Rights, Tenancy & Cultivation (Pahani)",content:"The RTC (popularly called Pahani) is the fundamental land record in Karnataka maintained at the village level by the Village Accountant. It shows: owner's name, survey number, extent, type of land (wet/dry/garden), assessment, and details of possession. RTC is updated after each mutation. Karnataka's Bhoomi portal (landrecords.karnataka.gov.in) provides online RTC."},
        {title:"Mutation / Khata Transfer",content:"After registration of a sale deed, the buyer must apply for mutation at the Taluk office within 30 days. The Tahsildar verifies the deed and updates the RTC. In urban areas, Khata (a separate record showing ownership for tax purposes) must also be transferred at the BBMP, CMC, or local body. Khata is required for building plan approval, utilities, and property tax."},
        {title:"Conversion of Agricultural Land (Section 95)",content:"Agricultural land in Karnataka cannot be used for non-agricultural purposes without a conversion order from the Deputy Commissioner under Section 95 of the Karnataka Land Revenue Act. Conversion fees are levied at a percentage of guideline value. DC Order is required before applying for building plan sanction on agricultural land."},
        {title:"Bhoomi Kalyan Portal",content:"Karnataka's Bhoomi portal digitised all land records. It provides online RTC, mutation status, encumbrance certificates (EC), and certified copies. The KAVERI portal handles registration. Karnataka introduced RTC-linked KAVERI for simultaneous mutation on registration. The Sakala scheme guarantees time-bound delivery of land-related government services."},
      ],
      watchFor:"Check RTC is in seller's name on Bhoomi portal before purchase. In Bangalore — verify BBMP Khata status. Agricultural land needs DC conversion order before construction."},
    { id:302, category:"agricultural", icon:Leaf, name:"Karnataka Land Reforms Act", year:1961,
      short:"Abolished absentee landlordism, conferred ownership on tenants, and fixed ceiling on agricultural land holdings in Karnataka.",
      sections:[
        {title:"Vesting of Land in Tenants",content:"The Karnataka Land Reforms Act gave ownership rights to persons who were cultivating agricultural land as tenants before 1 March 1974. Such tenants became owners upon payment of a nominal amount. Their names were entered in the RTC as owners. Before purchasing old agricultural land, verify that no former tenant's name appears in old RTC extracts."},
        {title:"Ceiling on Agricultural Land",content:"The ceiling limit in Karnataka is 10 units (approximately 54 acres for dry land, 27 acres for irrigated land) for a family unit of 5 members. Surplus land was surrendered to the government and assigned to landless laborers. Agricultural land acquired under the Karnataka Land Reforms Act (assigned land) cannot be sold for 15 years from assignment."},
        {title:"Restrictions on Transfer to Non-Agriculturists",content:"Under Section 79A, agricultural land in Karnataka cannot be sold to a person who is not an agriculturist (farmer or agricultural worker) without prior government permission. A person with non-agricultural income above a specified threshold (enhanced from time to time) cannot purchase agricultural land. Violation renders the transaction void."},
        {title:"Urban Agglomeration — Section 109",content:"In and around urban areas of Bangalore and other cities, the DC can grant permission for purchase of agricultural land by non-agriculturists under Section 109 of the Act. This is done for industrial, residential, or commercial development. DC permission is mandatory — without it, any sale to a non-agriculturist is void."},
      ],
      watchFor:"Agricultural land in Karnataka cannot be sold to non-farmers without DC permission. Always check Sec 79A status. Verify no assigned land restrictions apply."},
    { id:303, category:"rera", icon:Landmark, name:"Karnataka Real Estate Regulatory Authority (RERA Karnataka)", year:2017,
      short:"Karnataka's RERA implementation. Projects must register at rera.karnataka.gov.in. Especially critical in Bangalore where numerous buyer complaints exist.",
      sections:[
        {title:"RERA Registration Requirement",content:"All residential and commercial real estate projects in Karnataka with more than 8 units or area above 500 sq.m must be registered with RERA Karnataka before advertising or selling. Bangalore Metropolitan Area falls under BBMP jurisdiction — all apartment projects in BBMP area must register with RERA Karnataka."},
        {title:"Complaints Against Builders",content:"Karnataka RERA regularly adjudicates complaints against builders for: possession delay, alteration of plans, defective construction, failure to form apartment owner associations, and non-formation of maintenance corpus. Karnataka RERA has issued orders against several major Bangalore builders directing refunds with interest."},
        {title:"Corpus Fund for Maintenance",content:"At the time of handing over the project, the promoter must form the Resident Welfare Association (RWA) and hand over the corpus maintenance fund. The corpus must be at least 25% of the annual maintenance charges. Failure to hand over corpus is a violation reportable to RERA Karnataka."},
        {title:"Project Extension & Revised Completion Date",content:"If a project cannot be completed by the registered completion date, the promoter must apply to RERA for an extension with valid reasons (force majeure, natural calamity, regulatory delay). RERA Karnataka may grant extension but the promoter must pay interest to allottees for the extended period. Unexplained delay is penalised."},
      ],
      watchFor:"Verify Karnataka RERA registration on rera.karnataka.gov.in. Check complaint history. For Bangalore projects, also verify BBMP OC and Khata status."},
    { id:304, category:"registration", icon:Scale, name:"Karnataka Stamp Act & Registration", year:1957,
      short:"Karnataka-specific stamp duty rules. Current sale deed stamp duty is 5% plus surcharges totalling 5.6%. Registration fee 1%.",
      sections:[
        {title:"Current Stamp Duty Rates",content:"Sale deed: 5% stamp duty + 0.5% BBMP/CMC/Town Panchayat cess + 0.1% agricultural surcharge = effective 5.6% in Bangalore. Additional 10% surcharge (0.5%) may apply in certain municipal areas. For women buyers: 5.1% (0.5% concession). Gift deed to family members: 5% (no concession currently). Mortgage deed: 0.5% subject to maximum of ₹1 lakh."},
        {title:"Sub-Registrar Office Process",content:"Registration in Karnataka happens at Sub-Registrar Offices (SRO) under KAVERI (Karnataka Valuation and e-Registration). Both parties (buyer and seller) with two witnesses must appear in person. Biometric authentication (fingerprint and photograph) is captured. The registered document is returned immediately with digital QR code for future verification."},
        {title:"KAVERI Online Services",content:"KAVERI portal (kaverionline.karnataka.gov.in) allows online scheduling of registration appointments, pre-checking of documents, calculation of stamp duty, and obtaining EC (Encumbrance Certificate). EC for up to 30 years can be obtained online instantly. This is a critical due diligence tool before any property purchase."},
        {title:"Guidance Value (Circle Rate) in Karnataka",content:"The guidance value for each locality in Karnataka is fixed by the Stamps and Registration Department and is published on the KAVERI portal. Registration cannot be done below the guidance value. If the sale value is below guidance value, duty is calculated on guidance value. Guidance values in Bangalore are updated periodically and vary significantly by area."},
      ],
      watchFor:"Effective stamp duty in Bangalore is ~5.6%. Always calculate on guidance value or sale value — whichever is higher. Verify guidance value on KAVERI portal before finalising price."},
  ],

  "Maharashtra": [
    { id:401, category:"registration", icon:FileText, name:"Maharashtra Land Revenue Code", year:1966,
      short:"Comprehensive revenue administration for Maharashtra. Governs 7/12 extract (Satbara), mutation records, land conversions, and survey records.",
      sections:[
        {title:"7/12 Extract (Satbara Utara)",content:"The 7/12 extract (7 refers to the register of rights, 12 refers to the register of other rights) is the most important land record in Maharashtra for agricultural land. It shows: owner's name, survey number, area, type of soil, crops grown, and encumbrances. Available online at mahabhulekh.maharashtra.gov.in. Any property transaction involving agricultural land must be verified on Satbara first."},
        {title:"8A Extract",content:"The 8A extract shows all survey numbers owned by a person in a village. It is used to verify whether a seller owns the specific land they are selling and to check for any ceiling violations. It is cross-checked with the 7/12 to confirm ownership. Both 7/12 and 8A are admissible as evidence in court for land matters."},
        {title:"Mutation (Ferfar)",content:"After registration, mutation is done by applying to the Talathi (village revenue officer). The Talathi forwards to the Tehsildar. Notice is given to neighbouring owners and objections are invited. Mutation is sanctioned after verification. Maharashtra has E-mutation (online) available through Mahabhulekh. Mutation must be completed within 45 days."},
        {title:"Non-Agricultural Use Permission (NA Permission)",content:"Agricultural land in Maharashtra cannot be used for non-agricultural purposes without NA (Non-Agricultural) permission from the Collector. The Collector issues Section 44 (for private land) or other relevant permissions under MLRC. Construction on agricultural land without NA permission is illegal. NA permission specifies the use (residential, commercial, industrial) and conditions."},
      ],
      watchFor:"Always verify 7/12 and 8A before purchasing agricultural land in Maharashtra. For urban land, check Mutation Entry, City Survey records, and NA permission."},
    { id:402, category:"rera", icon:Landmark, name:"MahaRERA — Maharashtra Real Estate Regulatory Authority", year:2017,
      short:"Maharashtra was one of the first states to implement RERA. MahaRERA (maharerait.maharashtra.gov.in) has received the highest number of complaints and orders in India.",
      sections:[
        {title:"MahaRERA Registration",content:"All residential projects in Maharashtra with 8+ apartments or 500+ sqm must register with MahaRERA. Mumbai Metropolitan Region, Pune, Nagpur, and all major urban centres are covered. Self-redevelopment projects by housing societies also require RERA registration. Construction of project infrastructure (roads, utilities) before RERA registration is allowed."},
        {title:"Quarterly Updates & Transparency",content:"Promoters must update project completion status quarterly on MahaRERA website. The quarterly progress reports include: funds received, funds utilised, construction completed (floor-wise), apartments sold, completion certificate status. Buyers can track their project in real-time on the website. Non-filing of quarterly reports attracts penalty."},
        {title:"Conciliation Forum",content:"MahaRERA has a unique Conciliation and Dispute Resolution Forum where disputes between buyers and promoters are resolved through structured mediation before filing formal complaints. Most straightforward complaints (delay, plan changes) are resolved through conciliation without full adjudication, saving time for both parties."},
        {title:"Legal Recourse for Delay",content:"Maharashtra buyers suffering possession delay can: (1) File complaint with MahaRERA for interest at SBI MCLR + 2% per month; (2) File for full refund with interest if more than 1 year of delay; (3) Approach consumer forum for compensation for mental agony; (4) File criminal complaint under IPC if developer committed fraud. MahaRERA orders are enforceable through collector's office."},
      ],
      watchFor:"Verify MahaRERA registration. Maharashtra has the most RERA complaints — always check builder's complaint history. Insist on quarterly progress reports and escrow account statement."},
    { id:403, category:"tenancy", icon:Building2, name:"Maharashtra Rent Control Act", year:1999,
      short:"Governs rent, eviction, and tenant rights in Maharashtra urban areas. Replaced earlier Bombay Rent Act. Provides for Rent Courts and Rent Tribunals.",
      sections:[
        {title:"Standard Rent",content:"The Standard Rent (equivalent of fair rent) is determined by the Rent Court based on the formula in the Act. Landlords cannot charge rent above the standard rent. For old properties in Mumbai under Bombay Rent Act protections, rents are extremely low (legacy tenants paying rents fixed in the 1940s–60s). New tenancies post-1999 are on market rent."},
        {title:"Eviction Grounds",content:"Eviction from protected premises requires Rent Court order on specific grounds: non-payment of rent; subletting without consent; use for purposes other than agreed; causing nuisance; bona fide need for personal use; need for repairs or reconstruction; denial of access to landlord for inspection. Self-help eviction is illegal and amounts to criminal trespass."},
        {title:"Pagdi System (Premium)",content:"Pagdi is a large premium (key money) charged to new tenants upon entry into a tenancy. Once a tenancy is established on pagdi, the landlord cannot unilaterally evict or raise rent beyond standard rent. When the tenant vacates, the landlord pays the outgoing tenant 33–50% of the new pagdi received from the incoming tenant. This is a unique Mumbai practice."},
        {title:"Society Redevelopment",content:"When a cooperative housing society wants to redevelop its building, protected tenants under MRC 1999 must be given temporary alternative accommodation during construction and the right to return to the rebuilt structure with equivalent area. Failure to provide this is a violation. RERA also applies to redevelopment projects."},
      ],
      watchFor:"Old Mumbai tenancies under Bombay Rent Act are extremely complex. Always take a lawyer's advice before dealing with old tenanted properties in Maharashtra."},
    { id:404, category:"registration", icon:Scale, name:"Maharashtra Stamp Act & IGR", year:1958,
      short:"Maharashtra stamp duty rules and registration. Effective stamp duty in Mumbai is 6% (5% + 1% metro cess). Registration fee 1% capped at ₹30,000.",
      sections:[
        {title:"Current Stamp Duty Rates",content:"Sale deed in Mumbai Metropolitan Region: 5% stamp duty + 1% Mumbai Metropolitan Region Development Authority (MMRDA) local body tax = 6% effective rate. In rest of Maharashtra: 5%. For women buyers in Maharashtra: 4% (1% concession). Gift deed to family: 3% in Mumbai, 3% elsewhere. Lease deed for more than 3 years: 5%."},
        {title:"Ready Reckoner Rates",content:"Annual Statement of Rates (ASR), commonly called Ready Reckoner, is published by the Maharashtra Government at the start of each year. It specifies the minimum market value for each area, building type, and flat configuration. Stamp duty cannot be paid on a value below the ASR. Available at igrmaharashtra.gov.in. ASR is critical for calculating stamp duty for under-construction properties."},
        {title:"Online Registration (SARATHI & iSarita)",content:"Maharashtra launched SARATHI (Stamps and Registration) portal for online document registration. iSarita is used for online submission of documents. Registration fees must be paid via GRAS (Government Receipt Accounting System). E-registration with video conferencing is available for certain document types and for NRIs. Physical attendance at SRO is required for most property transactions."},
        {title:"Leave & License Registration",content:"In Maharashtra, all Leave & License (leave and license) agreements must be compulsorily registered regardless of term. This is unique to Maharashtra. Online registration of L&L agreements is available through iSarita. The stamp duty on L&L is ₹500 for up to 60 months. Unregistered L&L agreements cannot be enforced in court."},
      ],
      watchFor:"Effective stamp duty in Mumbai is 6%. Stamp duty on women buyers is 4% — significant saving. All Leave & License agreements must be registered in Maharashtra, even short-term ones."},
  ],

  "Kerala": [
    { id:501, category:"registration", icon:FileText, name:"Kerala Land Reforms Act", year:1963,
      short:"Abolished tenancy, vested surplus land in government, and redistribution to landless. Kerala has one of India's most comprehensive land reform implementations.",
      sections:[
        {title:"Abolition of Tenancy",content:"The Kerala Land Reforms Act granted ownership rights to kudikidappukars (homestead tenants), kanam tenants, and other classes of cultivating tenants. Tenants became owners upon payment of purchase price. Their names were entered in the Basic Tax Register (BTR). Verify BTR and Thandapper records to identify former tenancy claims on land being purchased."},
        {title:"Ceiling on Land Holdings",content:"Ceiling limits: 15 acres for a single person, 20 acres for a family of 2–5 members, 25 acres for a family above 5 members. Exemptions for educational institutions, plantations, and religious trusts. Surplus land was assigned to landless laborers. Assigned land cannot be transferred for 10 years. Court decrees needed to determine pre-reform history."},
        {title:"Pokkuvaravu (Mutation) in Kerala",content:"After registration, Pokkuvaravu (mutation/transfer of land record ownership) must be done at the Village Office. The Village Officer updates the Basic Tax Register (BTR) which is the primary ownership document for agricultural land. Delay in Pokkuvaravu creates disputed title. Kerala has E-District portal for online mutation applications."},
        {title:"Survey & Resurvey Records",content:"Kerala has completed extensive resurvey operations. The resurvey record replaces the old Thandapper/Jamabandi. It provides precise boundaries and areas. Resurvey record extract (cadastral map) is essential for verifying exact boundaries. Discrepancy between old deed area and resurvey area must be examined before purchase."},
      ],
      watchFor:"Kerala has the most complex land reform history. Always check BTR, Thandapper, and resurvey records. Verify no kudikidappukar (homestead tenant) rights exist on the land."},
    { id:502, category:"registration", icon:Scale, name:"Kerala Stamp Act & Registration", year:1959,
      short:"Kerala has one of India's highest stamp duty rates at 8% for sale deeds. Registration fee 2% capped at ₹2 lakhs.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 8% stamp duty (one of the highest in India). No concession for women. Gift deed to family members: 2.5% (concessional). Gift deed to others: 8%. Settlement deed within family: 2.5%. Exchange: 8% on higher value. Partition deed: 2.5% on separated share. Mortgage with possession: 8%. Simple mortgage: 0.3% up to ₹5 lakhs."},
        {title:"Fair Value Certificate",content:"Before registration, a Fair Value Certificate must be obtained from the Village Officer. The Fair Value is the government's estimate of market value for the property based on location, type, and recent transactions. Stamp duty is calculated on the higher of the Fair Value or the sale consideration. Fair Values are updated every year."},
        {title:"Registration Process in Kerala",content:"Registration is at Sub-Registrar Office under Kerala Registration Department. Both parties must be present with two witnesses. Aadhaar verification is mandatory. E-registration facilities are available at select SROs. Kerala has integrated ReLIS (Registration and Land Information System) which links registration with survey and land revenue records."},
        {title:"ReLIS — Integrated Land Records",content:"Kerala's ReLIS portal (erekha.kerala.gov.in) integrates land records, survey records, and registration. It provides online encumbrance certificates (EC), certified copies of documents, and fair value information. The system aims to prevent fraudulent double-registration by cross-checking ownership records before accepting new documents."},
      ],
      watchFor:"Kerala's stamp duty is 8% — the highest in India. Budget accordingly. Always get Fair Value Certificate from Village Officer before finalising sale price."},
    { id:503, category:"tenancy", icon:Building2, name:"Kerala Buildings (Lease & Rent Control) Act", year:1965,
      short:"Governs residential and commercial tenancies in Kerala urban areas. Provides for Rent Control Courts and limits on rent and eviction.",
      sections:[
        {title:"Fixation of Fair Rent",content:"The Rent Control Court can fix fair rent on application by either party. Fair rent is calculated at 8% per annum of the market value of the building. Once fixed, fair rent cannot be increased except after 3 years or after substantial improvements. Landlords cannot unilaterally increase rent without a Rent Control Court order."},
        {title:"Eviction Grounds",content:"Eviction is allowed only for: non-payment of rent; subletting without consent; misuse; nuisance; owner's personal requirement; demolition and reconstruction; use of building on lease for running business that has been permanently closed; tenant having more than one house of their own in the same city. All evictions require Rent Control Court order."},
        {title:"Advance & Security Deposit",content:"Advance (koodika) in Kerala cannot exceed 3 months rent for residential premises and 6 months for commercial premises. Any amount in excess of this is illegal and can be recovered. Separate amounts for maintenance, utility deposits, and society charges may be legitimate but must be specified. Receipts for all payments must be given."},
        {title:"Protection Against Demolition",content:"If a landlord wants to demolish a tenanted building for reconstruction, the tenant must be given alternative accommodation during construction and the right to return to the new building at the same rent. If the landlord does not provide alternative accommodation, the Rent Control Court can deny eviction permission."},
      ],
      watchFor:"Kerala rent control is very tenant-protective. Purchasing tenanted property in Kerala is very difficult to clear for redevelopment. Always verify possession status before purchase."},
  ],

  "Telangana": [
    { id:601, category:"registration", icon:FileText, name:"Telangana Rights in Land and Pattadar Passbooks Act", year:1971,
      short:"Provides Pattadar Passbooks to agricultural landowners in Telangana through Dharani portal. Primary ownership proof for land transactions.",
      sections:[
        {title:"Pattadar Passbook System",content:"Like Andhra Pradesh, Telangana issues Pattadar Passbooks containing ownership particulars. Since bifurcation in 2014, Telangana maintains its own records separately. The passbook is issued by the Revenue Department through Dharani portal (dharani.telangana.gov.in). Banks accept passbook as security for agricultural and crop loans."},
        {title:"Dharani Portal (Telangana)",content:"Telangana's Dharani portal (dharani.telangana.gov.in) provides simultaneous registration and mutation service. Agricultural land registration happens at Dharani facilitation centres (co-located with Sub-Registrar offices). The system generates a Pattadar Passbook immediately after registration. However, Dharani has faced criticism for technical glitches causing registration issues."},
        {title:"Prohibited Properties List",content:"Dharani maintains a list of properties prohibited from registration — government land, assigned land, land under court orders, and encumbered land. The system automatically flags these properties and prevents registration. Before purchasing, the buyer can check the property's status on Dharani and ensure it is not on the prohibited list."},
        {title:"Layout Regularisation Scheme (LRS)",content:"Telangana has periodic Layout Regularisation Schemes (LRS) to regularise unapproved layouts. Under LRS, plots in unapproved layouts can be regularised on payment of development charges. Regularised plots are eligible for building plan approval. Check whether any plot being purchased in a layout was regularised under LRS before purchase."},
      ],
      watchFor:"Use Telangana Dharani portal to verify ownership and prohibited property status. Agricultural land only through Dharani. Check LRS status for plot purchases."},
    { id:602, category:"rera", icon:Landmark, name:"Telangana Real Estate Regulatory Authority (TS RERA)", year:2017,
      short:"Telangana RERA implementation. Projects in Hyderabad and other cities must register at tsrera.telangana.gov.in before marketing or selling.",
      sections:[
        {title:"TS RERA Registration",content:"All residential and commercial projects above threshold (8 apartments / 500 sqm) in Telangana must register with TS RERA. Hyderabad Metropolitan Development Authority (HMDA) area and GHMC limits are the most active zones. Plotted development projects of more than 1000 sqm also require RERA registration in Telangana."},
        {title:"Hyderabad Specific Issues",content:"Hyderabad has seen rapid real estate development with frequent RERA complaints. Common complaints: delay in possession; failure to obtain OC from GHMC; alteration of approved plans; non-formation of apartment owners' association; failure to hand over common areas. TS RERA has issued orders against several Hyderabad builders."},
        {title:"Buyer Rights in TS",content:"Buyers have the right to interest at SBI MCLR + 2% per month for delay. If possession is not given within 1 year of agreed date, the buyer can seek full refund. After possession, if structural defects are found within 5 years, the promoter must rectify them free. OC (Occupancy Certificate) from GHMC/UDA is mandatory before possession."},
        {title:"Open Plots & RERA",content:"In Telangana, open plot development projects (colonies/layouts) above 500 plots or 5 acres of land area require RERA registration. This addresses the large number of plotted development projects around Hyderabad. Buyers should verify RERA registration for any plot purchase in a development project."},
      ],
      watchFor:"Verify TS RERA registration on tsrera.telangana.gov.in. For Hyderabad projects, verify GHMC-approved building plan and pending OC. Check Dharani for plot status."},
    { id:603, category:"registration", icon:Scale, name:"Telangana Stamp Act & Registration", year:1999,
      short:"Telangana stamp duty: 5% for sale deeds. Registration fee 0.5% (max ₹75,000). Stamp duty on guideline value or sale value — whichever higher.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 5% stamp duty. Registration fee: 0.5% subject to maximum ₹75,000 per document. No concession for women currently. Gift deed to family: 2% + 0.5% registration. Gift to others: 5% + 0.5%. Mortgage: 0.5% subject to maximum ₹1 lakh. Lease for more than 1 year: 0.5% for first year + 0.5% for each subsequent year."},
        {title:"Market Value Assessment",content:"The Stamps and Registration Department of Telangana publishes market values (guideline values) for each area. The IGRS Telangana portal (registration.telangana.gov.in) has a market value calculator. Registration cannot be done below market value. Under-valuation is referred to the District Registrar for assessment and recovery."},
        {title:"Document Registration Process",content:"Registration happens at Sub-Registrar Offices. Since integration with Dharani, agricultural land registration is done at Dharani Facilitation Centres. Biometric authentication is mandatory. Registered document is issued digitally. EC (Encumbrance Certificate) for up to 30 years is available on IGRS Telangana website."},
        {title:"NRI Registration",content:"NRIs can register property in Telangana through a Special Power of Attorney (SPA). The SPA must be executed before the Indian Consulate in the country of residence and apostilled/attested. The SPA holder (attorney) can appear for registration on behalf of the NRI. Original SPA must be produced at registration."},
      ],
      watchFor:"Stamp duty in Telangana is 5% + 0.5% registration. For agricultural land, all transactions must go through Dharani portal only. Verify market value on IGRS Telangana portal."},
  ],

  "West Bengal": [
    { id:701, category:"registration", icon:FileText, name:"West Bengal Land Reforms Act", year:1955,
      short:"Abolished zamindari, conferred rights on bargadars (sharecroppers) under Operation Barga, and fixed ceiling on landholdings in West Bengal.",
      sections:[
        {title:"Operation Barga — Bargadar Rights",content:"Operation Barga (1978–81) was a landmark land reform in West Bengal where sharecroppers (bargadars) were registered with the Revenue Department and given security of tenure. Once registered, a bargadar cannot be evicted and is entitled to retain their cultivating rights. Before buying agricultural land in WB, check whether any bargadar rights are recorded in the Khatian."},
        {title:"Khatian & Daag Number System",content:"West Bengal uses a Khatian (record of rights) and Daag (plot number) system. Khatian Type 1 is Raiyati (private ownership). Khatian Type 2 is Bargadar (sharecropper). Khatian Type 3 is Government Khas land. Always verify the Khatian type before purchase. Government Khas land cannot be privately purchased. Available at banglarbhumi.gov.in."},
        {title:"Ceiling on Agricultural Land",content:"Ceiling limit in WB is 25 bighas (approximately 8.25 acres) for a family. Surplus land was vested in the government and distributed to landless laborers. Vested land cannot be purchased by private parties. Verify at the Block Land and Land Reform Office whether any part of the land being purchased was vested and redistributed."},
        {title:"Mutation (Namjari) Process",content:"After registration, Namjari (mutation) must be done at the Block Land and Land Reform Office (BLLRO). Namjari involves updating the Khatian and the Daag register. Online Namjari is available through Banglar Bhumi portal. Physical appearance with registered deed copy and ID is required. Namjari certificate is required for agricultural loan and land transactions."},
      ],
      watchFor:"Verify Khatian type — government khas land cannot be purchased. Check bargadar entries. Namjari after purchase is mandatory and must be done promptly."},
    { id:702, category:"registration", icon:Scale, name:"West Bengal Stamp Act & Registration", year:1949,
      short:"WB stamp duty on sale deeds is 5–7% depending on consideration value. Registration fee 1% (max ₹1 lakh in Kolkata).",
      sections:[
        {title:"Stamp Duty Rate Slabs",content:"Sale deed stamp duty in WB: For consideration up to ₹25 lakhs — 5%; For ₹25 lakhs to ₹40 lakhs — 6%; Above ₹40 lakhs — 7%. For properties in Kolkata Municipal Corporation area: additional 1% cess applies. Women buyers: 1% concession on all slabs. Registration fee: 1% subject to max ₹1 lakh within KMC, no cap in other areas."},
        {title:"Fair Value Assessment",content:"The Directorate of Registration & Stamp Revenue, WB publishes area-wise fair values (MVA — Market Value Assessment). Registration cannot be done below MVA. MVA portal available at wbregistration.gov.in. Under-valuation is detected automatically and additional stamp duty is demanded. MVA values are updated annually."},
        {title:"e-Registration in WB",content:"West Bengal has implemented e-registration for certain document types. The e-District portal and GRIPS (Government Receipt Portal) handles stamp duty payment online. Citizens can schedule registration appointments online. EC for up to 25 years available through the online portal. Physical presence at SRO required for property registration."},
        {title:"Kolkata Specific — KMDA",content:"In Kolkata and surrounding areas, the Kolkata Metropolitan Development Authority (KMDA) has jurisdiction over planning. Building plan approval requires NOC from KMDA. KMC (Kolkata Municipal Corporation) issues building plans, completion certificates, and occupancy certificates within city limits. KMDA handles the extended metropolitan area."},
      ],
      watchFor:"WB stamp duty is progressive — 5–7% based on value. Women get 1% concession. Check MVA on wbregistration.gov.in before finalising sale price."},
  ],

  "Gujarat": [
    { id:801, category:"registration", icon:FileText, name:"Gujarat Land Revenue Code", year:1879,
      short:"Governs land records, mutations, and land administration in Gujarat. Village Form 7 (Satbara) and Form 6 (Mutation Register) are key documents.",
      sections:[
        {title:"Village Form 7/12 & Form 6",content:"Gujarat uses Village Form 7 (Satbara — rights and cultivations) and Village Form 6 (Mutation Register / Hakkpatra) to record land ownership. Form 7/12 shows owner, tenant, type of land, and crop details. Form 6 shows the sequence of mutations. Available online at anyror.gujarat.gov.in. Always verify Form 7/12 in seller's name before purchase."},
        {title:"e-Dhara System",content:"Gujarat's e-Dhara centres (operated at Mamlatdar offices) provide computer-printed land record extracts with digital authentication. These replace hand-written documents that were prone to manipulation. The AnyROR portal (anyror.gujarat.gov.in) provides online access to village forms. EC (Property Search) up to 35 years available online."},
        {title:"NA Permission (Non-Agricultural Use)",content:"Agricultural land cannot be used for non-agricultural purposes in Gujarat without NA (Non-Agricultural) permission from the Collector under Section 65 of the Gujarat Land Revenue Code. NA permission specifies the type of use permitted. Construction without NA permission is illegal. Once NA is granted, the land revenue classification is changed accordingly."},
        {title:"Mutation Process in Gujarat",content:"Mutation (Hakkpatrak) in Gujarat is done at the Mamlatdar's office. The buyer submits the registered deed and ID proof. Notices are given to objectors. Mutation is sanctioned after 30 days if no objection. Online mutation tracking is available. In urban Gujarat, Nagarpalika (municipal body) records must also be updated for property tax purposes."},
      ],
      watchFor:"Verify Form 7/12 on anyror.gujarat.gov.in before purchase. Agricultural land needs NA permission before construction. Update Nagarpalika records for urban properties."},
    { id:802, category:"registration", icon:Scale, name:"Gujarat Stamp Act & Registration", year:1958,
      short:"Gujarat stamp duty: 4.9% for sale deeds. Registration fee 1%. One of the lower stamp duty states, encouraging real estate investment.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 4.9% (made up of 3.5% basic stamp duty + 1% local body tax + 0.4% infrastructure cess). Registration fee: 1% (no cap). For women buyers: 1% concession making it 3.9%. Gift deed to family: 3.9%. Partition deed: 1% on the highest share. Lease for 1–10 years: 2.5% of annual rent."},
        {title:"Jantri (Guideline Value)",content:"Gujarat's guideline value system is called Jantri. Jantri rates are fixed for each village and urban area by the Revenue Department. Available at jantri.gujarat.gov.in. All stamp duty calculations are on Jantri value or sale value — whichever is higher. Jantri for commercial land is generally higher than residential. Revised periodically."},
        {title:"Online Registration (GARVI)",content:"Gujarat's GARVI (Gujarat Registration) portal handles online registration. Appointments can be booked online. Stamp duty is paid through e-GRAS (Gujarat Government Revenue Accounting System). EC up to 30 years is available online through GARVI. Physical attendance at SRO is required for most property transactions."},
        {title:"Urban Land Records",content:"For urban properties (non-agricultural), City Survey records show ownership, building details, and encumbrances. City Survey extract (Form CTS) is the urban equivalent of Form 7/12. City Survey records are maintained by City Survey offices in each taluka town. Both CTS extract and EC are required before purchasing urban property."},
      ],
      watchFor:"Gujarat stamp duty is ~4.9% — relatively low. Calculate on Jantri value or sale value. Verify Form 7/12 for agricultural and City Survey (CTS) for urban properties."},
  ],

  "Rajasthan": [
    { id:901, category:"registration", icon:FileText, name:"Rajasthan Land Revenue Act", year:1956,
      short:"Governs land administration, mutations, land conversions, and survey operations in Rajasthan. Jamabandi is the primary ownership document.",
      sections:[
        {title:"Jamabandi (Record of Rights)",content:"Jamabandi is Rajasthan's primary land record showing: owner's name, co-owner details, land classification (agricultural/residential), area, khasra number, and encumbrances. Available online at apnakhata.raj.nic.in. Jamabandi is updated after each mutation. A fresh Jamabandi certificate (Nakal) is required before any transaction."},
        {title:"Naksha (Field Map)",content:"The Naksha is the cadastral field map showing the shape and boundaries of each khasra number. Available through the Patwari (village revenue officer). Discrepancy between Naksha boundary and actual physical boundary must be resolved before purchase. In urban areas, DLC (Divisional Land Commissioner) office maintains city survey maps."},
        {title:"Mutation (Intkal) Process",content:"Mutation (Intkal in Rajasthan) is done at the Tehsil level through the Patwari. Online mutation (E-Dharti) is available through apnakhata.raj.nic.in. Mutation involves updating Jamabandi to reflect new owner. Notices are issued to interested parties. Mutation must be done within 30 days of registration, failing which a delay fee applies."},
        {title:"Land Use Conversion",content:"Agricultural land conversion to non-agricultural use in Rajasthan requires Sanad (conversion certificate) from the Collector. Rajasthan Urban Improvement Trusts (UITs) manage planned development in urban areas. JDA (Jaipur Development Authority) handles Jaipur. Outside JDA limits, Collector grants conversion on payment of conversion fees."},
      ],
      watchFor:"Verify Jamabandi on apnakhata.raj.nic.in before purchase. In Jaipur — check JDA master plan zone for the property. Conversion Sanad required before construction on agricultural land."},
    { id:902, category:"registration", icon:Scale, name:"Rajasthan Stamp Act", year:1998,
      short:"Rajasthan stamp duty: 5–6% for sale deeds depending on area. Women buyers get 1% concession. Registration fee 1%.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 5% for properties in panchayat areas, 6% in municipal areas (corporation/council/board). Women buyers: 1% concession (4% panchayat / 5% municipal). Stamp duty is calculated on DLC (District Level Committee) rate or sale consideration — whichever is higher. Gift within family: 1% subject to ₹1 lakh maximum. Exchange: 5–6% on higher value."},
        {title:"DLC Rates",content:"DLC (District Level Committee) rates are the guideline values in Rajasthan. Published annually by the Revenue Department for each locality, tehsil, and survey number. Available at igrsrajasthan.gov.in. All registrations are done at minimum DLC value. Under-valuation leads to demand notices from the Collector."},
        {title:"IGRS Rajasthan Portal",content:"Rajasthan's Integrated Grievances and Registration System (IGRS) handles online stamp duty calculation, appointment booking, document submission for scrutiny, and EC issue. EC for up to 30 years available online. Rajasthan has deployed e-Panjiyan for online registration assistance. Physical presence at SRO remains mandatory."},
        {title:"Stamp Duty Exemptions",content:"Rajasthan offers stamp duty exemptions for: transfers to government under land acquisition; transfers by court decree; transfers to recognised charitable/educational institutions; transfers under slum clearance schemes; gift to government. Partial exemptions for rural housing schemes and affordable housing projects under Rajasthan Housing Board."},
      ],
      watchFor:"Rajasthan stamp duty is 5–6% — 1% less for women. Always check DLC rate on IGRS portal before finalising purchase price. Municipal vs panchayat area makes 1% difference."},
  ],

  "Uttar Pradesh": [
    { id:1001, category:"registration", icon:FileText, name:"Uttar Pradesh Revenue Code", year:2006,
      short:"Consolidates all UP revenue laws. Governs Khataunis (land records), mutations, land acquisition, and revenue court procedures. UP has the largest land records system in India.",
      sections:[
        {title:"Khatauni (Record of Rights)",content:"Khatauni is UP's primary land record maintained at the Lekhpal level. It shows co-owners, tenant details, area, khasra number, and land classification. Available online at upbhulekh.gov.in. Khatauni is updated every fasli (crop season). For purchase, a current certified copy of Khatauni with the seller's name is essential."},
        {title:"Bhulekh Portal (UP)",content:"UP Bhulekh (upbhulekh.gov.in) provides online Khatauni, Khasra (field book), and Bhu-Naksha (field maps). The portal covers all 75 districts of UP. EC for up to 30 years is available on IGRSUP portal (igrsup.gov.in). UP has integrated land records with the Bhu-Lekh portal to reduce land fraud."},
        {title:"Mutation (Dakhil Kharij)",content:"Mutation in UP is called Dakhil Kharij. Done at the Tehsil office through the Naib Tehsildar. Application can be made online through UP Bhulekh. The Naib Tehsildar issues mutation order (Intkal) after verifying the sale deed and giving notice to interested parties. UP mandates mutation within 45 days of registration."},
        {title:"UP Consolidation of Holdings Act",content:"UP has consolidated land holdings in many districts under the UP Consolidation of Holdings Act 1953. Consolidation redistributes fragmented plots to give each owner compact contiguous holdings. During consolidation, all previous survey numbers change to new Chak numbers. Title must be verified against both old and new survey/chak numbers."},
      ],
      watchFor:"UP has the highest land dispute rate in India. Verify Khatauni on upbhulekh.gov.in. Check mutation status thoroughly. Engage a local lawyer familiar with UP Revenue courts."},
    { id:1002, category:"registration", icon:Scale, name:"UP Stamp Act & Registration", year:2008,
      short:"UP stamp duty: 7% for sale deeds (5% + 2% Bundelkhand surcharge in some areas). Women buyers get 1% concession. UP has a comprehensive IGRSUP portal.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 7% across UP (reduced from earlier higher rates). Women buyers: 6% (1% concession). Rural panchayat areas: 6% (1% concession). Gift deed within family: 60% exemption — effectively 2.8% or ₹5000 whichever higher. Exchange deed: 7% on higher value. Partition deed: 2% on separated shares. Relinquishment deed: 7%."},
        {title:"Circle Rates in UP",content:"UP Stamps and Registration Department publishes Circle Rates (guideline values) for each area of each district. Available on IGRSUP portal. Registration must be done at or above circle rate. In Lucknow, Noida, Ghaziabad — circle rates are revised periodically. Noida/Greater Noida properties are registered based on Authority (GNIDA/NIDA) approved prices."},
        {title:"IGRSUP Portal",content:"UP's IGRS (igrsup.gov.in) provides: online appointment booking, stamp duty calculation, document viewer, EC for 30 years, property valuation, and registered document download. Stamp duty payment through SBI Collect or authorised banks. UP mandates Aadhaar-linked biometric authentication for all property registrations since 2020."},
        {title:"Noida/Greater Noida Authority Properties",content:"Properties in Noida, Greater Noida, and Yamuna Expressway Authority areas (allotted by NOIDA/GNIDA/YEIDA) have a unique registration process. Original allotment letter (from Authority) must be produced. Transfer fees to the Authority must be paid before registration. Lease deeds are executed by the Authority and then registered at SRO."},
      ],
      watchFor:"UP stamp duty is 7% (6% for women). Verify circle rate on IGRSUP. For Noida/Greater Noida — pay Authority transfer charges before registration. Check mutation on UP Bhulekh."},
  ],

  "Punjab": [
    { id:1101, category:"registration", icon:FileText, name:"Punjab Land Revenue Act", year:1887,
      short:"Governs land records in Punjab. Fard (Jamabandi) is the ownership record. Punjab has one of the most digitised land record systems — PLRS.",
      sections:[
        {title:"Jamabandi (Fard) — Punjab Land Record",content:"Punjab's Jamabandi (also called Fard) is the record of rights showing owner, tenant details, area, type of land, and mutation number. Available online at jamabandi.punjab.gov.in. Fard is periodically published (every 4 years). Buyer should get a certified Fard from the Revenue Patwari before purchase. Fard shows all co-owners — all must sign the sale deed."},
        {title:"PLRS — Punjab Land Records Society",content:"Punjab has one of India's best digitised land record systems managed by PLRS (Punjab Land Record Society). The jamabandi.punjab.gov.in portal provides online Jamabandi, mutation status, and cadastral maps. All 22 districts of Punjab are covered. EC available through the portal. Certified copies of Fard are admitted as evidence in court."},
        {title:"Mutation (Intkal) in Punjab",content:"Mutation in Punjab is done at the Tehsil office. Application submitted to Patwari who forwards to Naib Tehsildar for sanction. Notice is given for objections. Punjab has significantly reduced mutation time through e-services. Online tracking of mutation status available on PLRS portal. Delay in mutation affects subsequent transactions."},
        {title:"Tenancy in Punjab (PEPSU Act)",content:"Punjab has a complex tenancy history due to the PEPSU Tenancy & Agricultural Lands Act 1955. Tenants who cultivated land continuously have security of tenure. Before purchasing agricultural land in Punjab, verify that no PEPSU Act tenancy rights exist. Revenue records show tenancy entries if any."},
      ],
      watchFor:"Verify Jamabandi on jamabandi.punjab.gov.in. Check all co-owner names — all must sign. Agricultural land — verify no PEPSU Act tenancy rights before purchase."},
  ],

  "Haryana": [
    { id:1201, category:"registration", icon:FileText, name:"Haryana Land Revenue Act & Jamabandi", year:1887,
      short:"Governs land records in Haryana. Jamabandi and Shajra Nasb (pedigree tree) are primary records. Haryana has implemented e-Dharti for online records.",
      sections:[
        {title:"Haryana Jamabandi",content:"Haryana uses Jamabandi (record of rights) similar to Punjab. Available online at jamabandi.nic.in (Haryana). Shows owner, co-owners, tenant details, area, Khasra number, and soil type. All owners (including women with right as per Hindu Succession Act) must be identified. Jamabandi is attested by Patwari and Tehsildar — certified copy is admissible evidence."},
        {title:"e-Dharti Portal",content:"Haryana's e-Dharti portal provides online Jamabandi copies, mutation status, Shajra (field maps), and property details. Nakal (certified copy) with digital authentication can be downloaded. This reduces fraudulent document creation. EC through NGDRS (National Generic Document Registration System) is available. Haryana has integrated registration with e-Dharti."},
        {title:"Lal Dora & Abadi Deh",content:"Lal Dora refers to the original inhabited area of villages in Haryana (and Delhi). Properties within Lal Dora were traditionally exempt from building plan approval and registration requirements. The Supreme Court has clarified that from 2018, Lal Dora properties must also be registered and cannot be sold by oral agreement or power of attorney. Verify if property falls within Lal Dora."},
        {title:"Sectoral Land in Urban Haryana",content:"In urban Haryana (Gurugram, Faridabad, Hisar, etc.), properties are mostly sectoral. Plot allotments by HSVP (Haryana Shahari Vikas Pradhikaran, formerly HUDA) are governed by allotment letters. Transfer of such properties requires EDC (External Development Charges) clearance and No Dues Certificate from HSVP/local authority before registration."},
      ],
      watchFor:"Verify Jamabandi on e-Dharti. Lal Dora properties require registration — power of attorney transfers are no longer valid. HSVP properties need EDC clearance before registration."},
    { id:1202, category:"registration", icon:Scale, name:"Haryana Stamp Act & Registration", year:1899,
      short:"Haryana stamp duty: 7% for male buyers, 5% for women buyers. One of the highest stamp duties in North India. Registration fee 1%.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 7% for male buyers, 5% for women buyers (2% concession — one of the largest in India). Joint purchase (man+woman): 6% proportionate. Gift deed within family: 3% for male, 2% for female. Partition deed: 3% on separated share. Registration fee: 1% with no cap. Exchange deed: 7% on higher value."},
        {title:"Collector Rate",content:"Haryana's guideline value system is called Collector Rate. Published annually for each sector, block, and village. Available at janhit.bpl.in (Jameen Prapt portal). All registrations at or above Collector Rate. Collector Rate in Gurugram, Faridabad, and Panchkula sectors is relatively high and updated more frequently."},
        {title:"Online Registration in Haryana",content:"Haryana uses NGDRS (National Generic Document Registration System) integrated with e-Dharti for registration. Appointments can be booked online. Stamp duty paid via e-GRAS or RTGS. Biometric authentication at Sub-Registrar office mandatory. Haryana has implemented e-stamp using SHCIL for stamp duty payment."},
        {title:"HRERA — Haryana RERA",content:"Haryana Real Estate Regulatory Authority (HRERA) operates from two benches — Gurugram and Panchkula. All residential projects above 8 apartments or 500 sqm must register. Gurugram has the highest volume of HRERA complaints in Haryana due to the large number of delayed high-rise projects. Verify HRERA registration at hrera.org.in."},
      ],
      watchFor:"Haryana stamp duty is 7% for men and 5% for women — buy in woman's name for 2% saving. Verify Collector Rate. For Gurugram projects, check HRERA complaint history."},
  ],

  "Delhi (NCT)": [
    { id:1301, category:"registration", icon:FileText, name:"Delhi Land Reforms Act & Records", year:1954,
      short:"Governs agricultural land in Delhi. Most of Delhi is urban. Urban properties are governed by DDA Act and MCD regulations.",
      sections:[
        {title:"Urban Land Records in Delhi",content:"Delhi's urban land records are maintained by Revenue Department (Patwari) for agricultural land in villages, by DDA (Delhi Development Authority) for leasehold properties, and by NDMC/MCD for freehold properties. For agricultural land, Jamabandi records at dlrc.delhi.gov.in. For urban areas, use the Delhi Online Registration Information System (DORIS)."},
        {title:"DDA Leasehold Properties",content:"Most residential properties in Delhi's colonies were allotted by DDA on 99-year lease. The DDA lease deed specifies land use, building conditions, and transfer conditions. Transfer of DDA properties requires NOC from DDA or payment of unearned income (UEI) charges — typically 50% of the appreciation in value. This is a major cost in resale transactions."},
        {title:"Lal Dora Properties",content:"Delhi has many villages with Lal Dora properties — properties in old village abadi (inhabited) area exempt from building plan requirements historically. SC judgment in 2021 held that Lal Dora properties must be registered. Unregistered Lal Dora properties cannot be sold by power of attorney; actual registration at Sub-Registrar is required."},
        {title:"Regularisation of Unauthorised Colonies",content:"Delhi has a large number of unauthorised colonies. The central government periodically notifies regularisation schemes. Under the Pradhan Mantri-UDAY scheme (2019), residents of over 1700 unauthorised colonies were given ownership rights. PM-UDAY residents can now register their properties and get proper title deeds through the Revenue Department."},
      ],
      watchFor:"DDA properties — check if UEI (Unearned Income) is payable to DDA before registration. Lal Dora properties must be properly registered. PM-UDAY regularisation — verify certificate before purchase."},
    { id:1302, category:"registration", icon:Scale, name:"Delhi Stamp Act & Registration", year:1899,
      short:"Delhi stamp duty: 6% for men, 4% for women, 5% for joint purchase. Registration fee 1% (no cap). DORIS portal handles registrations.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 6% for male buyers, 4% for female buyers, 5% for joint male+female purchase. 2% concession for women is one of the best in India. Gift deed within family: 0.5% (minimum ₹1,000). Partition deed: 3% on separated share. Exchange deed: 6% on higher value. Stamp duty on DDA properties is on circle rate or sale value — whichever higher."},
        {title:"Circle Rates in Delhi",content:"Delhi's circle rates are published by the Revenue Department for each category (A through H) based on location. Category A covers premium colonies (Lutyens Bungalow Zone, Vasant Vihar) with highest rates; Category H covers rural/village areas with lowest. Available at revenue.delhi.gov.in. DDA revises circle rates periodically."},
        {title:"DORIS — Delhi Online Registration System",content:"Delhi's online registration portal (doris.delhigovt.nic.in) allows document submission, appointment booking, stamp duty calculation, and EC. EC for up to 30 years available online. Stamp duty payment through RTGS/NEFT or authorised banks. Biometric authentication and Aadhaar verification at Sub-Registrar office mandatory."},
        {title:"Aadhaar-Linked Registration",content:"Delhi mandates Aadhaar number for all property transactions since 2020. NRI sellers/buyers can use passport number in lieu of Aadhaar. PAN card is mandatory for transactions above ₹50 lakhs. TDS of 1% must be deducted by buyer for properties above ₹50 lakhs (Section 194-IA of Income Tax Act) and deposited through Form 26QB online."},
      ],
      watchFor:"Stamp duty in Delhi: 6% men / 4% women / 5% joint — buy jointly or in woman's name to save. TDS @1% mandatory for properties above ₹50L. DDA UEI charges must be cleared before registration."},
  ],

  "Madhya Pradesh": [
    { id:1401, category:"registration", icon:FileText, name:"Madhya Pradesh Land Revenue Code", year:1959,
      short:"Governs land records, mutations, land conversions, and revenue court procedures in MP. Khasra and B1 Khataunis are the primary records.",
      sections:[
        {title:"Khasra & B1 Khatauni",content:"MP uses Khasra (individual plot record) and B1 Khatauni (owner's record) as primary land documents. Khasra shows plot number, area, soil type, irrigation, crop details, and tenant information. B1 Khatauni aggregates all khasra numbers held by a person in a village. Both available on MP Bhulekh portal (mpbhulekh.gov.in)."},
        {title:"e-Nakshe (Digital Field Maps)",content:"MP has digitised field maps (Khasra Naksha) available through the Bhu-Lekh portal. The e-Naksha system shows boundaries of each khasra number with neighbouring survey numbers. Physical boundary verification must match the e-Naksha. Discrepancy between e-Naksha and actual possession indicates encroachment or boundary dispute."},
        {title:"Mutation (Namantar) in MP",content:"Mutation in MP (called Namantar) is done at the Patwari level and sanctioned by the Tahsildar. Application can be submitted online through the MP E-District portal. After sale deed registration, automatic mutation notice is issued by the system. MP has implemented a 30-day mandatory mutation period after registration for purchased properties."},
        {title:"Land Bank & Government Land",content:"MP maintains a Land Bank of vacant government land available for industrial and commercial use. Private land adjacent to government land should be verified carefully to avoid boundary overlap. Forest and revenue waste land (Banjar) is government land and cannot be purchased privately. Check with Revenue department before purchasing land in rural areas of MP."},
      ],
      watchFor:"Verify Khasra and Khatauni on mpbhulekh.gov.in. Check if land is near forest boundary — forest land encroachment is common in MP rural areas. Verify mutation after purchase."},
    { id:1402, category:"registration", icon:Scale, name:"MP Stamp Act & Registration", year:1899,
      short:"MP stamp duty: 7.5% for sale deeds (5% + 2.5% cess). Registration fee 3% (one of the highest in India). Women get 1% concession.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed: 7.5% stamp duty (5% basic + 2.5% cess). Registration fee: 3% of consideration (one of the highest registration fees in India — no cap). Women buyers: 6.5% stamp duty (1% concession). Gift deed within family: 0.5% minimum ₹500. Partition: 2% on separated share. Combined stamp duty + registration in MP can reach 10.5% — significantly higher than other states."},
        {title:"MP Guideline Values",content:"MP's guideline values (market values) are published for each area by the Inspector General of Registration. Available on MPIGR portal (mpigr.gov.in). Values are area-specific and updated periodically. Registration must be done at or above guideline value. Under-valuation triggers assessment notice from the District Registrar."},
        {title:"MPIGR Portal",content:"MP's IGRS (mpigr.gov.in) provides online stamp duty calculation, appointment booking, EC for 30 years, document search, and Valuation Calculator. Stamp duty payment through RTGS, authorised banks, or e-stamp. Physical presence at SRO mandatory. MP has implemented video-conferencing registration for NRIs and senior citizens on case-by-case basis."},
        {title:"TDS on Property in MP",content:"For property purchases above ₹50 lakhs in MP, the buyer must deduct TDS at 1% of the sale consideration under Section 194-IA of the Income Tax Act. This applies uniformly across India. Form 26QB must be filed online and TDS deposited. TDS certificate (Form 16B) must be given to the seller. Failure attracts interest and penalty on the buyer."},
      ],
      watchFor:"MP has very high registration fees (3%) — total cost with stamp duty can be 10.5%. Budget accordingly. Check guideline value on MPIGR portal before agreeing on sale price."},
  ],

  "Goa": [
    { id:1501, category:"registration", icon:FileText, name:"Goa Land Revenue Code & Portuguese Civil Code", year:1968,
      short:"Goa has a unique legal framework — Portuguese Civil Code of 1867 still applies to personal law including property succession. Community (Comunidade) land also exists.",
      sections:[
        {title:"Portuguese Civil Code — Property Succession",content:"Goa is the only Indian state where the Portuguese Civil Code (1867) applies to property matters. Key difference: mandatory equal succession — parents cannot disinherit children. Every child has an equal share of the parental property (50% of property goes to children in equal shares). This cannot be overridden by a will. Verify succession rights carefully before purchasing property originally owned by Goan Hindus/Catholics."},
        {title:"Comunidade Land",content:"Goa has a unique system of Comunidade lands — community-owned land originally administered by village communities (Gaunkari/Comunidade) under Portuguese rule. These are now managed by the Directorate of Comunidades under GoG. Comunidade land cannot be privately purchased directly — it is leased for specified periods. Verify whether any property has Comunidade origin."},
        {title:"Form I & XIV (Record of Rights)",content:"Goa's land records system uses Form I & XIV (combined records) similar to Jamabandi. Form I shows ownership details; Form XIV shows possession and cultivation details. Available online at egov.goa.nic.in. Survey of India maps (Goa-specific) show boundaries. Village Panchayat land certificates are also important for property identification."},
        {title:"Mutation (Verba) in Goa",content:"Mutation in Goa is done at the Mamlatdar's office (equivalent of Tehsildar). The process is called Verba. After registration, Form I & XIV must be updated. Goa has a complex land records history due to Portuguese-era records being partially in Portuguese language. Professional help for title verification is strongly recommended."},
      ],
      watchFor:"Goa's Portuguese Civil Code mandates equal share for children — verify succession chain carefully. Comunidade land cannot be purchased privately. Form I & XIV must be in seller's name."},
    { id:1502, category:"registration", icon:Scale, name:"Goa Stamp Duty & Registration", year:1958,
      short:"Goa stamp duty: 5.5% for sale deeds. Registration fee 1%. Goa has a unique registration process under the Portuguese Civil Code heritage system.",
      sections:[
        {title:"Stamp Duty Rates",content:"Sale deed in Goa: 5.5% stamp duty + 0.5% surcharge = 6% effective. Registration fee: 1% (no cap). Women buyers: 1% concession = 5% effective. Gift deed within family: 2%. Partition deed: 1% on separated share. Mortgage: 0.5% of loan amount. Rates are relatively moderate compared to mainland states."},
        {title:"Sub-Registrar Process",content:"Registration in Goa happens at Sub-Registrar offices under the Inspector General of Registration. Physical presence of buyer, seller, and two witnesses required. Biometric authentication mandatory. Stamp duty payment through authorized banks or e-stamp. The registered document number is entered into the digital IGRS system for record."},
        {title:"Property Valuation — Goa",content:"Goa's guideline values (called Annual Statement of Rates) are published by the Revenue Department. Due to Goa's tourism and lifestyle premium, prices vary greatly — North Goa coastal properties command much higher values than South Goa or interior areas. Guideline values in Candolim, Calangute, Baga areas are significantly higher than other parts."},
        {title:"Environmental Restrictions",content:"Goa has extensive coastal and forest land. CRZ (Coastal Regulation Zone) restrictions are strictly enforced. Properties within 500m of High Tide Line in CRZ-I are prohibited from development. The Goa Foundation has actively litigated against illegal coastal construction. Always verify CRZ clearance for any property near Goa's coast."},
      ],
      watchFor:"Goa coastal properties — strict CRZ restrictions. Verify succession chain under Portuguese Civil Code. Check Form I & XIV on egov.goa.nic.in. Comunidade land is not for private sale."},
  ],

  "Bihar": [
    { id:1601, category:"registration", icon:FileText, name:"Bihar Land Reforms Act & Bandobast Records", year:1950,
      short:"Bihar abolished zamindari in 1950 and vested surplus land in government. Khatiyan (record of rights) and Chitha (mutation register) are primary documents.",
      sections:[
        {title:"Khatiyan & Chitha",content:"Bihar's primary land records are Khatiyan (Record of Rights — shows owner, co-owners, area, plot number) and Chitha (mutation register). Available online at biharbhumi.bihar.gov.in. Plot number system uses Khata number (owner's account number) and Khasra number (plot number). Both are required to identify land in Bihar transactions."},
        {title:"Bihar Bhumi Portal",content:"Bihar Bhumi (biharbhumi.bihar.gov.in) provides online Khatiyan, mutation status, encumbrance certificate (Bhumi Parcha / Panjibaddh), and Cadastral Maps. EC for up to 30 years available online. Bihar has digitised records for most districts, though rural records remain partly incomplete. Verify records with Patwari/Circle Officer for accuracy."},
        {title:"Dakhil Kharij (Mutation) in Bihar",content:"Mutation in Bihar is called Dakhil Kharij. Application is made to the Circle Officer (CO). CO issues notice for objections and then passes mutation order. Bihar has implemented online Dakhil Kharij application through Bihar Bhumi portal. Mutation must be done within 30 days of registration. Delay creates title complications."},
        {title:"DCLR — District Land Consolidation & Records",content:"Bihar has carried out land consolidation in some areas. For areas under consolidation, old survey numbers have changed. Title must be verified against both old Khatiyan and new consolidated records. Revenue courts (DCLR offices) in Bihar handle disputes about land records, mutations, and boundary issues."},
      ],
      watchFor:"Bihar has high land dispute rates. Verify Khatiyan on Bihar Bhumi portal. Engage local advocate for thorough title search. Check for pending cases in DCLR court before purchase."},
  ],

  "Himachal Pradesh": [
    { id:1701, category:"registration", icon:FileText, name:"Himachal Pradesh Tenancy & Land Reforms Act", year:1974,
      short:"Governs agricultural land tenancy and ownership in HP. Strict restrictions on purchase of agricultural land by non-HP persons.",
      sections:[
        {title:"Restriction on Non-HP Persons",content:"The most critical law for HP: Under Section 118, no person who is not a resident of HP or who is not an agriculturist of HP can purchase agricultural land in HP without prior government permission. This restriction covers most outsiders. Permission requires government approval. Violation makes the transaction void. Only residential plots in notified areas and flats in apartments are freely purchasable by non-residents."},
        {title:"Himbhoomi Portal",content:"HP's land records are available on Himbhoomi portal (himbhoomi.nic.in). Records include Jamabandi (record of rights), Khasra, and Mutation Register. HP uses Khasra number system similar to Punjab. Jamabandi is updated every 4 years. Certified copies available from Patwari office or through portal."},
        {title:"Mutations in HP",content:"Mutation in HP is done through the Patwari under supervision of Tehsildar. Online mutation application available through Himbhoomi. Mutation must be completed within 45 days of registration. HP Revenue Department is actively digitising all records under Digital India Land Records Modernisation Programme."},
        {title:"Forest Land Restrictions",content:"HP has extensive forest land under the Forest Department and Himachal Pradesh Forest Corporation. No private purchase of forest land is possible. Properties adjacent to forest must be verified for encroachment. The Eco-Sensitive Zone around HP wildlife sanctuaries limits development. Mountain slope constructions require stability certificates and environmental clearance."},
      ],
      watchFor:"Non-HP residents CANNOT buy agricultural land in HP without government permission under Sec 118. Only apartments and plots in notified areas are purchasable by outsiders. Verify before committing."},
  ],

  "_other_states": [
    {
      id: 901, category: "all", icon: Scale,
      name: "Central Laws Apply in This State",
      year: "-",
      short: "All central laws listed under All India section apply in this state. Additionally, this state has its own Land Revenue Code, Tenancy Acts, and Stamp Duty rates.",
      sections: [
        { title: "Which Central Laws Apply?", content: "All 16 central laws under the All India section apply across every state including Transfer of Property Act, Registration Act, Indian Stamp Act (with state amendments), RERA, Land Acquisition Act (RFCTLARR), Indian Contract Act, Specific Relief Act, Limitation Act, Model Tenancy Act, Hindu Succession Act, Forest Rights Act, Benami Transactions Act, FEMA, National Building Code, and Environment Protection Act." },
        { title: "State Land Revenue Code", content: "Every state has its own Land Revenue Code (e.g., Rajasthan Land Revenue Act, Maharashtra Land Revenue Code, Karnataka Land Revenue Act) which governs mutation of land records, land conversion, partition procedures, revenue court appeals, and tax collection. The Revenue Code is state-specific and requires local legal advice." },
        { title: "State Rent Control Act", content: "Most states have their own Rent Control Act which may be more protective of tenants than the central Model Tenancy Act 2021. States that have adopted the Model Tenancy Act provide a more balanced framework. States that have not adopted it continue under older, often very tenant-protective legislation that makes eviction difficult." },
        { title: "State Stamp Duty Rates", content: "Stamp duty rates are state subjects and vary widely. Examples: Karnataka 5.6%, Maharashtra 5%, Delhi 4–6%, Kerala 8%, Rajasthan 5–6%, Gujarat 4.9%, Andhra Pradesh 5%, Telangana 5%. Most states offer a concession of 1–2% if property is registered in a woman's name. Check current rates at your state's Stamps and Registration Department website." },
      ],
      watchFor: "Consult a local property lawyer for state-specific rates, procedures, and land revenue codes applicable in this state.",
    },
    {
      id: 902, category: "registration", icon: FileText,
      name: "State Land Revenue Code",
      year: "-",
      short: "Each state has its own Revenue Code governing mutation, land conversion, and revenue court procedures.",
      sections: [
        { title: "Mutation / Jamabandi / Khata Transfer", content: "After registration of a sale deed, the buyer must apply for mutation (transfer of name in revenue records) at the local Tehsil/Taluk office within the specified period. The mutation register (Jamabandi in North India, Khata in Karnataka, Patta in Tamil Nadu) is updated to show the new owner. Delay in mutation creates title gaps and makes the next transaction difficult." },
        { title: "Land Conversion", content: "Agricultural land cannot be used for non-agricultural purposes without obtaining a conversion or diversification certificate from the Collector/Revenue Department. The process involves paying conversion fees, submitting the purchase deed, and obtaining the order. Construction on unconverted agricultural land is illegal and the building is liable to demolition." },
        { title: "Survey & Settlement Records", content: "State governments periodically carry out survey and settlement operations to update land records. The outcome is a Revised Settlement Register showing the current holder of each survey number, the extent of land, and its classification. These records form the basis of all subsequent transactions." },
        { title: "Revenue Court Appeals", content: "Disputes related to land records — such as mutation orders, land classification, boundary disputes, or eviction from government land — are first heard by Revenue Courts (Tehsildar, Sub-Divisional Magistrate, Collector). Appeals go up to the Revenue Tribunal or Board of Revenue depending on the state. Revenue court orders can be challenged in civil courts." },
      ],
      watchFor: "Always update mutation after registration. Delay causes title gaps that complicate future sales and mortgages.",
    },
    {
      id: 903, category: "tenancy", icon: Building2,
      name: "State Rent Control Act",
      year: "-",
      short: "Most states have their own Rent Control Act governing fair rent, eviction grounds, and tenant rights.",
      sections: [
        { title: "Applicability", content: "State Rent Control Acts generally apply to residential and commercial premises in urban areas within the state. Rural areas may be excluded. Premises above a certain rent threshold (varies by state) may also be excluded. New constructions are often exempted for a specified period to encourage construction activity." },
        { title: "Rent Fixation", content: "The Rent Controller (typically a magistrate or revenue officer) can fix fair rent based on the original cost of construction, current market value, or a statutory formula. Landlords cannot demand rent above the fair rent so fixed. Any premium or pagdi (key money) demanded in addition to rent is illegal under most state acts." },
        { title: "Eviction Grounds", content: "Common eviction grounds under state rent control acts: non-payment of rent; sub-letting without consent; misuse of premises; material damage; nuisance to neighbours; bona fide personal need of the landlord; need for reconstruction. Eviction without a court order from the Rent Controller is illegal even if the lease has expired." },
        { title: "Model Tenancy Act 2021 — Adoption Status", content: "As of 2024, the states/UTs that have adopted the Model Tenancy Act include Andhra Pradesh, Telangana, Tamil Nadu, Uttar Pradesh, Assam, Maharashtra, and some Union Territories. States that have not adopted it continue under their older state-specific rent control legislation which tends to be much more protective of tenants." },
      ],
      watchFor: "Check if state has adopted Model Tenancy Act 2021. If not, old rent control rules (very tenant-protective) apply and eviction is extremely difficult.",
    },
    {
      id: 904, category: "registration", icon: Scale,
      name: "State Stamp Duty Rates",
      year: "-",
      short: "Stamp duty varies by state. Maharashtra 5%, Karnataka 5.6%, Delhi 4–6%, Kerala 8%. Must be paid at or before registration.",
      sections: [
        { title: "Sale Deed Rates by State", content: "Approximate stamp duty on sale deeds: Maharashtra 5% (plus 1% metro cess in MMR), Karnataka 5.6% (5% + 0.5% BBMP/CMC + 0.1% surcharge), Delhi 4% for women/6% for men, Kerala 8%, Andhra Pradesh 5%, Telangana 5%, Rajasthan 5–6%, Gujarat 4.9%, Punjab 5%, Haryana 7%, West Bengal 5–7% depending on value slab. Rates are subject to change — verify current rates." },
        { title: "Concessions for Women Buyers", content: "Most states offer stamp duty concessions for property registered in a woman's name: Delhi reduces by 2% (4% for women vs 6% for men), Haryana gives 1% concession, Punjab 1% concession, Rajasthan up to 1% concession, Maharashtra 1% concession. Tamil Nadu exempts registration fee above a threshold for women. These concessions incentivise property ownership by women." },
        { title: "Gift & Inheritance Rates", content: "Gift to blood relatives (spouse, children, parents, siblings) attracts lower stamp duty in most states — typically 1–2% or a fixed amount regardless of property value. Gift to non-relatives attracts the full sale rate. Inheritance through will or intestate succession is not subject to stamp duty but requires Succession Certificate and registration of the inheritance document." },
        { title: "E-Stamping & Payment", content: "Most states have moved to e-stamping through SHCIL (Stock Holding Corporation of India) or state-specific portals. Stamp duty can also be paid through challan at designated banks. Always verify payment of stamp duty through the official portal before signing. Franking (rubber stamp) is being discontinued in many states in favour of e-stamping." },
      ],
      watchFor: "Check current rates at your state's Stamps and Registration Department website. Many states offer 1–2% concession for women buyers.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// EXPANDABLE SECTION ROW
// ─────────────────────────────────────────────────────────────
function SectionRow({ section, dark }) {
  const D = dark ? DARK : LIGHT;
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${D.border}` }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ background: open ? (dark ? "#1c2230" : "#eef0ff") : D.surfaceAlt }}
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2.5">
          <ChevronRight size={11} style={{ color: "#4f6ef7", flexShrink: 0 }} />
          <span className="text-xs font-semibold" style={{ color: open ? "#4f6ef7" : D.text }}>
            {section.title}
          </span>
        </div>
        {open
          ? <Minus size={13} style={{ color: "#4f6ef7", flexShrink: 0 }} />
          : <Plus  size={13} style={{ color: D.textSubtle, flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div className="px-4 py-3" style={{ background: dark ? "#0d1117" : "#f8fafc", borderTop: `1px solid ${D.border}` }}>
          <p className="text-xs leading-relaxed" style={{ color: D.textMuted }}>
            {section.content}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LAW DETAIL MODAL
// ─────────────────────────────────────────────────────────────
function LawDetail({ law, dark, onClose, bookmarked, onToggleBookmark }) {
  const D = dark ? DARK : LIGHT;
  const Icon = law.icon || Scale;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          background: dark ? "#161b22" : "#fff",
          border: `1px solid ${D.border}`,
          maxHeight: "88vh",
          animation: "modalIn .3s cubic-bezier(.16,1,.3,1) forwards",
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: `1px solid ${D.border}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)" }}>
              <Icon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold leading-snug mb-1" style={{ color: D.text }}>
                {law.name}
              </h3>
              <span className="text-xs font-medium" style={{ color: D.textMuted }}>
                Year enacted: {law.year}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => onToggleBookmark(law.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                style={{ background: D.surfaceAlt, color: bookmarked ? "#f59e0b" : D.textMuted }}>
                <Star size={14} fill={bookmarked ? "#f59e0b" : "none"} />
              </button>
              <button onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
                style={{ background: D.surfaceAlt, color: D.textMuted }}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Overview */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: D.textSubtle }}>
              Overview
            </p>
            <p className="text-sm leading-relaxed" style={{ color: D.textMuted }}>{law.short}</p>
          </div>

          {/* Key Sections — expandable */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: D.textSubtle }}>
              Key Sections — click to expand
            </p>
            <div className="space-y-2">
              {law.sections.map((s, i) => (
                <SectionRow key={i} section={s} dark={dark} />
              ))}
            </div>
          </div>

          {/* Watch For */}
          <div className="p-4 rounded-2xl"
            style={{ background: dark ? "#1c1400" : "#fffbeb", border: `1px solid ${dark ? "#3d2e00" : "#fde68a"}` }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={13} style={{ color: "#f59e0b" }} />
              <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>What to watch for in contracts</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: dark ? "#fbbf24" : "#92400e" }}>
              {law.watchFor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATE DROPDOWN
// ─────────────────────────────────────────────────────────────
function StateDropdown({ selected, onSelect, dark }) {
  const D = dark ? DARK : LIGHT;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = STATES.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
          color: "#fff",
          boxShadow: "0 2px 12px rgba(79,110,247,.35)",
          minWidth: 220,
        }}>
        <MapPin size={13} />
        <span className="flex-1 text-left truncate">{selected}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50"
          style={{ background: D.surface, borderColor: D.border, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
          <div className="p-2" style={{ borderBottom: `1px solid ${D.border}` }}>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: D.textSubtle }} />
              <input autoFocus
                className="w-full pl-7 pr-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: D.surfaceAlt, color: D.text, border: `1px solid ${D.border}` }}
                placeholder="Search state or UT…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
            {filtered.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: D.textSubtle }}>No results</p>
            )}
            {filtered.map(s => (
              <button key={s}
                onClick={() => { onSelect(s); setOpen(false); setSearch(""); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left transition-colors"
                style={{
                  color: s === selected ? "#4f6ef7" : D.textMuted,
                  background: s === selected ? (dark ? "#1c2230" : "#eef0ff") : "transparent",
                  fontWeight: s === selected ? 700 : 400,
                }}
                onMouseEnter={e => { if (s !== selected) { e.currentTarget.style.background = D.surfaceAlt; e.currentTarget.style.color = D.text; }}}
                onMouseLeave={e => { if (s !== selected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = D.textMuted; }}}>
                <MapPin size={11} style={{ color: s === selected ? "#4f6ef7" : D.textSubtle }} />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LAW CARD
// ─────────────────────────────────────────────────────────────
function LawCard({ law, dark, bookmarked, onToggleBookmark, onClick }) {
  const D = dark ? DARK : LIGHT;
  const Icon = law.icon || Scale;
  return (
    <div className="rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: D.surface, borderColor: D.border,
        boxShadow: dark ? "0 2px 8px rgba(0,0,0,.2)" : "0 2px 8px rgba(0,0,0,.06)",
      }}
      onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#4f6ef7,#7c3aed)" }}>
          <Icon size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-bold leading-snug" style={{ color: D.text }}>{law.name}</h4>
            <button onClick={e => { e.stopPropagation(); onToggleBookmark(law.id); }}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ color: bookmarked ? "#f59e0b" : D.textSubtle }}>
              <Star size={12} fill={bookmarked ? "#f59e0b" : "none"} />
            </button>
          </div>
          <span className="text-[10px] font-medium" style={{ color: D.textSubtle }}>{law.year}</span>
          <p className="text-xs leading-relaxed mt-1.5 line-clamp-3" style={{ color: D.textMuted }}>{law.short}</p>
          <div className="flex items-center gap-1 mt-2.5" style={{ color: "#4f6ef7" }}>
            <span className="text-[11px] font-semibold">View details</span>
            <ChevronRight size={11} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function LawsPage({ dark }) {
  const D = dark ? DARK : LIGHT;
  const [selectedState, setSelectedState] = useState("All India (Central Laws)");
  const [selectedCat,   setSelectedCat]   = useState("all");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [bookmarks,     setBookmarks]     = useState(new Set());
  const [activeLaw,     setActiveLaw]     = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const getLawsForState = (state) => {
    if (state === "All India (Central Laws)") return ALL_LAWS["All India (Central Laws)"];
    const stateLaws = ALL_LAWS[state];
    const central   = ALL_LAWS["All India (Central Laws)"];
    const fallback  = ALL_LAWS["_other_states"];
    if (stateLaws) return [...central, ...stateLaws];
    return [...central, ...fallback];
  };

  const rawLaws = getLawsForState(selectedState);

  const filteredLaws = rawLaws.filter(law => {
    if (showBookmarks && !bookmarks.has(law.id)) return false;
    if (selectedCat !== "all" && law.category !== "all" && law.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return law.name.toLowerCase().includes(q) ||
             law.short.toLowerCase().includes(q) ||
             law.watchFor.toLowerCase().includes(q) ||
             law.sections.some(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
    }
    return true;
  });

  const toggleBookmark = (id) => {
    setBookmarks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col" style={{ background: D.bg }}>

      {/* Top bar */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4"
        style={{ borderBottom: `1px solid ${D.border}`, background: D.surface }}>

        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold" style={{ color: D.text }}>Indian Land Laws</h1>
            <p className="text-xs mt-0.5" style={{ color: D.textMuted }}>
              {filteredLaws.length} law{filteredLaws.length !== 1 ? "s" : ""} ·{" "}
              {selectedState === "All India (Central Laws)" ? "All India Central Laws" : `${selectedState} Laws`}
            </p>
          </div>
          <StateDropdown
            selected={selectedState}
            onSelect={(s) => { setSelectedState(s); setSelectedCat("all"); setSearchQuery(""); }}
            dark={dark}
          />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: D.textSubtle }} />
            <input
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: D.surfaceAlt, border: `1px solid ${D.border}`, color: D.text }}
              placeholder="Search by law name, section, or keyword…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: D.textSubtle }}>
                <X size={12} />
              </button>
            )}
          </div>
          <button onClick={() => setShowBookmarks(!showBookmarks)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: showBookmarks ? (dark ? "#2a1e00" : "#fffbeb") : D.surfaceAlt,
              color:      showBookmarks ? "#f59e0b" : D.textMuted,
              border:    `1px solid ${showBookmarks ? (dark ? "#4d3800" : "#fde68a") : D.border}`,
            }}>
            <Star size={12} fill={showBookmarks ? "#f59e0b" : "none"} />
            Saved ({bookmarks.size})
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={selectedCat === cat.id
                ? { background: "linear-gradient(135deg,#4f6ef7,#7c3aed)", color: "#fff" }
                : { background: D.surfaceAlt, color: D.textMuted, border: `1px solid ${D.border}` }}>
              <cat.icon size={11} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Law cards */}
      <div className="flex-1 overflow-y-auto p-5">
        {filteredLaws.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: D.surfaceAlt }}>
              <Info size={20} style={{ color: D.textSubtle }} />
            </div>
            <p className="text-sm font-medium" style={{ color: D.textMuted }}>
              {showBookmarks ? "No bookmarked laws yet" : "No laws found"}
            </p>
            <p className="text-xs" style={{ color: D.textSubtle }}>
              {showBookmarks ? "Click ☆ on any card to save it" : "Try a different search or category"}
            </p>
          </div>
        ) : (
          <>
            {selectedState !== "All India (Central Laws)" && !ALL_LAWS[selectedState] && (
              <div className="flex items-start gap-3 p-4 rounded-2xl mb-4"
                style={{ background: dark ? "#1c1400" : "#fffbeb", border: `1px solid ${dark ? "#3d2e00" : "#fde68a"}` }}>
                <Info size={14} style={{ color: "#f59e0b" }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: "#f59e0b" }}>
                    Showing All India + Generic State Laws for {selectedState}
                  </p>
                  <p className="text-xs" style={{ color: dark ? "#fbbf24" : "#92400e" }}>
                    Detailed state-specific laws for {selectedState} are administered locally.
                    Consult a registered property lawyer or your state's Revenue Department for exact procedures and rates.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLaws.map(law => (
                <LawCard key={law.id} law={law} dark={dark}
                  bookmarked={bookmarks.has(law.id)}
                  onToggleBookmark={toggleBookmark}
                  onClick={() => setActiveLaw(law)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {activeLaw && (
        <LawDetail
          law={activeLaw} dark={dark}
          onClose={() => setActiveLaw(null)}
          bookmarked={bookmarks.has(activeLaw.id)}
          onToggleBookmark={toggleBookmark}
        />
      )}
    </div>
  );
}
