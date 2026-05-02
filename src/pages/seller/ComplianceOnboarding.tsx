import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Download, FileText, Landmark, Leaf, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Web3Background } from "@/components/Web3Background";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Header } from "@/components/Web3Header";
import { ComplianceStatusBadge } from "@/components/compliance/ComplianceStatusBadge";
import { FarmLocationMap } from "@/components/compliance/FarmLocationMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCompliance } from "@/contexts/ComplianceContext";
import { generateAllExportDocuments, generateExportDocument } from "@/lib/exportDocuments";
import { createCertification, createDefaultSellerProfile, createFarmerIdentity, EXPORT_DOCUMENT_LABELS, SIMPLISIA_OPTIONS } from "@/lib/complianceUtils";
import type { ExportDocumentType, SellerAdministrativeProfile, SimplisiaType } from "@/types/compliance";

const steps = [
  { id: 0, title: "Administrative", icon: Landmark },
  { id: 1, title: "Farmer Identity", icon: Leaf },
  { id: 2, title: "Geo & Certification", icon: MapPin },
  { id: 3, title: "Documents", icon: FileText },
];

const documentTypes = Object.keys(EXPORT_DOCUMENT_LABELS) as ExportDocumentType[];

const buildFormDefaults = (profile: SellerAdministrativeProfile | null) => {
  const seed = profile ?? createDefaultSellerProfile();

  return {
    sellerType: seed.sellerType,
    nik: seed.nik,
    npwp: seed.npwp,
    legalName: seed.legalName,
    businessEntityName: seed.businessEntityName,
    email: seed.email,
    phone: seed.phone,
    registeredAddress: seed.registeredAddress,
    exportLicenseNumber: seed.exportLicenseNumber,
    nibNumber: seed.nibNumber,
    hsCode: seed.hsCode,
    destinationMarkets: seed.destinationMarkets.join(", "),
    simplisiaTypes: seed.simplisiaTypes,
    bankName: seed.bankName,
    bankAccountNumber: seed.bankAccountNumber,
    bankAccountName: seed.bankAccountName,
    farmerName: seed.farmerIdentity.farmerName,
    farmerIdentityNumber: seed.farmerIdentity.identityNumber,
    farmName: seed.farmerIdentity.farmName,
    farmLocation: seed.farmerIdentity.farmLocation,
    latitude: seed.farmerIdentity.coordinates.latitude.toString(),
    longitude: seed.farmerIdentity.coordinates.longitude.toString(),
    landAreaHectares: seed.farmerIdentity.landAreaHectares.toString(),
    cultivationMethod: seed.farmerIdentity.cultivationMethod,
    certificationBody: seed.farmerIdentity.certifications[0]?.certifyingBody ?? "Control Union Indonesia",
    certificationNumber: seed.farmerIdentity.certifications[0]?.certificateNumber ?? "",
  };
};

