# 3-Minute Demo Script

## Setup
- Open: `/playground/orchestrator`
- Click "Reset Demo" to start fresh
- Screen recording ON

---

## Script (3 minutes)

### 0:00-0:30 — Build Workflow (Step 1)

**Action:** Drag Z4 "Format Transform" task to canvas

> "I'm building a workflow. I drag a task onto the canvas."

**Action:** Drag Z5 "Document Extraction" task

> "I add another task."

**Visual:** Step bar shows "① Build workflow" active

---

### 0:30-1:00 — Publish (Step 2)

**Action:** Click "Publish for Approval" button (green)

> "Now I want to publish this. I click Publish for Approval."

**Action:** Fill in name: "Demo Workflow"

**Action:** Check all 6 declarations

**Action:** Click "Submit for Certification"

---

### 1:00-1:30 — Cost Warning + Approval

*If cost > RM10:*
> "The system checks my cost ceiling. I'm over RM10, so I get a warning."

**Action:** Click "Continue to Approval"

**Action:** Approval modal appears

> "Here's the key moment. A human must approve before this can run."

**Action:** Check "I approve this workflow to run"

**Action:** Click "Approve Workflow"

> "Now it's approved. Look at the badge — it says 'Human approved'."

---

### 1:30-2:00 — Run Test

**Action:** Click "Run Test" button

> "Now I can run a test. Before approval, this was blocked."

**Action:** Watch simulation complete

> "The simulation runs. Each step shows pass or fail."

---

### 2:00-2:30 — Export Audit (Step 3)

**Action:** Click "Export Audit" button

> "Finally, I export the audit proof."

**Action:** ZIP downloads

**Action:** Unzip on desktop

**Action:** Show files:
- `workflow.json` — "Here's the full workflow definition"
- `cost.txt` — "Cost breakdown"
- `approval.txt` — "Proof that a human approved this, with timestamp"
- `screenshot.png` — "Visual evidence"

---

### 2:30-3:00 — Wrap-Up

> "That's the governance loop:
> 1. Build a workflow
> 2. Human approval required before it runs
> 3. Export audit proof
>
> This isn't just a chatbot. It's governed AI with a paper trail."

**Action:** Click "Reset Demo" to show it's repeatable

---

## After Demo — Questions for Human Test

**Say nothing. Let them explore for 2 minutes.**

Then ask:

1. **"What did this prove?"**
   - Good: mentions approval, audit, cost control
   - Bad: mentions "AI workflow builder"

2. **"What's different vs ChatGPT?"**
   - Good: human approval, audit trail, blocked execution
   - Bad: "nicer UI"

3. **"Would this matter in your company?"**
   - Good: compliance, audit, governance
   - Bad: "maybe for automating tasks"

---

## Success Criteria

| Response | ✅ Pass | ❌ Fail |
|----------|---------|---------|
| "Human has to approve" | ✅ | |
| "There's an audit trail" | ✅ | |
| "You can't run without approval" | ✅ | |
| "Cool AI tool" | | ❌ |
| "Like ChatGPT but visual" | | ❌ |
| "Automates workflows" | | ❌ |

**Target:** 4/5 humans mention governance, approval, or audit.
