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
    if not query.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed")
    result = supabase.rpc("execute_sql", {"query": query}).execute()
    return str(result.data)
