export type SimplisiaType =
  | "Jahe"
  | "Kunyit"
  | "Temulawak"
  | "Lengkuas"
  | "Kayu Manis"
  | "Andrographis"
  | "Pala"
  | "Black Pepper"
  | "Other";

export type CultivationMethod = "Organic" | "Conventional" | "Agroforestry" | "Wild Harvested";

export type CertificationType = "Organic" | "GAP" | "Halal" | "BPOM" | "JAS" | "Phytosanitary" | "Other";

export type VerificationStatus = "verified" | "pending" | "expired" | "rejected";

export type ExportDocumentType =
  | "buyer_invitation_letter"
  | "bill_of_lading"
  | "commercial_invoice"
  | "packing_list"
  | "certificate_of_origin"
  | "phytosanitary_certificate";

export interface FarmCoordinate {
  latitude: number;
  longitude: number;
}

export interface FarmPolygonPoint extends FarmCoordinate {
  label: string;
}

export interface CertificationRecord {
  id: string;
  type: CertificationType;
  certificateNumber: string;
  certifyingBody: string;
  issuedAt: string;
  expiresAt: string;
  status: VerificationStatus;
  inspectionNotes: string;
  txHash: string;
}

export interface FarmerDigitalIdentity {
  farmerId: string;
  farmerName: string;
  identityNumber: string;
  farmName: string;
  farmLocation: string;
  coordinates: FarmCoordinate;
  polygon: FarmPolygonPoint[];
  landAreaHectares: number;
  plantsCultivated: SimplisiaType[];
  cultivationMethod: CultivationMethod;
  protectedZoneStatus: "clear" | "review_required" | "flagged";
  deforestationRisk: "low" | "medium" | "high";
  landUseChangeStatus: string;
  certifications: CertificationRecord[];
  createdAt: string;
  txHash: string;
}

export interface SellerAdministrativeProfile {
  id: string;
  sellerType: "individual" | "business_entity";
  nik: string;
  npwp: string;
  legalName: string;
  businessEntityName: string;
  email: string;
  phone: string;
  registeredAddress: string;
  exportLicenseNumber: string;
  nibNumber: string;
  hsCode: string;
  destinationMarkets: string[];
  simplisiaTypes: SimplisiaType[];
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  farmerIdentity: FarmerDigitalIdentity;
  completionStatus: "draft" | "complete";
  updatedAt: string;
}

export interface QualityTestResult {
  parameter: string;
  result: string;
  standard: string;
  labName: string;
  testedAt: string;
  txHash: string;
}

export interface ChainOfCustodyNode {
  id: string;
  label: string;
  handler: string;
  location: string;
  timestamp: string;
  txHash: string;
}

export interface ComplianceDataPoint {
  label: string;
  value: string;
  txHash: string;
}

export interface ProductBatch {
  id: string;
  batchCode: string;
  productName: string;
  simplisiaType: SimplisiaType;
  farmerId: string;
  harvestDate: string;
  processingFacility: string;
  processingDate: string;
  exportDestination: string;
  quantityKg: number;
  packaging: string;
  shippingTimeline: ChainOfCustodyNode[];
  qualityTests: QualityTestResult[];
  eudr: {
    deforestationCutoff: string;
    geoTaggedProof: string;
    landUseChangeData: string;
    polygonTxHash: string;
    riskLevel: "low" | "medium" | "high";
  };
  fda: {
    traceabilityLotCode: string;
    criticalTrackingEvents: ComplianceDataPoint[];
  };
  jas: {
    certificateNumber: string;
    certifyingBody: string;
    validityPeriod: string;
    inspectionRecords: ComplianceDataPoint[];
  };
  qrCodeDataUrl?: string;
  qrTargetUrl: string;
  scanCount: number;
  createdAt: string;
  txHash: string;
}

export interface VerificationHistoryEntry {
  id: string;
  batchId: string;
  batchCode: string;
  productName: string;
  verifiedAt: string;
  verifierRole: "buyer" | "public" | "seller";
  complianceSummary: string;
  reportTxHash: string;
}

export interface ComplianceContextState {
  sellerProfile: SellerAdministrativeProfile | null;
  batches: ProductBatch[];
  verificationHistory: VerificationHistoryEntry[];
}
