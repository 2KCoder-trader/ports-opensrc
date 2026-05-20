import time
import threading
import time
from datetime import datetime
from queue import Queue
import requests
import pandas as pd
from KeyUpdater import headers
from sqlalchemy import create_engine
import psycopg2
import pickle
import bs4 as bs

def refresh_list():
 

    # Access the S&P 500 list from the wiki webpage
    resp = requests.get('https://en.m.wikipedia.org/wiki/List_of_S%26P_500_companies')
    # Find the S&P 500 table using beautiful soup
    soup = bs.BeautifulSoup(resp.text, 'lxml')
    table = soup.find('table', {'id': 'constituents'})
    # Variable that will store the S&P 500 list
    tickers = []
    # Go through the S&P 500 table and append each ticker to the tickers array
    for row in table.findAll('tr')[1:]:
        # If the ticker has a '.' or '-' then remove them
        content = row.findAll('td')
        ticker = content[0].get_text(strip=True)
        tickers.append(ticker)
        
        # raise Exception
        print("tickers")
        # print(tickers)
    
    with open("sp500tickers.pickle", "wb") as f:
        pickle.dump(tickers, f)

    # Return the S&P 500 list
    print(len(tickers))
    return tickers


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


def server_stonks(stocks,name_df,result_queue):
    df = pd.DataFrame(columns=['symbol', 'name', 'volume','price','change'])
    url = "https://api.tradestation.com/v3/marketdata/quotes/" + ",".join(stocks)
    response = requests.request("GET", url, headers=headers())
    try:
        response.json()['Quotes']
    except:
        print(response.json())
        return

    for quote in response.json()['Quotes']:
        if "Error" in quote:
            continue
        if float(quote['PreviousVolume']) <= 1000000:
            continue
        df_len = len(df)
        try:
            name = name_df[name_df['stock'] == quote['Symbol']].iloc[0]['name']
        except:
            name = " "
        # print(name)
        df.loc[df_len] = {'symbol':quote['Symbol'],'name':name,'volume':int(quote['Volume']),'change':round((float(quote['Last'])-float(quote['PreviousClose']))/float(quote['PreviousClose'])*100,2),'price':quote['Last']}
    result_queue.put(df)

def run(tickers=None):
    if tickers is None:
        tickers = refresh_list()
        # print(tickers)
        # breakpoint()
    # url = "https://api.tradestation.com/v3/marketdata/quotes/"+"MSFT"
    # response = requests.request("GET", url, headers=headers())
    # print(response.json())
    # breakpoint()
    groups = split_list_into_groups_of_100(tickers)
    df = pd.DataFrame(columns=['symbol','name', 'volume','price','change'])
    i = 0
    threads = []
    result_queue = Queue()
    name_df = pd.read_csv("stock_name.csv",index_col=0)
    # server_stonks(['AAPL'],name_df,result_queue)
    for group in groups:
        group = [str(x) for x in group]
        thread = threading.Thread(target=server_stonks,args=(group,name_df,result_queue))
        thread.start()
        threads.append(thread)
    for thread in threads:
        thread.join()
    while not result_queue.empty():
        df = pd.concat([df,result_queue.get()])
        i+= 1
        df = df.sort_values(by='volume',ascending=False)
    return df
    df.to_csv("df.csv")
    df[:100].to_csv("display_df.csv")
    print(len(df.index))
    

# if __name__ == '__main__':
#     run()


# TODO: Keep
# while True:
#     run()
#     time.sleep(60)