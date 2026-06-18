# Akshar — AI-Powered Dyslexia Screening for Indian Script Readers

**Team Akshar | Parul University, Vadodara, Gujarat**  
**Samsung Solve for Tomorrow 2026 | Theme: Health & Education**

---

## Problem Statement

Dyslexia is the most common learning disability in the world. It affects an estimated 10–15% of any population — not because of intelligence, but because of how the brain processes written language. In India, this translates to **25–37 million school-age children** who may have dyslexia.

Most of them will never be identified.

Instead of a diagnosis, they receive a label: *slow*, *lazy*, *not trying hard enough*. Without identification, they receive no accommodations. They fall progressively further behind their peers. Confidence erodes. Dropout rates rise. A learning difference that is entirely manageable with the right support becomes a life sentence of educational failure — not because the child cannot learn, but because no one ever found out what was actually happening.

---

## Why the Problem Persists

Three structural barriers prevent screening from reaching Indian children.

**1. Clinical inaccessibility**  
A formal dyslexia diagnosis requires a trained educational psychologist. India has approximately 10,000 such professionals for a school-age population of 250 million — one professional for every 25,000 children. Outside Tier 1 cities, access is functionally zero. A family in Vadodara, Patna, or Madurai cannot get their child assessed even if they know something is wrong.

**2. Cost**  
A single diagnostic assessment costs ₹3,000–₹8,000 per session. For the vast majority of Indian families, this is simply not possible.

**3. The deepest gap — the one nobody has addressed**  
Every validated dyslexia screening tool in the world — the Bangor Dyslexia Test, DAST, Lexia, Nessy, Rapid — was designed for English and Latin-alphabet readers.

Not a single validated screening tool exists for any Indian script. Not Gujarati. Not Devanagari. Not Tamil. Not Telugu. Not one.

---

## Why Indian Scripts Are a Distinct Problem

This is not simply a translation problem. It is a structural one.

Indian scripts are **abugidas** — a categorically different writing system from alphabetic scripts like English. In an abugida, consonants carry an inherent vowel sound, modified by attached diacritical markers called matras. Characters combine into conjunct clusters. The visual logic, reading direction, and cognitive demands are fundamentally different from English.

Dyslexia manifests through different error patterns in different scripts. In English, the hallmark indicators include letter reversals (b/d, p/q) and phonological decoding errors. In Gujarati and Hindi, the primary indicators are likely:

- **Matra omission** — missing or confusing the attached vowel markers that modify consonants
- **Similar character confusion** — mixing up visually adjacent character pairs such as ક and ર in Gujarati, or क and ग in Devanagari
- **Conjunct cluster difficulty** — breaking down on combined consonant clusters like સ્ત or ક્ત
- **Reading rhythm irregularity** — unusually long hesitation times, particularly on matra-marked words compared to unmarked ones

These error signatures exist in academic literature on Indian script reading cognition, but they have never been operationalised into a screening instrument. The research-to-tool gap has remained open for decades.

**A child in Vadodara reading Gujarati has zero tools built for them. Anywhere in the world.**

---

## Our Solution — Akshar

**Akshar** (meaning *letter* in Gujarati and Sanskrit) is an early dyslexia screening web application for Indian script readers. It is the first screening tool in the world designed around the specific error patterns of Indian abugida scripts.

Akshar runs on any laptop or tablet. No installation. No internet required. A teacher or parent can screen a child in under 5 minutes.

### How It Works

The child completes two types of tasks, in their own language and script:

**Task 1 — Letter Tracing**  
The child traces a series of letters over a faint guide outline using the mouse or stylus. The system records stroke paths, tracing accuracy, number of re-attempts, and time taken per letter.

**Task 2 — Word Reading**  
Simple words are displayed one at a time in large text. The system records reading time per word. Critically, it compares reading speed on matra-marked words against non-matra words — a differential that existing tools cannot measure because they were not built for scripts that have matras.

### Scoring Engine

A heuristic scoring engine processes the task results against rules derived from published literature on Indian script reading difficulties. The engine checks for:

- Short or fragmented tracing strokes
- Excessive re-attempts while forming letters
- Extended average hesitation time per word
- Disproportionate difficulty on matra-marked words vs. unmarked words
- Multiple words requiring over 7 seconds to read

The system outputs a structured risk report with a risk level (Low / Moderate / High), the specific patterns observed, a plain-language explanation for parents and teachers, and recommended next steps.

### What Akshar Is — and Is Not

Akshar is a **screening flag**, not a clinical diagnosis. It functions like a blood pressure reading — it identifies whether a child should see a specialist, not whether they definitively have a condition. The output is explicit about this at every step.

---

## Technical Approach — Phased and Honest

**Phase 1 — Current prototype**  
A rule-based heuristic scoring engine grounded in published cognitive linguistics research on Indian script reading, designed with input from special educators. No training data required. Immediately deployable.

Language support: Gujarati (gu) and Hindi / Devanagari (hi). Tamil and Telugu are planned for Phase 2.

**Phase 2 — Post-hackathon**  
Labeled dataset collection through school partnerships begins during Phase 1 deployment. Our location in Vadodara provides direct access to Gujarati-medium primary schools. Once 200+ labeled reading samples are collected from children with and without confirmed reading difficulties, we replace the heuristic engine with a trained classifier.

The Phase 1 prototype is the data collection infrastructure. It is not just a product — it is the foundation of a research pipeline that does not currently exist anywhere.

**Phase 3 — Scale**  
Tamil and Telugu modules, each requiring script-specific literature review and educator partnerships. The architecture is modular: each script gets its own heuristic or model layer with a shared interface and reporting layer.

---

## Impact and Scalability

| Metric | Value |
|---|---|
| Children at risk in India | 25–37 million |
| Existing Indian-script screening tools | 0 |
| Time per screening | ~5 minutes |
| Cost per screening | ₹0 |
| Hardware required | Any laptop or tablet |
| Internet required | No |

A single teacher can screen an entire classroom in one session. No app installation. No specialist present. No cost to the family.

Even reaching 1% of at-risk children means hundreds of thousands of children referred for assessment who would otherwise go entirely unscreened for their entire school career.

## Future Scope: Dynamic Vocabulary API

While Phase 1 and 2 rely on curated, locally-stored word lists designed to specifically target dyslexia phonetic indicators, **Phase 4** will involve building a dynamic API fetching mechanism. This backend service will allow schools and specialists to supply an infinite, dynamic vocabulary of words directly from the internet or a centralized database. The scoring engine will be adapted to automatically extract features from arbitrary text inputs, enabling testing that is not constrained by a limited vocabulary pool.

---

## The Team

**Team Akshar**  

**Prit Patel** — Leader  
**Prince Patel**

Parul University, Vadodara, Gujarat  
Parul Institute of Technology — B.Tech Computer Science Engineering

*Strategic advantage: Our base in Vadodara gives us direct access to Gujarati-medium primary schools for Phase 1 deployment and Phase 2 data collection. This is not hypothetical access — it is a partnership we can establish before the hackathon concludes.*

---

*Akshar — because every child deserves to be seen.*
