import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from scipy.stats import boxcox
import matplotlib.pyplot as plt
import requests
from KeyUpdater import headers
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
from kaidens_stuff import run
import time



def four_pm_run():
    df = pd.DataFrame()
    # @ 4pm get the list of stocks with volume >= 1,000,000
    stocks = run()  
    print(len(stocks))
    breakpoint()
    stocks = stocks[['symbol']]  # Ensure we only have the symbol column

    df['symbol'] = stocks['symbol']  # Assign stock symbols to df

    highs = []
    print("made it here")
    for stock in list(stocks['symbol']):
        print(stock)
        try:
          stock_df = get_data(stock)  # Do not overwrite df
        except:
          continue
        H_t = stock_df['High']
        lower_high = get_conf_int(H_t).iloc[0]['lower High']
        highs.append(lower_high)
        # time.sleep(0.6)  

    df['lower High'] = highs  # Assign lower high values
    df.to_csv('chat_strat.csv')  # Save to file

    # @ 9:20am get the open price for each stock
def nine_twenty_am_run():
    df = pd.read_csv('chat_strat.csv', index_col=0)
    df.dropna(inplace=True)  # Drop any NaN values
    stocks = run(list(df['symbol']))  # Fetch stock data again
    df = df.merge(stocks[['symbol', 'price']], on='symbol', how='left')  # Safer merge
    df.rename(columns={'price': 'Open'}, inplace=True)
    df['Open'] = pd.to_numeric(df['Open'])  # Convert to numeric
    # Determine if the stock is tradable
    df['Tradable'] = df['Open'] < df['lower High']
    df.to_csv('chat_strat.csv')  # Save to file

def nine_thirty_am_run():
    # @ 9:30 am trade the stocks that are tradable
    df = pd.read_csv('chat_strat.csv')
    tradable_stocks = df[df['Tradable']]
    for index, row in tradable_stocks.iterrows():
        order = limit_order(row['symbol'], row['Open'], row['lower High'])  # Limit order
        url = "https://sim-api.tradestation.com/v3/orderexecution/orderconfirm"
        response = requests.request("POST", url, headers=headers(), json=order)
        print(response.json())
        # Trade the stock
        
    # Trade the stocks




def limit_order(stock, price, exit):
    stop = price - (exit - price)
    print(stop)
    order = {
  "AccountID": "SIM1145924M",
  "Symbol": stock,
  "Quantity": "1",
  "OrderType": "Limit",
  "LimitPrice": str(round(price,2)),
  "TradeAction": "BUY",
  "TimeInForce": {
    "Duration": "IOC"
  },
  "Route": "Intelligent",
  "OSOs": [
    {
      "Type": "BRK",
      "Orders": [
        {
          "AccountID": "SIM1145924M",
          "Symbol": stock,
          "Quantity": "1",
          "OrderType": "Limit",
          "LimitPrice": str(round(exit,2)),
          "TradeAction": "SELL",
          "TimeInForce": {
            "Duration": "DAY"
          },
          "Route": "Intelligent"
        },
        {
          "AccountID": "SIM1145924M",
          "Symbol": stock,
          "Quantity": "1",
          "OrderType": "StopLimit",
          "TradeAction": "SELL",
            "StopPrice": str(round(stop,2)),      # Stop price (trigger)
          "LimitPrice": str(round(stop * 0.99,2)),  # Limit price slightly below stop price
          "TimeInForce": {
            "Duration": "GTC"
          },
          "Route": "Intelligent",
          }
      ]
        }
      ]
    }

    return order


        





def get_data(stock):
    

    url = "https://api.tradestation.com/v3/marketdata/barcharts/" + stock
    params = {
        "barsback": 500,
    }
    response = requests.request("GET", url, headers=headers(), params=params)
    df = pd.DataFrame(response.json()['Bars'])
    df['High'] = pd.to_numeric(df['High'])
    return df

# Assuming df is your DataFrame with a 'High' column


def get_conf_int(Y_t):
    lol, lambda_optimal = boxcox(Y_t)
    W_t = (np.power(Y_t, lambda_optimal) - 1) / lambda_optimal
# Fit ARIMA(1,2,1) model
    arima_model_custom = ARIMA(W_t, order=(1, 2, 1))
    arima_result = arima_model_custom.fit()

    # Forecast
    forecast_result = arima_result.get_forecast(steps=1)
    conf_int = forecast_result.conf_int()
    return (conf_int * lambda_optimal + 1) ** (1 / lambda_optimal)
# Plot results
# plt.plot(forecasted_values, label='Forecast')
# plt.legend()
# plt.show()


# Print forecasted values

if __name__ == '__main__':
    four_pm_run()
    breakpoint()
    nine_twenty_am_run()
    breakpoint()
    nine_thirty_am_run()