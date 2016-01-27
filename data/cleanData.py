# Project: TripAdvisor Lab
# Description: quick script to clean raw data and remove duplicate entries and make 
#              Mapbox Geocoder API calls to fetch lat/long
# Date: 1/25/2016
# Author: Molly Lloyd, @mollymerp

import pandas as pd
import numpy as np
from mapbox_batch import MapboxBatchGeocoder
from mapbox_geocode import geocode

# load data into pandas dataframe
# raw = pd.read_csv('ta_confidential_raw.csv', parse_dates=[0])
# raw['ds'].dt.date
# raw.head()


# # get rid of erroneous columns and duplicate entries
# sorted_data = raw[['ds','placetype_id','name','primaryname','street1','street2','postalcode','telephone','officialurl','email','parent_id','closed', 'acc_rank']].sort_values(by=['primaryname', 'street1', 'ds'], ascending=[True, True, False])
# sorted_data.head()

# # save unique POI that are not closed to disk to avoid using the big raw file again
# unique_poi = sorted_data.ix[sorted_data['closed']=='f'].drop_duplicates(subset=['primaryname','street1'])

# unique_poi.to_csv('ta_unique_poi.csv')

# # prepare data for geocoding by isolating the relevant fields to the API query
# geocoding = unique_poi[['primaryname','street1']]

# # with the intuition that an address will normally return a more accurate result from 
# # the geocoding API than a place name, I use an address when available in the TA dataset 
# # and otherwise use the place name as the geocoder query
# def get_query(row):
#   if pd.isnull(row['primaryname']):
#     return row['street1'] +' san francisco'
#   else:
#     return row['primaryname'] +' san francisco'

# geocoding['query'] = geocoding.apply(lambda row: get_query (row),axis=1)
# geocoding[['query']].to_csv('geocoding_queries.txt', index=False, header=False)

# here we use the batch geocoder function from https://github.com/mapbox/geocoding-example/
# mapbox = MapboxBatchGeocoder('pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw')
# with open('geocoding_queries.txt') as input_file:
#     mapbox.geocode(input_file, 'geocoding/geocode_responses/')
token = 'pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw'

with open('geocoding_queries.txt') as input_file: 
    geocode(token, input_file)
    






