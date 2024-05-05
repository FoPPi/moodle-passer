from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import List
from g4f.client import AsyncClient
from g4f.Provider import Bing

from Database import Database
from mail import send_mail
from services import activate_user_key, check_user_key, check_api_key, check_donatello_key, generate_user_key

app = FastAPI()
client = AsyncClient()
db = Database('subscription.db')

db.connect()

# API key security
api_key_query = APIKeyHeader(name="api_key")
user_key_query = APIKeyHeader(name="user_key")
donatello_api_key_query = APIKeyHeader(name="X-Key")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["api_key", "user_key", "X-Key", "Authorization", "Content-Type"],
)


class Question(BaseModel):
    test_type: str
    question: str
    prompt: int
    answers: List[str]


class Donate(BaseModel):
    pubId: str
    message: str
    amount: str


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
            typeText = 'Write what I need to enter in input'

        response = await client.chat.completions.create(
            provider=Bing,
            model="gpt-4-turbo",
            stream=False,
            max_tokens=1000,
            messages=[{"role": "user",
                       "content": f"Help me to solve a question of {test_type}. "
                                  f"{'Write only letter of the answer!'} "
                                  f"Question: {question}. "
                                  f"Answers: {answers if type != -1 else 'empty'}. "
                                  f"{typeText}"
                       }
                      ],
        )
        return {"answer": response.choices[0].message.content}


@app.post("/user/activate")
async def activate_user(api_key: str = Depends(api_key_query), user_key: str = Depends(user_key_query)):
    if await check_api_key(api_key):
        return await activate_user_key(db, user_key)


@app.post("/user/donates")
async def get_donates(donate_data: Donate, donatello_api_key: str = Depends(donatello_api_key_query)):
    if await check_donatello_key(donatello_api_key):
        key = await generate_user_key(db, donate_data)
        await send_mail(donate_data.message, key)
        return {"status": "success"}
