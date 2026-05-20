import pytz
from datetime import datetime, timedelta
import pandas as pd
import pandas_market_calendars as mcal
import os
import datetime as dt
import time
import psycopg2

def terminate_idle_sessions(conn):
    cursor = conn.cursor()
    try:
        # Query to find and terminate idle sessions
        cursor.execute("""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE state = 'idle'
            AND pid <> pg_backend_pid();
        """)
        conn.commit()
        # print("Idle sessions terminated.")
    except Exception as e:
        print("Error terminating idle sessions:", e)
    finally:
        cursor.close()

def market_status(beg=0, end=0):
    tz = pytz.timezone('UTC')
    nyse = mcal.get_calendar('NYSE')
    script_directory = os.path.dirname(os.path.abspath(__file__))
    schedule = pd.read_csv(script_directory+'/schedule.csv',index_col=[0])
    if str(datetime.now().date()) != schedule.index[0]:
        schedule = nyse.schedule(start_date=str(dt.date.today()), end_date=str(dt.date.today()))
        if schedule.empty:
            return False
        schedule['prev_market_close'] = pd.to_datetime(schedule.iloc[0]['market_close'])
        schedule.to_csv('schedule.csv')
    else: 
        schedule['market_open'] = pd.to_datetime(schedule['market_open'])
        schedule['market_close'] = pd.to_datetime(schedule['market_close'])
    index = schedule.index[0]
    if (schedule.loc[index, 'market_open'] + timedelta(minutes=beg)) > datetime.now(pytz.utc):
        return False
    elif (schedule.loc[index, 'market_close'] - timedelta(minutes=end)) < datetime.now(pytz.utc):
        return False
    else:
        return True
    
def run_market_status():
    while True:
        try:
            conn = psycopg2.connect(database="zephyr_capital",
                                host=os.environ.get("DB_HOST", "localhost"),
                                user="postgres",
                                password=os.environ.get("DB_PASSWORD", ""),
                                port="5432")
            # terminate_idle_sessions(conn)
            cursor = conn.cursor()
        except Exception as e:
            print("SQL ERROR")
            print(e)
            time.sleep(1)
            continue
        if market_status(-5, -5):
            statement = '''
                UPDATE ports.market_status
                SET is_market_open = %s,
                start_date = %s,
                close_date = %s,
                previous_close_date = %s
                WHERE id = 0;
            '''
            schedule = pd.read_csv('schedule.csv',index_col=[0])
            start_date =  pd.to_datetime(schedule['market_open']).iloc[0]
            close_date =  pd.to_datetime(schedule['market_close']).iloc[0]
            previous_close_date = pd.to_datetime(schedule['prev_market_close']).iloc[0]
            cursor.execute(statement, (True, start_date, close_date,previous_close_date))
            conn.commit()
            
        else:
            statement = '''
                UPDATE ports.market_status
                SET is_market_open = %s
                WHERE id = 0;
            '''
            cursor.execute(statement, (False,))
            conn.commit()
        cursor.close()
        conn.close()
        time.sleep(60)
if __name__ == '__main__':
    run_market_status()