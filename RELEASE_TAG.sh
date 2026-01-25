#!/bin/bash
# =============================================================================
# ORCHESTRATOR DEMO RELEASE - January 30, 2026
# =============================================================================
# Run this script to create the release tag for demo day
# =============================================================================

set -e

RELEASE_TAG="orchestrator-demo-jan30"
RELEASE_DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "=============================================="
echo "ORCHESTRATOR DEMO RELEASE"
echo "Tag: $RELEASE_TAG"
echo "Date: $RELEASE_DATE"
echo "=============================================="

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo ""
    echo "WARNING: You have uncommitted changes."
    echo "Please commit or stash them before creating a release tag."
    git status --short
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create annotated tag
echo ""
echo "Creating release tag: $RELEASE_TAG"
git tag -a "$RELEASE_TAG" -m "Orchestrator Demo Release - Jan 30, 2026

Features included:
- Day-1: Human Approval Gate (Publish -> Approval Modal -> Block Run)
- Day-2: audit.zip Export (workflow.json, cost.txt, approval.txt, screenshot.png)
- Day-3: Cost Ceiling Popup (RM10 warning before approval)
- Day-4: Demo Spine Polish (3-click happy path, plain English, Reset Demo)

Governance moments:
1. Build workflow (drag tasks)
2. Publish for Approval (human must approve)
3. Export audit proof (audit.zip download)

No new features after this tag. Hotfixes only."

echo ""
echo "Tag created successfully!"
echo ""
echo "To push the tag to remote:"
echo "  git push origin $RELEASE_TAG"
echo ""
echo "To verify the tag:"
echo "  git show $RELEASE_TAG"
echo ""
echo "=============================================="
echo "RELEASE COMPLETE"
echo "=============================================="
