# Project: TripAdvisor Lab
# Description: quick script to clean raw data and remove duplicate entries
# Date: 1/25/2016
# Author: Molly Lloyd, @mollymerp

import pandas as pd


# load data into pandas dataframe
raw = pd.read_csv('ta_confidential_raw.csv', parse_dates=[0])
raw['ds'].dt.date
raw.head()


# get rid of erroneous columns and duplicate entries
sorted_data = raw[['ds','placetype_id','name','primaryname','street1','street2','postalcode','telephone','officialurl','email','parent_id','closed', 'acc_rank']].sort_values(by=['primaryname', 'street1', 'ds'], ascending=[True, True, False])
sorted_data.head()

# save unique POI to disk to avoid using the big raw file again
unique_poi = sorted_data.drop_duplicates(subset=['primaryname','street1'])
unique_poi.to_csv('ta_unique_poi.csv')
