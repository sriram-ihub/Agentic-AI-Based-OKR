import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini (Gemini 2.0 Flash)
llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.0-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.3
)

# LangChain Prompt Template
prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You break OKRs into detailed micro-tasks. Output only JSON list of tasks."),
    ("human", "OKR JSON: {okr_json}")
])

# Output parser
parser = StrOutputParser()

# LangChain chain
chain = prompt_template | llm | parser

def generate_micro_tasks(parsed_okr_json: dict) -> list:
    okr_str = json.dumps(parsed_okr_json, indent=2)
    response = chain.invoke({"okr_json": okr_str})

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        print("⚠️ Could not parse Gemini response. Raw output:\n", response)
        return [] 