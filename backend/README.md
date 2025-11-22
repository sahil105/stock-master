# OTP Authentication Backend

Minimal FastAPI service to generate, deliver, and validate expiring email OTPs via Gmail SMTP.

## Requirements

- Python 3.11+
- Gmail account with an **App Password** (do not reuse the account password).
- MySQL or compatible server (8.0+ recommended) accessible from the host running the backend.

## Setup

1. From the `backend/` directory, create a virtual environment:
   ```bash
   python -m venv .venv
   ```
2. Activate the environment:
   - **Windows PowerShell**: `.\.venv\Scripts\Activate.ps1`
   - **Command Prompt**: `.\.venv\Scripts\activate`
   - **macOS/Linux**: `source .venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Environment

1. Copy `.env.example` to `.env` in the `backend/` directory.
2. Provision a MySQL database (e.g., `otp_service`) and grant a user access.
3. Fill in your email credentials plus the database information. The service uses `DATABASE_URL` if present; otherwise it requires `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`:
   ```text
   EMAIL_ADDRESS=your-address@gmail.com
   EMAIL_PASSWORD=your-app-password
   DB_HOST=0.tcp.in.ngrok.io
   DB_PORT=18785
   DB_USER=team_maven
   DB_PASSWORD=maven@123
   DB_NAME=StockMaster
   ```
   If you prefer a connection string, you can instead set:
   ```text
   DATABASE_URL=mysql+pymysql://username:password@host:3306/otp_service
   ```
4. Keep this file secret; do not commit it to version control.

## Running the Server

Use uvicorn to start the FastAPI app:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive documentation is available at `http://127.0.0.1:8000/docs`.

## API Endpoints

### `POST /send-otp`

Request body:

```json
{ "email": "user@example.com" }
```

Response:

```json
{ "success": true, "message": "OTP sent" }
```

### `POST /verify-otp`

Request body:

```json
{ "email": "user@example.com", "otp": "123456" }
```

Responses:

- `{ "success": true, "message": "OTP verified" }`
- `{ "success": false, "message": "Invalid or expired OTP" }`

## Notes

- OTPs expire after 5 minutes.
- Each new OTP invalidates the previous one for the same email.
- Data is persisted in whatever database is pointed to by `DATABASE_URL` (MySQL by default).

