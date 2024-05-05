import asyncio
import time

from g4f.client import AsyncClient
from g4f.Provider import FreeGpt

client = AsyncClient()


async def main(question, answers, type, test_type):
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
                   "content": f"Help me to solve a question of {test_type}. {'Write only letter of the answer!' if type != -1 else ''} Question: {question if type != -1 else 'write text in answer'}. Answers: {answers}. {typeText}"}],
    )
    print(response.choices[0].message.content)

start_time = time.time()
asyncio.run(main("Який буде результат: "" - 1 + 0",
                 [], -1, test_type='JS'))
print(f"--- {(time.time() - start_time):.2f} seconds ---")
