### Running Server:

1. **Install Packages Globally:**
   ```bash
   pip install fastapi==0.110.3 uvicorn==0.29.0 pydantic==2.7.1 python-dotenv==1.0.1 g4f==0.3.0.7
   ```
   OR
   ```bash
   pip install -r requirements.txt
   ```

   This command will install these packages for all projects and users (depending on whether you have administrative rights or not).

2. **Run Your Application:**
   ```bash
   uvicorn main:app --reload
   ```
   You can run your FastAPI application directly using Uvicorn.
