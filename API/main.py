from venv import logger
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List
import dotenv

from g4f.client import AsyncClient
from g4f.Provider import FreeGpt

app = FastAPI()
client = AsyncClient()

api_key_query = APIKeyHeader(name="api_key")

origins = [
    "http://127.0.0.1:5500",
    "https://dn.duikt.edu.ua"
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,
    allow_origins=["*"],  # Для отладки
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    test_type: str
    question: str
    prompt: int
    answers: List[str]


@app.post("/")
async def root(question_data: Question, api_key: str = Depends(api_key_query)):
    if api_key != dotenv.get_key(".env", "API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API Key")

    test_type = question_data.test_type
    question = question_data.question
    type = question_data.prompt
    answers = question_data.answers


    typeText = ''
    if type == 1:
        typeText = 'Select only one answer'
    elif type == 2:
        typeText = 'Select only several answers'
    elif type == -1:
        typeText = 'Write an answer'

    response = await client.chat.completions.create(
        provider=FreeGpt,
        model="gpt-3.5-turbo",
        stream=False,
        max_tokens=1000,
        messages=[{"role": "user",
                   "content": f"Help me to solve a question of {test_type}. {'Write only letter of the answer!' if type != -1 else ''} Question: {question}. Answers: {answers}. {typeText}"}],
    )
    return {"answer": response.choices[0].message.content}
