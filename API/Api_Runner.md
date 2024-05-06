### Documentation for FastAPI Application Setup and API Testing

This document provides comprehensive instructions for setting up and testing a FastAPI application using Uvicorn as the server. Additionally, it outlines the procedure for using Visual Studio Code with the REST Client extension to test API endpoints effectively.

#### Prerequisites

Ensure Python is installed on your system, along with `pip` for managing Python packages.

#### Installation Steps

1. **Install Required Packages**:
   
   To avoid potential conflicts with other projects, it is recommended to use a virtual environment for package installations. Execute the following command to install the necessary packages:

   ```bash
   pip install -r requirements.txt
   ```

   This command installs all dependencies listed in your `requirements.txt`, which should include FastAPI, Uvicorn, and any others your application requires.

2. **Running the Application**:
   
   Start your FastAPI application using the following command. The `--reload` flag is particularly useful during development as it allows the server to automatically reload upon code changes.

   ```bash
   uvicorn main:app --reload
   ```

   `main` is the Python file where your FastAPI app is defined (`main.py`), and `app` is the FastAPI instance.

3. **Setup API Key**:

   - Create a `.env` file in the root directory of your project. This file will store the API key needed for authentication.

   ```dotenv
   API_KEY=
   DONATELLO_KEY=
    
   SMTP_USERNAME=
   SMTP_PASSWORD=
   SMTP_HOST=
   SMTP_PORT=
   ```

   Use this API key to authenticate requests to your API endpoints.

#### API Testing

Utilize the REST Client extension in Visual Studio Code to facilitate API testing. Configure your requests in a `test_main.http` file as follows:

1. **Global Variables**:
   
   Define essential variables at the start of the file for easy management of frequently used data like host URL, API key, and user key.

   ```http
   @host = http://127.0.0.1:8000
   @api_key = your_actual_api_key_here
   @donatello_key = your_actual_donatello_api_key_here
   @user_key = Enter_Key_Here_After_Generation
   ```

#### API Endpoints

   - **Generate User**:
     This endpoint generates a new `user_key`.
   
     ```http
     ### Generate User
     POST {{host}}/user/donates
     Content-Type: application/json
     X-Key: {{donatello_key}}
    
     {
       "pubId": "D41-123123",
       "message": "your_mail",
       "amount": "100"
     }
     ```

   - **Activate User**:
     This endpoint activates the `user_key` obtained from the "Generate User" step.
   
     ```http
     ### Activate User
     POST {{host}}/user/activate
     Content-Type: application/json
     X-Api-Key: {{api_key}}
     X-User-Key: {{user_key}}
     ```

   - **GPT Request**:
     Processes a question through GPT using the specified parameters.
   
     ```http
     ### GPT Request
     POST {{host}}/
     Content-Type: application/json
     X-Api-Key: {{api_key}}
     X-User-Key: {{user_key}}

     {
       "test_type": "Math",
       "question": "What is 2 + 2?",
       "prompt": 1,
       "answers": ["1", "2", "3", "4"]
     }
     ```

#### How to Use

- Open your `test_main.http` file in Visual Studio Code.
- Position your cursor over the name of a request and click the `Send Request` link that appears above it to execute.
- Ensure your FastAPI server is active as per the earlier instructions.