import sys
import psycopg2
import pandas as pd
from sqlalchemy import create_engine
from KeyUpdater import headers
import requests
from datetime import datetime
import json
conn = psycopg2.connect(database="zephyr_capital",
                            host=os.environ.get("DB_HOST", "localhost"),
                            user="postgres",
                            password=os.environ.get("DB_PASSWORD", ""),
                            port="5432") 

cursor = conn.cursor()

cursor.execute(f"SELECT stock,percentages,shares,total_price,name FROM ports.portfolios")
d = cursor.fetchall()

print(d[0][2])

for i,f in enumerate(d):
    print(i)
    print(d[i][2])
    url = f"https://api.tradestation.com/v3/marketdata/quotes/{','.join(d[i][0])}"
    response = requests.request("GET", url, headers=headers())

    prices = []
    stock_prices = []
    for ooga,name in enumerate(d[i][2]):

        stock_price = response.json()["Quotes"][ooga]["Ask"]
        stock_prices.append(stock_price)
        # print(stock_price)
        # print(name) 
        prices.append(float(name)*float(stock_price))

    print(prices)  

    more_q = []

    for ooga,name in enumerate(d[i][2]):
        stock_price = stock_prices[ooga]
        allo = d[i][1][ooga]
        new_q  = float(allo)/ float(stock_price)
        more_q.append(new_q)

    print(more_q)

    more_q_json = json.dumps(more_q)
    update_statement = """
    UPDATE ports.portfolios
    SET shares = %s
    WHERE name = %s ;
    """
    cursor.execute(update_statement, (more_q_json,d[i][4]))
    conn.commit()