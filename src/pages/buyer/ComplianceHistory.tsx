import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, ExternalLink, FileCheck2, History, SearchCheck } from "lucide-react";
import { Web3Background } from "@/components/Web3Background";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Header } from "@/components/Web3Header";
import { ComplianceStatusBadge } from "@/components/compliance/ComplianceStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompliance } from "@/contexts/ComplianceContext";
import { formatDateTime, shortenTx } from "@/lib/complianceUtils";
import { generateComplianceReport } from "@/lib/exportDocuments";

const ComplianceHistory = () => {
  const { sellerProfile, batches, verificationHistory, recordVerification } = useCompliance();

  const handleDownloadReport = (batchCode: string) => {
    const batch = batches.find((item) => item.batchCode === batchCode);
    const verification = verificationHistory.find((item) => item.batchCode === batchCode);

    if (batch && sellerProfile) {
      generateComplianceReport(sellerProfile, batch, verification);
    }
  };

  const handleDemoVerify = () => {
    const batch = batches[0];
    if (batch) {
      recordVerification(batch, "buyer");
    }
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="container mx-auto px-4 py-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary">
            Buyer Verification History
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-hero mb-3">
            QR Scan History & Compliance Reports
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            Buyers can track every scanned HerblocX QR record, reopen product journey pages, and download batch-level compliance reports for procurement due diligence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Verified Batches</p>
              <p className="text-3xl font-bold text-primary">{new Set(verificationHistory.map((entry) => entry.batchCode)).size}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Verification Events</p>
              <p className="text-3xl font-bold text-blue-400">{verificationHistory.length}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Demo Batch</p>
                <p className="text-3xl font-bold text-emerald-400">{batches.length}</p>
              </div>
              <Button variant="outline" className="border-border/50 bg-muted/30" onClick={handleDemoVerify}>
                <SearchCheck className="h-4 w-4 mr-2" />
                Demo Verify
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Verification Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationHistory.length === 0 && (
              <div className="py-12 text-center">
                <FileCheck2 className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No verification history yet</h3>
                <p className="text-muted-foreground mb-6">
                  Scan a product QR, open a product journey page, or run a demo verification to populate this buyer dashboard.
                </p>
                {batches[0] && (
                  <Button asChild className="btn-web3">
                    <Link to={`/journey/${batches[0].batchCode}`}>Open Sample Product Journey</Link>
                  </Button>
                )}
              </div>
            )}

            {verificationHistory.map((entry) => {
              const batch = batches.find((item) => item.batchCode === entry.batchCode);

              return (
                <div key={entry.id} className="rounded-xl border border-border/50 bg-muted/20 p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm text-primary">{entry.batchCode}</p>
                        <ComplianceStatusBadge value={entry.verifierRole} tone="info" />
                        {batch && <ComplianceStatusBadge value={batch.eudr.riskLevel} />}
                      </div>
                      <h3 className="text-xl font-semibold">{entry.productName}</h3>
                      <p className="text-sm text-muted-foreground">{entry.complianceSummary}</p>
                      <p className="text-xs text-muted-foreground">Verified at {formatDateTime(entry.verifiedAt)}</p>
                      <p className="text-xs font-mono text-primary">Report TX: {shortenTx(entry.reportTxHash)}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="outline" className="border-border/50 bg-muted/30">
                        <Link to={`/journey/${entry.batchCode}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Product Journey
                        </Link>
                      </Button>
                      <Button variant="outline" className="border-border/50 bg-muted/30" onClick={() => handleDownloadReport(entry.batchCode)} disabled={!batch}>
                        <Download className="h-4 w-4 mr-2" />
                        Report PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      <Web3Footer />
    </div>
  );
};

export default ComplianceHistory;
