const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const crossReferenceLocation = async (locationName, userHealthInfo) => {
  const prompt = PromptTemplate.fromTemplate(`
    You are a Retail AI assistant for seniors.
    Target Location: {locationName}
    User Health Profile: {healthInfo}

    Task:
    1. Simulate cross-referencing {locationName} with its website and Google Maps.
    2. Provide the company's phone number, address, and hours.
    3. If the location is a restaurant, check for conflicts with the user's allergies, dietary restrictions, or medications.
    
    Output format:
    - Phone: [number]
    - Address: [full address]
    - Hours: [opening hours]
    - Health Conflicts: [Detailed list or "None detected"]
    - Recommendation: [Brief advice for the senior]
  `);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  
  const result = await chain.invoke({
    locationName,
    healthInfo: JSON.stringify(userHealthInfo),
  });

  return result;
};

module.exports = { crossReferenceLocation };
