import os
import time
import threading
import time
from datetime import datetime
from queue import Queue
import requests
import pandas as pd
from KeyUpdaterSIM1 import headers1
from KeyUpdaterSIM2 import headers2
import psycopg2
from YFinance import YFinance
import pytz
from sqlalchemy import create_engine
from market_status import market_status

def print_to_txt_file(message):
    with open(r"run.txt", 'a') as file:
        file.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S")+": "+message + '\n')
# log_file_path = "C:\\Users\\zephy\\Documents\\ports-backend\\python_scripts\\run.txt"

def convert_to_eastern(x):
        x = datetime.strptime(x, "%Y-%m-%dT%H:%M:%S.%fZ")
        utc_time = x.replace(tzinfo=utc)
        eastern_time = utc_time.astimezone(eastern)
        return eastern_time
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






def server_stonks(stocks,cnt,engine):
    try:
        conn = psycopg2.connect(database="zephyr_capital",
                                host=os.environ.get("DB_HOST", "localhost"),
                                user="postgres",
                                password=os.environ.get("DB_PASSWORD", ""),
                                port="5432")



        cursor = conn.cursor()
        url = "https://api.tradestation.com/v3/marketdata/quotes/" + ",".join(stocks)
        if cnt % 2 == 0:
            response = requests.request("GET", url, headers=headers2())
        else:
            response = requests.request("GET", url, headers=headers1())
        df = pd.DataFrame(response.json()['Quotes'])
        df['ticker'] = df['Symbol']
        df['change'] = df['NetChange'].astype(float)
        df['last_price'] = df['Last'].astype(float)
        df['volume'] = df['Volume'].astype(int)
        df = df[['ticker','change','last_price','volume']]
        df.to_sql(f'temp_n_stocks_{cnt}', engine, schema='ports', if_exists='replace', index=False)
        cursor.execute(f"""
        UPDATE ports.stocks
        SET change = temp.change,
            last_price = temp.last_price,
            volume = temp.volume
        FROM ports.temp_n_stocks_{cnt} AS temp
        WHERE ports.stocks.ticker = temp.ticker;
        """)
        cursor.execute(f""" DROP TABLE ports.temp_n_stocks_{cnt};""")
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print_to_txt_file(f"Error in run_stocks: {e} at line {e.__traceback__.tb_lineno} in file stocks.py")

def run_stocks():
    try:
        print("Starting")
        engine = create_engine(os.environ.get('DB_URL', 'postgresql+psycopg2://postgres:@localhost:5432/zephyr_capital'))
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
        stock_id_map = {}
        for stock_id, ticker in d:
            stock_id_map[ticker] = stock_id
        utc = pytz.utc
        eastern = pytz.timezone("US/Eastern")     
        tickers = split_list_into_groups_of_100(tickers)
        print_to_txt_file(f"Waiting for market to open")
        while True:
            if market_status(0, 5):
                break
        print_to_txt_file(f"Market Opened")
        # for testing
        cnt = 0
        print_to_txt_file(f"Closing connection")
        cursor.close()
        conn.close()
        while True:
            for group in tickers:
                threading.Thread(target=server_stonks,args=(group,cnt,engine)).start()
                time.sleep(.505)
                cnt += 1
                print("cnt: ",cnt)
            if not market_status(0, 5):
                time.sleep(300)
                break
    except Exception as e:
        print_to_txt_file(f"Error in run_stocks: {e} at line {e.__traceback__.tb_lineno} in file stocks.py")




