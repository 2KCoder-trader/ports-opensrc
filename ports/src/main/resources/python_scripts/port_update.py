import sys
import psycopg2
import pandas as pd
from KeyUpdater import headers
import requests
from datetime import datetime
import json
from risk_num_calc import cunt
from SpeedRunner import market_status
import time
import numpy as np
while True:
    # if not market_status(0,0):
    #     continue
    conn = psycopg2.connect(database="zephyr_capital",
                                host=os.environ.get("DB_HOST", "localhost"),
                                user="postgres",
                                password=os.environ.get("DB_PASSWORD", ""),
                                port="5432") 

    cursor = conn.cursor()


    # TODO also need to recalculate risk ratio and (expense ratio)

    # cursor.execute(f"SELECT * FROM ports.portfolios")
    # d = cursor.fetchall()


    ff = requests.get(f"https://api.example.com/ports/portfolios/getAll",verify=False)


    # columns = [desc[0] for desc in cursor.description]
    df = pd.json_normalize(ff.json())
    # print(df)
    for index, row in df.iterrows():
        # load in neccesary data
        stocks = row['stock']
        shares = row['shares']
        position_types = row['positionTypes']
        pnl_hist = row['pnlHist']
        date_hist = row['dateHist']
        avg_prices = row['avgPrices']
        curRisk = row['curRisk']
        # init_percentage = row['init_percentages']

        new_risk = cunt(stocks, shares, position_types, 'SPY')
        # for short stocks as the price decreases the percentage increases
        # percentages
        url = f"https://api.tradestation.com/v3/marketdata/quotes/{','.join(stocks)}"
        quotes = requests.request("GET", url, headers=headers()).json()['Quotes']
        cur_price = 0
        for i in range(len(stocks)):
            # for each stock
            # load data
            stock_price = float(quotes[i]['Ask'])
            if position_types[i] == 'long':
                # print(stock_price*float(shares[i]))
                cur_price += stock_price*float(shares[i])
            else:
                avg_price = avg_prices[i]
                # print((avg_price - stock_price) + avg_price)
                cur_price += (avg_price - stock_price + avg_price)*float(shares[i])
        percentage = []
        # print("cur_price ",cur_price)

        for i in range(len(stocks)):
            if position_types[i] == 'long':
                stock_price = float(quotes[i]['Ask'])

                percentage.append(str(stock_price*float(shares[i])/float(cur_price)*100))
            else:
                avg_price = avg_prices[i]
                stock_price = float(quotes[i]['Ask'])
                stock_price = (avg_price - stock_price + avg_price)
                percentage.append(str(stock_price*shares[i]/cur_price*100))
        # print(percentage)


        # check if its updated
        # if date_hist[-1] == str(datetime.now().date()):
        #     continue
        # calculate new_price
        # cur_price = 0
        # # this will get request limited as we hv more ports we can make it more efficient later by using my last_quotes.py script
        # url = f"https://api.tradestation.com/v3/marketdata/quotes/{','.join(stocks)}"
        # quotes = requests.request("GET", url, headers=headers())['Quotes']
        # for i, stock in enumerate(stocks):
            
        #     stock_price = float(quotes[0]["Ask"])

        #     if position_types[i] == 'long':
        #         cur_price += round(stock_price*float(shares[i]),2)
        #     else:
        #         cur_price += round(float(percentage[i]) + (float(percentage[i])  - stock_price*float(shares[i])),2)
        pnl_hist.append(cur_price)
        date_hist.append(str(datetime.now().year) + '-' + str(datetime.now().month) + '-' + str(datetime.now().day)+ '-' + str(datetime.now().hour) + '-' + str(datetime.now().minute))
        # print(pnl_hist)
        # print(date_hist)
        # print(percentage)
        # # print(new_risk)
        # print(row['portfolioId'])
        # pnl_hist = json.dumps(pnl_hist)
        # date_hist = json.dumps(date_hist)
        # percentage_json = json.dumps(percentage)


        data = {
            "pnlHist": pnl_hist ,
            "dateHist": date_hist ,
            "curRisk":curRisk ,
            "curPercentages": percentage,
            "portfolioId": int(row['portfolioId'])
        }
        headerss = {
            "Content-Type": "application/json"
        }

        response = requests.post("https://api.example.com/ports/portfolios/update/pnl-date-risk-perc", json=data, headers=headerss,verify=False)
        # print(response.json())

        # update the database
    #     update_statement = """
    #     UPDATE ports.portfolios
    #     SET pnl_hist = %s,
    #         date_hist = %s,
    #         cur_risk = %s,
    #         cur_percentages = %s
    #     WHERE portfolio_id = %s;
    #     """
    #     cursor.execute(update_statement, (pnl_hist, date_hist, new_risk, percentage_json, row['portfolio_id']))
    #     # Commit the changes
    #     conn.commit()
    # conn.close()
    # cursor.close()
    time.sleep(60*60)
