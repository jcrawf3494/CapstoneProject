import openai
import psycopg2
from retell import Retell
from dotenv import load_dotenv
import os
import re  # Importing the regular expression module
from datetime import datetime
import tkinter as tk
from tkinter import messagebox

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI")

# Initialize Retell client
api_key = os.getenv("RETELL")
client = Retell(api_key=api_key)

# Function to check if the current time is within the preferred contact time range
def is_within_preferred_time(preferred_time):
    # Ensure the preferred_time is valid
    if not preferred_time or '-' not in preferred_time:
        return False  # Return False if the time format is not valid

    # Get current time in 12-hour format
    current_time = datetime.now().strftime('%I:%M %p')

    try:
        # Parse the preferred time range (e.g., "7AM-10AM")
        start_time_str, end_time_str = preferred_time.split('-')

        # Convert start and end times to 24-hour format
        start_time = datetime.strptime(start_time_str.strip(), '%I%p').strftime('%I:%M %p')
        end_time = datetime.strptime(end_time_str.strip(), '%I%p').strftime('%I:%M %p')

        # Check if current time is within the range
        return start_time <= current_time <= end_time
    except Exception as e:
        print(f"Error parsing time range {preferred_time}: {e}")
        return False

# Function to run the program
def run_program():
    run_button.config(state=tk.DISABLED)  # Disable the button to prevent multiple clicks while running
    try:
        # Reconnect to the database every time the button is clicked
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port="5432"
        )

        # Create a cursor to interact with the database
        cursor = connection.cursor()

        # Start from id=1 and loop through the fosters table until no more entries
        cursor.execute('SELECT "id", "call_id", "phone_number", "preferred_contact_time" FROM "fosters" ORDER BY "id" ASC;')

        # Fetch all fosters with call_id, phone_number, and preferred contact time
        fosters = cursor.fetchall()

        # Loop through all fetched fosters
        for foster in fosters:
            foster_id, call_id, phone_number, preferred_contact_time = foster

            # Check if the current time is within the preferred contact time
            if is_within_preferred_time(preferred_contact_time):
                log(f"Processing foster ID: {foster_id} with preferred contact time: {preferred_contact_time}")

                # Strip non-numeric characters from the phone number
                stripped_phone_number = re.sub(r'\D', '', phone_number)
                log(f"Stripped phone number for foster ID {foster_id}: {stripped_phone_number}")

                if call_id:
                    log(f"Processing foster ID: {foster_id} with call_id: {call_id}")

                    # Update the 'call_completed' column to True for the current foster
                    cursor.execute(
                        """
                        UPDATE "fosters"
                        SET "call_completed" = TRUE
                        WHERE "id" = %s;
                        """,
                        (foster_id,)
                    )
                    log(f"Updated 'call_completed' to TRUE for foster ID: {foster_id}")

                    # Retrieve the transcription using Retell
                    try:
                        call_response = client.call.retrieve(call_id)
                        transcript = call_response.transcript
                        log(f"Transcript retrieved for call ID {call_id}: {transcript}")

                        # Generate a bio from the transcription using OpenAI API
                        completion = openai.ChatCompletion.create(
                            model="gpt-3.5-turbo",
                            messages=[{
                                "role": "user",
                                "content": f"Generate a 2-3 paragraph biography based on the following information. Maintain an upbeat and engaging tone. Do not fabricate details—focus on presenting the information in a positive light, even if some aspects are not inherently optimistic. Ensure clarity, coherence, and a natural flow in the writing. Ignore any lines preceded by 'AGENT:'.\n\nHere is the provided information:\n\n{transcript}"
                            }]
                        )

                        generated_bio = completion.choices[0].message['content']
                        log(f"Generated Bio for foster ID {foster_id}: {generated_bio}")

                        # Update the 'transcription' column with the generated bio
                        cursor.execute(
                            """
                            UPDATE "fosters"
                            SET "transcription" = %s
                            WHERE "id" = %s;
                            """,
                            (generated_bio, foster_id)
                        )
                        log(f"Updated 'transcription' for foster ID: {foster_id}")

                    except Exception as e:
                        log(f"Error retrieving transcription for call_id {call_id}: {e}")

                else:
                    log(f"No call_id for foster ID: {foster_id}, initiating phone call...")

                    # Create the phone call using Retell
                    phone_call_response = client.call.create_phone_call(
                        from_number="+18446060918",  # Replace with your number
                        to_number=f"+1{stripped_phone_number}"  # Using the stripped phone number
                    )

                    # Extract the call_id from the phone call response
                    call_id = phone_call_response.call_id
                    log(f"Phone call initiated. Call agent ID (used as call_id): {call_id}")

                    # Update the foster's call_id in the database
                    cursor.execute(
                        """
                        UPDATE "fosters"
                        SET "call_id" = %s
                        WHERE "id" = %s;
                        """,
                        (call_id, foster_id)
                    )
                    log(f"Phone call initiated for foster ID: {foster_id}. call_id updated.")

        # Commit all changes to the database
        connection.commit()

        messagebox.showinfo("Success", "Program ran successfully!")

    except Exception as e:
        messagebox.showerror("Error", f"An error occurred: {e}")

    finally:
        # Re-enable the button after the program finishes
        run_button.config(state=tk.NORMAL)
        # Close the database connection
        connection.close()

# Function to log both to terminal and GUI Text widget
def log(message):
    print(message)  # Output to terminal
    text_box.insert(tk.END, message + "\n")  # Insert message to the GUI text widget
    text_box.yview(tk.END)  # Auto-scroll to the bottom

# Create the main window
window = tk.Tk()
window.title("Foster Call System")

# Set the size of the window
window.geometry("800x600")  # Width x Height

# Create a button to run the program
run_button = tk.Button(window, text="Run Program", command=run_program, font=('Arial', 14), width=20, height=2)
run_button.pack(pady=20)

# Create a text box widget to display logs
text_box = tk.Text(window, height=20, width=80, font=('Arial', 12))
text_box.pack(pady=20)

# Run the Tkinter event loop
window.mainloop()
