
export const en = {
  "header": {
    "titleMain": "VIDEO",
    "titleSubtitle": "Prompt Architect"
  },
  "hero": {
    "title": {
      "1": "Create the Next",
      "2": "Blockbuster",
      "3": "Scene"
    },
    "subtitle": "An AI-powered application to create, refine, and manage detailed prompts for text-to-video models like Sora. Describe your vision, select cinematic parameters, and let the AI craft the perfect prompt.",
    "cta": "Start Building Your Prompt"
  },
  "app": {
    "outputPlaceholder": {
      "title": "Your Prompt Awaits",
      "subtitle": "Fill out the form and click 'Generate' to see the AI-crafted prompt appear here."
    }
  },
  "buttons": {
    "getSuggestions": "✨ Get AI Suggestions",
    "applySuggestions": "Apply Suggestions to Description",
    "thinking": "Thinking...",
    "generate": "🚀 Generate Prompt",
    "generating": "Generating...",
    "copied": "Copied!",
    "copy": "📋 Copy Prompt",
    "save": "💾 Save to Gallery",
    "generateVideo": "🎬 Generate Video",
    "generatingVideo": "Generating Video...",
    "startRecording": "Start Recording",
    "stopRecording": "Stop Recording"
  },
  "promptForm": {
    "title": "🎬 Composition Panel",
    "subtitle": "Build your video prompt shot by shot for ultimate creative control.",
    "startNew": "Start New",
    "remixingMessage": "Remixing a scene. Adjust the settings below or click \"Start New\".",
    "importedMessage": "Editing an imported prompt. Adjust the deconstructed settings below to refine and regenerate.",
    "sceneDescriptionLabel": "Overall Scene Description (Core idea, environment, mood)",
    "sceneDescriptionPlaceholder": "e.g., A cyberpunk city alley, drenched in neon rain, where a lone detective finds a mysterious glowing artifact.",
    "cameosLabel": "🎭 Characters / Cameos",
    "cameosPlaceholder": "e.g., A grizzled cyborg, a hologram geisha",
    "cameoDescriptionLabel": "Character Description (Appearance, role, etc.)",
    "cameoDescriptionPlaceholder": "e.g., A stoic robot bartender with glowing blue eyes; a famous scientist looking concerned.",
    "cameoDescriptionDisabledTooltip": "Please check the consent box above to add a detailed description.",
    "cameoConsentLabel": "I have consent to use the likeness of any real people.",
    "cameoConsentDescription": "You must have permission before using the names or likenesses of real individuals.",
    "aspectRatioLabel": "Format / Aspect Ratio",
    "addShot": "➕ Add Another Shot",
    "thinkingMode": "Thinking Mode",
    "thinkingModeTooltip": "Use a more advanced model (Gemini 2.5 Pro) for deeper, more creative suggestions. May take longer.",
    "import": {
      "button": "Import",
      "tooltip": "Import an existing prompt to deconstruct and improve it",
      "modalTitle": "Deconstruct Existing Prompt",
      "modalSubtitle": "Paste your existing prompt below. The AI will analyze it and break it down into the structured editor.",
      "placeholder": "Paste your full Sora prompt here...",
      "cancel": "Cancel",
      "deconstructButton": "Deconstruct with AI",
      "deconstructingButton": "Deconstructing...",
      "errorMessage": "Failed to deconstruct prompt. The AI could not understand the text or a network error occurred."
    },
    "guidelines": {
      "title": "Creative Guidelines",
      "one": "Avoid requesting violent, hateful, or explicit content.",
      "two": "Do not use copyrighted music or audio in your sound descriptions.",
      "three": "Ensure all generated content is clearly marked as AI-created when shared."
    },
    "suggestions": {
      "title": "AI Suggestions",
      "loading": "Asking the AI for ideas...",
      "divider": "--- AI Suggestions ---"
    },
    "error": {
      "descriptionNeeded": "Please enter a scene description first.",
      "suggestionsFailed": "Could not fetch suggestions. Please try again.",
      "cameoConsentNeeded": "Please confirm cameo consent before generating"
    }
  },
  "shotEditor": {
    "title": "🎬 Shot #{{index}}",
    "shotListTitle": "Shot List",
    "listView": "List View",
    "storyboardView": "Storyboard View",
    "delete": "Delete Shot",
    "descriptionPlaceholder": "Action, details, physical interactions (e.g., water splashing, heavy object impact)...",
    "constraintsPlaceholder": "Constraints / Negative prompt (e.g., no people, avoid fast cuts, natural lighting only)...",
    "noDescription": "No description provided.",
    "editButton": "Edit Shot",
    "modalTitle": "Editing Shot #{{index}}",
    "closeButton": "Done",
    "tabs": {
      "camera": "📷 Camera",
      "style": "🎨 Style",
      "context": "🌍 Context"
    }
  },
  "animationSettings": {
    "title": "🎨 Animation & Style",
    "description": "Define the specific animation style for your scene. These settings work best when the main 'Style' parameter is also set to an animation type.",
    "animationStyle": "Overall Animation Style",
    "characterDesign": "Character Design Style",
    "backgroundStyle": "Background Style",
    "renderingStyle": "Rendering Style",
    "frameRate": "Frame Rate"
  },
  "advancedSettings": {
    "title": "🔬 Advanced Physics & Audio",
    "physicsEngine": "Physics Engine",
    "weightAndRigidity": "Object Weight & Rigidity",
    "materialInteractions": "Material Properties & Interactions",
    "environmentalForces": "Environmental Forces",
    "soundscape": "Soundscape",
    "dialogue": "Dialogue Details",
    "dialoguePlaceholder": "e.g., A character whispers, 'I've been waiting...'",
    "sfx": "Specific Sound Effects (SFX)",
    "sfxPlaceholder": "e.g., Sizzling rain, distant sirens, the crackle of a neon sign.",
    "music": "Ambient Music & Cues",
    "musicPlaceholder": "e.g., A low, tense synthesizer score swells; music cuts out on impact.",
    "musicStyle": "Overall Music Style",
    "sfxStyle": "Overall SFX Style"
  },
  "cameraEffects": {
    "title": "🎥 Scene-Wide Camera & Composition",
    "description": "Set default camera behaviors for all shots. These can be overridden in individual shot parameters.",
    "cameraAnimation": "Camera Animation"
  },
  "generatedPrompt": {
    "title": "✨ Generated Prompt",
    "versionNotesLabel": "Version Notes (Optional Changelog)",
    "versionNotesPlaceholder": "e.g., v2: Changed lens to 85mm, added rain.",
    "saveDisabledTooltip": "Generate a new prompt to save",
    "saveTooltip": "Save to Gallery",
    "videoUnsupportedAspect": "Video generation only supports 16:9 and 9:16 aspect ratios."
  },
  "generatedVideo": {
    "title": "🎬 Generated Video",
    "progress": {
      "start": "Initializing video generation...",
      "running": "Your video is being generated. This can take a few minutes. Please wait...",
      "downloading": "Finalizing and downloading your video...",
      "complete": "Video generation complete!"
    },
    "error": "Video Generation Failed",
    "errorKey": "Your API key seems to be invalid. Please select a valid key and try again."
  },
  "apiKeyModal": {
    "title": "API Key Required for Video Generation",
    "body": "To generate videos with the Veo model, you need to select one of your own API keys. This ensures that any usage is associated with your account.",
    "linkText": "Please refer to the billing documentation for more details.",
    "button": "Select API Key"
  },
  "gallery": {
    "title": "🖼️ Scene Gallery",
    "subtitle": "Review, remix, and manage your saved creations.",
    "empty": {
      "title": "📭 Your Gallery is Empty",
      "subtitle": "Generate and save scenes to see them here."
    },
    "visibility": {
      "public": "Public",
      "private": "Private"
    },
    "visibilityTooltip": {
      "makePrivate": "Click to make private",
      "makePublic": "Click to make public"
    },
    "versionNotes": "VERSION NOTES:",
    "sceneIdea": "Scene Idea:",
    "shots": "Shots:",
    "format": "Format:",
    "cameoConsent": "Cameo Consent:",
    "acknowledged": "Acknowledged",
    "remixScene": "Remix Latest Version",
    "deleteScene": "Delete Scene",
    "history": "View Version History",
    "versionHistoryTitle": "📜 Version History",
    "remixThisVersion": "🔄 Remix This Version",
    "versionCreatedOn": "Created:",
    "versionNotesLabel": "Notes:",
    "latest": "(Latest)"
  },
  "promptOptions": {
    "labels": {
        "animationStyle": "Animation Style",
        "characterDesign": "Character Design",
        "backgroundStyle": "Background Style",
        "renderingStyle": "Rendering Style",
        "frameRate": "Frame Rate",
        "shotType": "Shot Type",
        "cameraAngle": "Camera Angle",
        "cameraMovement": "Camera Movement",
        "cameraAnimation": "Camera Animation",
        "lens": "Lens",
        "composition": "Composition",
        "lighting": "Lighting",
        "style": "Style",
        "filmQuality": "Film Quality",
        "pacing": "Pacing",
        "timeOfDay": "Time Of Day",
        "location": "Location",
        "depthOfField": "Depth of Field",
        "texture": "Texture",
        "colorPalette": "Color Palette",
        "genre": "Genre",
        "weightAndRigidity": "Weight & Rigidity",
        "materialInteractions": "Material Interactions",
        "environmentalForces": "Environmental Forces",
        "musicStyle": "Music Style",
        "sfxStyle": "SFX Style"
    },
    "animationStyle": {
        "none": "Not Specified",
        "2dTraditional": "2D Traditional (Hand-drawn)",
        "3dCgi": "3D CGI Animation",
        "stopMotion": "Stop-motion",
        "anime": "Anime",
        "motionGraphics": "Motion Graphics",
        "cutOut": "Cut-out Animation",
        "claymation": "Claymation",
        "pixelArt": "Pixel Art",
        "oilPainting": "Oil Painting",
        "charcoal": "Charcoal Sketch",
        "comicBook": "Comic Book / Graphic Novel"
    },
    "characterDesign": {
        "none": "Not Specified",
        "pixar": "Pixar Style",
        "ghibli": "Ghibli Style",
        "looneyTunes": "Classic Looney Tunes",
        "90sAnime": "90s Anime Style",
        "calarts": "CalArts Style",
        "southPark": "South Park Style",
        "rickAndMorty": "Rick and Morty Style"
    },
    "backgroundStyle": {
        "none": "Not Specified",
        "watercolor": "Watercolor",
        "mattePainting": "Matte Painting",
        "ghibli": "Ghibli-style",
        "vectorArt": "Vector Art",
        "stylized3d": "Stylized 3D"
    },
    "renderingStyle": {
        "none": "Not Specified",
        "celShaded": "Cel-shaded",
        "claymation": "Claymation",
        "paperCutOut": "Paper Cut-out",
        "glitchArt": "Glitch Art",
        "rotoscoping": "Rotoscoping",
        "pixelArt": "Pixel Art"
    },
    "frameRate": {
        "none": "Not Specified",
        "onTwos": "On Twos (12fps)",
        "smooth": "Smooth (24fps)",
        "variable": "Variable / Dynamic",
        "low": "Low Frame Rate / Choppy"
    },
    "weightAndRigidity": {
        "normal": "Normal Gravity / Realistic",
        "lowGravity": "Low Gravity / Floating",
        "highGravity": "High Gravity / Heavy",
        "lightweight": "Lightweight & Floaty",
        "heavy": "Extremely Heavy & Rigid"
    },
    "materialInteractions": {
        "realistic": "Realistic Interactions",
        "cartoonish": "Exaggerated / Cartoonish",
        "brittle": "Brittle (shatters easily)",
        "soft": "Soft & Bouncy",
        "none": "Not Specified"
    },
    "environmentalForces": {
        "none": "No Significant Forces",
        "strongWind": "Strong Wind",
        "gentleBreeze": "Gentle Breeze",
        "underwater": "Underwater Currents",
        "magnetic": "Magnetic Forces"
    },
    "musicStyle": {
        "none": "Not Specified",
        "orchestral": "Orchestral Score",
        "synth": "Synthesizer / Electronic",
        "lofi": "Lo-fi Hip Hop",
        "ambient": "Ambient",
        "rock": "Rock Anthem",
        "jazz": "Jazz"
    },
    "sfxStyle": {
        "none": "Not Specified",
        "realistic": "Realistic",
        "cinematic": "Cinematic / Impactful",
        "cartoon": "Cartoonish (Boinks, Zaps)",
        "scifi": "Sci-Fi (Hums, Beeps)",
        "fantasy": "Fantasy (Magical)"
    },
    "aspectRatio": {
        "widescreen": "16:9 (Widescreen)",
        "vertical": "9:16 (Vertical)",
        "square": "1:1 (Square)",
        "classic": "4:3 (Classic TV)",
        "cinemascope": "2.39:1 (Cinemascope)"
    },
    "genre": {
        "drama": "Drama", "action": "Action", "comedy": "Comedy", "sciFi": "Sci-Fi", "horror": "Horror", "fantasy": "Fantasy", "documentary": "Documentary", "thriller": "Thriller"
    },
    "shotType": {
        "extremeCloseUp": "Extreme Close-Up", "closeUp": "Close-Up", "mediumShot": "Medium Shot", "longShot": "Long Shot", "establishingShot": "Establishing Shot", "pov": "Point of View (POV)"
    },
    "cameraAngle": {
        "eyeLevel": "Eye-Level", "highAngle": "High Angle", "lowAngle": "Low Angle", "dutchAngle": "Dutch Angle", "birdsEyeView": "Bird's-Eye View"
    },
    "cameraMovement": {
        "none": "Static", "pan": "Pan", "tilt": "Tilt", "dollyZoom": "Dolly Zoom", "craneShot": "Crane Shot", "handheld": "Handheld / Shaky Cam", "droneShot": "Drone Shot", "gimbal": "Gimbal / Steadicam"
    },
    "lens": {
        "24": "24mm (Wide Angle)", "35": "35mm (Standard)", "50": "50mm (Natural)", "85": "85mm (Portrait)", "135": "135mm (Telephoto)"
    },
    "composition": {
        "ruleOfThirds": "Rule of Thirds", "leadingLines": "Leading Lines", "centered": "Centered", "symmetry": "Symmetry", "frameWithinFrame": "Frame Within a Frame"
    },
    "lighting": {
        "cinematic": "Cinematic Lighting", "goldenHour": "Golden Hour", "blueHour": "Blue Hour", "highKey": "High-Key Lighting", "lowKey": "Low-Key / Chiaroscuro", "neon": "Neon Lighting", "backlight": "Backlight / Rim Light", "studio": "Studio Lighting"
    },
    "style": {
        "photorealistic": "Photorealistic", "cinematicFilm": "Cinematic Film", "denisVilleneuve": "Cinematography like Denis Villeneuve", "wesAnderson": "Style of Wes Anderson", "quentinTarantino": "Style of Quentin Tarantino", "anime": "Anime", "documentary": "Documentary", "foundFootage": "Found Footage", "threeDRender": "3D Render", "macroPhotography": "Macro Photography", "fantasyArt": "Fantasy Art", "vaporwave": "Vaporwave"
    },
    "filmQuality": {
        "fourK": "Crisp 4K", "eightK": "Hyper-detailed 8K", "thirtyFiveMM": "35mm Film Grain", "sixteenMM": "16mm Film Grain", "vhs": "VHS Look", "imax": "IMAX Quality"
    },
    "pacing": {
        "normal": "Normal Speed", "slowMotion": "Slow-Motion", "fastMotion": "Fast-Motion", "timeLapse": "Time-lapse"
    },
    "timeOfDay": {
        "daytime": "Daytime", "nighttime": "Nighttime", "dawn": "Dawn", "dusk": "Dusk", "midnight": "Midnight"
    },
    "location": {
        "unspecified": "Unspecified", "cityscape": "Cityscape", "forest": "Forest", "ocean": "Ocean", "mountains": "Mountains", "desert": "Desert", "sciFiInterior": "Sci-Fi Interior"
    },
    "depthOfField": {
        "natural": "Natural", "shallow": "Shallow (Bokeh)", "deep": "Deep / Everything in Focus", "rackFocus": "Rack Focus effect"
    },
    "texture": {
        "standard": "Standard Definition", "smooth": "Smooth / Glossy", "rough": "Rough / Matte", "heavyGrain": "Heavy Film Grain", "sharp": "Sharp and Clean"
    },
    "colorPalette": {
        "vibrant": "Vibrant and Saturated", "muted": "Muted and Desaturated", "monochromatic": "Monochromatic / B&W", "pastel": "Pastel Colors", "neon": "Neon / Synthwave", "warm": "Warm Tones", "cool": "Cool Tones"
    },
    "cameraMovementOptions": {
        "none": "Static", "pan": "Pan", "tilt": "Tilt", "dolly": "Dolly", "zoom": "Zoom", "dollyZoom": "Dolly Zoom (Vertigo)", "craneShot": "Crane Shot", "handheld": "Handheld", "droneShot": "Drone Shot", "gimbal": "Gimbal / Steadicam", "slow": "Slow", "normal": "Normal", "fast": "Fast", "left": "Left", "right": "Right", "up": "Up", "down": "Down", "in": "In", "out": "Out"
    },
    "cameraAnimationOptions": {
      "none": "None",
      "slowPanLeft": "Slow Pan Left",
      "slowPanRight": "Slow Pan Right",
      "slowTiltUp": "Slow Tilt Up",
      "slowTiltDown": "Slow Tilt Down",
      "rapidZoomIn": "Rapid Zoom In",
      "rapidZoomOut": "Rapid Zoom Out",
      "handheldShake": "Handheld Shake",
      "smoothDollyIn": "Smooth Dolly In",
      "smoothDollyOut": "Smooth Dolly Out"
    }
  }
};

