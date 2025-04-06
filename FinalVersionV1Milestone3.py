import openai
import psycopg2
from retell import Retell
from dotenv import load_dotenv
import os
import re
from datetime import datetime
import tkinter as tk
from tkinter import messagebox

# Load environment variables
load_dotenv()

# Initialize OpenAI and Retell clients
openai.api_key = os.getenv("OPENAI")
client = Retell(api_key=os.getenv("RETELL"))

def is_within_preferred_time(preferred_time):
    if not preferred_time or '-' not in preferred_time:
        return False
    try:
        current_time = datetime.now().strftime('%H:%M')
        start_time_str, end_time_str = preferred_time.split('-')
        start_time = datetime.strptime(start_time_str.strip(), '%I%p').strftime('%H:%M')
        end_time = datetime.strptime(end_time_str.strip(), '%I%p').strftime('%H:%M')
        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"Error parsing time range {preferred_time}: {e}")
        return False

def run_program():
    run_button.config(state=tk.DISABLED)
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port="5432"
        )
        cursor = connection.cursor()
        cursor.execute('SELECT "id", "call_id", "phone_number", "preferred_contact_time" FROM "fosters" ORDER BY "id" ASC;')
        fosters = cursor.fetchall()

        for foster in fosters:
            foster_id, call_id, phone_number, preferred_contact_time = foster

            if is_within_preferred_time(preferred_contact_time):
                log(f"Processing foster ID: {foster_id} with preferred contact time: {preferred_contact_time}")
                stripped_phone_number = re.sub(r'\D', '', phone_number)
                log(f"Stripped phone number for foster ID {foster_id}: {stripped_phone_number}")

                if call_id:
                    log(f"Processing foster ID: {foster_id} with call_id: {call_id}")
                    cursor.execute(
                        """
                        UPDATE "fosters"
                        SET "call_completed" = TRUE
                        WHERE "id" = %s;
                        """,
                        (foster_id,)
                    )
                    log(f"Updated 'call_completed' to TRUE for foster ID: {foster_id}")

                    try:
                        call_response = client.call.retrieve(call_id)
                        transcript = call_response.transcript
                        log(f"Transcript retrieved for call ID {call_id}: {transcript}")

                        # Set photographyneeded to True only if phrase is found
                        photos_needed = False
                        target_phrase = "No worries at all! We’ll have a member of the photography team reach out to you to coordinate a time for photos."
                        if target_phrase in transcript:
                            photos_needed = True

                        log(f"Photos needed (based on phrase match) for foster ID {foster_id}: {photos_needed}")

                        completion = openai.ChatCompletion.create(
                            model="gpt-4-turbo",
                            messages=[{
                                "role": "user",
                                "content": f"Generate a 3-4 paragraph biography based on the following information. Maintain an upbeat and engaging tone. Do not fabricate details—focus on presenting the information in a positive light, even if some aspects are not inherently optimistic. Ensure clarity, coherence, and a natural flow in the writing. Ignore any lines preceded by 'AGENT:'.\n\nHere is the provided information:\n\n{transcript}"
                            }]
                        )

                        generated_bio = completion.choices[0].message['content']
                        log(f"Generated Bio for foster ID {foster_id}: {generated_bio}")

                        cursor.execute(
                            """
                            UPDATE "fosters"
                            SET "transcription" = %s, "photographyneeded" = %s
                            WHERE "id" = %s;
                            """,
                            (generated_bio, photos_needed, foster_id)
                        )
                        log(f"Updated 'transcription' and 'photographyneeded' for foster ID: {foster_id}")

                    except Exception as e:
                        log(f"Error retrieving transcription for call_id {call_id}: {e}")

                else:
                    log(f"No call_id for foster ID: {foster_id}, initiating phone call...")
                    phone_call_response = client.call.create_phone_call(
                        from_number="+18446060918",
                        to_number=f"+1{stripped_phone_number}"
                    )
                    call_id = phone_call_response.call_id
                    log(f"Phone call initiated. Call agent ID (used as call_id): {call_id}")

                    cursor.execute(
                        """
                        UPDATE "fosters"
                        SET "call_id" = %s
                        WHERE "id" = %s;
                        """,
                        (call_id, foster_id)
                    )
                    log(f"Phone call initiated for foster ID: {foster_id}. call_id updated.")

        connection.commit()
        messagebox.showinfo("Success", "Program ran successfully!")

    except Exception as e:
        messagebox.showerror("Error", f"An error occurred: {e}")

    finally:
        run_button.config(state=tk.NORMAL)
        connection.close()

def log(message):
    print(message)
    text_box.insert(tk.END, message + "\n")
    text_box.yview(tk.END)

# GUI setup
window = tk.Tk()
window.title("Foster Call System")
window.geometry("800x600")

run_button = tk.Button(window, text="Run Program", command=run_program, font=('Arial', 14), width=20, height=2)
run_button.pack(pady=20)

text_box = tk.Text(window, height=20, width=80, font=('Arial', 12))
text_box.pack(pady=20)

window.mainloop()
