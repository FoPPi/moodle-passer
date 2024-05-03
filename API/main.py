from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List
from g4f.client import AsyncClient
from g4f.Provider import FreeGpt

from Database import Database
from services import generate_user_key, activate_user_key, check_user_key, check_api_key

app = FastAPI()
client = AsyncClient()
db = Database('subscription.db')

db.connect()

# API key security
api_key_query = APIKeyHeader(name="api_key")
user_key_query = APIKeyHeader(name="user_key")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["api_key", "user_key", "Authorization", "Content-Type"],
)


class Question(BaseModel):
    test_type: str
    question: str
    prompt: int
    answers: List[str]


@app.post("/")
async def gpt_request(question_data: Question, api_key: str = Depends(api_key_query),
                      user_key: str = Depends(user_key_query)):
    if await check_api_key(api_key) and await check_user_key(db, user_key):
        test_type = question_data.test_type
        question = question_data.question
        type = question_data.prompt
        answers = question_data.answers

        typeText = ''
        if type == 1:
            typeText = 'Select only one answer'
        elif type == 2:
            typeText = 'Select one or several answers'
        elif type == -1:
            typeText = 'Write an answer'

        response = await client.chat.completions.create(
            provider=FreeGpt,
            model="gpt-3.5-turbo",
            stream=False,
            max_tokens=1000,
            messages=[{"role": "user",
                       "content": f"Help me to solve a question of {test_type}. "
                                  f"{'Write only letter of the answer!' if type != -1 else ''} "
                                  f"Question: {question}. "
                                  f"Answers: {answers if type != -1 else 'write text in answer'}. "
                                  f"{typeText}"
                       }
                      ],
        )
        return {"answer": response.choices[0].message.content}


@app.get("/user/generate")
async def create_user(api_key: str = Depends(api_key_query)):
    if await check_api_key(api_key):
        return await generate_user_key(db)


@app.post("/user/activate")
async def activate_user(api_key: str = Depends(api_key_query), user_key: str = Depends(user_key_query)):
    if await check_api_key(api_key):
        return await activate_user_key(db, user_key)


