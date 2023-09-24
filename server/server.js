const express   = require('express')
const cors = require('cors')
const path = require('path')
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);

// const __dirname = path.dirname(__filename);



const app = express()
const port = process.env.PORT||3030
app.use(cors())
app.use(express.json())

// 1. Import necessary modules and libraries
// import { OpenAI } from 'langchain/llms';
// import { RetrievalQAChain } from 'langchain/chains';
// import { HNSWLib } from 'langchain/vectorstores';
// import { OpenAIEmbeddings } from 'langchain/embeddings';
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import * as fs from 'fs';
// import * as dotenv from 'dotenv';

// 2. Load environment variables
const { OpenAI } = require('langchain/llms/openai');
const { RetrievalQAChain } = require('langchain/chains');
const { HNSWLib,PineconeStore } = require('langchain/vectorstores');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const  fs = require('fs');
const  dotenv = require('dotenv')


dotenv.config();


// 3. Set up input data and paths
const txtFilename = "handbook";
// const question = "Tell me about “The Experimenter and the Finisher";
const txtPath = `./${txtFilename}.txt`;
const VECTOR_STORE_PATH = `${txtFilename}.index`;

// 4. Define the main function runWithEmbeddings
 const runWithEmbeddings = async (question) => {
  // 5. Initialize the OpenAI model with an empty configuration object
  console.log(process.env.OPENAI_API_KEY)
  const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY

  });

  // 6. Check if the vector store file exists
  let vectorStore;
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // 6.1. If the vector store file exists, load it into memory
    console.log('Vector Exists..');
    console.table(HNSWLib)
    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());
  } else {
    // 6.2. If the vector store file doesn't exist, create it
    // 6.2.1. Read the input text file
    const text = fs.readFileSync(txtPath, 'utf8');
    // 6.2.2. Create a RecursiveCharacterTextSplitter with a specified chunk size
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    // 6.2.3. Split the input text into documents
    const docs = await textSplitter.createDocuments([text]);
    // 6.2.4. Create a new vector store from the documents using OpenAIEmbeddings
    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
    // 6.2.5. Save the vector store to a file
    await vectorStore.save(VECTOR_STORE_PATH);
  }

  // 7. Create a RetrievalQAChain by passing the initialized OpenAI model and the vector store retriever
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  // 8. Call the RetrievalQAChain with the input question, and store the result in the 'res' variable
  const res = await chain.call({
    query: question,
  });

  

  // 9. Log the result to the console
//   console.log({ res });
  return res
};





app.use(express.static('public'))

app.post('/api/v1/handbook',async(req,res)=>{
      try{
        const {question} =req.body
        const answer = await runWithEmbeddings(question)
    
        if(question){
            res.json({data:answer.text})
        }

      }catch(err){
        res.send(err)
        console.log(err)
      }
})

app.listen(process.env.PORT||3030)