const ComplianceOnboarding = () => {
  const { sellerProfile, saveSellerProfile, batches } = useCompliance();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(buildFormDefaults(sellerProfile));

  const previewFarmerIdentity = useMemo(() => {
    return createFarmerIdentity({
      farmerName: form.farmerName,
      identityNumber: form.farmerIdentityNumber,
      farmName: form.farmName,
      farmLocation: form.farmLocation,
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
      landAreaHectares: Number(form.landAreaHectares) || 1,
      plantsCultivated: form.simplisiaTypes,
      cultivationMethod: form.cultivationMethod,
      certifications: [
        {
          ...createCertification(`${form.farmerIdentityNumber}-${form.certificationNumber}`, "Organic", form.certificationBody || "Registered Certifier"),
          certificateNumber: form.certificationNumber || createCertification(form.farmerIdentityNumber, "Organic", form.certificationBody).certificateNumber,
        },
        createCertification(`${form.farmerIdentityNumber}-gap`, "GAP", "Indonesian Ministry of Agriculture"),
        createCertification(`${form.farmerIdentityNumber}-halal`, "Halal", "BPJPH"),
        createCertification(`${form.farmerIdentityNumber}-jas`, "JAS", "Registered JAS Certifier"),
      ],
    });
  }, [form]);

  const completionItems = [
    { label: "NIK & NPWP", complete: Boolean(form.nik && form.npwp) },
    { label: "Export license", complete: Boolean(form.exportLicenseNumber && form.nibNumber) },
    { label: "Farm geotag", complete: Boolean(form.latitude && form.longitude) },
    { label: "Certification trail", complete: previewFarmerIdentity.certifications.length > 0 },
  ];

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const toggleSimplisia = (value: SimplisiaType) => {
    setForm((previous) => ({
      ...previous,
      simplisiaTypes: previous.simplisiaTypes.includes(value)
        ? previous.simplisiaTypes.filter((item) => item !== value)
        : [...previous.simplisiaTypes, value],
    }));
  };

  const buildProfile = (): SellerAdministrativeProfile => ({
    id: sellerProfile?.id ?? `SELLER-${Date.now()}`,
    sellerType: form.sellerType,
    nik: form.nik,
    npwp: form.npwp,
    legalName: form.legalName,
    businessEntityName: form.businessEntityName,
    email: form.email,
    phone: form.phone,
    registeredAddress: form.registeredAddress,
    exportLicenseNumber: form.exportLicenseNumber,
    nibNumber: form.nibNumber,
    hsCode: form.hsCode,
    destinationMarkets: form.destinationMarkets.split(",").map((market) => market.trim()).filter(Boolean),
    simplisiaTypes: form.simplisiaTypes,
    bankName: form.bankName,
    bankAccountNumber: form.bankAccountNumber,
    bankAccountName: form.bankAccountName,
    farmerIdentity: previewFarmerIdentity,
    completionStatus: "complete",
    updatedAt: new Date().toISOString(),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const profile = buildProfile();
    saveSellerProfile(profile);
    toast.success("Seller administrative profile and farmer digital identity saved.");
    setCurrentStep(3);
  };

  const handleGenerateDocument = (documentType: ExportDocumentType) => {
    const profile = buildProfile();
    saveSellerProfile(profile);
    generateExportDocument(profile, documentType, batches[0]);
    toast.success(`${EXPORT_DOCUMENT_LABELS[documentType]} generated.`);
  };

  const handleGenerateAll = () => {
    const profile = buildProfile();
    saveSellerProfile(profile);
    generateAllExportDocuments(profile, batches[0]);
    toast.success("All export document PDFs generated from saved seller data.");
  };

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="container mx-auto px-4 py-24 relative z-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Badge variant="outline" className="mb-4 border-primary/40 bg-primary/10 text-primary">
            Seller Administrative Automation
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-hero mb-3">
            Automated Administrative Data & Export Documents
          </h1>
          <p className="text-muted-foreground max-w-3xl text-lg">
            Complete one seller onboarding flow and let HerblocX generate farmer identity, geotagged compliance records, certification history, and export-ready PDF templates without manual re-entry.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <div className="space-y-4">
            <Card className="glass-card border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Onboarding Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      currentStep === step.id
                        ? "border-primary/50 bg-primary/15"
                        : "border-border/50 bg-muted/20 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/15 p-2">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{step.title}</span>
                    </div>
                  </button>
                ))}

                <Separator className="bg-border/50" />

                <div className="space-y-2">
                  {completionItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      {item.complete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 0 && (
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Seller Registration & Export Compliance Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Seller Type</Label>
                      <Select value={form.sellerType} onValueChange={(value) => updateField("sellerType", value as typeof form.sellerType)}>
                        <SelectTrigger className="bg-muted/30 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="business_entity">Business Entity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legalName">Full Legal Name</Label>
                      <Input id="legalName" value={form.legalName} onChange={(event) => updateField("legalName", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nik">NIK</Label>
                      <Input id="nik" value={form.nik} onChange={(event) => updateField("nik", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="npwp">NPWP</Label>
                      <Input id="npwp" value={form.npwp} onChange={(event) => updateField("npwp", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEntityName">Business Entity Name</Label>
                      <Input id="businessEntityName" value={form.businessEntityName} onChange={(event) => updateField("businessEntityName", event.target.value)} className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nibNumber">NIB Number</Label>
                      <Input id="nibNumber" value={form.nibNumber} onChange={(event) => updateField("nibNumber", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exportLicenseNumber">Export License Number</Label>
                      <Input id="exportLicenseNumber" value={form.exportLicenseNumber} onChange={(event) => updateField("exportLicenseNumber", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hsCode">HS Code</Label>
                      <Input id="hsCode" value={form.hsCode} onChange={(event) => updateField("hsCode", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="registeredAddress">Registered Address</Label>
                      <Textarea id="registeredAddress" value={form.registeredAddress} onChange={(event) => updateField("registeredAddress", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="destinationMarkets">Destination Markets</Label>
                      <Input id="destinationMarkets" value={form.destinationMarkets} onChange={(event) => updateField("destinationMarkets", event.target.value)} placeholder="European Union, United States, Japan" className="bg-muted/30 border-border/50" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Types of Simplisia Sold</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SIMPLISIA_OPTIONS.map((item) => (
                        <label key={item} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                          <Checkbox checked={form.simplisiaTypes.includes(item)} onCheckedChange={() => toggleSimplisia(item)} />
                          <span className="text-sm">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Farmer / Supplier Digital Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmerName">Farmer Name</Label>
                      <Input id="farmerName" value={form.farmerName} onChange={(event) => updateField("farmerName", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmerIdentityNumber">Farmer Identity Number</Label>
                      <Input id="farmerIdentityNumber" value={form.farmerIdentityNumber} onChange={(event) => updateField("farmerIdentityNumber", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmName">Farm / Plantation Name</Label>
                      <Input id="farmName" value={form.farmName} onChange={(event) => updateField("farmName", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cultivation Method</Label>
                      <Select value={form.cultivationMethod} onValueChange={(value) => updateField("cultivationMethod", value as typeof form.cultivationMethod)}>
                        <SelectTrigger className="bg-muted/30 border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Organic">Organic</SelectItem>
                          <SelectItem value="Conventional">Conventional</SelectItem>
                          <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                          <SelectItem value="Wild Harvested">Wild Harvested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="farmLocation">Farm Location</Label>
                      <Input id="farmLocation" value={form.farmLocation} onChange={(event) => updateField("farmLocation", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landAreaHectares">Land Area (hectares)</Label>
                      <Input id="landAreaHectares" type="number" step="0.01" value={form.landAreaHectares} onChange={(event) => updateField("landAreaHectares", event.target.value)} required className="bg-muted/30 border-border/50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Generated Farmer ID</Label>
                      <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 font-mono text-sm text-primary">
                        {previewFarmerIdentity.farmerId}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle>Geo-tagging, Protected Zone Screening & Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input id="latitude" type="number" step="0.000001" value={form.latitude} onChange={(event) => updateField("latitude", event.target.value)} required className="bg-muted/30 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input id="longitude" type="number" step="0.000001" value={form.longitude} onChange={(event) => updateField("longitude", event.target.value)} required className="bg-muted/30 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Risk Screening</Label>
                        <div className="flex gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
                          <ComplianceStatusBadge value={previewFarmerIdentity.protectedZoneStatus} />
                          <ComplianceStatusBadge value={previewFarmerIdentity.deforestationRisk} />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                      <p className="text-sm text-muted-foreground">{previewFarmerIdentity.landUseChangeStatus}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="certificationBody">Primary Certifying Body</Label>
                        <Input id="certificationBody" value={form.certificationBody} onChange={(event) => updateField("certificationBody", event.target.value)} className="bg-muted/30 border-border/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="certificationNumber">Primary Certificate Number</Label>
                        <Input id="certificationNumber" value={form.certificationNumber} onChange={(event) => updateField("certificationNumber", event.target.value)} className="bg-muted/30 border-border/50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {previewFarmerIdentity.certifications.map((certificate) => (
                        <div key={certificate.id} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="font-semibold">{certificate.type}</p>
                            <ComplianceStatusBadge value={certificate.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{certificate.certifyingBody}</p>
                          <p className="text-xs font-mono text-primary mt-2">{certificate.certificateNumber}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <FarmLocationMap farmerIdentity={previewFarmerIdentity} />
              </div>
            )}

            {currentStep === 3 && (
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Export Document Auto-Generation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">
                      Documents below are auto-populated from the seller profile, farmer identity, geotagging records, certifications, and the latest available product batch. No manual re-entry is required.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentTypes.map((documentType) => (
                      <div key={documentType} className="rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{EXPORT_DOCUMENT_LABELS[documentType]}</p>
                          <p className="text-xs text-muted-foreground mt-1">International trade template populated from saved profile data.</p>
                        </div>
                        <Button type="button" variant="outline" className="border-border/50 bg-muted/30" onClick={() => handleGenerateDocument(documentType)}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" className="btn-web3" onClick={handleGenerateAll}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate All Export Documents
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col md:flex-row justify-between gap-3">
              <Button type="button" variant="outline" className="border-border/50 bg-muted/30" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}>
                Back
              </Button>
              <div className="flex gap-3 justify-end">
                {currentStep < 3 && (
                  <Button type="button" variant="outline" className="border-border/50 bg-muted/30" onClick={() => setCurrentStep((step) => Math.min(3, step + 1))}>
                    Continue
                  </Button>
                )}
                <Button type="submit" className="btn-web3">
                  Save Administrative Profile
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Web3Footer />
    </div>
  );
};

export default ComplianceOnboarding;
