import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Building2, FileCheck2, Leaf, LockKeyhole, MapPin, ShieldCheck, UploadCloud, UserRoundCheck } from "lucide-react";
import { Web3Background } from "@/components/Web3Background";
import { Web3Header } from "@/components/Web3Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService, type BuyerKycProfile, type LegalEntityType, type SellerKycProfile, type TradeRole } from "@/lib/auth";
import { createFarmerIdentity } from "@/lib/complianceUtils";
import { hashFromSeed, numberFromSeed } from "@/lib/mockChain";
import { useCompliance } from "@/contexts/ComplianceContext";
import type { SellerAdministrativeProfile, SimplisiaType } from "@/types/compliance";

const simplisiaOptions: SimplisiaType[] = ["Jahe", "Kunyit", "Temulawak", "Lengkuas", "Kayu Manis", "Pala", "Black Pepper", "Andrographis"];
const marketOptions = ["Indonesia", "European Union", "United States", "Japan", "Singapore", "Middle East"];

const nowIso = () => new Date().toISOString();

const splitValues = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildSellerComplianceProfile = (seller: SellerKycProfile): SellerAdministrativeProfile => {
  const seed = `${seller.nibNumber}-${seller.legalName}-${seller.landName}`;
  const simplisiaTypes = seller.simplisiaOffered.length
    ? seller.simplisiaOffered.map((item) => (simplisiaOptions.includes(item as SimplisiaType) ? (item as SimplisiaType) : "Other"))
    : ["Jahe"];
  const farmerIdentity = createFarmerIdentity({
    farmerName: seller.legalName,
    identityNumber: seller.nikOrNpwp,
    farmName: seller.landName,
    farmLocation: seller.landLocation,
    latitude: seller.geotagLatitude,
    longitude: seller.geotagLongitude,
    landAreaHectares: seller.landAreaHectares,
    plantsCultivated: simplisiaTypes,
      cultivationMethod: seller.cultivationMethod as SellerAdministrativeProfile["farmerIdentity"]["cultivationMethod"],
  });

  return {
    id: `SELLER-${numberFromSeed(seed, 1000, 9999)}`,
    sellerType: seller.legalEntityType,
    nik: seller.legalEntityType === "individual" ? seller.nikOrNpwp : "",
    npwp: seller.legalEntityType === "business_entity" ? seller.nikOrNpwp : "",
    legalName: seller.legalName,
    businessEntityName: seller.businessEntityName,
    email: seller.email,
    phone: seller.phone,
    registeredAddress: seller.registeredAddress,
    exportLicenseNumber: `EXP-${seller.nibNumber}-${numberFromSeed(seed, 100, 999)}`,
    nibNumber: seller.nibNumber,
    hsCode: "0910.99",
    destinationMarkets: marketOptions.slice(1, 4),
    simplisiaTypes,
    bankName: "Bank account pending verification",
    bankAccountNumber: "Pending settlement setup",
    bankAccountName: seller.businessEntityName || seller.legalName,
    farmerIdentity: {
      ...farmerIdentity,
      txHash: hashFromSeed(`${seed}-seller-kyc-farmer`),
    },
    completionStatus: "complete",
    updatedAt: nowIso(),
  };
};

const KYCOnboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = authService.getUser();
  const { saveSellerProfile } = useCompliance();
  const initialRole = (searchParams.get("role") === "seller" || searchParams.get("role") === "buyer" ? searchParams.get("role") : "seller") as TradeRole;
  const [selectedRole, setSelectedRole] = useState<TradeRole>(initialRole);

  const [sellerForm, setSellerForm] = useState({
    legalEntityType: "business_entity" as LegalEntityType,
    legalName: currentUser?.name || "",
    businessEntityName: currentUser?.company || "",
    nibNumber: "",
    nikOrNpwp: "",
    registeredAddress: "",
    phone: "",
    email: currentUser?.email || "",
    landName: "",
    landLocation: "",
    landAreaHectares: "",
    geotagLatitude: "-7.3166",
    geotagLongitude: "110.1747",
    geotagPhotoName: "",
    simplisiaOffered: "Jahe, Kunyit",
    cultivationMethod: "Organic",
    monthlyCapacityKg: "1000",
    businessLicenseNotes: "",
  });

  const [buyerForm, setBuyerForm] = useState({
    legalEntityType: "business_entity" as LegalEntityType,
    legalName: currentUser?.name || "",
    businessEntityName: currentUser?.company || "",
    nibNumber: "",
    nikOrNpwp: "",
    registeredAddress: "",
    phone: "",
    email: currentUser?.email || "",
    simplisiaNeeded: "Jahe, Kunyit, Temulawak",
    purchaseVolumeKg: "500",
    preferredOrigin: "Central Java, Indonesia",
    qualityRequirements: "Moisture below 10%, COA available, traceable origin, export-ready packaging.",
    importDestination: currentUser?.country || "Indonesia",
  });

  const kycSummary = useMemo(() => {
    if (!currentUser) {
      return "Login terlebih dahulu untuk memulai KYC Seller atau Buyer.";
    }

    if (currentUser.kycStatus === "pending" || currentUser.kycStatus === "verified") {
      return `${authService.getKycStatusLabel(currentUser.kycStatus)} sebagai ${currentUser.role.toUpperCase()}. Kamu masih bisa memperbarui data KYC jika diperlukan.`;
    }

    return "Akun umum aktif. Kamu bisa melihat marketplace, komunitas, dan fitur umum; transaksi membutuhkan KYC role.";
  }, [currentUser]);

  const requireLogin = () => {
    if (!currentUser) {
      toast.error("Please login with a general account before starting KYC.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleSellerSubmit = () => {
    if (!requireLogin()) return;

    const requiredFields = [
      sellerForm.legalName,
      sellerForm.nibNumber,
      sellerForm.nikOrNpwp,
      sellerForm.registeredAddress,
      sellerForm.phone,
      sellerForm.email,
      sellerForm.landName,
      sellerForm.landLocation,
      sellerForm.landAreaHectares,
      sellerForm.geotagLatitude,
      sellerForm.geotagLongitude,
      sellerForm.simplisiaOffered,
    ];

    if (requiredFields.some((field) => !String(field).trim())) {
      toast.error("Lengkapi semua field wajib Seller KYC sebelum submit.");
      return;
    }

    const submittedAt = nowIso();
    const sellerProfile: SellerKycProfile = {
      role: "seller",
      legalEntityType: sellerForm.legalEntityType,
      legalName: sellerForm.legalName,
      businessEntityName: sellerForm.businessEntityName,
      nibNumber: sellerForm.nibNumber,
      nikOrNpwp: sellerForm.nikOrNpwp,
      registeredAddress: sellerForm.registeredAddress,
      phone: sellerForm.phone,
      email: sellerForm.email,
      submittedAt,
      updatedAt: submittedAt,
      landName: sellerForm.landName,
      landLocation: sellerForm.landLocation,
      landAreaHectares: Number(sellerForm.landAreaHectares),
      geotagLatitude: Number(sellerForm.geotagLatitude),
      geotagLongitude: Number(sellerForm.geotagLongitude),
      geotagPhotoName: sellerForm.geotagPhotoName || "Manual GPS proof pending upload",
      simplisiaOffered: splitValues(sellerForm.simplisiaOffered),
      cultivationMethod: sellerForm.cultivationMethod,
      monthlyCapacityKg: Number(sellerForm.monthlyCapacityKg),
      businessLicenseNotes: sellerForm.businessLicenseNotes,
    };

    authService.submitKyc("seller", sellerProfile);
    saveSellerProfile(buildSellerComplianceProfile(sellerProfile));
    toast.success("Seller KYC submitted. Data legalitas, lahan, geotag, dan simplisia kini menjadi template dokumen otomatis.");
    navigate("/seller/dashboard");
  };

  const handleBuyerSubmit = () => {
    if (!requireLogin()) return;

    const requiredFields = [buyerForm.legalName, buyerForm.nibNumber, buyerForm.nikOrNpwp, buyerForm.registeredAddress, buyerForm.phone, buyerForm.email, buyerForm.simplisiaNeeded];
    if (requiredFields.some((field) => !String(field).trim())) {
      toast.error("Lengkapi semua field wajib Buyer KYC sebelum submit.");
      return;
    }

    const submittedAt = nowIso();
    const buyerProfile: BuyerKycProfile = {
      role: "buyer",
      legalEntityType: buyerForm.legalEntityType,
      legalName: buyerForm.legalName,
      businessEntityName: buyerForm.businessEntityName,
      nibNumber: buyerForm.nibNumber,
      nikOrNpwp: buyerForm.nikOrNpwp,
      registeredAddress: buyerForm.registeredAddress,
      phone: buyerForm.phone,
      email: buyerForm.email,
      submittedAt,
      updatedAt: submittedAt,
      simplisiaNeeded: splitValues(buyerForm.simplisiaNeeded),
      purchaseVolumeKg: Number(buyerForm.purchaseVolumeKg),
      preferredOrigin: buyerForm.preferredOrigin,
      qualityRequirements: buyerForm.qualityRequirements,
      importDestination: buyerForm.importDestination,
    };

    authService.submitKyc("buyer", buyerProfile);
    toast.success("Buyer KYC submitted. Preferensi simplisia akan dipakai sebagai dasar rekomendasi dashboard.");
    navigate("/buyer/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg relative overflow-hidden">
      <Web3Background />
      <Web3Header />

      <main className="container mx-auto px-4 py-10 relative z-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button variant="ghost" className="mb-4" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">Exchange-style staged access</Badge>
            <h1 className="text-4xl font-bold mb-3">HerBlocX Role KYC</h1>
            <p className="text-muted-foreground max-w-3xl">
              Akun pertama adalah akun umum read-only. Untuk melakukan transaksi jual beli, pengguna memilih role Seller atau Buyer lalu mengisi KYC sesuai kebutuhan legalitas dan operasional.
            </p>
          </div>
          <Card className="glass border-border/50 md:w-[360px]">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Current Access</p>
                  <p className="text-sm text-muted-foreground">{kycSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5" /> Access Levels</CardTitle>
                <CardDescription>Alur baru dibuat bertahap agar mirip exchange dan memisahkan akun umum dari akun transaksi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/60 p-4">
                  <div className="flex items-center justify-between"><span className="font-medium">General Account</span><Badge variant="outline">Browse</Badge></div>
                  <p className="mt-2 text-sm text-muted-foreground">Melihat marketplace, supplier, komunitas, tracking publik, dan fitur informasi tanpa transaksi.</p>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center justify-between"><span className="font-medium">Seller KYC</span><Badge>Trade</Badge></div>
                  <p className="mt-2 text-sm text-muted-foreground">Legalitas Indonesia, NIB, lahan, foto geotag, spesifikasi simplisia, dan data template dokumen ekspor.</p>
                </div>
                <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
                  <div className="flex items-center justify-between"><span className="font-medium">Buyer KYC</span><Badge variant="secondary">Purchase</Badge></div>
                  <p className="mt-2 text-sm text-muted-foreground">Legalitas perusahaan, kebutuhan simplisia, volume, kualitas, dan origin preferensi untuk rekomendasi dashboard.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as TradeRole)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="seller" className="gap-2"><Leaf className="h-4 w-4" /> Seller KYC</TabsTrigger>
              <TabsTrigger value="buyer" className="gap-2"><Building2 className="h-4 w-4" /> Buyer KYC</TabsTrigger>
            </TabsList>

            <TabsContent value="seller">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Seller KYC Form</CardTitle>
                  <CardDescription>Data ini dipakai untuk mengisi template Quotation, Bill of Lading, export documents, QR traceability, dan compliance onboarding Seller.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-primary" /> Legalitas Indonesia</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Tipe Legalitas</Label>
                        <Select value={sellerForm.legalEntityType} onValueChange={(value: LegalEntityType) => setSellerForm({ ...sellerForm, legalEntityType: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business_entity">Badan Usaha</SelectItem>
                            <SelectItem value="individual">Usaha Perorangan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>NIB</Label><Input value={sellerForm.nibNumber} onChange={(e) => setSellerForm({ ...sellerForm, nibNumber: e.target.value })} placeholder="Nomor Induk Berusaha" /></div>
                      <div className="space-y-2"><Label>Nama Penanggung Jawab</Label><Input value={sellerForm.legalName} onChange={(e) => setSellerForm({ ...sellerForm, legalName: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Nama Badan Usaha / Brand</Label><Input value={sellerForm.businessEntityName} onChange={(e) => setSellerForm({ ...sellerForm, businessEntityName: e.target.value })} /></div>
                      <div className="space-y-2"><Label>NIK / NPWP</Label><Input value={sellerForm.nikOrNpwp} onChange={(e) => setSellerForm({ ...sellerForm, nikOrNpwp: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Email</Label><Input value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Phone</Label><Input value={sellerForm.phone} onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Alamat Terdaftar</Label><Textarea value={sellerForm.registeredAddress} onChange={(e) => setSellerForm({ ...sellerForm, registeredAddress: e.target.value })} /></div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Lahan, Geotag, dan Simplisia</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Nama Lahan</Label><Input value={sellerForm.landName} onChange={(e) => setSellerForm({ ...sellerForm, landName: e.target.value })} placeholder="Kebun Rempah..." /></div>
                      <div className="space-y-2"><Label>Lokasi Lahan</Label><Input value={sellerForm.landLocation} onChange={(e) => setSellerForm({ ...sellerForm, landLocation: e.target.value })} placeholder="Kabupaten, Provinsi" /></div>
                      <div className="space-y-2"><Label>Luas Lahan (ha)</Label><Input type="number" value={sellerForm.landAreaHectares} onChange={(e) => setSellerForm({ ...sellerForm, landAreaHectares: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Metode Budidaya</Label><Select value={sellerForm.cultivationMethod} onValueChange={(value) => setSellerForm({ ...sellerForm, cultivationMethod: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Organic">Organic</SelectItem><SelectItem value="Conventional">Conventional</SelectItem><SelectItem value="Wild Harvested">Wild Harvested</SelectItem><SelectItem value="Agroforestry">Agroforestry</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>Latitude</Label><Input type="number" value={sellerForm.geotagLatitude} onChange={(e) => setSellerForm({ ...sellerForm, geotagLatitude: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Longitude</Label><Input type="number" value={sellerForm.geotagLongitude} onChange={(e) => setSellerForm({ ...sellerForm, geotagLongitude: e.target.value })} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Simplisia yang Dijual</Label><Input value={sellerForm.simplisiaOffered} onChange={(e) => setSellerForm({ ...sellerForm, simplisiaOffered: e.target.value })} placeholder="Pisahkan dengan koma" /><p className="text-xs text-muted-foreground">Contoh: {simplisiaOptions.slice(0, 4).join(", ")}</p></div>
                      <div className="space-y-2"><Label>Kapasitas Bulanan (kg)</Label><Input type="number" value={sellerForm.monthlyCapacityKg} onChange={(e) => setSellerForm({ ...sellerForm, monthlyCapacityKg: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Foto Geotag Lahan</Label><Input type="file" accept="image/*" onChange={(e) => setSellerForm({ ...sellerForm, geotagPhotoName: e.target.files?.[0]?.name || "" })} /><p className="text-xs text-muted-foreground flex items-center gap-1"><UploadCloud className="h-3 w-3" /> Prototype menyimpan nama file sebagai proof; integrasi storage dapat ditambahkan nanti.</p></div>
                      <div className="space-y-2 md:col-span-2"><Label>Catatan Legalitas / Sertifikasi</Label><Textarea value={sellerForm.businessLicenseNotes} onChange={(e) => setSellerForm({ ...sellerForm, businessLicenseNotes: e.target.value })} placeholder="Nomor sertifikat organik, izin edar, GMP, atau catatan audit..." /></div>
                    </div>
                  </section>

                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <p className="font-medium flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" /> Auto-template ready</p>
                    <p className="mt-2 text-sm text-muted-foreground">Setelah submit, data Seller otomatis mengisi profil compliance yang dipakai untuk Quotation, Bill of Lading, packing list, invoice, certificate of origin, dan QR product journey.</p>
                  </div>

                  <Button className="btn-hero w-full" onClick={handleSellerSubmit}>Submit Seller KYC</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buyer">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Buyer KYC Form</CardTitle>
                  <CardDescription>Buyer hanya mengisi legalitas dan kebutuhan simplisia; data lahan tidak diperlukan karena buyer bukan pihak budidaya.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><UserRoundCheck className="h-5 w-5 text-primary" /> Legalitas Buyer</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2"><Label>Tipe Legalitas</Label><Select value={buyerForm.legalEntityType} onValueChange={(value: LegalEntityType) => setBuyerForm({ ...buyerForm, legalEntityType: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="business_entity">Badan Usaha</SelectItem><SelectItem value="individual">Usaha Perorangan</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label>NIB</Label><Input value={buyerForm.nibNumber} onChange={(e) => setBuyerForm({ ...buyerForm, nibNumber: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Nama Penanggung Jawab</Label><Input value={buyerForm.legalName} onChange={(e) => setBuyerForm({ ...buyerForm, legalName: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Nama Perusahaan / Brand</Label><Input value={buyerForm.businessEntityName} onChange={(e) => setBuyerForm({ ...buyerForm, businessEntityName: e.target.value })} /></div>
                      <div className="space-y-2"><Label>NIK / NPWP</Label><Input value={buyerForm.nikOrNpwp} onChange={(e) => setBuyerForm({ ...buyerForm, nikOrNpwp: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Email</Label><Input value={buyerForm.email} onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Phone</Label><Input value={buyerForm.phone} onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })} /></div>
                      <div className="space-y-2 md:col-span-2"><Label>Alamat Terdaftar</Label><Textarea value={buyerForm.registeredAddress} onChange={(e) => setBuyerForm({ ...buyerForm, registeredAddress: e.target.value })} /></div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /> Kebutuhan Simplisia</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2"><Label>Simplisia yang Dibutuhkan</Label><Input value={buyerForm.simplisiaNeeded} onChange={(e) => setBuyerForm({ ...buyerForm, simplisiaNeeded: e.target.value })} placeholder="Pisahkan dengan koma" /></div>
                      <div className="space-y-2"><Label>Estimasi Volume Pembelian (kg)</Label><Input type="number" value={buyerForm.purchaseVolumeKg} onChange={(e) => setBuyerForm({ ...buyerForm, purchaseVolumeKg: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Preferensi Origin</Label><Input value={buyerForm.preferredOrigin} onChange={(e) => setBuyerForm({ ...buyerForm, preferredOrigin: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Negara Tujuan / Import Destination</Label><Select value={buyerForm.importDestination} onValueChange={(value) => setBuyerForm({ ...buyerForm, importDestination: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{marketOptions.map((market) => <SelectItem key={market} value={market}>{market}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2 md:col-span-2"><Label>Spesifikasi Kualitas</Label><Textarea value={buyerForm.qualityRequirements} onChange={(e) => setBuyerForm({ ...buyerForm, qualityRequirements: e.target.value })} /></div>
                    </div>
                  </section>

                  <div className="rounded-lg border border-secondary/30 bg-secondary/5 p-4">
                    <p className="font-medium flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" /> Recommendation ready</p>
                    <p className="mt-2 text-sm text-muted-foreground">Kebutuhan simplisia Buyer akan dipakai untuk rekomendasi dashboard, shortcut pencarian marketplace, dan product request.</p>
                  </div>

                  <Button className="btn-web3 w-full" onClick={handleBuyerSubmit}>Submit Buyer KYC</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default KYCOnboarding;
