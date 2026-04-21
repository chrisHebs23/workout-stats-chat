import os
from dotenv import load_dotenv
from supabase import Client, create_client
from fastapi import FastAPI
from google import genai

load_dotenv()

app = FastAPI()


url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

genai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
