from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.local"))

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env.local")

client = Groq(api_key=api_key)


def analyze_legal_text(text: str, depth: str = "Standard"):
    """
    Analyze full legal document using Groq LLaMA 3.1.
    depth: "Standard" | "Detailed" | "Expert"
    Returns raw JSON string.
    """

    try:
        # Clean document
        text = text.replace("\n", " ").strip()

        # Adjust limits and instructions based on depth
        if depth == "Expert":
            MAX_CHARS = 18000
            summary_instruction = "Detailed 12–18 paragraph expert-level executive summary. Cover every clause in depth: financial structure, termination rights, liability allocation, penalties, dispute resolution, ownership transfer, force majeure, stamp duty implications, registration requirements, legal protections waived, and a comprehensive fairness assessment with specific negotiation recommendations."
            pros_instruction = "List ALL favorable clauses — be exhaustive, include minor protections too"
            cons_instruction = "List ALL risky or unfair clauses — be exhaustive, include minor risks too"
            terms_instruction = "Include ALL legal terms found (minimum 6), with their statutory section references where applicable"
            extra_instruction = "- This is an EXPERT analysis. Be exhaustive. Cover every angle.\n- Identify negotiation leverage points.\n- Flag any missing standard clauses (e.g., missing dispute resolution, missing force majeure).\n- Note compliance issues with Indian property law."
        elif depth == "Detailed":
            MAX_CHARS = 15000
            summary_instruction = "Detailed 8–12 paragraph executive summary explaining the agreement in depth, including financial structure, termination rights, liability allocation, penalties, dispute resolution, risks, and overall fairness assessment"
            pros_instruction = "List all favorable clauses found"
            cons_instruction = "List all risky or unfair clauses found"
            terms_instruction = "Include all important legal terms (minimum 4)"
            extra_instruction = "- This is a DETAILED analysis. Be thorough and cover all significant clauses.\n- Include specific clause references where possible."
        else:  # Standard
            MAX_CHARS = 12000
            summary_instruction = "Clear 4–6 paragraph summary covering the key points: what the agreement is about, main financial terms, key obligations, major risks, and overall fairness"
            pros_instruction = "List the main favorable clauses (top 5–8)"
            cons_instruction = "List the main risky or unfair clauses (top 5–8)"
            terms_instruction = "Include the most important legal terms (minimum 3)"
            extra_instruction = "- This is a STANDARD analysis. Focus on the most important points only."

        was_truncated = False
        if len(text) > MAX_CHARS:
            text = text[:MAX_CHARS]
            was_truncated = True

        prompt = f"""
You are LegalEase AI, an expert legal risk analysis system.

Carefully analyze the ENTIRE property or rental agreement below.
Analysis depth level: {depth.upper()}

Return ONLY valid JSON in this EXACT structure:

{{
  "risk_score": number (0-100),
  "risk_level": "Low" | "Medium" | "High",
  "simple_summary": "{summary_instruction}",
  "pros": ["{pros_instruction}"],
  "cons": ["{cons_instruction}"],
  "legal_terms": [
      {{
        "section": "Clause number or document section where this term appears (e.g., Section 12, Clause 5.2)",
        "term": "Legal term name",
        "explanation": "Explanation in simple language"
      }}
  ],
  "suggestions": [
      {{
        "original": "exact text from the document that should be changed (copy verbatim)",
        "replacement": "improved version of that clause",
        "reason": "why this change reduces risk or improves protection (1-2 sentences)"
      }}
  ]
}}

STEP-BY-STEP SCORING INSTRUCTIONS (follow exactly):

Before writing any JSON, silently calculate the risk_score using this point system:

BASE SCORE: Start at 15 (every contract has some inherent risk).

ADD points for each risk factor found in THIS document:
+5  → Security deposit > 3 months rent
+8  → Security deposit > 6 months rent (use the higher one, not both)
+6  → Late payment penalty > 1% per month
+10 → No notice required before eviction/termination
+7  → Licensor/landlord can terminate with < 15 days notice
+5  → Lock-in period exists (tenant cannot exit early)
+8  → Lock-in penalty = full remaining rent for lock-in period
+6  → Automatic revocation / must vacate immediately on expiry
+5  → Subletting completely prohibited with no exceptions
+7  → Structural alteration rights completely removed
+8  → Landlord can inspect without notice (no 24-hour requirement)
+10 → Default interest rate > 2% per month
+8  → Unlimited liability clause
+6  → One-sided indemnity (only tenant/licensee bears all liability)
+5  → Arbitration clause (minor risk — adds cost/delay)
+5  → CAM/maintenance charges in addition to rent
+4  → Annual rent escalation > 10%
+6  → Tenant must pay rent during force majeure events
+10 → Property development/sale rights given to one party without consent

SUBTRACT points for each protection found:
-5  → Refundable security deposit clearly stated
-4  → Deposit refund timeline clearly specified (30–45 days)
-5  → 30+ days written notice required by both parties
-4  → Landlord repair obligations clearly listed
-3  → Quiet enjoyment clause
-5  → Dispute resolution through courts (not just arbitration)
-4  → Both party obligations clearly and equally listed
-3  → Utility bills responsibility clearly assigned
-4  → Governing law and jurisdiction specified

FINAL SCORE BOUNDS: Clamp between 5 (minimum) and 95 (maximum).

RISK LEVEL:
- 5–30  → "Low"
- 31–60 → "Medium"  
- 61–95 → "High"

IMPORTANT: You MUST use this calculation. The score must vary for every document based on its actual clauses. Do NOT round to a round number like 40, 45, 50 — use the exact sum.

IMPORTANT:
- The summary MUST follow the depth level instructions above.
- Write in structured paragraphs.
- Cover financial, legal, operational, and termination aspects.
- Explain both benefits and risks clearly.
- DO NOT invent fake section numbers.
- If a legal section applies, include correct section number.
- If document contains internal section numbers (e.g., Section 1, Clause 3.2), extract and return that.
- If no section number is identifiable, return "Section not clearly defined".
- Do NOT default to statute references unless explicitly mentioned.
- If no specific statutory section applies, write:
  "section": "Not specifically defined in statute"
- Include as many pros and cons as truly found.
- If very safe, cons may be empty.
- {terms_instruction}.
- Base risk_score on severity and number of harmful clauses.
- For "suggestions": provide ONE suggestion for EVERY item listed in "cons". Do not cap at 3 or 6. If there are 8 cons, provide 8 suggestions. Each "original" must be an exact verbatim phrase copied directly from the document text (so it can be programmatically found and replaced). Each "replacement" should be a fair, legally sound alternative clause. Order by severity — highest risk first.
- Return raw JSON only.
- No markdown.
- No extra explanation outside JSON.
{extra_instruction}

Document:
{text}
"""

        # Try models in order of capability — use first one that works
        MODELS = [
            "llama-3.3-70b-versatile",
            "llama3-70b-8192",
            "llama-3.1-70b-versatile",
            "llama3-8b-8192",
            "llama-3.1-8b-instant",
        ]
        last_error = None
        completion = None
        for model_name in MODELS:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                    max_tokens=4096,
                )
                print(f"\n✅ Using Groq model: {model_name}")
                break
            except Exception as model_err:
                print(f"\n⚠️  Model {model_name} failed: {model_err}")
                last_error = model_err
                continue

        if completion is None:
            raise last_error or Exception("All Groq models failed")

        response_text = completion.choices[0].message.content.strip()

        print("\n===== AI RAW RESPONSE =====")
        print(response_text[:500])

        return response_text

    except Exception as e:
        print("\n🔥 GROQ ERROR:", str(e))
        # Return error marker so caller can surface real error
        import json as _json
        return _json.dumps({
            "risk_score": -1,
            "risk_level": "Error",
            "simple_summary": "GROQ_ERROR: " + str(e),
            "pros": [],
            "cons": [],
            "legal_terms": []
        })