import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

def add_notification_email(email: str) -> dict:
    """
    Adds an email to the notifications table.
    """
    data = {"mail_id": email}
    response = supabase.table("notification_user").insert(data).execute()
    return response.data


if __name__ == "__main__":
    # Example usage
    test_email = "test@gmail.com"
    result = add_notification_email(test_email)
    print(f"Added email: {result}")