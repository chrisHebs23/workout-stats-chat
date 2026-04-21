from clients import supabase, genai_client
from prompts import system_prompt
from tool import run_sql
from google.genai import types

config = types.GenerateContentConfig(system_instruction=system_prompt, tools=[run_sql])


def chat(user_message: str):

    response = genai_client.models.generate_content(
        model="gemini-3-flash-preview", contents=user_message, config=config
    )

    return response.text
