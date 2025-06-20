from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from app.vector_store import load_vector_retriever

def create_okr_parser():
    retriever = load_vector_retriever()
    llm = ChatOpenAI(temperature=0.2, model="gpt-4")

    prompt = PromptTemplate(
        template="""
You are an OKR parsing assistant.

Given the OKR: "{input}" and examples: {context}, extract and return a structured JSON:
{{
  "objective": "...",
  "deliverables": ["...", "..."],
  "timeline": "..."
}}
""",
        input_variables=["input", "context"]
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type="stuff",
        chain_type_kwargs={"prompt": prompt}
    )

    return chain
