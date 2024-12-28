const express = require("express");
const dotenv = require("dotenv");
const { VertexAI } = require("@google-cloud/vertexai");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const clinicalNotesFormat = `
Clinical Symptoms:
    [AI to generate 10 most probable symptoms here based on the provisional diagnosis in a comma separated list]

Past History:
    [AI Insert "NOT APPLICABLE" if no past history is mentioned. Otherwise, fill in details.]

Personal History:
    [AI Insert "NOT APPLICABLE" if no personal history is mentioned. Otherwise, fill in details.]

General Examination:  
    Temperature:
    Pulse:
    Blood Pressure:
    Respiration Rate:
    SpO2:

Systemic Examination:  
    CVS (Cardiovascular System):   [AI generate generic examinations based on the provided diagnosis]
    CNS (Central Nervous System):  [AI generate generic examinations based on the provided diagnosis]
    RS (Respiratory System):       [AI generate generic examinations based on the provided diagnosis]
    Abdomen:                       [AI generate generic examinations based on the provided diagnosis]
    Local Examination:             [AI generate generic examinations based on the provided diagnosis]

`;

const treatmentGivenFormat = `
Treatment Plan:
    Follow-Up Plan:
        [AI to generate follow-up timelines and monitoring strategies for this condition]

`;
const systemInstruction = `
UNDERSTAND REMARKS WRITTEN FOR YOU INSIDE [], Remember you are AI. If I ask you to generate things
Be careful when reading General Examination and Systemic Examination.
Be careful with "\\n"
Based on provided diagnosis you should generate things
You are tasked to generate summary sheets for patients in the following json format:

{
"PatientUHID": 0,
"PatientIndoorID": 0,
"PatientAdmitDate": "0000-00-00",
"ProvisionalDiagnosis": "",
"FinalDiagnosis": "",
"ClinicalNotes": "",
"TreatmentGiven": "",
"CourseAfterAdmission": "",
"ConditionAtDischarge": "",
"ProcedureCodeForSurgey": "",
"Investigation": [],
"Advise": [],
"Remarks": ""
}


Here is what I expect in each field:

1) PatientUHID the health identifier I provide. I want you to set it to 0 by default
2) PatientIndoorID I will provide this, set 0 if not provided
3) PatientAdmitDate I will provide this, set to 0000-00-00 if not provided
4) ProvisionalDiagnosis I will provide this, set to blank if not provided
5) FinalDiagnosis should be same as ProvisionalDiagnosis, i will manually change in case it differs
6) ClinicalNotes -- THIS IS THE BULK OF YOU JOB, SO PAY ATTENTION
    You should generate Clinical Notes in the following format: ${clinicalNotesFormat.replace("\n", "\\n")}
these are text prompts so be sure to make use of \\n and \\t appropriately
7) TreatmentGiven -- THIS IS ALSO IMPORTANT AND I EXPECT IT IN THIS FORMAT
    You should generate Treatment Given in the following format: ${treatmentGivenFormat.replace("\n", "\\n")}
8) Advise -- Generate Common Advise based on provisional diagnosis
9) Remarks -- Generate Common Remarks based on provisional diagnosis


BE SURE TO GENERATE ONLY PLAIN TEXT (NO MARKDOWN) IN YOUR RESPONSE
`;
// Define a route that serves JSON
app.post("/api", async (req, res) => {
  try {
    const { prompt } = req.body;
    const string_prompt = JSON.stringify(prompt);
    const generativeModel = new VertexAI({
      project: process.env.PROJECT_ID,
      location: process.env.LOCATION,
    }).getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log(`recieved request: ${string_prompt}`);
    const request = {
      contents: [{ role: "user", parts: [{ text: string_prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 1.2,
      },
      systemInstruction: {
        role: "server",
        parts: [
          {
            text: systemInstruction,
          },
        ],
      },
    };
    const streamingResp = await generativeModel.generateContentStream(request);
    for await (const item of streamingResp.stream) {
      //   console.log("stream chunk: ", JSON.stringify(item));
    }
    // console.log(
    //   "aggregated response: ",
    //   JSON.stringify(await streamingResp.response)
    // );
    const generatedData = await streamingResp.response;
    const jsonData = generatedData.candidates[0].content.parts[0].text
      .replace(/\n/g, "")
      .replace(/```json/g, "")
      .replace(/```/g, "");
    // console.log(JSON.parse(jsonData));
    res.json({ status: "OK", response: jsonData });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ status: "ERROR", message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
