const { GoogleGenAI } = require("@google/genai");
const { Mistral } = require("@mistralai/mistralai");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
  title: z
    .string()
    .describe("The standard title of the job extracted from the job description"),
  technicalQuestions: z
    .array(
      z.object({
        question: z.string().describe("The technical interview question"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, points to cover, and approach"),
      })
    )
    .describe("At least 5 technical questions related to the job description"),
  behavioralQuestions: z
    .array(
      z.object({
        question: z.string().describe("The behavioral interview question"), // Fixed description
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question using the STAR method"),
      })
    )
    .describe("At least 5 behavioral questions focusing on soft skills and past experiences"),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill the candidate is lacking based on the JD"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("Severity of this skill gap impact on hiring chances"),
      })
    )
    .describe("At least 3 skill gaps identified by comparing the resume to the JD"),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().describe("The day number (1 through 7)"),
        focus: z.string().describe("Main focus of this day (e.g., System Design, React hooks)"),
        tasks: z.array(z.string()).describe("Specific, actionable tasks for this day"),
      })
    )
    .describe("A 7-day preparation plan tailored to close the skill gaps"),
});

// Clean schema specifically for Gemini Structured Outputs
function getGeminiSchema(zodSchema) {
  const jsonSchema = zodToJsonSchema(zodSchema, { target: "openApi3" });
  delete jsonSchema.$schema; // Remove draft metadata tag that confuses Gemini
  return jsonSchema;
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an elite Senior Technical Recruiter and Engineering Manager.
Your task is to analyze a candidate's profile against a Job Description (JD) and generate a highly detailed, actionable interview preparation report.

### INSTRUCTIONS:
1. Analyze the overlap between the Candidate Profile and the Job Description.
2. Determine a realistic 'matchScore' (0-100). Be critical and objective.
3. Extract the standard job 'title' from the Job Description.
4. Identify at least 3 'skillGaps' where the candidate falls short of the JD. Assign severity strictly as "low", "medium", or "high".
5. Generate at least 5 'technicalQuestions' directly related to the required skills in the JD. Provide the interviewer's intention and a guide on how the candidate should answer.
6. Generate at least 5 'behavioralQuestions' tailored to the seniority and role.
7. Create a 7-day 'preparationPlan' focusing on closing the identified skill gaps and passing the interview.

### REQUIRED EXACT JSON TEMPLATE:
{
  "matchScore": 88,
  "title": "Extracted Job Title",
  "skillGaps": [
    {
      "skill": "Name of the missing skill",
      "severity": "high" // MUST be exactly "low", "medium", or "high"
    }
  ],
  "technicalQuestions": [
    {
      "question": "The technical question?",
      "intention": "Why ask this?",
      "answer": "How to answer it."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "The behavioral question?",
      "intention": "Why ask this?",
      "answer": "How to answer it using STAR."
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "Topic for the day",
      "tasks": [
        "Actionable task 1",
        "Actionable task 2"
      ]
    }
  ]
}

###CRITICAL INSTRUCTIONS FOR OUTPUT FORMAT:
- "skillGaps" MUST be an array of objects. Example:
  [
    { "skill": "Docker", "severity": "high" },
    { "skill": "Kubernetes", "severity": "medium" }
  ]
- DO NOT return primitive numbers or simple strings inside "skillGaps".
- Ensure "severity" is strictly one of: "low", "medium", or "high".

### CANDIDATE PROFILE:
Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

### JOB DESCRIPTION:
${jobDescription}
`;

  const chatResponse = await client.chat.complete({
    model: "mistral-large-2512",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" }, // Forces strict JSON output
    temperature: 0.1, // Low temperature for maximum compliance
  });

  const responseText = chatResponse.choices[0].message.content;
  const rawData = JSON.parse(responseText);
  // console.log(rawData);
  
  // 2. The Magic of Zod: Validate the data before returning it!
  // If Mistral hallucinates or flattens an array, Zod will instantly catch it here
  // and throw a clear error, protecting your MongoDB from crashing.
  const validatedData = interviewReportSchema.parse(rawData);
  // console.log(validatedData);
  
  return validatedData;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true // Ensures it runs invisibly in the background
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  // 1. Define the exact Zod Schema
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe("The complete HTML5 document of the resume designed with embedded CSS"),
  });

  // Convert Zod to JSON Schema for the prompt
  const jsonSchema = zodToJsonSchema(resumePdfSchema, { target: "openApi3" });

  // 2. Structured Prompt for Mistral
  const prompt = `
You are an expert Resume Writer and Frontend Developer.
Create an ATS-optimized professional resume in HTML format based on the candidate's details and target job.

### CRITICAL INSTRUCTION:
You must return a valid JSON object that strictly adheres to the following JSON Schema:
${JSON.stringify(jsonSchema, null, 2)}

### HTML REQUIREMENTS (for the "html" string field):
1. The html must be a COMPLETE HTML5 DOCUMENT (starts with <!DOCTYPE html>).
2. Include sections: Summary, Skills, Education, Experience (if available), Projects, Certifications (if available).
3. Tailor the resume for the provided Job Description. Highlight only relevant skills.
4. Use professional colors and embedded CSS (<style> tags inside <head>).
5. No JavaScript.
6. ATS Friendly, modern clean layout, print-friendly, and optimized to fit on one page.
7. Do not mention AI. Do not invent fake experience.
8. Ensure all quotes and newlines inside the HTML are properly escaped so the JSON remains valid.

### CANDIDATE PROFILE:
Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

### TARGET JOB DESCRIPTION:
${jobDescription}
`;

  // 3. Call Mistral API
  const chatResponse = await client.chat.complete({
    model: "mistral-large-2512",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" }, // Forces output to be valid JSON
    temperature: 0.2, // Kept low to ensure strict structural compliance while allowing slight CSS creativity
  });

  const responseText = chatResponse.choices[0].message.content;
  const rawData = JSON.parse(responseText);
  // console.log(rawData);
  
  // 4. Validate output with Zod
  const validatedData = resumePdfSchema.parse(rawData);

  // 5. Generate PDF using Puppeteer
  const pdfBuffer = await generatePdfFromHtml(validatedData.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
