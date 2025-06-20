from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from datetime import datetime, timedelta
from utils.email_sender import send_email
from utils.dashboard_notifier import send_dashboard_notification
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class ReminderAgent:
    def __init__(self, vector_store_path: str):
        self.llm = ChatGoogleGenerativeAI(
            model="models/gemini-2.0-flash",
            google_api_key=GEMINI_API_KEY,
            temperature=0.3
        )
        self.vectorstore = FAISS.load_local(
            vector_store_path,
            GoogleGenerativeAIEmbeddings(google_api_key=GEMINI_API_KEY)
        )
        self.rag_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=self.vectorstore.as_retriever()
        )
        self.sent_reminders = set()

    def should_remind(self, task, current_time):
        deadline = datetime.fromisoformat(task["deadline"])
        time_to_deadline = deadline - current_time
        return timedelta(hours=23) < time_to_deadline <= timedelta(hours=25)

    def generate_personalized_message(self, task, user_context):
        question = f"What kind of reminder message would help {user_context['name']} for task: {task['title']}?"
        context = f"User History:\n{user_context['history']}"
        prompt = f"{context}\n\n{question}"
        return self.rag_chain.run(prompt)

    def send_reminder(self, task, user_context):
        user_id = user_context["id"]
        task_id = task["id"]
        key = f"{user_id}_{task_id}"
        if key in self.sent_reminders:
            return  # Avoid redundant reminders

        current_time = datetime.now()
        if self.should_remind(task, current_time):
            message = self.generate_personalized_message(task, user_context)
            if user_context.get("preferred_channel") == "email":
                send_email(user_context["email"], message)
            else:
                send_dashboard_notification(user_id, message)
            self.sent_reminders.add(key)
            print(f"[✓] Reminder sent to {user_id} for task '{task['title']}'")

    def run(self, tasks, user_contexts):
        for user in user_contexts:
            user_tasks = [t for t in tasks if t["assigned_to"] == user["id"]]
            for task in user_tasks:
                self.send_reminder(task, user) 