
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, WeekPlan, Priority, ChatMessage, Task, Flashcard } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found.");
  return new GoogleGenAI({ apiKey });
};

export const generateStudyPlan = async (
  subjectName: string,
  syllabusText: string,
  preferences: UserPreferences,
  existingGlobalSchedule: Task[]
): Promise<WeekPlan[]> => {
  const ai = getClient();
  const busySlots = existingGlobalSchedule.map(t => `${t.assignedDate}: ${t.estimatedMinutes}m`).join(", ");

  const prompt = `
    Subject: ${subjectName}
    Syllabus Content: ${syllabusText}
    Preferences: Study for ${preferences.durationWeeks} weeks, starting ${preferences.startDate}.
    Study Days: ${preferences.studyDays.join(", ")}
    Target Hours: ${preferences.hoursPerDay}h/day.
    Busy Slots: ${busySlots.slice(0, 500)}
    
    Task: Create a detailed weekly study plan in JSON.
    - Each task needs an "assignedDate" (YYYY-MM-DD).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            weekNumber: { type: Type.INTEGER },
            theme: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: [Priority.HIGH, Priority.MEDIUM, Priority.LOW] },
                  estimatedMinutes: { type: Type.INTEGER },
                  assignedDate: { type: Type.STRING }
                },
                required: ['title', 'description', 'priority', 'estimatedMinutes', 'assignedDate']
              }
            }
          },
          required: ['weekNumber', 'theme', 'tasks']
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateExamPrep = async (
  subjectName: string,
  syllabus: string,
  notes?: string
): Promise<{ questions: string[]; summaries: string[]; flashcards: Flashcard[] }> => {
  const ai = getClient();
  const prompt = `
    Based on this syllabus for ${subjectName}:
    ${syllabus}
    
    ${notes ? `And these specific study notes: ${notes}` : ''}
    
    Task: Generate:
    1. 10 high-yield exam questions.
    2. 5 concise core concept summaries.
    3. 8 interactive flashcards (question and answer).
    Return as JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: { type: Type.ARRAY, items: { type: Type.STRING } },
          summaries: { type: Type.ARRAY, items: { type: Type.STRING } },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ['question', 'answer']
            }
          }
        },
        required: ['questions', 'summaries', 'flashcards']
      }
    }
  });

  return JSON.parse(response.text || '{"questions":[], "summaries":[], "flashcards":[]}');
};

export const getAITutorResponse = async (
  subjectName: string,
  syllabus: string,
  chatHistory: ChatMessage[],
  userQuery: string,
  mode: 'rag' | 'general'
): Promise<string> => {
  const ai = getClient();
  const historyParts = chatHistory.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const systemInstruction = mode === 'rag' 
    ? `You are a specialist tutor for ${subjectName}. Answer strictly using this syllabus: ${syllabus}. Be concise.`
    : `You are a general academic assistant. Help the student with any study-related query.`;

  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...historyParts, { role: 'user', parts: [{ text: userQuery }] }],
    config: { systemInstruction }
  });

  return result.text || "I'm sorry, I couldn't process that request.";
};
