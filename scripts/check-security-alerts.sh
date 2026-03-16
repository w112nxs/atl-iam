#!/bin/bash
# Pre-deploy security check — ensures no open CodeQL or Dependabot alerts
# Usage: ./scripts/check-security-alerts.sh

set -e

REPO="w112nxs/atl-iam"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "  Security Alert Check — Pre-Deploy"
echo "========================================="
echo ""

# Check CodeQL alerts
echo "Checking CodeQL alerts..."
CODEQL_OPEN=$(gh api "repos/$REPO/code-scanning/alerts?state=open" --jq 'length' 2>/dev/null || echo "error")

if [ "$CODEQL_OPEN" = "error" ]; then
  echo -e "${YELLOW}⚠  Could not fetch CodeQL alerts (check gh auth)${NC}"
elif [ "$CODEQL_OPEN" = "0" ]; then
  echo -e "${GREEN}✓  No open CodeQL alerts${NC}"
else
  echo -e "${RED}✗  $CODEQL_OPEN open CodeQL alert(s):${NC}"
  gh api "repos/$REPO/code-scanning/alerts?state=open" \
    --jq '.[] | "   [\(.rule.severity)] \(.rule.id) — \(.most_recent_instance.location.path):\(.most_recent_instance.location.start_line) \(.rule.description)"' 2>/dev/null
  echo ""
  echo -e "${RED}⛔ Deploy blocked. Fix CodeQL alerts before deploying.${NC}"
  exit 1
fi

echo ""

# Check Dependabot alerts
echo "Checking Dependabot alerts..."
DEPENDABOT_OPEN=$(gh api "repos/$REPO/dependabot/alerts?state=open" --jq 'length' 2>/dev/null || echo "error")

if [ "$DEPENDABOT_OPEN" = "error" ]; then
  echo -e "${YELLOW}⚠  Could not fetch Dependabot alerts (check gh auth or enable Dependabot)${NC}"
elif [ "$DEPENDABOT_OPEN" = "0" ]; then
  echo -e "${GREEN}✓  No open Dependabot alerts${NC}"
else
  echo -e "${RED}✗  $DEPENDABOT_OPEN open Dependabot alert(s):${NC}"
  gh api "repos/$REPO/dependabot/alerts?state=open" \
    --jq '.[] | "   [\(.security_advisory.severity)] \(.dependency.package.name) — \(.security_advisory.summary)"' 2>/dev/null
  echo ""
  echo -e "${RED}⛔ Deploy blocked. Fix Dependabot alerts before deploying.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  All security checks passed ✓${NC}"
echo -e "${GREEN}=========================================${NC}"
