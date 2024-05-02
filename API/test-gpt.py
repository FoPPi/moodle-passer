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
                   "content": f"Help me to solve a question of {test_type}. {'Write only letter of the answer!' if type != -1 else ''} Question: {question}. Answers: {answers}. {typeText}"}],
    )
    print(response.choices[0].message.content)


start_time = time.time()
# Run the asyncio event loop
asyncio.run(main("Дано наступний код:\n\nCSS\tHTML\n\nbody {\n\n    color: white;\n    background-color: blue;\n}\n\n\n.important {\n    color: yellow;\n    font-style: italic;\n}\n.highlight {\n    color: gray;\n}\n#vital {\n    color: yellow;\n    font-weight: bold;}ul li, ol {color: white;background-color: red;\n}\nbody > li {background-color: purple;}<body><p>Paragraph 1</p><ul><liclass=\"important\"id=\"vital\">Item 1</li><li>Item 2</li></ul><pclass=\"important highlight>Paragraph 2</p><ol><liclass=\"highlight\">Item 3</li></ol></body> Визначте правильні значення властивостей стилю дляParagraph 1",
                 [
                     "a. background-color: red",
                     "b. color: white",
                     "c. background-color: blue",
                     "d. font-weight: bold",
                     "e. color: gray",
                     "f. color: yellow",
                     "g. background-color: purple",
                     "h. font-style: italic"
                 ], 2, test_type='JS'))
print(f"--- {(time.time() - start_time):.2f} seconds ---")

start_time = time.time()
asyncio.run(main("Що означає CSS?", [
    "a. Computer Style Sheets",
    "b. Cascading Style Sheets",
    "c. Colorful Style Sheets",
    "d. Creative Style Sheets"
], 1, test_type='JS'))
print(f"--- {(time.time() - start_time):.2f} seconds ---")

start_time = time.time()
asyncio.run(main("Який t est буде результат:\n\n\"1\" + 2 + \"3\" + 4;",
            'write text in answer', -1, test_type='JS'))
print(f"--- {(time.time() - start_time):.2f} seconds ---")
