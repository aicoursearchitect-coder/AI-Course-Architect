import { GoogleGenAI } from "@google/genai";
import type { Course, Source } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Custom error class to signify that the AI response was not in the expected JSON format.
 */
export class InvalidJsonError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidJsonError';
    }
}

const createPrompt = (topic: string): string => `
You are an expert instructional designer. Your task is to create a comprehensive, well-structured course outline based on the topic: "${topic}".

Crawl the web using your search tool to gather the most relevant and up-to-date information to design this course.

The course should be structured into logical modules, and each module should contain several specific lessons. For each module and lesson, provide a concise, one-sentence description.

Your final output MUST be a single, valid JSON object. Do not include any text, code blocks, or markdown formatting like \`\`\`json before or after the JSON object. Just the raw JSON.

The JSON object must follow this exact structure:
{
  "title": "Course Title Related to the Topic",
  "description": "A brief, one-paragraph overview of what the course covers.",
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "A one-sentence description of this module.",
      "lessons": [
        {
          "title": "Lesson 1.1 Title",
          "description": "A one-sentence description of this lesson."
        },
        {
          "title": "Lesson 1.2 Title",
          "description": "A one-sentence description of this lesson."
        }
      ]
    }
  ]
}
`;

export async function generateCourseOutline(topic: string): Promise<{ course: Course; sources: Source[] }> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createPrompt(topic),
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const rawText = response.text.trim();
        let course: Course;

        try {
          // Fix: Extract the JSON object from the raw text, as it may be wrapped in markdown.
          const jsonStartIndex = rawText.indexOf('{');
          const jsonEndIndex = rawText.lastIndexOf('}');

          if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
            throw new Error("Could not find a valid JSON object in the response.");
          }
          
          const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
          const parsedJson = JSON.parse(jsonString);

          // Validate that the parsed JSON has the properties we expect for a Course
          if (parsedJson && parsedJson.title && parsedJson.description && Array.isArray(parsedJson.modules)) {
            course = parsedJson as Course;
          } else {
            // Throw if the JSON is valid but doesn't match our schema
            throw new Error("Parsed JSON does not match the expected course structure.");
          }
        } catch (jsonError) {
          console.error("Failed to parse or validate JSON response:", jsonError);
          console.error("Raw Gemini response:", rawText);
          // Throw our custom error with a user-friendly message for the UI
          throw new InvalidJsonError(
            'Failed to generate a valid course structure. The AI returned an unexpected format. Please try again with a different topic.'
          );
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        
        const sourceMap = new Map<string, Source>();

        for (const chunk of groundingChunks) {
            if (chunk.web?.uri) {
                const { uri, title } = chunk.web;
                // Snippet is often in retrievedContext, which is at the same level as `web`.
                const snippet = (chunk as any).retrievedContext?.text;

                if (sourceMap.has(uri)) {
                    const existing = sourceMap.get(uri)!;
                    if (!existing.snippet && snippet) {
                        existing.snippet = snippet;
                    }
                    if (!existing.title && title) {
                        existing.title = title;
                    }
                } else {
                    sourceMap.set(uri, {
                        uri,
                        title: title || '',
                        snippet: snippet,
                    });
                }
            }
        }
        const sources: Source[] = Array.from(sourceMap.values());

        return { course, sources };

    } catch (error) {
        // Re-throw our custom error so it's not replaced by the generic one below
        if (error instanceof InvalidJsonError) {
            throw error;
        }

        console.error("Error calling Gemini API:", error);
        // For all other errors (network, API key issues), throw a generic, user-friendly error.
        throw new Error("An error occurred while generating the course. Please check your connection and API key, then try again.");
    }
}