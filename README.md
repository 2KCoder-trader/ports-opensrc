# ports-opensrc

Open-source release of the Ports stock-portfolio tracker — backend, frontend, and
data/utility scripts.

## Layout

- `ports/` — Spring Boot (Java 17, Maven) backend
- `frontend/` — React (Create React App) web client
- `python_scripts/` — standalone Python utilities for stock data, scheduling, AI strategy work
- `server.js` — small Node demo server (unrelated, kept for reference)

## Configuration

All credentials are read from environment variables. Each subproject has its
own `.env.example` — copy to `.env` and populate values before running.

**Backend** (`ports/src/main/resources/application.properties` reads `${VAR}`):
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — Postgres
- `OPENAI_API_KEY`, `ALPHAVANTAGE_API_KEY` — external data/AI APIs
- `ENCRYPTION_SECRET_KEY` — 32-char AES key for `EncryptionUtil`
- `JWT_SECRET_KEY` — HMAC secret for signing auth tokens
- `RECAPTCHA_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- `TS_*` — TradeStation OAuth (only if running the broker integration)

**Frontend** (`process.env.REACT_APP_*`, inlined into the bundle at build time):
- `REACT_APP_API_URL` — backend base URL
- `REACT_APP_SECRET_KEY` — must match backend `ENCRYPTION_SECRET_KEY`
- `REACT_APP_ALPHAVANTAGE_KEY`, `REACT_APP_FEEDBACK_EMAIL`

> Note: `REACT_APP_*` values are visible to anyone who loads the deployed site.
> Do not put true secrets there.

## Run

```
# backend
cd ports
./mvnw spring-boot:run

# frontend
cd frontend
npm install
npm start
```

## License

TBD.
