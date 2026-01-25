# Orchestrator Demo - Deployment Checklist

## Pre-Deployment Verification

### 1. Approval Gate ✅
- [ ] Click "Publish for Approval" button
- [ ] Cost warning appears (if > RM10)
- [ ] Approval modal opens with "Human must approve" header
- [ ] Checkbox: "I approve this workflow to run"
- [ ] Approve button disabled until checkbox checked
- [ ] After approval: badge changes to "Human approved" (green)

### 2. Cost Warning ✅
- [ ] Add enough tasks to exceed RM10 ceiling
- [ ] Click "Publish for Approval"
- [ ] Cost warning modal appears: "⚠ This workflow exceeds your RM10.00 ceiling"
- [ ] Shows actual cost vs ceiling
- [ ] "Continue to Approval" proceeds to approval modal

### 3. audit.zip Export ✅
- [ ] Click "Export Audit" button
- [ ] ZIP file downloads
- [ ] Unzip contains:
  - [ ] `workflow.json` (readable, contains workflow data)
  - [ ] `cost.txt` (shows cost breakdown)
  - [ ] `approval.txt` (shows approval status)
  - [ ] `screenshot.png` (canvas capture)

### 4. Demo Reset ✅
- [ ] Click "Reset Demo" button
- [ ] Workflow clears
- [ ] Approval status resets to "Needs human approval"
- [ ] Step indicator returns to Step 1
- [ ] Ready for fresh demo

### 5. Blocked Execution ✅
- [ ] Without approval: click "Run Test"
- [ ] See: "❌ This workflow cannot run until a human approves it."
- [ ] Clear instructions to approve shown

### 6. Happy Path Visual ✅
- [ ] Step bar visible: "① Build workflow → ② Publish & approve → ③ Export audit proof"
- [ ] Step badges appear on relevant buttons
- [ ] Current step highlighted in purple
- [ ] Completed steps show green

---

## Deployment Steps

```bash
# 1. Pull latest
git pull origin main

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Test locally
npm run dev
# Visit: http://localhost:3000/playground/orchestrator

# 5. Create release tag
./RELEASE_TAG.sh

# 6. Push tag
git push origin orchestrator-demo-jan30

# 7. Deploy to Vercel
# (automatic on push, or manual deploy)
```

---

## Post-Deployment Verification

URL: `https://kuasaturbo.com/playground/orchestrator`

Run through checklist above on production.

---

## Hotfix Protocol

If bugs found after tag:

```bash
# Fix the bug
git add -A
git commit -m "hotfix: [description]"

# Delete old tag
git tag -d orchestrator-demo-jan30
git push origin :refs/tags/orchestrator-demo-jan30

# Create new tag
./RELEASE_TAG.sh
git push origin orchestrator-demo-jan30
```

---

## Sign-Off

| Check | Status | Date | Tester |
|-------|--------|------|--------|
| Approval Gate | ⬜ | | |
| Cost Warning | ⬜ | | |
| audit.zip | ⬜ | | |
| Reset Demo | ⬜ | | |
| Blocked Execution | ⬜ | | |
| Happy Path Visual | ⬜ | | |

**Ready for Demo:** ⬜ Yes / ⬜ No
