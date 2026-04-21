from clients import supabase

run_sql_declaration = {
    "name": "run_sql",
    "description": "Executes a SQL SELECT query against the workouts table and returns the results",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "A valid SQL SELECT statement to run against the workouts table",
            }
        },
    },
}


def run_sql(query: str) -> str:
    """Executes a SQL SELECT query against the workouts table and returns the results.

    Only SELECT statements are allowed. Use this tool to answer questions about
    workout history, exercise performance, weight progression and training frequency.

    Args:
        query: A valid SQL SELECT statement against the workouts table
    """
    query = query.strip().rstrip(";").strip()
    head = query.upper()
    if not (head.startswith("SELECT") or head.startswith("WITH")):
        return "ERROR: Only SELECT queries (optionally starting with WITH) are allowed."

    print(f"[run_sql] query: {query}")
    try:
        result = supabase.rpc("execute_sql", {"query": query}).execute()
    except Exception as e:
        print(f"[run_sql] exception: {e!r}")
        return f"ERROR: {type(e).__name__}: {e}"

    data = result.data
    print(f"[run_sql] rows: {len(data) if isinstance(data, list) else 'n/a'}")
    if data is None:
        return "ERROR: query returned no data (possible SQL error). Rewrite the query and retry."
    return str(data)
