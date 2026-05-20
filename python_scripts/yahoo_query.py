import os
from yahooquery import Ticker
import psycopg2
import pandas as pd

conn = psycopg2.connect(database="zephyr_capital",
                                host=os.environ.get("DB_HOST", "localhost"),
                                user="postgres",
                                password=os.environ.get("DB_PASSWORD", ""),
                                port="5432")



cursor = conn.cursor()
cursor.execute(f"""
SELECT stock_id, ticker FROM ports.stocks;
""")
d = cursor.fetchall()
columns = [desc[0] for desc in cursor.description]
df = pd.DataFrame(d, columns=columns)
tickers = list(df['ticker'])

# symbols = ['fb', 'aapl', 'amzn', 'nflx', 'goog']

faang = Ticker(tickers)

print(faang.summary_detail)
