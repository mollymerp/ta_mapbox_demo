import pandas as pd
from mapbox_batch import MapboxBatchGeocoder

mapbox = MapboxBatchGeocoder('pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw')
with open('../geocoding_queries.txt') as input_file:
    mapbox.geocode(input_file, '../')