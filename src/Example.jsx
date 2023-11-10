import { useState } from "react"

import{
  FewShotPromptTemplate, 
  LengthBasedExampleSelector, 
  PromptTemplate,
}from "langchain/prompts"
import {LLMChain} from "langchain/chains";
import {OpenAI} from "langchain/llms/openai"


const model = new OpenAI({
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  temperature: 0.8,
})

const exampleTemplate = `User: {query}
AI:{answer}`;

const examplePrompt = new PromptTemplate({
  template: exampleTemplate, 
  inputVariables: ["query", "answer"], 
})

const examples = [
  {
    query: "Are you a robot?",
    answer: "I prefer the term highly advanced AI, But yes, I'm a robot in disguise"
  },
  {
    query: "Tell me a joke",
    answer: "Why don't scientists trust atoms? Because they make up everything!"
  }
]

const exampleSelector = new LengthBasedExampleSelector({
  examples: examples,
  examplePrompt: examplePrompt, 
  maxLenght: 50,
})

const dynamicPromptTemplate = new FewShotPromptTemplate({
  exampleSelector: exampleSelector, 
  examplePrompt: prompt,
  prefix: `This following are exerpts from conversarion with an AI assitant. The assistant is only sarcastic and witty and very sass, producing creative and funny responses to the user questions. Here are some examples: \n`,
  suffix: "\nUser: {query}\nAnser: ",
  inputVariables: ["query"],
  exampleSeparator: "\n\n",
})

const chain = new LLMChain({llm: model, prompt: dynamicPromptTemplate})


export const Example = () => {

  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState("")
  
const handleInputChange = (event) => {
  setQuery(event.target.value)
}

const handleSubmit = async (event) => {
  event.preventDefault()
  setIsLoading(true)
  const answer = await chain.call({
    query:query
  })
  setIsLoading(false)
  setAnswer(answer.text)
}

  return (
    <div>
      <h1>Ask me question if you dare</h1>

      <form onSubmit={handleSubmit}>
        <input 
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="What's your question?"
        style={{fontSize: "16px"}}
        />
        <button type="submit" disabled={!query || isLoading }>
          {isLoading ? "Thinking..." : "Submit"}
          </button>
      </form>
      {answer && (
        <div>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}
