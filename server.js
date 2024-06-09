const express = require("express");
const dotenv = require("dotenv");
const { VertexAI } = require("@google-cloud/vertexai");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const systemInstruction = `
You are tasked to generate summary sheets for patients in the following json format:

{
"PatientUHID": 0,
"PatientIndoorID": 0,
"PatientAdmitDate": "0000-00-00",
"ClinicalNotes": "",
"ProvisionalDiagnosis": "",
"FinalDiagnosis": "",
"TreatmentGiven": "",
"CourseAfterAdmission": "",
"ConditionAtDischarge": "",
"ProcedureCodeForSurgey": "",
"Investigation": [],
"Advise": [],
"Remarks": ""
}

Feel free to Add in some of your own remarks and advises like lyfestyle changes
etc based on the medical history.
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
