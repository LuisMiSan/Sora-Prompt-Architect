

import { GoogleGenAI, Type } from "@google/genai";
import { Shot, PromptParameters } from '../types';
import { SceneData } from "../App";
import { PROMPT_OPTIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatSceneForPrompt(data: SceneData): string {
  let formattedString = `SCENE DESCRIPTION: ${data.sceneDescription}\n`;
  formattedString += `ASPECT RATIO: ${data.aspectRatio}\n\n`;

  if (data.cameraEffects && (data.cameraEffects.cameraMovement !== 'none' || data.cameraEffects.depthOfField !== 'natural' || (data.cameraEffects.cameraAnimation && data.cameraEffects.cameraAnimation !== 'none'))) {
    formattedString += `SCENE-WIDE CAMERA EFFECTS (Defaults for all shots unless specified otherwise):\n`;
    if (data.cameraEffects.cameraMovement !== 'none') {
        formattedString += `  - Camera Movement: ${data.cameraEffects.cameraMovement.replace(/-/g, ' ')}\n`;
    }
    if (data.cameraEffects.depthOfField !== 'natural') {
        formattedString += `  - Depth of Field: ${data.cameraEffects.depthOfField.replace(/-/g, ' ')}\n`;
    }
    if (data.cameraEffects.cameraAnimation && data.cameraEffects.cameraAnimation !== 'none') {
        formattedString += `  - Camera Animation: ${data.cameraEffects.cameraAnimation.replace(/-/g, ' ')}\n`;
    }
    formattedString += `\n`;
  }

  if (data.cameos.trim()) {
    formattedString += `CHARACTERS/CAMEOS: ${data.cameos}\n`;
    formattedString += `CAMEO CONSENT: ${data.cameoConsent ? 'User has acknowledged consent requirements.' : 'Consent not specified.'}\n\n`;
  }

  const { audio, physics } = data;
  let audioDesign = '';
  if (audio.dialogue.trim()) audioDesign += `  - Dialogue: ${audio.dialogue}\n`;
  if (audio.soundEffects.trim()) audioDesign += `  - SFX: ${audio.soundEffects}\n`;
  if (audio.music.trim()) audioDesign += `  - Music: ${audio.music}\n`;
  if (audioDesign) {
    formattedString += `SOUND DESIGN:\n${audioDesign}\n`;
  }

  let physicsEngine = '';
  if (physics.weightAndRigidity.trim()) physicsEngine += `  - Weight & Rigidity: ${physics.weightAndRigidity}\n`;
  if (physics.materialInteractions.trim()) physicsEngine += `  - Material Interactions: ${physics.materialInteractions}\n`;
  if (physics.environmentalForces.trim()) physicsEngine += `  - Environmental Forces: ${physics.environmentalForces}\n`;
  if (physicsEngine) {
    formattedString += `PHYSICS & INTERACTIONS:\n${physicsEngine}\n`;
  }

  formattedString += `--- SHOT LIST ---\n\n`;

  data.shots.forEach((shot, index) => {
    formattedString += `SHOT ${index + 1}:\n`;
    if (shot.description.trim()) {
      formattedString += `  Description: ${shot.description}\n`;
    }
     if (shot.constraints.trim()) {
      formattedString += `  Constraints: ${shot.constraints}\n`;
    }
    
    const params = Object.entries(shot.parameters)
      .map(([key, value]) => {
        if (value && value !== 'none' && value !== 'unspecified' && value !== 'natural') {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
          const formattedValue = value.replace(/-/g, ' ');
          return `    - ${formattedKey}: ${formattedValue}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n');
      
    formattedString += `  Parameters:\n${params}\n\n`;
  });

  return formattedString;
}

export const generatePrompt = async (data: SceneData, language: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const formattedScene = formatSceneForPrompt(data);

  const languageMap: { [key: string]: string } = {
    en: 'English',
    es: 'Spanish',
  };
  const responseLanguage = languageMap[language] || 'English';

  const systemInstruction = `You are an expert director of photography and prompt engineer for advanced text-to-video AI models like Sora. Your task is to interpret a structured "shooting script" containing a scene description, characters, sound design, physics, consent information, and a detailed shot list with specific constraints and genres. Synthesize all this information into a single, cohesive, and vivid paragraph. The final prompt should be rich with descriptive detail, capturing the mood, atmosphere, physical interactions, and cinematic qualities specified. Do not add any preamble, explanation, or markdown formatting; just return the final, camera-ready prompt itself. Your final response MUST be in ${responseLanguage}.`;

  const userPrompt = formattedScene;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};

export const getSuggestions = async (data: SceneData, language: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const formattedScene = formatSceneForPrompt(data);
  
  const languageMap: { [key: string]: string } = {
    en: 'English',
    es: 'Spanish',
  };
  const responseLanguage = languageMap[language] || 'English';

  const systemInstruction = `You are a creative assistant and expert filmmaker. Your task is to analyze the provided "shooting script" and offer 3-5 concise, actionable suggestions for improvement. Your suggestions must be highly targeted and context-aware. Pay close attention to the selected parameters for each shot, such as genre, style, lighting, and camera movement. For example, if the genre is 'horror', suggest darker lighting, unsettling camera angles like a dutch-angle, or slow, creeping camera movements. If the style is 'style-of-wes-anderson', suggest symmetrical compositions or a specific pastel color palette. The goal is to provide specific advice that enhances the chosen aesthetic, not generic feedback. Focus on enhancing mood, visual interest, narrative clarity, or making better use of cinematic techniques that align with the user's intent. Frame your feedback as constructive advice. Present your suggestions as a simple, unnumbered, bulleted list using "-" for each point. Do not add any preamble or conclusion. Your response MUST be in ${responseLanguage}.`;

  const userPrompt = formattedScene;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    throw new Error("Failed to get suggestions from the API.");
  }
};


const parameterProperties = Object.keys(PROMPT_OPTIONS).reduce((acc, key) => {
  if (key !== 'cameraAnimation') { // Exclude cameraAnimation from per-shot parameters
    acc[key as keyof PromptParameters] = { type: Type.STRING, description: `The ${key} for the shot.` };
  }
  return acc;
}, {} as Record<keyof PromptParameters, { type: Type; description: string }>);


const deconstructionSchema = {
    type: Type.OBJECT,
    properties: {
        sceneDescription: {
            type: Type.STRING,
            description: "A detailed, top-level summary of the entire scene, its mood, environment, and core concept.",
        },
        shots: {
            type: Type.ARRAY,
            description: "A list of distinct camera shots that make up the scene.",
            items: {
                type: Type.OBJECT,
                properties: {
                    description: {
                        type: Type.STRING,
                        description: "A specific description of the action and subjects within this single shot.",
                    },
                    constraints: {
                        type: Type.STRING,
                        description: "Any negative prompts or explicit limitations for this shot, e.g., 'no people', 'avoid bright colors'.",
                    },
                    parameters: {
                        type: Type.OBJECT,
                        properties: parameterProperties,
                         description: "Cinematic parameters for this shot. Only use valid values from the provided list.",
                    },
                },
                 required: ["description", "parameters"],
            },
        },
        cameos: {
            type: Type.STRING,
            description: "A comma-separated list of any specific characters, actors, or personas mentioned.",
        },
        audio: {
            type: Type.OBJECT,
            properties: {
                dialogue: { type: Type.STRING, description: "Any spoken dialogue." },
                soundEffects: { type: Type.STRING, description: "Specific sound effects mentioned (e.g., 'rain hitting pavement')." },
                music: { type: Type.STRING, description: "Description of the score or ambient music." },
            },
        },
        physics: {
            type: Type.OBJECT,
            properties: {
                weightAndRigidity: { type: Type.STRING, description: "Descriptions of object weight, stiffness, or physical properties." },
                materialInteractions: { type: Type.STRING, description: "How materials interact (e.g., 'glass shattering')." },
                environmentalForces: { type: Type.STRING, description: "Forces like wind, gravity, etc." },
            },
        },
        cameraEffects: {
            type: Type.OBJECT,
            properties: {
                depthOfField: { type: Type.STRING, description: "The overall depth of field for the scene (e.g., 'shallow', 'deep')." },
                cameraMovement: { type: Type.STRING, description: "A default camera movement for the whole scene (e.g., 'handheld', 'slow-pan-left')." },
                cameraAnimation: { type: Type.STRING, description: "A default camera animation for the whole scene (e.g., 'slow-pan-left', 'handheld-shake')." },
            },
        },
        aspectRatio: {
            type: Type.STRING,
            description: "The aspect ratio, e.g., '16:9', '9:16'. Default to '16:9' if not specified.",
        },
    },
    required: ["sceneDescription", "shots", "cameos", "audio", "physics", "cameraEffects", "aspectRatio"],
};


export const deconstructPrompt = async (promptText: string): Promise<SceneData> => {
    const model = 'gemini-2.5-flash';

    const validOptionsString = Object.entries(PROMPT_OPTIONS)
        .map(([key, values]) => {
            const validValues = values.map(v => v.value).join(', ');
            return `- ${key}: [${validValues}]`;
        })
        .join('\n');

    const systemInstruction = `You are an expert film director and AI prompt engineer. Your task is to deconstruct a user-provided text-to-video prompt into a structured JSON object. Analyze the prompt to identify the main scene, break it down into logical shots, and extract every possible cinematic, audio, and physical parameter.

Your response MUST be a single JSON object that strictly adheres to the provided schema.

Key Instructions:
1.  **sceneDescription**: Create a comprehensive summary of the entire prompt's theme, mood, and setting.
2.  **shots**: This is critical. Identify distinct moments or camera perspectives in the prompt and treat each as a separate shot object in the array. If the prompt describes one continuous action, create a single shot.
3.  **parameters**: For each shot, meticulously fill in the parameter fields. Infer values where possible (e.g., a "dark alley" implies 'low-key' lighting). For each parameter, you MUST choose the closest valid option from the lists provided below. Do not invent new values. If a parameter is not mentioned and cannot be inferred, use a sensible default (e.g., 'medium-shot', 'eye-level', 'none').
4.  **audio & physics**: Extract any mention of sounds, music, dialogue, or physical interactions and place them in the appropriate fields.
5.  **aspectRatio**: Infer if possible (e.g., "vertical video" -> "9:16"). If not specified, default to "16:9".
6.  **cameos**: List any named characters or people.

Here are the valid options for the parameters. YOU MUST USE THESE VALUES:
${validOptionsString}
`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: promptText,
            config: {
                systemInstruction,
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: deconstructionSchema,
            },
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);

        // Basic validation and default-filling to ensure data integrity
        const validatedData: SceneData = {
            cameoConsent: !!parsedJson.cameos, // Assume consent if cameos are extracted
            ...parsedJson,
            shots: parsedJson.shots?.map((shot: any) => ({
                id: Date.now().toString() + Math.random(),
                ...shot,
                constraints: shot.constraints || '',
            })) || [],
        };

        return validatedData;

    } catch (error) {
        console.error("Error deconstructing prompt with Gemini API:", error);
        throw new Error("Failed to deconstruct prompt. The AI could not understand the provided text or there was a network error.");
    }
};