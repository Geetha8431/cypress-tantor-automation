const zapReport = require("./zap-report.json");
const fs = require("fs");

const vulnerabilities = zapReport.site[0].alerts.map((alert, index) => ({
  id: `VULN-${String(index + 1).padStart(3, "0")}`,
  category: alert.alert,
  severity: alert.riskdesc.split(" ")[0],
  file: alert.uri,
  line: null,
  description: alert.desc,
  tool: "OWASP ZAP",
  remediationTimeline: alert.riskdesc.includes("High")
    ? "7 days"
    : "30 days",
  status: "Open"
}));

fs.writeFileSync(
  "cypress/security/vulnerabilities.json",
  JSON.stringify(vulnerabilities, null, 2)
);

console.log("vulnerabilities.json generated");
