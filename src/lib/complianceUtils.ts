import { addressFromSeed, hashFromSeed, numberFromSeed, shortenHash } from "@/lib/mockChain";
import type {
  CertificationRecord,
  FarmerDigitalIdentity,
  FarmPolygonPoint,
  ProductBatch,
  SellerAdministrativeProfile,
  SimplisiaType,
  VerificationHistoryEntry,
} from "@/types/compliance";

export const SIMPLISIA_OPTIONS: SimplisiaType[] = [
  "Jahe",
  "Kunyit",
  "Temulawak",
  "Lengkuas",
  "Kayu Manis",
  "Andrographis",
  "Pala",
  "Black Pepper",
  "Other",
];

export const EXPORT_DOCUMENT_LABELS = {
  buyer_invitation_letter: "Buyer Invitation Letter",
  bill_of_lading: "Bill of Lading",
  commercial_invoice: "Commercial Invoice",
  packing_list: "Packing List",
  certificate_of_origin: "Certificate of Origin",
  phytosanitary_certificate: "Phytosanitary Certificate Template",
} as const;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const calculateDistanceKm = (
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
) => {
  const earthRadiusKm = 6371;
  const latDistance = toRadians(second.latitude - first.latitude);
  const lonDistance = toRadians(second.longitude - first.longitude);
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const protectedReferenceZones = [
  { name: "Ujung Kulon Conservation Buffer", latitude: -6.746, longitude: 105.332, radiusKm: 20 },
  { name: "Gunung Leuser Buffer", latitude: 3.792, longitude: 97.346, radiusKm: 35 },
  { name: "Kerinci Seblat Buffer", latitude: -2.416, longitude: 101.483, radiusKm: 30 },
  { name: "Lore Lindu Buffer", latitude: -1.416, longitude: 120.193, radiusKm: 25 },
];

export const assessGeoRisk = (latitude: number, longitude: number) => {
  const nearestZone = protectedReferenceZones
    .map((zone) => ({ ...zone, distanceKm: calculateDistanceKm({ latitude, longitude }, zone) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];

  if (!nearestZone) {
    return {
      protectedZoneStatus: "clear" as const,
      deforestationRisk: "low" as const,
      landUseChangeStatus: "No conservation reference zone detected near submitted coordinates.",
    };
  }

  if (nearestZone.distanceKm <= nearestZone.radiusKm) {
    return {
      protectedZoneStatus: "flagged" as const,
      deforestationRisk: "high" as const,
      landUseChangeStatus: `Manual review required: submitted coordinate is within ${nearestZone.radiusKm} km of ${nearestZone.name}.`,
    };
  }

  if (nearestZone.distanceKm <= nearestZone.radiusKm + 20) {
    return {
      protectedZoneStatus: "review_required" as const,
      deforestationRisk: "medium" as const,
      landUseChangeStatus: `Additional land-use evidence recommended: nearest conservation buffer is ${nearestZone.distanceKm.toFixed(1)} km away.`,
    };
  }

  return {
    protectedZoneStatus: "clear" as const,
    deforestationRisk: "low" as const,
    landUseChangeStatus: `Pre-screen clear in demo reference model: nearest conservation buffer is ${nearestZone.distanceKm.toFixed(1)} km away.`,
  };
};

export const buildFarmPolygon = (latitude: number, longitude: number, landAreaHectares: number): FarmPolygonPoint[] => {
  const offset = Math.max(0.002, Math.sqrt(Math.max(landAreaHectares, 1)) * 0.0015);

  return [
    { label: "North West", latitude: latitude + offset, longitude: longitude - offset },
    { label: "North East", latitude: latitude + offset, longitude: longitude + offset },
    { label: "South East", latitude: latitude - offset, longitude: longitude + offset },
    { label: "South West", latitude: latitude - offset, longitude: longitude - offset },
  ];
};

export const createCertification = (
  seed: string,
  type: CertificationRecord["type"],
  certifyingBody: string,
  status: CertificationRecord["status"] = "verified",
): CertificationRecord => {
  const year = new Date().getFullYear();

  return {
    id: `CERT-${numberFromSeed(`${seed}-${type}`, 1000, 9999)}`,
    type,
    certificateNumber: `${type.toUpperCase()}-${year}-${numberFromSeed(seed + certifyingBody, 10000, 99999)}`,
    certifyingBody,
    issuedAt: `${year - 1}-06-15`,
    expiresAt: `${year + 1}-06-14`,
    status,
    inspectionNotes: `${type} certificate verified through HerblocX document registry workflow.`,
    txHash: hashFromSeed(`${seed}-${type}-certificate`),
  };
};

export const createFarmerIdentity = (input: {
  farmerName: string;
  identityNumber: string;
  farmName: string;
  farmLocation: string;
  latitude: number;
  longitude: number;
  landAreaHectares: number;
  plantsCultivated: SimplisiaType[];
  cultivationMethod: FarmerDigitalIdentity["cultivationMethod"];
  certifications?: CertificationRecord[];
}): FarmerDigitalIdentity => {
  const seed = `${input.identityNumber}-${input.farmName}-${input.latitude}-${input.longitude}`;
  const geoRisk = assessGeoRisk(input.latitude, input.longitude);

  return {
    farmerId: `FRM-${numberFromSeed(seed, 100000, 999999)}`,
    farmerName: input.farmerName,
    identityNumber: input.identityNumber,
    farmName: input.farmName,
    farmLocation: input.farmLocation,
    coordinates: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    polygon: buildFarmPolygon(input.latitude, input.longitude, input.landAreaHectares),
    landAreaHectares: input.landAreaHectares,
    plantsCultivated: input.plantsCultivated,
    cultivationMethod: input.cultivationMethod,
    protectedZoneStatus: geoRisk.protectedZoneStatus,
    deforestationRisk: geoRisk.deforestationRisk,
    landUseChangeStatus: geoRisk.landUseChangeStatus,
    certifications: input.certifications ?? [
      createCertification(seed, "Organic", "Control Union Indonesia"),
      createCertification(seed, "GAP", "Indonesian Ministry of Agriculture"),
      createCertification(seed, "Halal", "BPJPH"),
    ],
    createdAt: new Date().toISOString(),
    txHash: hashFromSeed(`${seed}-farmer-identity`),
  };
};

export const createDefaultSellerProfile = (): SellerAdministrativeProfile => {
  const farmerIdentity = createFarmerIdentity({
    farmerName: "Siti Aminah",
    identityNumber: "3302155508780004",
    farmName: "Kebun Rempah Sindoro",
    farmLocation: "Temanggung, Central Java, Indonesia",
    latitude: -7.3166,
    longitude: 110.1747,
    landAreaHectares: 4.8,
    plantsCultivated: ["Jahe", "Kunyit", "Temulawak"],
    cultivationMethod: "Organic",
  });

  return {
    id: `SELLER-${numberFromSeed("default-seller-profile", 1000, 9999)}`,
    sellerType: "business_entity",
    nik: "3302155508780004",
    npwp: "09.876.543.2-521.000",
    legalName: "Siti Aminah",
    businessEntityName: "PT Herba Nusantara Lestari",
    email: "compliance@herbanusantara.id",
    phone: "+62 812-3456-7890",
    registeredAddress: "Jl. Raya Parakan No. 18, Temanggung, Central Java, Indonesia",
    exportLicenseNumber: "ET-HERBAL-2026-0188",
    nibNumber: "9120304050607",
    hsCode: "0910.11",
    destinationMarkets: ["European Union", "United States", "Japan"],
    simplisiaTypes: ["Jahe", "Kunyit", "Temulawak"],
    bankName: "Bank Mandiri",
    bankAccountNumber: "1380012345678",
    bankAccountName: "PT Herba Nusantara Lestari",
    farmerIdentity,
    completionStatus: "complete",
    updatedAt: new Date().toISOString(),
  };
};

const createCustodyNode = (seed: string, label: string, handler: string, location: string, dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);

  return {
    id: `CUST-${numberFromSeed(seed + label, 1000, 9999)}`,
    label,
    handler,
    location,
    timestamp: date.toISOString(),
    txHash: hashFromSeed(`${seed}-${label}`),
  };
};

export const createProductBatch = (
  profile: SellerAdministrativeProfile,
  input?: Partial<ProductBatch>,
): ProductBatch => {
  const seed = `${profile.id}-${input?.productName ?? "Organic Ginger"}-${Date.now()}`;
  const batchCode = input?.batchCode ?? `HBX-${numberFromSeed(seed, 100000, 999999)}`;
  const simplisiaType = input?.simplisiaType ?? profile.simplisiaTypes[0] ?? "Jahe";
  const productName = input?.productName ?? `Premium ${simplisiaType} Simplisia`;
  const txHash = hashFromSeed(`${seed}-${batchCode}`);
  const qrTargetUrl = input?.qrTargetUrl ?? `/journey/${batchCode}`;
  const organicCertificate = profile.farmerIdentity.certifications.find((cert) => cert.type === "Organic" || cert.type === "JAS");

  return {
    id: `BATCH-${numberFromSeed(seed, 100000, 999999)}`,
    batchCode,
    productName,
    simplisiaType,
    farmerId: profile.farmerIdentity.farmerId,
    harvestDate: input?.harvestDate ?? new Date().toISOString().split("T")[0],
    processingFacility: input?.processingFacility ?? "HerblocX GMP Processing Facility - Semarang",
    processingDate: input?.processingDate ?? new Date().toISOString().split("T")[0],
    exportDestination: input?.exportDestination ?? profile.destinationMarkets[0] ?? "European Union",
    quantityKg: input?.quantityKg ?? 1200,
    packaging: input?.packaging ?? "25 kg food-grade kraft bags, palletized and shrink-wrapped",
    shippingTimeline: input?.shippingTimeline ?? [
      createCustodyNode(seed, "Farm Harvest", profile.farmerIdentity.farmerName, profile.farmerIdentity.farmLocation, -7),
      createCustodyNode(seed, "Primary Drying", "Village Post-Harvest Unit", "Temanggung, Central Java", -5),
      createCustodyNode(seed, "GMP Processing", "HerblocX GMP Processing Facility", "Semarang, Central Java", -2),
      createCustodyNode(seed, "Export Consolidation", "PT Herba Nusantara Lestari", "Tanjung Emas Port, Semarang", 0),
    ],
    qualityTests: input?.qualityTests ?? [
      {
        parameter: "Moisture Content",
        result: "8.4%",
        standard: "Max 10.0%",
        labName: "SIG Laboratory Indonesia",
        testedAt: new Date().toISOString().split("T")[0],
        txHash: hashFromSeed(`${seed}-moisture`),
      },
      {
        parameter: "Heavy Metals",
        result: "Pass",
        standard: "Codex / importing-country limit",
        labName: "SIG Laboratory Indonesia",
        testedAt: new Date().toISOString().split("T")[0],
        txHash: hashFromSeed(`${seed}-heavy-metals`),
      },
      {
        parameter: "Microbiology",
        result: "Pass",
        standard: "TPC, yeast, mold within specification",
        labName: "SIG Laboratory Indonesia",
        testedAt: new Date().toISOString().split("T")[0],
        txHash: hashFromSeed(`${seed}-microbiology`),
      },
    ],
    eudr: input?.eudr ?? {
      deforestationCutoff: "2020-12-31",
      geoTaggedProof: `Farm polygon committed for ${profile.farmerIdentity.farmName}; ${profile.farmerIdentity.landUseChangeStatus}`,
      landUseChangeData: profile.farmerIdentity.landUseChangeStatus,
      polygonTxHash: hashFromSeed(`${seed}-eudr-polygon`),
      riskLevel: profile.farmerIdentity.deforestationRisk,
    },
    fda: input?.fda ?? {
      traceabilityLotCode: `FDA-${batchCode}`,
      criticalTrackingEvents: [
        { label: "Growing Area", value: profile.farmerIdentity.farmLocation, txHash: hashFromSeed(`${seed}-fda-growing`) },
        { label: "Harvest Event", value: new Date().toISOString().split("T")[0], txHash: hashFromSeed(`${seed}-fda-harvest`) },
        { label: "Transformation Event", value: "Drying, sorting, slicing, packaging", txHash: hashFromSeed(`${seed}-fda-transform`) },
        { label: "Shipping Event", value: "Export consolidation with handler identification", txHash: hashFromSeed(`${seed}-fda-ship`) },
      ],
    },
    jas: input?.jas ?? {
      certificateNumber: organicCertificate?.certificateNumber ?? "JAS-DEMO-2026-001",
      certifyingBody: organicCertificate?.certifyingBody ?? "Registered Organic Certifier",
      validityPeriod: organicCertificate ? `${organicCertificate.issuedAt} to ${organicCertificate.expiresAt}` : "2025-06-15 to 2027-06-14",
      inspectionRecords: [
        { label: "Organic Field Inspection", value: "Completed, no critical non-conformity", txHash: hashFromSeed(`${seed}-jas-field`) },
        { label: "Input Material Review", value: "Compliant with organic cultivation declaration", txHash: hashFromSeed(`${seed}-jas-input`) },
        { label: "Post-Harvest Segregation", value: "Organic lots segregated and labelled", txHash: hashFromSeed(`${seed}-jas-segregation`) },
      ],
    },
    qrCodeDataUrl: input?.qrCodeDataUrl,
    qrTargetUrl,
    scanCount: input?.scanCount ?? 0,
    createdAt: new Date().toISOString(),
    txHash,
  };
};

export const createVerificationEntry = (batch: ProductBatch, role: VerificationHistoryEntry["verifierRole"]): VerificationHistoryEntry => ({
  id: `VERIFY-${numberFromSeed(`${batch.id}-${Date.now()}`, 100000, 999999)}`,
  batchId: batch.id,
  batchCode: batch.batchCode,
  productName: batch.productName,
  verifiedAt: new Date().toISOString(),
  verifierRole: role,
  complianceSummary: `Verified ${batch.productName} against EUDR, FDA traceability, and JAS certification sections.`,
  reportTxHash: hashFromSeed(`${batch.id}-verification-${Date.now()}`),
});

export const getExplorerUrl = (txHash: string) => `https://etherscan.io/tx/${txHash}`;

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const formatCoordinate = (latitude: number, longitude: number) => `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

export const shortenTx = (txHash: string) => shortenHash(txHash);

export const publicAddressForFarmer = (farmerId: string) => addressFromSeed(farmerId);
