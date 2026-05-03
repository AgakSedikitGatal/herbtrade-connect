export type UserRole = 'general' | 'buyer' | 'seller';
export type TradeRole = Exclude<UserRole, 'general'>;
export type KycStatus = 'not_started' | 'draft' | 'pending' | 'verified' | 'rejected';
export type LegalEntityType = 'individual' | 'business_entity';

export interface BaseKycProfile {
  legalEntityType: LegalEntityType;
  legalName: string;
  businessEntityName: string;
  nibNumber: string;
  nikOrNpwp: string;
  registeredAddress: string;
  phone: string;
  email: string;
  submittedAt: string;
  updatedAt: string;
}

export interface SellerKycProfile extends BaseKycProfile {
  role: 'seller';
  landName: string;
  landLocation: string;
  landAreaHectares: number;
  geotagLatitude: number;
  geotagLongitude: number;
  geotagPhotoName: string;
  simplisiaOffered: string[];
  cultivationMethod: string;
  monthlyCapacityKg: number;
  businessLicenseNotes: string;
}

export interface BuyerKycProfile extends BaseKycProfile {
  role: 'buyer';
  simplisiaNeeded: string[];
  purchaseVolumeKg: number;
  preferredOrigin: string;
  qualityRequirements: string;
  importDestination: string;
}

export type KycProfile = SellerKycProfile | BuyerKycProfile;

export interface User {
  name: string;
  email: string;
  company: string;
  country: string;
  role: UserRole;
  kycStatus: KycStatus;
  kycProfile?: KycProfile;
}

const AUTH_KEY = 'herblocx_user';

const normalizeUser = (rawUser: Partial<User>): User => {
  const role = rawUser.role ?? 'general';
  const hasLegacyTradeRole = role === 'buyer' || role === 'seller';

  return {
    name: rawUser.name || rawUser.email?.split('@')[0] || 'HerBlocX User',
    email: rawUser.email || '',
    company: rawUser.company || 'HerBlocX User',
    country: rawUser.country || 'Indonesia',
    role,
    kycStatus: rawUser.kycStatus || (hasLegacyTradeRole ? 'verified' : 'not_started'),
    kycProfile: rawUser.kycProfile,
  };
};

export const authService = {
  login: (user: User) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(normalizeUser(user)));
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;

    try {
      return normalizeUser(JSON.parse(data));
    } catch (error) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  },

  updateUser: (updates: Partial<User>): User | null => {
    const currentUser = authService.getUser();
    if (!currentUser) return null;

    const updatedUser = normalizeUser({ ...currentUser, ...updates });
    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  submitKyc: (role: TradeRole, profile: KycProfile): User | null => {
    const currentUser = authService.getUser();
    if (!currentUser) return null;

    const updatedUser = normalizeUser({
      ...currentUser,
      role,
      company: profile.businessEntityName || profile.legalName || currentUser.company,
      kycStatus: 'pending',
      kycProfile: profile,
    });

    localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getUser();
  },

  getUserRole: (): UserRole | null => {
    const user = authService.getUser();
    return user?.role || null;
  },

  isGeneralAccount: (): boolean => {
    return authService.getUser()?.role === 'general';
  },

  hasSubmittedKyc: (role?: TradeRole): boolean => {
    const user = authService.getUser();
    if (!user || user.role === 'general') return false;
    if (role && user.role !== role) return false;
    return ['pending', 'verified'].includes(user.kycStatus);
  },

  canTransactAsBuyer: (): boolean => {
    const user = authService.getUser();
    return !!user && user.role === 'buyer' && ['pending', 'verified'].includes(user.kycStatus);
  },

  canTransactAsSeller: (): boolean => {
    const user = authService.getUser();
    return !!user && user.role === 'seller' && ['pending', 'verified'].includes(user.kycStatus);
  },

  getKycStatusLabel: (status?: KycStatus): string => {
    const labels: Record<KycStatus, string> = {
      not_started: 'KYC not started',
      draft: 'KYC draft',
      pending: 'KYC submitted',
      verified: 'KYC verified',
      rejected: 'KYC rejected',
    };

    return labels[status || 'not_started'];
  },
};