export const es = {
  "header": {
    "titleMain": "VIDEO",
    "titleSubtitle": "Prompt Architect"
  },
  "hero": {
    "title": {
      "1": "Crea la Próxima",
      "2": "Escena",
      "3": "de Película"
    },
    "subtitle": "Una aplicación impulsada por IA para crear, refinar y gestionar prompts detallados para modelos de texto a video como Sora. Describe tu visión, selecciona parámetros cinematográficos y deja que la IA cree el prompt perfecto.",
    "cta": "Empieza a Construir tu Prompt"
  },
  "app": {
    "outputPlaceholder": {
      "title": "Tu Prompt Te Espera",
      "subtitle": "Completa el formulario y haz clic en 'Generar' para ver el prompt creado por la IA aquí."
    }
  },
  "buttons": {
    "getSuggestions": "✨ Obtener Sugerencias IA",
    "applySuggestions": "Aplicar Sugerencias a la Descripción",
    "thinking": "Pensando...",
    "generate": "🚀 Generar Prompt",
    "generating": "Generando...",
    "copied": "¡Copiado!",
    "copy": "📋 Copiar Prompt",
    "save": "💾 Guardar en Galería",
    "generateVideo": "🎬 Generar Video",
    "generatingVideo": "Generando Video...",
    "startRecording": "Iniciar Grabación",
    "stopRecording": "Detener Grabación"
  },
  "promptForm": {
    "title": "🎬 Panel de Composición",
    "subtitle": "Construye tu prompt de video toma por toma para un control creativo total.",
    "startNew": "Empezar Nuevo",
    "remixingMessage": "Remezclando una escena. Ajusta la configuración a continuación o haz clic en \"Empezar Nuevo\".",
    "importedMessage": "Editando un prompt importado. Ajusta la configuración deconstruida a continuación para refinar y regenerar.",
    "sceneDescriptionLabel": "Descripción General de la Escena (Idea central, entorno, ambiente)",
    "sceneDescriptionPlaceholder": "ej., Un callejón de ciudad cyberpunk, empapado en lluvia de neón, donde un detective solitario encuentra un misterioso artefacto brillante.",
    "cameosLabel": "🎭 Personajes / Cameos",
    "cameosPlaceholder": "ej., Un ciborg canoso, una geisha holográfica",
    "cameoDescriptionLabel": "Descripción del Personaje (Apariencia, rol, etc.)",
    "cameoDescriptionPlaceholder": "ej., Un robot camarero estoico con ojos azules brillantes; un científico famoso luciendo preocupado.",
    "cameoDescriptionDisabledTooltip": "Por favor, marca la casilla de consentimiento arriba para añadir una descripción detallada.",
    "cameoConsentLabel": "Tengo consentimiento para usar la imagen de cualquier persona real.",
    "cameoConsentDescription": "Debes tener permiso antes de usar los nombres o imágenes de individuos reales.",
    "aspectRatioLabel": "Formato / Relación de Aspecto",
    "addShot": "➕ Añadir Otra Toma",
    "thinkingMode": "Modo Pensamiento",
    "thinkingModeTooltip": "Usa un modelo más avanzado (Gemini 2.5 Pro) para sugerencias más profundas y creativas. Puede tardar más.",
    "import": {
      "button": "Importar",
      "tooltip": "Importar un prompt existente para deconstruirlo y mejorarlo",
      "modalTitle": "Deconstruir Prompt Existente",
      "modalSubtitle": "Pega tu prompt existente a continuación. La IA lo analizará y lo desglosará en el editor estructurado.",
      "placeholder": "Pega tu prompt completo de Sora aquí...",
      "cancel": "Cancelar",
      "deconstructButton": "Deconstruir con IA",
      "deconstructingButton": "Deconstruyendo...",
      "errorMessage": "No se pudo deconstruir el prompt. La IA no pudo entender el texto o ocurrió un error de red."
    },
    "guidelines": {
      "title": "Directrices Creativas",
      "one": "Evita solicitar contenido violento, odioso o explícito.",
      "two": "No uses música o audio con derechos de autor en tus descripciones de sonido.",
      "three": "Asegúrate de que todo el contenido generado esté claramente marcado como creado por IA cuando se comparta."
    },
    "suggestions": {
      "title": "Sugerencias de IA",
      "loading": "Pidiendo ideas a la IA...",
      "divider": "--- Sugerencias de IA ---"
    },
    "error": {
      "descriptionNeeded": "Por favor, introduce una descripción de la escena primero.",
      "suggestionsFailed": "No se pudieron obtener sugerencias. Por favor, inténtalo de nuevo.",
      "cameoConsentNeeded": "Por favor, confirma el consentimiento de cameo antes de generar"
    }
  },
  "shotEditor": {
    "title": "🎬 Toma #{{index}}",
    "shotListTitle": "Lista de Tomas",
    "listView": "Vista de Lista",
    "storyboardView": "Vista de Guion Gráfico",
    "delete": "Eliminar Toma",
    "descriptionPlaceholder": "Acción, detalles, interacciones físicas (ej., agua salpicando, impacto de objeto pesado)...",
    "constraintsPlaceholder": "Restricciones / Prompt negativo (ej., sin personas, evitar cortes rápidos, solo luz natural)...",
    "noDescription": "No se proporcionó descripción.",
    "editButton": "Editar Toma",
    "modalTitle": "Editando Toma #{{index}}",
    "closeButton": "Hecho",
    "tabs": {
      "camera": "📷 Cámara",
      "style": "🎨 Estilo",
      "context": "🌍 Contexto"
    }
  },
  "animationSettings": {
    "title": "🎨 Animación y Estilo",
    "description": "Define el estilo de animación específico para tu escena. Estos ajustes funcionan mejor cuando el parámetro principal 'Estilo' también está configurado en un tipo de animación.",
    "animationStyle": "Estilo General de Animación",
    "characterDesign": "Estilo de Diseño de Personajes",
    "backgroundStyle": "Estilo de Fondo",
    "renderingStyle": "Estilo de Renderizado",
    "frameRate": "Velocidad de Fotogramas"
  },
  "advancedSettings": {
    "title": "🔬 Física y Audio Avanzados",
    "physicsEngine": "Motor de Física",
    "weightAndRigidity": "Peso y Rigidez del Objeto",
    "materialInteractions": "Propiedades e Interacciones del Material",
    "environmentalForces": "Fuerzas Ambientales",
    "soundscape": "Paisaje Sonoro",
    "dialogue": "Detalles del Diálogo",
    "dialoguePlaceholder": "ej., Un personaje susurra, 'He estado esperando...'",
    "sfx": "Efectos de Sonido Específicos (SFX)",
    "sfxPlaceholder": "ej., Lluvia chisporroteando, sirenas distantes, el crujido de un letrero de neón.",
    "music": "Música Ambiental y Señales",
    "musicPlaceholder": "ej., Una partitura de sintetizador baja y tensa aumenta; la música se corta al impacto.",
    "musicStyle": "Estilo Musical General",
    "sfxStyle": "Estilo General de SFX"
  },
  "cameraEffects": {
    "title": "🎥 Cámara y Composición de la Escena",
    "description": "Establece comportamientos de cámara predeterminados para todas las tomas. Estos pueden ser anulados en los parámetros de toma individuales.",
    "cameraAnimation": "Animación de Cámara"
  },
  "generatedPrompt": {
    "title": "✨ Prompt Generado",
    "versionNotesLabel": "Notas de Versión (Registro de Cambios Opcional)",
    "versionNotesPlaceholder": "ej., v2: Se cambió la lente a 85mm, se añadió lluvia.",
    "saveDisabledTooltip": "Genera un nuevo prompt para guardar",
    "saveTooltip": "Guardar en Galería",
    "videoUnsupportedAspect": "La generación de video solo soporta relaciones de aspecto 16:9 y 9:16."
  },
  "generatedVideo": {
    "title": "🎬 Video Generado",
    "progress": {
      "start": "Inicializando generación de video...",
      "running": "Tu video se está generando. Esto puede tardar unos minutos. Por favor espera...",
      "downloading": "Finalizando y descargando tu video...",
      "complete": "¡Generación de video completa!"
    },
    "error": "Generación de Video Fallida",
    "errorKey": "Tu clave API parece no ser válida. Por favor selecciona una clave válida e inténtalo de nuevo."
  },
  "apiKeyModal": {
    "title": "Clave API Requerida para Generación de Video",
    "body": "Para generar videos con el modelo Veo, necesitas seleccionar una de tus propias claves API. Esto asegura que cualquier uso esté asociado con tu cuenta.",
    "linkText": "Por favor consulta la documentación de facturación para más detalles.",
    "button": "Seleccionar Clave API"
  },
  "gallery": {
    "title": "🖼️ Galería de Escenas",
    "subtitle": "Revisa, remezcla y gestiona tus creaciones guardadas.",
    "empty": {
      "title": "📭 Tu Galería está Vacía",
      "subtitle": "Genera y guarda escenas para verlas aquí."
    },
    "visibility": {
      "public": "Público",
      "private": "Privado"
    },
    "visibilityTooltip": {
      "makePrivate": "Clic para hacer privado",
      "makePublic": "Clic para hacer público"
    },
    "versionNotes": "NOTAS DE VERSIÓN:",
    "sceneIdea": "Idea de la Escena:",
    "shots": "Tomas:",
    "format": "Formato:",
    "cameoConsent": "Consentimiento de Cameo:",
    "acknowledged": "Reconocido",
    "remixScene": "Remezclar Última Versión",
    "deleteScene": "Eliminar Escena",
    "history": "Ver Historial de Versiones",
    "versionHistoryTitle": "📜 Historial de Versiones",
    "remixThisVersion": "🔄 Remezclar Esta Versión",
    "versionCreatedOn": "Creado:",
    "versionNotesLabel": "Notas:",
    "latest": "(Último)"
  },
  "promptOptions": {
    "labels": {
        "animationStyle": "Estilo de Animación",
        "characterDesign": "Diseño de Personajes",
        "backgroundStyle": "Estilo de Fondo",
        "renderingStyle": "Estilo de Renderizado",
        "frameRate": "Velocidad de Fotogramas",
        "shotType": "Tipo de Toma",
        "cameraAngle": "Ángulo de Cámara",
        "cameraMovement": "Movimiento de Cámara",
        "cameraAnimation": "Animación de Cámara",
        "lens": "Lente",
        "composition": "Composición",
        "lighting": "Iluminación",
        "style": "Estilo",
        "filmQuality": "Calidad de Película",
        "pacing": "Ritmo",
        "timeOfDay": "Hora del Día",
        "location": "Ubicación",
        "depthOfField": "Profundidad de Campo",
        "texture": "Textura",
        "colorPalette": "Paleta de Colores",
        "genre": "Género",
        "weightAndRigidity": "Peso y Rigidez",
        "materialInteractions": "Interacciones de Materiales",
        "environmentalForces": "Fuerzas Ambientales",
        "musicStyle": "Estilo Musical",
        "sfxStyle": "Estilo SFX"
    },
    "animationStyle": {
        "none": "No Especificado",
        "2dTraditional": "2D Tradicional (Dibujado a mano)",
        "3dCgi": "Animación 3D CGI",
        "stopMotion": "Stop-motion",
        "anime": "Anime",
        "motionGraphics": "Gráficos en Movimiento",
        "cutOut": "Animación de Recortes",
        "claymation": "Claymation (Plastilina)",
        "pixelArt": "Pixel Art",
        "oilPainting": "Pintura al Óleo",
        "charcoal": "Boceto al Carbón",
        "comicBook": "Cómic / Novela Gráfica"
    },
    "characterDesign": {
        "none": "No Especificado",
        "pixar": "Estilo Pixar",
        "ghibli": "Estilo Ghibli",
        "looneyTunes": "Looney Tunes Clásico",
        "90sAnime": "Estilo Anime de los 90",
        "calarts": "Estilo CalArts",
        "southPark": "Estilo South Park",
        "rickAndMorty": "Estilo Rick y Morty"
    },
    "backgroundStyle": {
        "none": "No Especificado",
        "watercolor": "Acuarela",
        "mattePainting": "Matte Painting",
        "ghibli": "Estilo Ghibli",
        "vectorArt": "Arte Vectorial",
        "stylized3d": "3D Estilizado"
    },
    "renderingStyle": {
        "none": "No Especificado",
        "celShaded": "Cel-shaded (Sombreado plano)",
        "claymation": "Claymation",
        "paperCutOut": "Recortes de Papel",
        "glitchArt": "Arte Glitch",
        "rotoscoping": "Rotoscopia",
        "pixelArt": "Pixel Art"
    },
    "frameRate": {
        "none": "No Especificado",
        "onTwos": "En Dos (12fps)",
        "smooth": "Fluido (24fps)",
        "variable": "Variable / Dinámico",
        "low": "Baja Velocidad de Fotogramas / EntreCortado"
    },
    "weightAndRigidity": {
        "normal": "Gravedad Normal / Realista",
        "lowGravity": "Baja Gravedad / Flotante",
        "highGravity": "Alta Gravedad / Pesado",
        "lightweight": "Ligero y Flotante",
        "heavy": "Extremadamente Pesado y Rígido"
    },
    "materialInteractions": {
        "realistic": "Interacciones Realistas",
        "cartoonish": "Exagerado / Caricaturesco",
        "brittle": "Frágil (se rompe fácilmente)",
        "soft": "Suave y Rebotante",
        "none": "No Especificado"
    },
    "environmentalForces": {
        "none": "Sin Fuerzas Significativas",
        "strongWind": "Viento Fuerte",
        "gentleBreeze": "Brisa Suave",
        "underwater": "Corrientes Submarinas",
        "magnetic": "Fuerzas Magnéticas"
    },
    "musicStyle": {
        "none": "No Especificado",
        "orchestral": "Partitura Orquestal",
        "synth": "Sintetizador / Electrónica",
        "lofi": "Lo-fi Hip Hop",
        "ambient": "Ambiental",
        "rock": "Himno de Rock",
        "jazz": "Jazz"
    },
    "sfxStyle": {
        "none": "No Especificado",
        "realistic": "Realista",
        "cinematic": "Cinematográfico / Impactante",
        "cartoon": "Caricaturesco (Boinks, Zaps)",
        "scifi": "Ciencia Ficción (Zumbidos, Pitidos)",
        "fantasy": "Fantasía (Mágico)"
    },
    "aspectRatio": {
        "widescreen": "16:9 (Pantalla Ancha)",
        "vertical": "9:16 (Vertical)",
        "square": "1:1 (Cuadrado)",
        "classic": "4:3 (TV Clásica)",
        "cinemascope": "2.39:1 (Cinemascope)"
    },
    "genre": {
        "drama": "Drama", "action": "Acción", "comedy": "Comedia", "sciFi": "Ciencia Ficción", "horror": "Terror", "fantasy": "Fantasía", "documentary": "Documental", "thriller": "Suspenso"
    },
    "shotType": {
        "extremeCloseUp": "Primerísimo Primer Plano", "closeUp": "Primer Plano", "mediumShot": "Plano Medio", "longShot": "Plano General", "establishingShot": "Plano de Situación", "pov": "Punto de Vista (POV)"
    },
    "cameraAngle": {
        "eyeLevel": "Nivel de los Ojos", "highAngle": "Ángulo Picado", "lowAngle": "Ángulo Contrapicado", "dutchAngle": "Plano Holandés", "birdsEyeView": "Vista de Pájaro"
    },
    "cameraMovement": {
        "none": "Estático", "pan": "Panorámica", "tilt": "Inclinación", "dollyZoom": "Dolly Zoom", "craneShot": "Plano de Grúa", "handheld": "Cámara en Mano / Temblorosa", "droneShot": "Plano de Dron", "gimbal": "Gimbal / Steadicam"
    },
    "lens": {
        "24": "24mm (Gran Angular)", "35": "35mm (Estándar)", "50": "50mm (Natural)", "85": "85mm (Retrato)", "135": "135mm (Teleobjetivo)"
    },
    "composition": {
        "ruleOfThirds": "Regla de los Tercios", "leadingLines": "Líneas Guía", "centered": "Centrado", "symmetry": "Simetría", "frameWithinFrame": "Cuadro dentro de Cuadro"
    },
    "lighting": {
        "cinematic": "Iluminación Cinematográfica", "goldenHour": "Hora Dorada", "blueHour": "Hora Azul", "highKey": "Clave Alta", "lowKey": "Clave Baja / Claroscuro", "neon": "Iluminación de Neón", "backlight": "Contraluz", "studio": "Iluminación de Estudio"
    },
    "style": {
        "photorealistic": "Fotorrealista", "cinematicFilm": "Cine Cinematográfico", "denisVilleneuve": "Cinematografía como Denis Villeneuve", "wesAnderson": "Estilo de Wes Anderson", "quentinTarantino": "Estilo de Quentin Tarantino", "anime": "Anime", "documentary": "Documental", "foundFootage": "Metraje Encontrado", "threeDRender": "Render 3D", "macroPhotography": "Macrofotografía", "fantasyArt": "Arte de Fantasía", "vaporwave": "Vaporwave"
    },
    "filmQuality": {
        "fourK": "4K Nítido", "eightK": "8K Hiper-detallado", "thirtyFiveMM": "Grano de Película de 35mm", "sixteenMM": "Grano de Película de 16mm", "vhs": "Aspecto VHS", "imax": "Calidad IMAX"
    },
    "pacing": {
        "normal": "Velocidad Normal", "slowMotion": "Cámara Lenta", "fastMotion": "Cámara Rápida", "timeLapse": "Time-lapse"
    },
    "timeOfDay": {
        "daytime": "Día", "nighttime": "Noche", "dawn": "Amanecer", "dusk": "Atardecer", "midnight": "Medianoche"
    },
    "location": {
        "unspecified": "No Especificado", "cityscape": "Paisaje Urbano", "forest": "Bosque", "ocean": "Océano", "mountains": "Montañas", "desert": "Desierto", "sciFiInterior": "Interior de Ciencia Ficción"
    },
    "depthOfField": {
        "natural": "Natural", "shallow": "Poca Profundidad (Bokeh)", "deep": "Profunda / Todo en Foco", "rackFocus": "Efecto de Cambio de Foco"
    },
    "texture": {
        "standard": "Definición Estándar", "smooth": "Suave / Brillante", "rough": "Áspero / Mate", "heavyGrain": "Grano de Película Pesado", "sharp": "Nítido y Limpio"
    },
    "colorPalette": {
        "vibrant": "Vibrante y Saturado", "muted": "Apagado y Desaturado", "monochromatic": "Monocromático / B&N", "pastel": "Colores Pastel", "neon": "Neón / Synthwave", "warm": "Tonos Cálidos", "cool": "Tonos Fríos"
    },
    "cameraMovementOptions": {
        "none": "Estático", "pan": "Panorámica", "tilt": "Inclinación", "dolly": "Dolly", "zoom": "Zoom", "dollyZoom": "Dolly Zoom (Vértigo)", "craneShot": "Plano de Grúa", "handheld": "Cámara en Mano", "droneShot": "Plano de Dron", "gimbal": "Gimbal / Steadicam", "slow": "Lento", "normal": "Normal", "fast": "Rápido", "left": "Izquierda", "right": "Derecha", "up": "Arriba", "down": "Abajo", "in": "Adentro", "out": "Afuera"
    },
    "cameraAnimationOptions": {
      "none": "Ninguno",
      "slowPanLeft": "Panorámica Lenta Izquierda",
      "slowPanRight": "Panorámica Lenta Derecha",
      "slowTiltUp": "Inclinación Lenta Arriba",
      "slowTiltDown": "Inclinación Lenta Abajo",
      "rapidZoomIn": "Zoom Rápido Adentro",
      "rapidZoomOut": "Zoom Rápido Afuera",
      "handheldShake": "Temblor de Cámara en Mano",
      "smoothDollyIn": "Dolly Suave Adentro",
      "smoothDollyOut": "Dolly Suave Afuera"
    }
  }
};
