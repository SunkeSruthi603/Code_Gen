const express = require("express"); // Get express
const { HfInference } = require("@huggingface/inference");
const hf = new HfInference("<api_key_here>"); // Replace with your Hugging Face API key

const app = express(); // Instance of express

// Add middleware to parse JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Reached root");
});

// Create Prompt for Code Generation
const createCodePrompt = (taskData) => {
  const { taskDescription, language } = taskData;

  return `Write code for the following task in ${language}:
  
  Task: ${taskDescription}
  
  Return only the code snippet in the specified programming language, with no additional text.`;
};

app.post("/generatecode", async (req, res) => {
  console.log("Received request for code generation");

  try {
    const taskData = req.body;
    console.log("Request Body:", taskData);

    // Validate request body
    if (!taskData || !taskData.taskDescription || !taskData.language) {
      return res.status(400).json({ error: "Invalid input. Please provide taskDescription and language." });
    }

    // Build the prompt dynamically
    const prompt = createCodePrompt(taskData);

    // Call Hugging Face API with the generated prompt
    const result = await hf.textGeneration({
      model: "tiiuae/falcon-7b-instruct", // Change to any suitable Hugging Face model
      inputs: prompt,
      parameters: {
        max_new_tokens: 300, // Limit the tokens
        temperature: 0.7, // Adjust randomness of the output
        top_p: 0.95, // Consider only tokens with cumulative probability ≤ 0.95
        return_full_text: false, // Return only generated text
        stop: ["\n\n"], // Stop generation after a double newline
        do_sample: true, // Enable sampling for creative code generation
      },
    });

    // Log and respond with the result
    console.log("Generated Code:", result);
    res.json({ code: result.generated_text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log("Backend server is listening at port 4000");
});
