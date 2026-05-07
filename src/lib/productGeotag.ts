import { formatCoordinate } from "@/lib/complianceUtils";
import type { SellerAdministrativeProfile } from "@/types/compliance";

export interface ProductGeotagDisplay {
  farmLocation: string;
  coordinateLabel: string;
  latitude: number;
  longitude: number;
  mapUrl: string;
}

export const getSellerProductGeotag = (
  sellerProfile: SellerAdministrativeProfile | null,
): ProductGeotagDisplay | null => {
  const coordinates = sellerProfile?.farmerIdentity.coordinates;

  if (!sellerProfile || !coordinates) {
    return null;
  }

  const { latitude, longitude } = coordinates;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    farmLocation: sellerProfile.farmerIdentity.farmLocation,
    coordinateLabel: formatCoordinate(latitude, longitude),
    latitude,
    longitude,
    mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
  };
};
