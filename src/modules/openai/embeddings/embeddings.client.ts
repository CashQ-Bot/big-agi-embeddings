export const requireUserKeyEmbeddings = !process.env.HAS_SERVER_KEY_OPENAI_EMBEDDINGS;

export const isValidDatabaseUrl = (apiKey?: string) => !!apiKey /*&& apiKey.startsWith("redis")*/;

export const embeddingsDefaultIndex: string = 'index';

export const embeddingsDefaultDocCount: string = '1';
