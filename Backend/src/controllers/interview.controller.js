const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

function sanitizeSkillGaps(skillGaps) {
  if (!Array.isArray(skillGaps)) return [];

  return skillGaps
    .map((gap) => {
      // If Gemini returned a plain string like "Docker"
      if (typeof gap === "string") {
        return { skill: gap, severity: "medium" };
      }
      // If Gemini returned a valid object
      if (typeof gap === "object" && gap !== null && gap.skill) {
        const severity = ["low", "medium", "high"].includes(gap.severity)
          ? gap.severity
          : "medium";
        return { skill: String(gap.skill), severity };
      }
      // Drop any invalid primitive values like numbers or booleans
      return null;
    })
    .filter(Boolean); // Filter out null values
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */

async function generateInterViewReportController(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Resume PDF file is required." });
    }

    const { selfDescription, jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required." });
    }

    // 1. Parse PDF safely
    let parsedResumeText = "";
    try {
      const resumeContent = await new pdfParse.PDFParse(
        Uint8Array.from(req.file.buffer),
      ).getText();
      parsedResumeText = typeof resumeContent === "string" ? resumeContent : resumeContent.text;
    } catch (pdfError) {
      console.error("PDF Parsing error:", pdfError);
      return res.status(400).json({ message: "Failed to read the resume PDF." });
    }

    // 2. Call Gemini
    const interViewReportByAi = await generateInterviewReport({
      resume: parsedResumeText,
      selfDescription: selfDescription || "Not provided",
      jobDescription,
    });

    // 3. Sanitize skillGaps to prevent Mongoose schema crash
    if (interViewReportByAi.skillGaps) {
      interViewReportByAi.skillGaps = sanitizeSkillGaps(interViewReportByAi.skillGaps);
    }

    // 4. Merge data for MongoDB
    const data = {
      user: req.user._id || req.user.id,
      resume: parsedResumeText,
      selfDescription: selfDescription || "",
      jobDescription,
      ...interViewReportByAi,
    };

    // 5. Save to MongoDB safely
    const interviewReport = await interviewReportModel.create(data);

    return res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });

  } catch (error) {
    console.error("Error in generateInterViewReportController:", error);
    return res.status(500).json({
      message: "An error occurred while generating the interview report.",
      error: error.message,
    });
  }
}
/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;

  const interviewReport =
    await interviewReportModel.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
