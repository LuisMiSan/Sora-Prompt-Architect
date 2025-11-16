

export interface PromptParameters {
  shotType: string;
  cameraAngle: string;
  cameraMovement: string;
  lens: string;
  composition: string;
  lighting: string;
  style: string;
  filmQuality: string;
  pacing: string;
  timeOfDay: string;
  location: string;
  depthOfField: string;
  texture: string;
  colorPalette: string;
  genre: string;
}

export interface Shot {
  id: string;
  description: string;
  parameters: PromptParameters;
  constraints: string;
}

export interface PhysicsData {
  weightAndRigidity: string;
  materialInteractions: string;
  environmentalForces: string;
}

export interface AudioData {
  dialogue: string;
  soundEffects: string;
  music: string;
}

export interface CameraEffectsData {
  depthOfField: string;
  cameraMovement: string;
  cameraAnimation: string;
  shotType?: string;
  cameraAngle?: string;
  lens?: string;
  composition?: string;
}

export interface PromptData {
  sceneDescription: string;
  shots: Shot[];
  cameos: string;
  cameoDescription: string;
  audio: AudioData;
  physics: PhysicsData;
  cameraEffects?: CameraEffectsData;
  aspectRatio: string;
  cameoConsent: boolean;
}

export interface PromptVersion extends PromptData {
  prompt: string;
  versionNotes?: string;
  createdAt: string;
}

export interface SavedPrompt {
  id: string;
  versions: PromptVersion[];
  visibility: 'public' | 'private';
}