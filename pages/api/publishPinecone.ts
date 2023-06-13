// noinspection ExceptionCaughtLocallyJS

import {NextRequest, NextResponse} from 'next/server';
import {PineconeClient} from "@pinecone-database/pinecone";
import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import {PineconeStore} from "langchain/vectorstores/pinecone";
import {RedisVectorStore} from "langchain/vectorstores/redis";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { loadQAChain } from "langchain/chains";


/**
 * 'Proxy' that uploads a file to paste.gg.
 * Called by the UI to avoid CORS issues, as the browser cannot post directly to paste.gg.
 */
export default async function handler(req: NextRequest) {

    try {
        const {to, question, dbHost, indexdb, docsCount, openaiKey, origin, model, chainType, modelTemp} = await req.json();
        if (req.method !== 'POST' || to !== 'pinecone.com' || !question)
            throw new Error('Invalid options');
        const index = !indexdb ? "index" : indexdb
        let defaultPrompt: string = "Use the following pieces of context to answer the users question. \\nIf you don't know the answer, just say that you don't know, don't try to make up an answer.\\n----------------\\n";
        const client = new PineconeClient();
        await client.init({
            apiKey: dbHost,
            environment: 'northamerica-northeast1-gcp',
        });

        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: openaiKey
        });
        const pineconeIndex = client.Index(index);
        const docsearch = await PineconeStore.fromExistingIndex(embeddings, {pineconeIndex});
        const docs = await docsearch.similaritySearch(question, docsCount);
        let result: string
        let resultDocs: any
        if (chainType && chainType!=="" && chainType!=="none") {
           /* let llm = new ChatOpenAI({modelName:model, streaming:false, temperature:modelTemp, openAIApiKey:openaiKey});
            let chain = loadQAChain(llm, {type:chainType});
            let res = await chain.call({
                input_documents: docs,
                question: question,
            });
            result = res.text;*/
            resultDocs = docs;
        } else {
            result = docs.map(doc => doc.pageContent).join("\\n\\n");
            result = defaultPrompt + result;
        }
        const payload = {
            type: 'success',
            //url: `https://paste.gg/${paste.result.id}`,
            //expires: paste.result.expires || 'never',
            chainType: chainType,
            result: result,
            resultDocs: resultDocs,
        };
        return new NextResponse(JSON.stringify(payload));

    } catch (error) {

        console.error('api/publish error:', error);
        return new NextResponse(JSON.stringify({
            type: 'error',
            error: error?.toString() || 'Network issue',
        }), {status: 500});

    }

}

// noinspection JSUnusedGlobalSymbols
export const config = {
    runtime: 'edge',
};