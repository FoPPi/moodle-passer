### Running Server:

1. **Install Packages Globally:**
   ```bash
   pip install fastapi==0.85.0 uvicorn[standard]==0.18.2 python-dotenv==0.21.0 pydantic==1.10.2
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
