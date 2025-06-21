from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_google_genai import  GoogleGenerativeAIEmbeddings
from langchain.vectorstores import FAISS
import os
from dotenv import load_dotenv

load_dotenv()

def load_vector_retriever():
    loader = TextLoader("data/sample_okrs.txt")
    docs = loader.load()
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    split_docs = splitter.split_documents(docs)
    embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key="GOOGLE_API_KEY")
    vectorstore = FAISS.from_documents(split_docs, embeddings)
    return vectorstore.as_retriever() 