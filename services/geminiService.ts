import { GoogleGenAI, Type } from "@google/genai";
import { Shot, PromptParameters, SceneData } from '../types';
import { PROMPT_OPTIONS } from "../constants";

// Lazy initialization to avoid top-level side effects or env var issues during module load
let aiInstance: GoogleGenAI | null = null;
const getAi = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

function formatSceneForPrompt(data: SceneData): string {
  let formattedString = `SCENE DESCRIPTION: ${data.sceneDescription}\n`;
  formattedString += `ASPECT RATIO: ${data.aspectRatio}\n\n`;

  const { cameraEffects } = data;
  if (cameraEffects) {
    const effects: string[] = [];
    if (cameraEffects.shotType && cameraEffects.shotType !== 'medium-shot') effects.push(`  - Shot Type: ${cameraEffects.shotType.replace(/-/g, ' ')}`);
    if (cameraEffects.cameraAngle && cameraEffects.cameraAngle !== 'eye-level') effects.push(`  - Camera Angle: ${cameraEffects.cameraAngle.replace(/-/g, ' ')}`);
    if (cameraEffects.lens && cameraEffects.lens !== '35mm') effects.push(`  - Lens: ${cameraEffects.lens.replace(/-/g, ' ')}`);
    if (cameraEffects.composition && cameraEffects.composition !== 'rule-of-thirds') effects.push(`  - Composition: ${cameraEffects.composition.replace(/-/g, ' ')}`);
    if (cameraEffects.cameraMovement && cameraEffects.cameraMovement !== 'none') effects.push(`  - Camera Movement: ${cameraEffects.cameraMovement.replace(/-/g, ' ')}`);
    if (cameraEffects.depthOfField && cameraEffects.depthOfField !== 'natural') effects.push(`  - Depth of Field: ${cameraEffects.depthOfField.replace(/-/g, ' ')}`);
    if (cameraEffects.cameraAnimation && cameraEffects.cameraAnimation !== 'none') effects.push(`  - Camera Animation: ${cameraEffects.cameraAnimation.replace(/-/g, ' ')}`);
    
    if (effects.length > 0) {
      formattedString += `SCENE-WIDE CAMERA & COMPOSITION (Defaults for all shots unless specified otherwise):\n`;
      formattedString += effects.join('\n') + '\n\n';
    }
  }

  if (data.cameos.trim()) {
    formattedString += `CHARACTERS/CAMEOS: ${data.cameos}`;
    if (data.cameoDescription.trim()) {
      formattedString += ` (${data.cameoDescription.trim()})`;
    }
    formattedString += `\n`;
    formattedString += `CAMEO CONSENT: ${data.cameoConsent ? 'User has acknowledged consent requirements.' : 'Consent not specified.'}\n\n`;
  }

  const { audio, physics, animation } = data;

  let animationStyle = '';
  if (animation.animationStyle && animation.animationStyle !== 'none') animationStyle += `  - Overall Style: ${animation.animationStyle.replace(/-/g, ' ')}\n`;
  if (animation.characterDesign && animation.characterDesign !== 'none') animationStyle += `  - Character Design: ${animation.characterDesign.replace(/-/g, ' ')}\n`;
  if (animation.backgroundStyle && animation.backgroundStyle !== 'none') animationStyle += `  - Background Style: ${animation.backgroundStyle.replace(/-/g, ' ')}\n`;
  if (animation.renderingStyle && animation.renderingStyle !== 'none') animationStyle += `  - Rendering: ${animation.renderingStyle.replace(/-/g, ' ')}\n`;
  if (animation.frameRate && animation.frameRate !== 'none') animationStyle += `  - Frame Rate: ${animation.frameRate.replace(/-/g, ' ')}\n`;
  if (animationStyle) {
    formattedString += `ANIMATION STYLE:\n${animationStyle}\n`;
  }

  let audioDesign = '';
  if (audio.dialogue.trim()) audioDesign += `  - Dialogue: ${audio.dialogue}\n`;

  const sfxStyle = audio.sfxStyle && audio.sfxStyle !== 'none' ? `[Style: ${audio.sfxStyle.replace(/-/g, ' ')}] ` : '';
  if (audio.soundEffects.trim() || sfxStyle) {
    audioDesign += `  - SFX: ${sfxStyle}${audio.soundEffects}\n`;
  }
  
  const musicStyle = audio.musicStyle && audio.musicStyle !== 'none' ? `[Style: ${audio.musicStyle.replace(/-/g, ' ')}] ` : '';
  if (audio.music.trim() || musicStyle) {
    audioDesign += `  - Music: ${musicStyle}${audio.music}\n`;
  }

  if (audioDesign) {
    formattedString += `SOUND DESIGN:\n${audioDesign}\n`;
  }


  let physicsEngine = '';
  if (physics.weightAndRigidity && physics.weightAndRigidity !== 'normal-gravity') physicsEngine += `  - Weight & Rigidity: ${physics.weightAndRigidity.replace(/-/g, ' ')}\n`;
  if (physics.materialInteractions && physics.materialInteractions !== 'realistic') physicsEngine += `  - Material Interactions: ${physics.materialInteractions.replace(/-/g, ' ')}\n`;
  if (physics.environmentalForces && physics.environmentalForces !== 'none') physicsEngine += `  - Environmental Forces: ${physics.environmentalForces.replace(/-/g, ' ')}\n`;
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

  const systemInstructionEN = `You are an expert director of photography and prompt engineer for advanced text-to-video AI models like Sora. Your task is to interpret a structured "shooting script" containing a scene description, characters, sound design, physics, consent information, animation styles, and a detailed shot list with specific constraints and genres. Synthesize all this information into a single, cohesive, and vivid paragraph. The final prompt should be rich with descriptive detail, capturing the mood, atmosphere, physical interactions, and cinematic qualities specified. Do not add any preamble, explanation, or markdown formatting; just return the final, camera-ready prompt itself. Your final response MUST be in ${responseLanguage}.`;
  
  const systemInstructionES = `Eres un experto director de fotografía e ingeniero de prompts para modelos avanzados de IA de texto a video como Sora. Tu tarea es interpretar un 'guion de rodaje' estructurado que contiene una descripción de la escena, personajes, diseño de sonido, física, información de consentimiento, estilos de animación y una lista de tomas detallada con restricciones y géneros específicos. Sintetiza toda esta información en un único párrafo cohesivo y vívido. El prompt final debe ser rico en detalles descriptivos, capturando el estado de ánimo, la atmósfera, las interacciones físicas y las cualidades cinematográficas especificadas. No añadas ningún preámbulo, explicación o formato markdown; solo devuelve el prompt final, listo para la cámara. Tu respuesta final DEBE estar en ${responseLanguage}.`;

  const systemInstruction = language === 'es' ? systemInstructionES : systemInstructionEN;

  const userPrompt = formattedScene;
  
  try {
    const ai = getAi();
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

export const getSuggestions = async (data: SceneData, language: string, thinkingMode: boolean): Promise<string> => {
  const formattedScene = formatSceneForPrompt(data);
  
  const languageMap: { [key: string]: string } = {
    en: 'English',
    es: 'Spanish',
  };
  const responseLanguage = languageMap[language] || 'English';

  const systemInstructionEN = `You are a creative assistant and expert filmmaker. Your task is to analyze the provided "shooting script" and offer 3-5 concise, actionable suggestions for improvement. Your suggestions must be highly targeted and context-aware. Pay close attention to the selected parameters for each shot, such as genre, style, lighting, and camera movement. For example, if the genre is 'horror', suggest darker lighting, unsettling camera angles like a dutch-angle, or slow, creeping camera movements. If the style is 'style-of-wes-anderson', suggest symmetrical compositions or a specific pastel color palette. The goal is to provide specific advice that enhances the chosen aesthetic, not generic feedback. Focus on enhancing mood, visual interest, narrative clarity, or making better use of cinematic techniques that align with the user's intent. Frame your feedback as constructive advice. Present your suggestions as a simple, unnumbered, bulleted list using "-" for each point. Do not add any preamble or conclusion. Your response MUST be in ${responseLanguage}.`;
  const systemInstructionES = `Eres un asistente creativo y cineasta experto. Tu tarea es analizar el 'guion de rodaje' proporcionado y ofrecer de 3 a 5 sugerencias concisas y prácticas para mejorarlo. Tus sugerencias deben ser muy específicas y contextuales. Presta mucha atención a los parámetros seleccionados para cada toma, como género, estilo, iluminación y movimiento de cámara. Por ejemplo, si el género es 'terror', sugiere una iluminación más oscura, ángulos de cámara inquietantes como un plano holandés, o movimientos de cámara lentos y sigilosos. Si el estilo es 'estilo-de-wes-anderson', sugiere composiciones simétricas o una paleta de colores pastel específica. El objetivo es proporcionar consejos específicos que mejoren la estética elegida, no comentarios genéricos. Enfoca tus comentarios en mejorar el ambiente, el interés visual, la claridad narrativa o en hacer un mejor uso de las técnicas cinematográficas que se alinien con la intención del usuario. Formula tus comentarios como consejos constructivos. Presenta tus sugerencias como una lista simple, no numerada, con viñetas usando '-' para cada punto. No añadas ningún preámbulo ni conclusión. Tu respuesta DEBE estar en ${responseLanguage}.`;
  
  const systemInstructionEN_Thinking = `You are a world-class film director and creative visionary. Your task is to perform an in-depth analysis of the provided "shooting script" and offer detailed, insightful, and highly creative suggestions for improvement. Go beyond simple tweaks. Suggest new symbolic elements, alternative narrative beats, or advanced cinematic techniques that could elevate the concept. Deconstruct the user's intent and provide a rationale for your suggestions, explaining how they would enhance the story, mood, or visual impact. The goal is to be an inspiring creative partner. Present your suggestions as a detailed, well-structured list using "-" for each point. Do not add any preamble or conclusion. Your response MUST be in ${responseLanguage}.`;
  const systemInstructionES_Thinking = `Eres un director de cine de talla mundial y un visionario creativo. Tu tarea es realizar un análisis en profundidad del 'guion de rodaje' proporcionado y ofrecer sugerencias detalladas, perspicaces y altamente creativas para su mejora. Ve más allá de simples ajustes. Sugiere nuevos elementos simbólicos, ritmos narrativos alternativos o técnicas cinematográficas avanzadas que puedan elevar el concepto. Deconstruye la intención del usuario y proporciona una justificación para tus sugerencias, explicando cómo mejorarían la historia, el ambiente o el impacto visual. El objetivo es ser un socio creativo inspirador. Presenta tus sugerencias como una lista detallada y bien estructurada, usando "-" para cada punto. No añadas ningún preámbulo ni conclusión. Tu respuesta DEBE estar en ${responseLanguage}.`;

  const userPrompt = formattedScene;
  
  let model: string;
  let systemInstruction: string;
  let config: any = { temperature: 0.7 };

  if (thinkingMode) {
    model = 'gemini-2.5-pro';
    systemInstruction = language === 'es' ? systemInstructionES_Thinking : systemInstructionEN_Thinking;
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else {
    model = 'gemini-2.5-flash';
    systemInstruction = language === 'es' ? systemInstructionES : systemInstructionEN;
  }
  config.systemInstruction = systemInstruction;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for suggestions:", error);
    throw new Error("Failed to get suggestions from the API.");
  }
};


const parameterProperties = Object.keys(PROMPT_OPTIONS).reduce((acc, key) => {
  if (key !== 'cameraAnimation' && !['animationStyle', 'characterDesign', 'backgroundStyle', 'renderingStyle', 'frameRate'].includes(key)) {
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
        cameoDescription: {
            type: Type.STRING,
            description: "A detailed description of the characters or cameos mentioned, including their appearance or role."
        },
        audio: {
            type: Type.OBJECT,
            properties: {
                dialogue: { type: Type.STRING, description: "Any spoken dialogue." },
                soundEffects: { type: Type.STRING, description: "Specific sound effects mentioned (e.g., 'rain hitting pavement')." },
                sfxStyle: { type: Type.STRING, description: "The overall style of the sound effects (e.g., 'realistic', 'cartoonish')." },
                music: { type: Type.STRING, description: "Description of the score or ambient music." },
                musicStyle: { type: Type.STRING, description: "The overall style of the music (e.g., 'orchestral-score', 'synthesizer')." },
            },
        },
        physics: {
            type: Type.OBJECT,
            properties: {
                weightAndRigidity: { type: Type.STRING, description: "Descriptions of object weight, stiffness, or physical properties (e.g., 'normal-gravity', 'low-gravity')." },
                materialInteractions: { type: Type.STRING, description: "How materials interact (e.g., 'realistic', 'brittle')." },
                environmentalForces: { type: Type.STRING, description: "Forces like wind, gravity, etc. (e.g., 'none', 'strong-wind')." },
            },
        },
        animation: {
            type: Type.OBJECT,
            properties: {
                animationStyle: { type: Type.STRING, description: "The overall animation style (e.g., '2d-traditional', '3d-cgi')." },
                characterDesign: { type: Type.STRING, description: "The design style of characters (e.g., 'pixar-style', '90s-anime-style')." },
                backgroundStyle: { type: Type.STRING, description: "The style of the backgrounds (e.g., 'watercolor', 'matte-painting')." },
                renderingStyle: { type: Type.STRING, description: "The final rendering look (e.g., 'cel-shaded', 'claymation')." },
                frameRate: { type: Type.STRING, description: "The animation frame rate (e.g., 'on-twos-12fps', 'smooth-24fps')." },
            },
        },
        cameraEffects: {
            type: Type.OBJECT,
            properties: {
                shotType: { type: Type.STRING, description: "The default shot type for the scene (e.g., 'medium-shot', 'close-up')." },
                cameraAngle: { type: Type.STRING, description: "The default camera angle for the scene (e.g., 'eye-level', 'low-angle')." },
                lens: { type: Type.STRING, description: "The default camera lens for the scene (e.g., '35mm', '85mm')." },
                composition: { type: Type.STRING, description: "The default composition rule for the scene (e.g., 'rule-of-thirds', 'centered')." },
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
    required: ["sceneDescription", "shots", "cameos", "audio", "physics", "animation", "cameraEffects", "aspectRatio"],
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
4.  **audio & physics & animation**: Extract any mention of sounds, music, dialogue, physical interactions, or animation styles and place them in the appropriate fields.
5.  **aspectRatio**: Infer if possible (e.g., "vertical video" -> "9:16"). If not specified, default to "16:9".
6.  **cameos & cameoDescription**: List any named characters or people in 'cameos', and describe their appearance or role in 'cameoDescription'.

Here are the valid options for the parameters. YOU MUST USE THESE VALUES:
${validOptionsString}
`;
    
    try {
        const ai = getAi();
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
            audio: {
                dialogue: '',
                soundEffects: '',
                sfxStyle: 'none',
                music: '',
                musicStyle: 'none',
                ...parsedJson.audio,
            },
            physics: {
                weightAndRigidity: 'normal-gravity',
                materialInteractions: 'realistic',
                environmentalForces: 'none',
                ...parsedJson.physics,
            },
            cameoDescription: parsedJson.cameoDescription || '',
            animation: parsedJson.animation || { animationStyle: 'none', characterDesign: 'none', backgroundStyle: 'none', renderingStyle: 'none', frameRate: 'none' },
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


export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
    // A new GenAI instance must be created before each call to ensure the latest API key is used.
    const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const operation = await localAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio,
            }
        });
        return operation;
    } catch (error) {
        console.error("Error calling Veo API:", error);
        throw error;
    }
};


export const getVideosOperationStatus = async (operation: any) => {
    // A new GenAI instance must be created before each call to ensure the latest API key is used.
    const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const updatedOperation = await localAi.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error polling Veo operation:", error);
        throw error;
    }
};