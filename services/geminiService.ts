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
        
        // Specific check for content safety blocks from the API response
        if (response.promptFeedback?.blockReason) {
            const reason = response.promptFeedback.blockReason.toLowerCase().replace(/_/g, ' ');
            throw new Error(`Your request was blocked due to ${reason}. Please adjust your topic and try again.`);
        }

        const rawText = response.text?.trim();
        
        // Specific check for an empty response from the AI
        if (!rawText) {
            throw new InvalidJsonError('The AI returned an empty response. This might happen with very niche or complex topics. Please try rephrasing your topic.');
        }

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
            'The AI returned an unexpected format. This can happen with niche or complex topics. Please try rephrasing your topic.'
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
        console.error("Error calling Gemini API:", error);

        // Re-throw our custom JSON error so it's not replaced by the generic one below
        if (error instanceof InvalidJsonError) {
            throw error;
        }

        if (error instanceof Error) {
            // Check for API key issues
            if (error.message.toLowerCase().includes('api key not valid')) {
                throw new Error("The configured API key is invalid. Please check your configuration.");
            }
            // Check for quota/billing issues
            if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
                 throw new Error("You have exceeded your API quota. Please check your billing status and try again later.");
            }
            // Re-throw the safety block error we threw from inside the try block
            if (error.message.includes('request was blocked')) {
                throw error;
            }
        }
        
        // Fallback for network errors or other unexpected issues
        throw new Error("An error occurred while generating the course. Please check your internet connection and try again.");
    }
}