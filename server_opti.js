const express = require("express"); // Get express
const { HfInference } = require("@huggingface/inference");
const hf = new HfInference("<api_key_here>"); // Replace with your Hugging Face API key

const app = express(); // Instance of express

// Add middleware to parse JSON
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Code Assistant API!");
});

// Helper function to create prompts for code generation
const createCodeGenerationPrompt = (taskData) => {
  const { taskDescription, language } = taskData;

  return `Write code for the following task in ${language}:
  
  Task: ${taskDescription}
  
  Return only the code snippet in the specified programming language, with no additional text.`;
};

// Helper function to create prompts for code optimization
const createCodeOptimizationPrompt = (taskData) => {
  const { code, language } = taskData;

  return `Optimize the following ${language} code for better performance and readability. Provide the optimized code only:
  
  ${code}
  
  Return only the optimized code snippet, with no additional text.`;
};

// Route for code generation
app.post("/generatecode", async (req, res) => {
  console.log("Received request for code generation");

  try {
    const taskData = req.body;

    // Validate request body
    if (!taskData || !taskData.taskDescription || !taskData.language) {
      return res.status(400).json({ error: "Invalid input. Please provide taskDescription and language." });
    }

    // Build the prompt
    const prompt = createCodeGenerationPrompt(taskData);

    // Call Hugging Face API
    const result = await hf.textGeneration({
      model: "tiiuae/falcon-7b-instruct", // Use a suitable model for text/code generation
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
        stop: ["\n\n"],
        do_sample: true,
      },
    });

    console.log("Generated Code:", result);
    res.json({ code: result.generated_text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for code optimization
app.post("/optimizecode", async (req, res) => {
  console.log("Received request for code optimization");

  try {
    const taskData = req.body;

    // Validate request body
    if (!taskData || !taskData.code || !taskData.language) {
      return res.status(400).json({ error: "Invalid input. Please provide code and language." });
    }

    // Build the prompt
    const prompt = createCodeOptimizationPrompt(taskData);

    // Call Hugging Face API
    const result = await hf.textGeneration({
      model: "TheBloke/CodeLlama-7B-Instruct-GGUF", // Use a model optimized for code tasks
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
        stop: ["\n\n"],
        do_sample: true,
      },
    });

    console.log("Optimized Code:", result);
    res.json({ optimizedCode: result.generated_text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(4000, () => {
  console.log("Backend server is listening at port 4000");
});
