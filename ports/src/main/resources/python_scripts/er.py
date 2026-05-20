import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import statsmodels.api as sm
from math import floor
import math
import statsmodels
from statsmodels.tsa.stattools import coint
from sklearn import linear_model
import time
from SpeedRunner import market_status
import SpeedRunner
import threading
import requests
from KeyUpdater import headers
import SpeedRunner
from datetime import date, datetime, timedelta
from time import gmtime, strftime
import pytz
from risk_num_calc import cunt
import psycopg2


def get_data(ticker,barsback):
    
    url = f"https://api.tradestation.com/v3/marketdata/barcharts/{ticker}"
    params = {
        "interval": 1,
        "unit": "Daily",
        "barsback": f'{barsback}',
        "sessiontemplate":'USEQ24Hour'
    }

    response = requests.request("GET", url, params=params, headers=headers())
    #print(response.json())
    bars = response.json()['Bars']
    closes = SpeedRunner.process_data(bars)['Close'][1:]

    #print(closes)

    return closes.values


def mfer(tickers, risknum, stockydata, shares, lors, sectorticker,trading_cost_per_share):
    prices = []

    # risknum, stockydata = cunt(tickers, shares, lors, sectorticker)
    
    for stock in tickers: 
        stockdata = stockydata[stock]
        #print(stock)
        prices.append(stockdata[0])

    management_fee_rate = 0.03 - (0.02 / 100) * risknum
    total_aum = sum(shares[i] * prices[i] for i in range(len(shares)))
    total_management_expense = total_aum * management_fee_rate
    total_trading_costs = sum(shares[i] * trading_cost_per_share[i] for i in range(len(shares)))
    total_expenses = total_management_expense + total_trading_costs
    expense_ratio = (total_expenses / total_aum) * 100
    
    sigmoid_value = 1 / (1 + np.exp(-abs(expense_ratio))) - .5
    normalized_expense_ratio = sigmoid_value * 2

    # print(round(normalized_expense_ratio, 2), "<- ER")
    return round(normalized_expense_ratio, 2)
    

# if __name__ == '__main__':

#     conn = psycopg2.connect(database="zephyr_capital",
#                             host=os.environ.get("DB_HOST", "localhost"),
#                             user="postgres",
#                             password=os.environ.get("DB_PASSWORD", ""),
#                             port="5432") 


#     cursor = conn.cursor()
#     cursor.execute(f"SELECT * FROM ports.portfolios WHERE published = 'f'")
#     rtr = cursor.fetchall()


      
#     for i in rtr:
#         print(i[15])

#         tickers = i[6]
#         shares = []
#         if  i[15] == None or len(i[15]) != len(tickers):
#             shares = [1 for i in tickers]
#         else: 
#             shares = i[15]
#         lors = []
#         if i[15] == None or len(i[16]) != len(tickers):
#             lors = [1 for i in tickers]
#         else: 
#             lors = i[16]
   
#         sectorticker = i[17]
#         if sectorticker == None:
#             sectorticker = 'SPY'
#         print("starting")
#         time.sleep(5)
#         trading_cost_per_share = []
#         if i[18] == None or len(i[18]) != len(tickers):
#             trading_cost_per_share = [1 for i in tickers]
#         else: 
#             trading_cost_per_share = i[16]

#         print("starting")
#         time.sleep(1)
#         if i[14] == None:
#             oy = mfer(tickers, shares, lors, sectorticker, trading_cost_per_share)
#             update_query = """
#             UPDATE ports.portfolios
#             SET expense_ratio = %s
#             WHERE portfolio_id = %s;
#             """
#             cursor.execute(update_query, (oy, i[9]))
#             conn.commit()