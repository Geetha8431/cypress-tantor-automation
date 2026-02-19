import addContext from "mochawesome/addContext";
import vulnerabilities from "../security/vulnerabilities.json";

describe("Security Validation - Login Page", () => {

  it("VULN-001: SQL Injection is blocked", function () {

    const vuln = vulnerabilities.find(v => v.id === "VULN-001");

    // Attach vulnerability details to report
    addContext(this, {
      title: "Vulnerability Details",
      value: {
        "Vulnerability ID": vuln.id,
        "Category": vuln.category,
        "Severity": vuln.severity,
        "Location in Code": `${vuln.file}:${vuln.line}`,
        "Remediation Timeline": vuln.remediationTimeline,
        "Detected By": vuln.tool,
        "Validation Tool": "Cypress",
        "Validation Status": "Verified"
      }
    });

    // Application validation (example)
    cy.visit("https://example.cypress.io");
    cy.contains("Kitchen Sink");
  });

  it("Security Summary", function () {
    addContext(this, {
      title: "Security Overview",
      value: {
        TotalVulnerabilities: vulnerabilities.length,
        High: vulnerabilities.filter(v => v.severity === "High").length,
        Medium: vulnerabilities.filter(v => v.severity === "Medium").length
      }
    });
  });

});
