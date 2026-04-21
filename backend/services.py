from clients import supabase, genai_client
from prompts import system_prompt
from tool import run_sql
from google.genai import types

config = types.GenerateContentConfig(system_instruction=system_prompt, tools=[run_sql])


def chat(user_message: str) -> str:

    response = genai_client.models.generate_content(
        model="gemini-2.5-flash-lite", contents=user_message, config=config
    )

    if response.text:
        return response.text

    parts = (response.candidates[0].content.parts if response.candidates else []) or []
    text = "".join(p.text for p in parts if getattr(p, "text", None))
    return text or "I wasn't able to produce a response for that. Try rephrasing the question."
