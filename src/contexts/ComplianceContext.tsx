import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { createDefaultSellerProfile, createProductBatch, createVerificationEntry } from "@/lib/complianceUtils";
import { buildJourneyUrl, generateQRCodeDataUrl } from "@/lib/qrCode";
import type {
  ComplianceContextState,
  ProductBatch,
  SellerAdministrativeProfile,
  VerificationHistoryEntry,
} from "@/types/compliance";

interface ComplianceContextValue extends ComplianceContextState {
  saveSellerProfile: (profile: SellerAdministrativeProfile) => void;
  createBatch: (input: Partial<ProductBatch>) => Promise<ProductBatch>;
  updateBatch: (batch: ProductBatch) => void;
  getBatchByCode: (batchCode: string) => ProductBatch | undefined;
  recordVerification: (batch: ProductBatch, role: VerificationHistoryEntry["verifierRole"]) => VerificationHistoryEntry;
  resetComplianceDemoData: () => void;
}

const STORAGE_KEY = "herblocx_compliance_state";

const buildInitialState = (): ComplianceContextState => {
  const profile = createDefaultSellerProfile();
  const firstBatch = createProductBatch(profile, {
    batchCode: "HBX-260501",
    productName: "Premium Organic Ginger Simplisia",
    simplisiaType: "Jahe",
    quantityKg: 1200,
    exportDestination: "European Union",
    qrTargetUrl: typeof window === "undefined" ? "/journey/HBX-260501" : `${window.location.origin}/journey/HBX-260501`,
  });

  return {
    sellerProfile: profile,
    batches: [firstBatch],
    verificationHistory: [],
  };
};

const loadState = (): ComplianceContextState => {
  const fallback = buildInitialState();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved) as Partial<ComplianceContextState>;

    return {
      sellerProfile: parsed.sellerProfile ?? fallback.sellerProfile,
      batches: parsed.batches?.length ? parsed.batches : fallback.batches,
      verificationHistory: parsed.verificationHistory ?? [],
    };
  } catch (error) {
    console.error("Failed to load compliance state", error);
    return fallback;
  }
};

const ComplianceContext = createContext<ComplianceContextValue | undefined>(undefined);

export const ComplianceProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ComplianceContextState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveSellerProfile = (profile: SellerAdministrativeProfile) => {
    setState((previous) => ({
      ...previous,
      sellerProfile: {
        ...profile,
        completionStatus: "complete",
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const createBatch = async (input: Partial<ProductBatch>) => {
    if (!state.sellerProfile) {
      throw new Error("Seller administrative profile must be completed before creating QR batch records.");
    }

    const rawBatch = createProductBatch(state.sellerProfile, input);
    const qrTargetUrl = buildJourneyUrl(rawBatch.batchCode);
    const qrCodeDataUrl = await generateQRCodeDataUrl(qrTargetUrl);
    const batch: ProductBatch = {
      ...rawBatch,
      qrTargetUrl,
      qrCodeDataUrl,
    };

    setState((previous) => ({
      ...previous,
      batches: [batch, ...previous.batches.filter((existing) => existing.batchCode !== batch.batchCode)],
    }));

    return batch;
  };

  const updateBatch = (batch: ProductBatch) => {
    setState((previous) => ({
      ...previous,
      batches: previous.batches.map((existing) => (existing.id === batch.id ? batch : existing)),
    }));
  };

  const getBatchByCode = (batchCode: string) => {
    return state.batches.find((batch) => batch.batchCode.toLowerCase() === batchCode.toLowerCase());
  };

  const recordVerification = (batch: ProductBatch, role: VerificationHistoryEntry["verifierRole"]) => {
    const verification = createVerificationEntry(batch, role);

    setState((previous) => ({
      ...previous,
      batches: previous.batches.map((existing) =>
        existing.id === batch.id ? { ...existing, scanCount: existing.scanCount + 1 } : existing,
      ),
      verificationHistory: [verification, ...previous.verificationHistory],
    }));

    return verification;
  };

  const resetComplianceDemoData = () => {
    setState(buildInitialState());
  };

  const value = useMemo<ComplianceContextValue>(
    () => ({
      ...state,
      saveSellerProfile,
      createBatch,
      updateBatch,
      getBatchByCode,
      recordVerification,
      resetComplianceDemoData,
    }),
    [state],
  );

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
};

export const useCompliance = () => {
  const context = useContext(ComplianceContext);

  if (!context) {
    throw new Error("useCompliance must be used within a ComplianceProvider");
  }

  return context;
};
