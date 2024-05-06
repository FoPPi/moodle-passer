import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import dotenv

config = dotenv.dotenv_values(".env")

HOST = config.get("SMTP_HOST")
PORT = int(config.get("SMTP_PORT"))

FROM_EMAIL = config.get("SMTP_USERNAME")
PASSWORD = config.get("SMTP_PASSWORD")




async def send_mail(TO_EMAIL, key):
    message = MIMEMultipart("alternative")
    message['Subject'] = "Subscription"
    message['From'] = FROM_EMAIL
    message['Cc'] = FROM_EMAIL
    message['Bcc'] = FROM_EMAIL
    message['To'] = TO_EMAIL

    html = ""
    with open("mail.html", "r") as file:
        html = file.read()

    html = html.replace("{{key}}", key)
    html_part = MIMEText(html, 'html')
    message.attach(html_part)

    smtp = smtplib.SMTP(HOST, PORT)
    status_code, response = smtp.ehlo()
    print(f"[*] Echoing the server: {status_code} {response}")

    status_code, response = smtp.starttls()
    print(f"[*] Starting TLS connection: {status_code} {response}")

    status_code, response = smtp.login(FROM_EMAIL, PASSWORD)
    print(f"[*] Logging in: {status_code} {response}")

    smtp.sendmail(FROM_EMAIL, TO_EMAIL, message.as_string())

    smtp.quit()
