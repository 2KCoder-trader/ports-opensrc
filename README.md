# ports-backend-opensrc

Open-source release of the Ports backend: a Spring Boot service for portfolio
tracking, paired with auxiliary Python scripts for data collection and analysis.

## Layout

- `ports/` — Spring Boot (Java 17, Maven) backend
- `python_scripts/` — standalone Python utilities for stock data, scheduling, AI strategy work
- `server.js` — small Node demo server (unrelated, kept for reference)

## Configuration

All credentials are read from environment variables. Copy `.env.example` to `.env`
and populate values before running. The Spring app reads them via `${VAR}` in
`application.properties`; Python scripts read them via `os.environ`.

Required env vars at minimum:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — Postgres
- `OPENAI_API_KEY`, `ALPHAVANTAGE_API_KEY` — external data/AI APIs
- `ENCRYPTION_SECRET_KEY` — 32-char key for `EncryptionUtil` (AES)
- `RECAPTCHA_SECRET`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- `TS_*` — TradeStation OAuth (only if running the broker integration)

## Run the backend

```
cd ports
./mvnw spring-boot:run
```

## License

TBD.
