import os
import yfinance as yf
import pandas as pd
import requests
import psycopg2
import time
from YFinance import YFinance


def refresh_list():
    nasdaq = requests.get("http://ftp.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt")
    nyse = requests.get("http://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt")
    file = open("./ticker_list.txt", "w")
    file.write(str(nasdaq.text))
    file.write(str(nyse.text))
    file.close()
    nasdaq = pd.read_csv("./ticker_list.txt", sep="|")
    nasdaq = list(nasdaq['Symbol'])
    # and len(stock) < 10 and "$" not in stock and "." not in stock
    nasdaq = [stock for stock in nasdaq if isinstance(stock, str) and len(stock) < 10 and "$" not in stock and "." not in stock]
    return nasdaq
def run_get_names():
    conn = psycopg2.connect(database="zephyr_capital",
                        host=os.environ.get("DB_HOST", "localhost"),
                        user="postgres",
                        password=os.environ.get("DB_PASSWORD", ""),
                        port="5432")
    tickers = refresh_list()
    cursor = conn.cursor()
    cursor.execute(f"""
    SELECT ticker FROM ports.stocks;
    """)
    d = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    df = pd.DataFrame(d, columns=columns)
    tickers = [stock for stock in tickers if stock not in list(df['ticker'])]
    for ticker in tickers:
        try:
            yf = YFinance(ticker)
            try:
                full_name = yf.info['shortName']
            except Exception as e:
                full_name = 'Name Not Found'
            cursor.execute(f"""
                INSERT INTO ports.stocks (ticker, full_name)
                VALUES (%s, %s)
            """, (ticker, full_name))
            print(ticker," ",full_name)
        except Exception as e:
            print(e)
            continue
    time.sleep(1)
    conn.commit()