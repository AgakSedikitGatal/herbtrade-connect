import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, FileCheck2, Leaf, QrCode, ShieldCheck, Truck } from "lucide-react";
import { Web3Background } from "@/components/Web3Background";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Header } from "@/components/Web3Header";
import { ComplianceStatusBadge } from "@/components/compliance/ComplianceStatusBadge";
import { FarmLocationMap } from "@/components/compliance/FarmLocationMap";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCompliance } from "@/contexts/ComplianceContext";
import { formatCoordinate, formatDate, formatDateTime, getExplorerUrl, publicAddressForFarmer, shortenTx } from "@/lib/complianceUtils";
import { generateComplianceReport } from "@/lib/exportDocuments";

const ProductJourney = () => {
  const { batchCode } = useParams();
  const { sellerProfile, getBatchByCode, recordVerification, verificationHistory } = useCompliance();
  const recordedRef = useRef(false);
  const batch = batchCode ? getBatchByCode(batchCode) : undefined;

  useEffect(() => {
    if (!batch || recordedRef.current) return;
    recordVerification(batch, "public");
    recordedRef.current = true;
  }, [batch?.id]);

  const latestVerification = useMemo(
    () => verificationHistory.find((entry) => entry.batchCode === batch?.batchCode),
    [verificationHistory, batch?.batchCode],
  );

  if (!batch || !sellerProfile) {
    return (
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        <Web3Background />
        <Web3Header />
        <main className="container mx-auto px-4 py-28 relative z-10">
          <Card className="glass-card border-border/50 max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <QrCode className="h-14 w-14 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-3xl font-bold mb-3">Product Journey Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The QR target does not match a known HerblocX compliance batch in this local workspace.
              </p>
              <Button asChild className="btn-web3">
                <Link to="/seller/qr-compliance">Open Seller QR Compliance</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Web3Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="container mx-auto px-4 py-24 relative z-10">
        <Button asChild variant="outline" className="mb-6 border-border/50 bg-muted/30">
          <Link to="/seller/qr-compliance"><ArrowLeft className="h-4 w-4 mr-2" />Back to QR Dashboard</Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary">
            Public Product Journey
          </Badge>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6 items-start">
            <div>
              <p className="text-sm font-mono text-primary mb-2">{batch.batchCode}</p>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-hero mb-3">{batch.productName}</h1>
              <p className="text-muted-foreground max-w-3xl text-lg">
                A living regulatory document linking farm origin, processing events, quality testing, EUDR due diligence, FDA traceability fields, JAS certification records, and blockchain transaction hashes.
              </p>
            </div>
            <Card className="glass-card border-border/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">QR Verification</p>
                <div className="rounded-xl bg-white p-4 inline-flex">
                  {batch.qrCodeDataUrl ? (
                    <img src={batch.qrCodeDataUrl} alt={`QR code for ${batch.batchCode}`} className="h-44 w-44" />
                  ) : (
                    <QrCode className="h-44 w-44 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Scanned {batch.scanCount.toLocaleString()} times</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card border-border/50"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Origin</p><p className="font-semibold">{sellerProfile.farmerIdentity.farmLocation}</p></CardContent></Card>
          <Card className="glass-card border-border/50"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Harvest</p><p className="font-semibold">{formatDate(batch.harvestDate)}</p></CardContent></Card>
          <Card className="glass-card border-border/50"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Quantity</p><p className="font-semibold">{batch.quantityKg.toLocaleString()} kg</p></CardContent></Card>
          <Card className="glass-card border-border/50"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Compliance</p><div className="flex gap-2 mt-1"><ComplianceStatusBadge value="EUDR" /><ComplianceStatusBadge value="FDA" /><ComplianceStatusBadge value="JAS" /></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 mb-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Product Journey Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-5">
                {batch.shippingTimeline.map((node, index) => (
                  <div key={node.id} className="relative pl-9">
                    {index < batch.shippingTimeline.length - 1 && <div className="absolute left-[10px] top-6 h-full w-px bg-border" />}
                    <div className="absolute left-0 top-1 h-5 w-5 rounded-full bg-primary shadow-[0_0_16px_rgba(34,197,94,0.5)]" />
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{node.label}</h3>
                          <p className="text-sm text-muted-foreground">{node.handler} • {node.location}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDateTime(node.timestamp)}</p>
                      </div>
                      <Button asChild variant="link" className="px-0 text-primary">
                        <a href={getExplorerUrl(node.txHash)} target="_blank" rel="noreferrer">
                          Verify TX {shortenTx(node.txHash)} <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Blockchain Proofs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Batch Registry TX</p>
                <p className="font-mono text-sm text-primary break-all">{batch.txHash}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Farmer Wallet Alias</p>
                <p className="font-mono text-sm text-primary break-all">{publicAddressForFarmer(sellerProfile.farmerIdentity.farmerId)}</p>
              </div>
              <Button asChild className="w-full btn-web3">
                <a href={getExplorerUrl(batch.txHash)} target="_blank" rel="noreferrer">
                  Verify on Blockchain <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" className="w-full border-border/50 bg-muted/30" onClick={() => generateComplianceReport(sellerProfile, batch, latestVerification)}>
                <FileCheck2 className="h-4 w-4 mr-2" />
                Download Compliance Report
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <FarmLocationMap farmerIdentity={sellerProfile.farmerIdentity} />
        </div>

        <Card className="glass-card border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" />Regulatory Compliance Data Room</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={["eudr", "fda", "jas", "quality"]} className="space-y-3">
              <AccordionItem value="eudr" className="rounded-xl border border-border/50 bg-muted/20 px-4">
                <AccordionTrigger>EUDR Due Diligence</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><p className="text-xs text-muted-foreground">Deforestation Cut-off</p><p className="font-semibold">{batch.eudr.deforestationCutoff}</p></div>
                    <div><p className="text-xs text-muted-foreground">Risk Level</p><ComplianceStatusBadge value={batch.eudr.riskLevel} /></div>
                    <div><p className="text-xs text-muted-foreground">Farm GPS</p><p className="font-mono text-sm">{formatCoordinate(sellerProfile.farmerIdentity.coordinates.latitude, sellerProfile.farmerIdentity.coordinates.longitude)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Polygon TX</p><p className="font-mono text-sm text-primary">{shortenTx(batch.eudr.polygonTxHash)}</p></div>
                  </div>
                  <Separator className="bg-border/50" />
                  <p className="text-sm text-muted-foreground">{batch.eudr.geoTaggedProof}</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fda" className="rounded-xl border border-border/50 bg-muted/20 px-4">
                <AccordionTrigger>FDA FSMA 204 Traceability</AccordionTrigger>
                <AccordionContent>
                  <p className="font-mono text-sm text-primary mb-4">Lot Code: {batch.fda.traceabilityLotCode}</p>
                  <div className="space-y-3">
                    {batch.fda.criticalTrackingEvents.map((event) => (
                      <div key={event.txHash} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-border/50 bg-background/30 p-3">
                        <div><p className="font-medium">{event.label}</p><p className="text-sm text-muted-foreground">{event.value}</p></div>
                        <a href={getExplorerUrl(event.txHash)} target="_blank" rel="noreferrer" className="text-sm text-primary">{shortenTx(event.txHash)}</a>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="jas" className="rounded-xl border border-border/50 bg-muted/20 px-4">
                <AccordionTrigger>JAS Organic Certification</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><p className="text-xs text-muted-foreground">Certificate</p><p className="font-mono text-sm">{batch.jas.certificateNumber}</p></div>
                    <div><p className="text-xs text-muted-foreground">Certifying Body</p><p className="font-semibold">{batch.jas.certifyingBody}</p></div>
                    <div><p className="text-xs text-muted-foreground">Validity</p><p className="text-sm">{batch.jas.validityPeriod}</p></div>
                  </div>
                  <div className="space-y-3">
                    {batch.jas.inspectionRecords.map((record) => (
                      <div key={record.txHash} className="rounded-lg border border-border/50 bg-background/30 p-3">
                        <p className="font-medium">{record.label}</p>
                        <p className="text-sm text-muted-foreground">{record.value}</p>
                        <p className="font-mono text-xs text-primary mt-2">{shortenTx(record.txHash)}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality" className="rounded-xl border border-border/50 bg-muted/20 px-4">
                <AccordionTrigger>Quality and Lab Tests</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {batch.qualityTests.map((test) => (
                      <div key={test.txHash} className="rounded-lg border border-border/50 bg-background/30 p-3">
                        <p className="font-semibold">{test.parameter}</p>
                        <p className="text-sm">{test.result}</p>
                        <p className="text-xs text-muted-foreground">Standard: {test.standard}</p>
                        <p className="text-xs text-muted-foreground">Lab: {test.labName}</p>
                        <p className="font-mono text-xs text-primary mt-2">{shortenTx(test.txHash)}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>

      <Web3Footer />
    </div>
  );
};

export default ProductJourney;
