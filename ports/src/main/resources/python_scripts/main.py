import pandas
import requests
from KeyUpdater import headers
from pprint import pprint
import json
import time
import pandas as pd
import SpeedRunner
import psycopg2
from decimal import Decimal
from tabulate import tabulate
pd.set_option('display.max_rows', None)  # Adjust as needed
pd.set_option('display.max_columns', None)  # Adjust based on your DataFrame


def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def main(cursor,id):

    cursor.execute(f"SELECT * FROM ports.portfolios WHERE portfolio_id = {id}")
    d = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    print(columns)
    df = pd.DataFrame(d, columns=columns)
    df.to_csv("test.csv")
    stocks = d[0][6]
    # print(stocks)
    # print(tabulate(df, headers='keys', tablefmt='psql'))
    result = ','.join(stocks)

    url = f"https://api.tradestation.com/v3/marketdata/quotes/{result}"

    response = requests.request("GET", url, headers=headers())

    po = response.json()

    ooga = []
    for i in po['Quotes']:
        ooga.append(i['Last'])
    print(ooga)
    # breakpoint()


    #need to change the columns 

    p = d[0][10]
   
    if p == None:
        p = []
    if d[0][7] == None:

        update_query = """
        UPDATE ports.portfolios
        SET init_price = %s
        WHERE portfolio_id = %s;
        """
        new_pnl_hist_json = json.dumps(ooga)
        cursor.execute(update_query, (new_pnl_hist_json, id))
        update_query2 = """
        UPDATE ports.portfolios
        SET total_price = %s
        WHERE portfolio_id = %s;
        """
        ooga = list(map(float, ooga))
        cursor.execute(update_query2, (sum(ooga), id))

        conn.commit()

    
    else:
        print("d")
        print(d)
        print("d[0][0]")
        print(d[0][0])
        e = d[0][5]
        prev_pnl = d[0][3]
        update_query2 = """
        UPDATE ports.portfolios
        SET total_price = %s
        WHERE portfolio_id = %s;
        """
        ooga = list(map(float, ooga))
        free = sum(ooga)
        print("free ",free)
        print("id ",id)
        print("e ",e)
        cursor.execute(update_query2, (sum(ooga), id))

        cursor = conn.cursor()
        update_query3 = """
        UPDATE ports.portfolios
        SET total_pnl = %s
        WHERE portfolio_id = %s;
        """
        cursor.execute(update_query3, ( float(free) - float(e), id))


        
        update_query4 = """
        UPDATE ports.portfolios
        SET pnl_hist = %s
        WHERE portfolio_id = %s;
        """
        print("prev_pnl")
        print(prev_pnl)

        p.append(prev_pnl)
        new_hist_hist_json = json.dumps(p,default=decimal_to_float)
        print("p")
        print(type(p))
        print(p)
        print("new_hist_hist_json")
        print(new_hist_hist_json)
        print("end")
        cursor.execute(update_query4, (new_hist_hist_json, id))

        conn.commit()



while True:
    conn = psycopg2.connect(database="zephyr_capital",
                            host=os.environ.get("DB_HOST", "localhost"),
                            user="postgres",
                            password=os.environ.get("DB_PASSWORD", ""),
                            port="5432") 

    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM ports.portfolios WHERE published = 'f'")
    rtr = cursor.fetchall()
  

    for i in rtr:
        main(cursor,i[9])

    time.sleep(86400)

