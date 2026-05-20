import time
import threading
import time
from datetime import datetime
from queue import Queue
import requests
import pandas as pd
from KeyUpdater import headers, reset_key
import psycopg2







def refresh_list():
    nasdaq = requests.get("http://ftp.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt")
    nyse = requests.get("http://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt")
    file = open("./ticker_list.txt", "w")
    file.write(str(nasdaq.text))
    file.write(str(nyse.text))
    file.close()
    nasdaq = pd.read_csv("./ticker_list.txt", sep="|")
    return list(nasdaq['Symbol'])
def split_list_into_groups_of_100(lst):
    # Calculate the number of groups
    num_groups = len(lst) // 100 + (1 if len(lst) % 100 != 0 else 0)
    # Initialize an empty list to store the groups
    groups = []
    # Iterate over the range of the number of groups
    for i in range(num_groups):
        # Calculate the start and end indices for the current group
        start = i * 100
        end = (i + 1) * 100
        # Append the current group to the list of groups
        groups.append(lst[start:end])
    return groups
def server_stonks(stocks,name_df,cursor,conn):
    url = "https://api.tradestation.com/v3/marketdata/quotes/" + ",".join(stocks)
    response = requests.request("GET", url, headers=headers())
    for quote in response.json()['Quotes']:
        if "Error" in quote:
            print(quote)
            continue
        if float(quote['PreviousClose']) <= 0:
            continue
        try:
            name = name_df[name_df['stock'] == quote['Symbol']].iloc[0]['name']
        except:
            name = " "
        # print(name)
        symbol = quote['Symbol']
        volume = int(quote['Volume'])
        change = round((float(quote['Last'])-float(quote['PreviousClose']))/float(quote['PreviousClose'])*100,2)
        price = float(quote['Last'])
        try:
            cursor.execute(f"""
                INSERT INTO ports.stocks (symbol, full_name, volume, change_percent, price)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (symbol) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    volume = EXCLUDED.volume,
                    change_percent = EXCLUDED.change_percent,
                    price = EXCLUDED.price;
            """, (symbol, name, volume, change, price))
            conn.commit()
        except Exception as e:
            print("SQL ERROR")
            print(e)
            conn.rollback()
        



while True:
    name_df = pd.read_csv("stock_name.csv",index_col=0)
    stocks = refresh_list()
    stock_groups = split_list_into_groups_of_100(stocks)
    conn = psycopg2.connect(database="zephyr_capital",
                        host=os.environ.get("DB_HOST", "localhost"),
                        user="postgres",
                        password=os.environ.get("DB_PASSWORD", ""),
                        port="5432")
    cursor = conn.cursor()
    reset_key()
    threads = []
    for group in stock_groups:
        group = [str(x) for x in group]
        thread = threading.Thread(target=server_stonks,args=(group,name_df,cursor,conn))
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()
    cursor.close()
    conn.close()
    print("sleeping ...")
    time.sleep(1)
    print("updating ...")