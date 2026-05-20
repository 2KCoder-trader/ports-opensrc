import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.cm as cm
import statsmodels.api as sm
from math import floor
import math
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
import pandas_market_calendars as mcal



def get_data(ticker,barsback):
    
    url = f"https://api.tradestation.com/v3/marketdata/barcharts/{ticker}"
    params = {
        "interval": 1,
        "unit": "Daily",
        "barsback": f'{barsback}',
        "sessiontemplate":'USEQ24Hour'
    }

    response = requests.request("GET", url, params=params, headers=headers())
    # print(response.json())
    try:
        response.json()['Bars']
    except:
        print(response.json())
    bars = response.json()['Bars']
    closes = SpeedRunner.process_data(bars)['Close'][1:]

    #print(closes)

    return closes.values


def betacov(stockData, marketData):
    covariance = np.cov(stockData[1:], marketData[1:])
    variance = np.var(marketData[1:])
    return covariance[0,1] / variance


def betalr(x,y):
    x = sm.add_constant(x)
    model = sm.regression.linear_model.OLS(y,x).fit()

    # We are removing the constant
    x = x[:, 1]
    return model.params[1]


def get_wmean(stocknums, stockprices, finalbetas):
    finalbetas = np.array(finalbetas, dtype=float)
    stocknums = np.array(stocknums, dtype=float)
    stockprices = np.array(stockprices, dtype=float)
    # print(stocknums)
    # print(stockprices)
    weighted_avg = np.average(finalbetas, weights=stocknums*stockprices)
    variancee = np.average((finalbetas-weighted_avg)**2, weights=stocknums*stockprices)

    return weighted_avg, variancee


def map_to_percentage(beta_value):
    # Apply sigmoid transformation
    
    sigmoid_value = 1 / (1 + np.exp(-abs(beta_value))) - .5
    
    # Scale sigmoid value to percentage (0-100%)
    percentage = sigmoid_value * 5
    
    return percentage

def tradingdaysnum():
    # Get the NYSE calendar
    nyse = mcal.get_calendar('NYSE')

    # Define the start and end dates
    start_date = pd.Timestamp.today() - pd.DateOffset(years=2)
    end_date = pd.Timestamp.today()

    # Get the trading schedule between the start and end dates
    schedule = nyse.schedule(start_date=start_date, end_date=end_date)

    # Calculate the number of trading days
    number_of_trading_days = len(schedule)

    # Print the result
    #print("trading day num", number_of_trading_days)

    return(number_of_trading_days)


def cunt(tickers, shares, lors, sectorticker):
    stockydata = {}
    betas = []
    prices = []

    number_of_trading_days = tradingdaysnum()

    marketdata = get_data(sectorticker, number_of_trading_days)
    marketdata_pct_change = np.diff(marketdata) / marketdata[:-1]
    # print(sectorticker)

    for stock in tickers: 
        stockdata = get_data(stock, number_of_trading_days)
        stockdata_pct_change = np.diff(stockdata) / stockdata[:-1]
        # print(stock)
        stockydata[stock] = stockdata
        
        shorter_length = min(len(stockdata_pct_change), len(marketdata_pct_change))

        # Shorten both lists to the length of the shorter list
        stockdata_pct_change = stockdata_pct_change[:shorter_length]
        marketdata_pct_change = marketdata_pct_change[:shorter_length]

        beta1 = betacov(stockdata_pct_change,marketdata_pct_change)
        beta2 = betalr(marketdata_pct_change,stockdata_pct_change)

        finalbeta = (beta1 + beta2) / 2

        # print(tickers.index(stock), "index")

        if lors[tickers.index(stock)] == 0:
            finalbeta = finalbeta * -1.4

        betas.append(float(finalbeta))
        prices.append(float(stockdata[0]))

    #lors is long or short, 0 if short 1 if long

    # print(tickers, "tickers")
    # print(lors, "lors")
    # print(shares, "shares")
    # print(prices, "prices")
    # print(betas, "betas")
    betaofport, varofport = get_wmean(shares, prices, betas)
    # print(betaofport, "betaofport")
    # print(math.sqrt(varofport), "stdofport")
    # print(varofport/betaofport, "divided")
    betaofport = round(betaofport, 8)
    varofport = round(varofport, 8)

    risknum = map_to_percentage(((abs(math.sqrt(varofport) - betaofport) / betaofport) + 1) * betaofport)
    # print(round(risknum, 2), "/ 5 <- RISK NUMBER")
    return round(risknum, 2), stockydata
    


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
#         oy = cunt(tickers, shares, lors, sectorticker)
#         print(oy)
#         update_query = """
#         UPDATE ports.portfolios
#         SET risk = %s
#         WHERE portfolio_id = %s;
#         """
#         cursor.execute(update_query, (oy, i[9]))
#         conn.commit()
    