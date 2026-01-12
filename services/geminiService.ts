import { GoogleGenAI, Type } from "@google/genai";

const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || dataUrl;
};

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const validateHumanPresence = async (imageBase64: string): Promise<{ valid: boolean; isFullBody?: boolean; reason?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: getMimeType(imageBase64),
              data: cleanBase64(imageBase64),
            },
          },
          {
            text: "Analyze this image. 1. Does it contain one or more humans (groups are allowed)? 2. Are the people fully visible from head to toe? Return a JSON object.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasHumans: { type: Type.BOOLEAN },
            isFullBody: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["hasHumans", "isFullBody"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      valid: result.hasHumans === true,
      isFullBody: result.isFullBody === true,
      reason: result.reason,
    };
  } catch (error) {
    return { valid: true, isFullBody: true };
  }
};

export const generateCompositeScene = async (
  personImage: string,
  backgroundImage: string,
  x: number,
  y: number
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: getMimeType(personImage),
              data: cleanBase64(personImage),
            },
          },
          {
            inlineData: {
              mimeType: getMimeType(backgroundImage),
              data: cleanBase64(backgroundImage),
            },
          },
          {
            text: `Task: Precisely extract the people from the first image and realistically composite them into the second image (the background).
            
            Spatial & Perspective Instructions:
            1. ANALYZE BACKGROUND SCALE: Look at architectural elements (doors, stairs, windows, floor tiles) in the second image to determine the real-world scale of the room.
            2. POSITIONING: Place the subjects so their feet touch the floor exactly at coordinate X=${x.toFixed(1)}%, Y=${y.toFixed(1)}%.
            3. PROPORTIONAL SCALING: Scale the human subjects so their height is realistic relative to the environment. For example, if placed next to a door, they should be roughly door-height. If placed further back in a hallway, they should appear smaller according to the vanishing point.
            4. HORIZON MATCHING: Ensure the eye-level of the subjects matches the estimated horizon line of the background scene.
            5. SHADOWS & LIGHTING: Cast a realistic contact shadow at their feet and a soft drop shadow on the floor/walls that matches the direction and intensity of the ambient light in the background.
            
            Strict Quality Requirements:
            - Erase the original background and all watermarks from the first image.
            - DO NOT crop, stretch, or alter the aspect ratio of the second image (the background).
            - Ensure the final output is a single, seamless, high-fidelity photographic composite.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });

    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content?.parts.find(p => p.inlineData);

    if (imagePart?.inlineData?.data) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    
    throw new Error("The AI model returned no image data.");
  } catch (error: any) {
    console.error("Generation error:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};