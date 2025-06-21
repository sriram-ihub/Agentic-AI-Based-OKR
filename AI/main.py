from fastapi import FastAPI, Request
from pydantic import BaseModel
from agents.parser_agent import create_okr_parser

app = FastAPI()
parser_chain = create_okr_parser()

class OKRRequest(BaseModel):
    okr_text: str

@app.post("/parse_okr")
def parse_okr(req: OKRRequest):
    response = parser_chain.run(req.okr_text)
    return {"parsed": response}