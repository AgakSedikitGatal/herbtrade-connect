import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Download, ExternalLink, Plus, QrCode, ScanLine, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Web3Background } from "@/components/Web3Background";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Header } from "@/components/Web3Header";
import { ComplianceStatusBadge } from "@/components/compliance/ComplianceStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCompliance } from "@/contexts/ComplianceContext";
import { formatDate, shortenTx, SIMPLISIA_OPTIONS } from "@/lib/complianceUtils";
import { buildJourneyUrl, downloadDataUrl, generateQRCodeDataUrl } from "@/lib/qrCode";
import type { ProductBatch, SimplisiaType } from "@/types/compliance";

const QRCompliance = () => {
  const { sellerProfile, batches, createBatch, updateBatch } = useCompliance();
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    productName: "Premium Organic Ginger Simplisia",
    simplisiaType: (sellerProfile?.simplisiaTypes[0] ?? "Jahe") as SimplisiaType,
    quantityKg: "1200",
    harvestDate: new Date().toISOString().split("T")[0],
    processingFacility: "HerblocX GMP Processing Facility - Semarang",
    exportDestination: sellerProfile?.destinationMarkets[0] ?? "European Union",
    packaging: "25 kg food-grade kraft bags, palletized and shrink-wrapped",
  });

  const analytics = useMemo(() => {
    const totalScans = batches.reduce((sum, batch) => sum + batch.scanCount, 0);
    const lowRiskCount = batches.filter((batch) => batch.eudr.riskLevel === "low").length;
    const linkedQrCount = batches.filter((batch) => Boolean(batch.qrCodeDataUrl)).length;

    return { totalScans, lowRiskCount, linkedQrCount };
  }, [batches]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const batch = await createBatch({
        productName: form.productName,
        simplisiaType: form.simplisiaType,
        quantityKg: Number(form.quantityKg) || 0,
        harvestDate: form.harvestDate,
        processingFacility: form.processingFacility,
        exportDestination: form.exportDestination,
        packaging: form.packaging,
      });
      toast.success(`QR compliance batch ${batch.batchCode} created.`);
    } catch (error) {
      console.error(error);
      toast.error("Please complete seller onboarding before creating QR compliance batches.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateQr = async (batch: ProductBatch) => {
    const qrTargetUrl = buildJourneyUrl(batch.batchCode);
    const qrCodeDataUrl = await generateQRCodeDataUrl(qrTargetUrl);
    updateBatch({ ...batch, qrTargetUrl, qrCodeDataUrl });
    toast.success(`QR code generated for ${batch.batchCode}.`);
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="container mx-auto px-4 py-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary">
            QR Code Compliance Layer
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-hero mb-3">
            Batch QR Traceability & Buyer Verification
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            Generate QR codes that point to a public product journey page, carrying EUDR due diligence data, FDA traceability events, JAS certification records, geotagged farm data, and mock on-chain proofs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">QR-Enabled Batches</p>
                  <p className="text-3xl font-bold text-primary">{analytics.linkedQrCount}</p>
                </div>
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Verification Scans</p>
                  <p className="text-3xl font-bold text-blue-400">{analytics.totalScans}</p>
                </div>
                <ScanLine className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low-Risk EUDR Batches</p>
                  <p className="text-3xl font-bold text-emerald-400">{analytics.lowRiskCount}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <Card className="glass-card border-border/50 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create QR Compliance Batch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input id="productName" value={form.productName} onChange={(event) => setForm((previous) => ({ ...previous, productName: event.target.value }))} required className="bg-muted/30 border-border/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Simplisia Type</Label>
                    <Select value={form.simplisiaType} onValueChange={(value) => setForm((previous) => ({ ...previous, simplisiaType: value as SimplisiaType }))}>
                      <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SIMPLISIA_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantityKg">Quantity (kg)</Label>
                    <Input id="quantityKg" type="number" value={form.quantityKg} onChange={(event) => setForm((previous) => ({ ...previous, quantityKg: event.target.value }))} required className="bg-muted/30 border-border/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date</Label>
                  <Input id="harvestDate" type="date" value={form.harvestDate} onChange={(event) => setForm((previous) => ({ ...previous, harvestDate: event.target.value }))} required className="bg-muted/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="processingFacility">Processing Facility</Label>
                  <Input id="processingFacility" value={form.processingFacility} onChange={(event) => setForm((previous) => ({ ...previous, processingFacility: event.target.value }))} required className="bg-muted/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportDestination">Export Destination</Label>
                  <Input id="exportDestination" value={form.exportDestination} onChange={(event) => setForm((previous) => ({ ...previous, exportDestination: event.target.value }))} className="bg-muted/30 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging</Label>
                  <Textarea id="packaging" value={form.packaging} onChange={(event) => setForm((previous) => ({ ...previous, packaging: event.target.value }))} className="bg-muted/30 border-border/50" />
                </div>
                <Button type="submit" className="w-full btn-web3" disabled={isCreating}>
                  <QrCode className="h-4 w-4 mr-2" />
                  {isCreating ? "Creating..." : "Create Batch & QR"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {batches.map((batch) => (
              <Card key={batch.id} className="glass-card border-border/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-6">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-mono text-primary">{batch.batchCode}</p>
                          <h3 className="text-2xl font-semibold">{batch.productName}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Harvested {formatDate(batch.harvestDate)} • {batch.quantityKg.toLocaleString()} kg • {batch.exportDestination}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <ComplianceStatusBadge value="EUDR" />
                          <ComplianceStatusBadge value="FDA" />
                          <ComplianceStatusBadge value="JAS" />
                          <ComplianceStatusBadge value={batch.eudr.riskLevel} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground">Registry TX</p>
                          <p className="font-mono text-sm text-primary">{shortenTx(batch.txHash)}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground">Traceability Lot</p>
                          <p className="font-mono text-sm">{batch.fda.traceabilityLotCode}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground">Scans</p>
                          <p className="font-semibold">{batch.scanCount}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" className="border-border/50 bg-muted/30">
                          <Link to={`/journey/${batch.batchCode}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Product Journey
                          </Link>
                        </Button>
                        {!batch.qrCodeDataUrl && (
                          <Button variant="outline" className="border-border/50 bg-muted/30" onClick={() => handleGenerateQr(batch)}>
                            <QrCode className="h-4 w-4 mr-2" />
                            Generate QR
                          </Button>
                        )}
                        {batch.qrCodeDataUrl && (
                          <Button variant="outline" className="border-border/50 bg-muted/30" onClick={() => downloadDataUrl(batch.qrCodeDataUrl!, `herblocx-${batch.batchCode}-qr.png`)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download QR
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-white p-4 flex items-center justify-center min-h-[180px]">
                      {batch.qrCodeDataUrl ? (
                        <img src={batch.qrCodeDataUrl} alt={`QR code for ${batch.batchCode}`} className="h-40 w-40" />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <QrCode className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                          <p className="text-sm text-slate-500">QR not generated yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {batches.length === 0 && (
              <Card className="glass-card border-border/50">
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No QR compliance batches yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Web3Footer />
    </div>
  );
};

export default QRCompliance;
