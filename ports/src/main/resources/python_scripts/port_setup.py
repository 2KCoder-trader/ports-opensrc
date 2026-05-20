import sys

import pandas as pd
from KeyUpdater import headers
import requests
from datetime import datetime
import json
from risk_num_calc import cunt
from er import mfer

token = sys.argv[9]


h = {
    "Authorization": f"Bearer ${token}"
}


def port_set(name,author,owner,money_input,description,stocks,percentages,position_types):


    # subtracting from users balamce:
    if owner != 'market':
        bal = requests.get(f"https://api.example.com/ports/user/getMoney?Username={owner}",headers=h,verify=False)
        balance = float(bal.text)
        print(balance)
        balance = balance - float(money_input)
        update_url = f'https://api.example.com/ports/user/update/balance'
        data = {
            "money": balance,
            "username": owner
        }
        headerss = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer ${token}"
        }

        response = requests.post(update_url, json=data, headers=headerss,verify=False)
        print(response.text)
        bal = requests.get(f"https://api.example.com/ports/user/getMoney?Username={owner}",headers=h,verify=False)
        balance = float(bal.text)
        print(balance)



    avg_prices = []
    url = f"https://api.tradestation.com/v3/marketdata/quotes/{','.join(stocks)}"
    shares = []
    response = requests.request("GET", url, headers=headers())
    for i, percentage in enumerate(percentages):

        percentage_price = (float(percentage)/100)*money_input
        # print(i)
        stock_price = response.json()["Quotes"][i]["Ask"]
        avg_prices.append(float(stock_price))
        stock_shares = float(percentage_price/float(stock_price))
        shares.append(stock_shares)
 
    pnl_hist = []
    pnl_hist.append(money_input)
    date_hist = []
    date_hist.append(str(datetime.now().date()))
    risk, stockydata = cunt(stocks, shares, position_types, 'SPY')
    # risk = 0
    cost_per_trade = [.02 for i in range(len(shares))]
    expense_ratio = mfer(stocks, risk, stockydata, shares, risk, 0, cost_per_trade)


    data = {
        "name": name,
        "author": author,
        "stock": stocks,
        "initPercentages": percentages,
        "description": description,
        "positionTypes": position_types,
        "money_input": money_input,
        "owner": owner,
        "pnlHist": pnl_hist,
        "creationDate":str(datetime.now().date()),
        "published": False,
        "expenseRatio": expense_ratio,
        "sector": "SPY",
        "dateHist": date_hist,
        "shares": shares,
        "curRisk": risk,
        "initRisk": risk,
        "related": "None",
        "curPercentages":percentages,
        "avgPrices": avg_prices,

        
        
        
    }

    return json.dumps(data)
    
def send_portfolio(portfolio):
    url = 'https://api.example.com/ports/portfolios/savePortfolios'
    headers = {
        'Content-Type': 'application/json',
        "Authorization": f"Bearer ${token}"
    }

    try:
        response = requests.post(url, headers=headers, data=portfolio,verify=False)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Process the response
        data = response.text
        print(data)
        
    except requests.exceptions.RequestException as e:
        print(f'Error fetching data: {e}')



# print({"pnl_hist": [100.0], "date_hist": ["2024-08-12"], "shares": [170.64846416382252, 0.6572029442691903, 2.0833333333333335, 0.8732099196646874], "risk": 0.28, "expense_ratio": 0.92, "avg_prices": [0.1465, 38.04, 12.0, 28.63], "name": "rr", "author": "admin", "owner": "market"}
# )
if __name__ == '__main__':
    name = sys.argv[1]
    author = sys.argv[2]
    owner = sys.argv[3]
    init_price = float(sys.argv[4])
    description = sys.argv[5]
    stocks = sys.argv[6].split(' ')
    percentages = sys.argv[7].split(' ')
    print("Arg 8",sys.argv[8])
    position_types =sys.argv[8].split(' ')
    portfolio = port_set(name,author,owner,init_price,description,stocks,percentages,position_types)
    send_portfolio(portfolio)
    print("Created Portfolio")
