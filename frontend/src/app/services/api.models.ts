export type ChatRoomType = 'SEGUIMIENTO';
export type ChatSenderRole = 'MECANICO' | 'USUARIO';
export type AuthUserRole = 'USER' | 'TALLER' | 'ADMIN';

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: AuthUserRole;
}

export interface AuthUserResponse {
  id: number;
  fullName: string;
  email: string;
  role: AuthUserRole;
  avatarUrl: string;
  createdAt: string;
  city?: string;
  postalCode?: string;
}

export interface WorkshopApplicationRequest {
  fullName: string;
  email: string;
  password: string;
  workshopName: string;
  address: string;
  phone: string;
  schedule: string;
  photoUrl: string;
  vehicleLimit: number;
}

export type WorkshopApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WorkshopApplicationResponse {
  id: number;
  fullName: string;
  email: string;
  workshopName: string;
  address: string;
  phone: string;
  schedule: string;
  photoUrl: string;
  vehicleLimit: number;
  status: WorkshopApplicationStatus;
  approvedWorkshopId: number | null;
  approvedMechanicId: number | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ChatJoinResponse {
  roomType: ChatRoomType;
  participantId: number;
  activeUsers: number;
  maxUsers: number;
  joined: boolean;
}

export interface ChatMessageRequest {
  participantId: number;
  roomType: ChatRoomType;
  senderRole: ChatSenderRole;
  sessionUuid: string;
  commentText: string;
}

export interface ChatMessageResponse {
  id: number;
  roomType: ChatRoomType;
  participantId: number;
  sessionUuid: string;
  senderRole: ChatSenderRole;
  commentText: string;
  wordCount: number;
  readByUser: boolean;
  createdAt: string;
}

export interface RepairVehicleMock {
  id: number;
  name: string;
  plate: string;
  status: string;
}

export interface Workshop {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  schedule: string;
  photoUrl: string;
  vehicleLimit: number;
  activeVehicles: number;
  mechanicId: number;
  mechanicName: string;
  mechanicAvatar: string;
  latitude: number;
  longitude: number;
  selectedByClient: boolean;
  sessionUuid: string | null;
  vehiclesInRepair: RepairVehicleMock[];
}

export interface WorkshopSelectionResponse {
  workshop: Workshop;
  tracking: MechanicClientTracking;
}

export interface MechanicClientTracking {
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  carInfo: string;
  problemDescription: string;
  aiDiagnosis: string;
  recommendedParts: DiagnosedPart[];
  estimatedPrice: number | null;
  createdAt: string;
  acceptedAt: string | null;
  inProgressAt: string | null;
  fixedAt: string | null;
  status: string;
  latestUpdate?: string;
  sessionUuid: string;
  tallerAssignmentId: number;
}

// ── Vehículos ──────────────────────────────────────────────────────────────

export type EngineType = 'PETROL' | 'DIESEL' | 'BEV' | 'HEV' | 'PHEV' | 'REEV';
export type TransmissionType = 'MT' | 'AT' | 'CVT' | 'iMT' | 'DCT' | 'eCVT' | 'DSG';

export interface VehicleModelSummary {
  id: number;
  name: string;
}

export interface VehicleVariant {
  id: number;
  modelName: string;
  transmission: TransmissionType | null;
  engineName: string | null;
  engineType: EngineType | null;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  city?: string;
  postalCode?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VehicleSearchContext {
  brand: string | null;
  modelId: number | null;
  modelName: string | null;
  variantId: number | null;
  variantName: string | null;
  engineType: EngineType | null;
  transmission: TransmissionType | null;
  year: number | null;
}

// ── Autodiagnóstico (IA) ───────────────────────────────────────────────────

export interface AutodiagnosisRequest {
  clientId: number;
  personalVehicleId: number;
  vehicleModelId: number;
  symptoms: string[];
  freeText: string;
  year: number | null;
  engineType: EngineType | null;
  transmission: TransmissionType | null;
}

export interface DiagnosedPart {
  idProduct: number;
  name: string;
  description: string;
  lowRangePrice: number | null;
  highRangePrice: number | null;
  image: string | null;
}

export interface AutodiagnosisResponse {
  diagnosis: string;
  confidence: number;
  explanation: string;
  suggestedParts: DiagnosedPart[];
  unresolvedPartNames: string[];
}

export interface PersonalVehicleResponse {
  id: number;
  ownerId: number;
  vehicleModelId: number;
  brand: string | null;
  vehicleName: string | null;
  modelName: string | null;
  year: number | null;
  engineType: EngineType | null;
  transmission: TransmissionType | null;
  plate: string | null;
  vin: string | null;
  buildDate: string | null;
}

export interface CreatePersonalVehicleRequest {
  ownerId: number;
  vehicleModelId: number;
  plate: string | null;
  vin: string | null;
  buildDate: string | null;
}
