// AI Assistant integration using Google's Gemini API
class AIAssistant {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
    }

    async generateResponse(prompt, context = '') {
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                ...this.requestOptions,
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${context}\n\n${prompt}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('AI response error:', data);
                return 'Sorry, I could not generate a response at this time.';
            }
        } catch (error) {
            console.error('AI assistant error:', error);
            return 'An error occurred while communicating with the AI assistant.';
        }
    }

    async explainCode(code) {
        const prompt = `Explain this Java code in a clear, structured way that a beginner could understand. 
        
Please format your response with:
- A brief summary heading
- Sections with proper headings (e.g., ## Purpose, ## Key Concepts)
- Bullet points for listing important aspects
- Code examples where helpful

Focus on what the code does, any algorithms used, and potential issues or improvements.

${code}`;
        return this.generateResponse(prompt);
    }

    async suggestImprovements(code) {
        const prompt = `Analyze this Java code and suggest improvements. 
        
Please format your response with:
- A brief summary heading
- Clear sections with headings (e.g., ## Performance Improvements, ## Readability)
- Numbered lists for step-by-step improvements
- Code examples showing before/after where appropriate

${code}`;
        return this.generateResponse(prompt);
    }

    async debugHelp(code, error) {
        const prompt = `Help debug this Java code that's giving the following error:
Error: ${error}

Code:
${code}

Please provide a structured response with:
- A heading summarizing the issue
- The likely cause of the error
- A clear explanation of the problem
- A solution section with code examples

Explain what might be causing the error and suggest fixes.`;
        return this.generateResponse(prompt);
    }

    async generateExample(topic) {
        const prompt = `Create a simple Java code example about "${topic}". 

Please structure your response with:
- A heading introducing the topic
- A brief explanation section
- Key points as bullet lists
- Well-commented code example
- Optional: common pitfalls to avoid

The example should be educational and demonstrate good coding practices.`;
        return this.generateResponse(prompt);
    }

    async analyzeComplexity(code) {
        const prompt = `Analyze the time and space complexity of this Java code.

Please provide a concise response with:
- The overall time complexity (Big O notation)
- The overall space complexity (Big O notation)
- One brief sentence explaining why

Make your response exactly in this JSON format:
{
  "timeComplexity": "O(?)",
  "spaceComplexity": "O(?)",
  "explanation": "Brief explanation..."
}

${code}`;
        
        const response = await this.generateResponse(prompt);
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // Fallback parsing - look for complexity information in text
            const timeMatch = response.match(/time complexity.*?O\(([^)]+)\)/i);
            const spaceMatch = response.match(/space complexity.*?O\(([^)]+)\)/i);
            return {
                timeComplexity: timeMatch ? `O(${timeMatch[1]})` : "Unknown",
                spaceComplexity: spaceMatch ? `O(${spaceMatch[1]})` : "Unknown",
                explanation: "Extracted from analysis"
            };
        } catch (error) {
            console.error('Error parsing complexity analysis:', error);
            return {
                timeComplexity: "Unknown",
                spaceComplexity: "Unknown",
                explanation: "Could not determine complexity"
            };
        }
    }
} 