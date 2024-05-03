import uuid
from datetime import datetime, date

from fastapi import HTTPException
from dotenv import dotenv_values

config = dotenv_values(".env")


async def generate_user_key(db):
    key = uuid.uuid4().__str__()

    try:
        await db.insert_data('users', {
            'subscription_key': key,
        })

        return {'key': key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def activate_user_key(db, key):
    selected = await db.select_data('users', ['active'], f'subscription_key = "{key}"')

    if len(selected) == 0:
        raise HTTPException(status_code=403, detail="Key not found")
    elif selected[0][0] == 1:
        raise HTTPException(status_code=403, detail="Key is already active")

    try:
        await db.update_data('users', {'active': 1}, f'subscription_key = "{key}"')

        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def check_user_key(db, key):
    selected = await db.select_data('users', ['active', 'end_date'], f'subscription_key = "{key}"')

    if len(selected) == 0:
        raise HTTPException(status_code=403, detail="Key not found")
    elif selected[0][0] == 0:
        raise HTTPException(status_code=403, detail="Key is not active")

    end_date_str = selected[0][1]
    end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    current_date = date.today()

    if current_date > end_date:
        await db.delete_data('users', f'subscription_key = "{key}"')
        raise HTTPException(status_code=403, detail="Subscription is expired")
    else:
        return True


async def check_api_key(api_key):
    if api_key != config.get("API_KEY"):
        raise HTTPException(status_code=403, detail="Invalid API key")
    else:
        return True
