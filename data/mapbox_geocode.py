import __future__
import os, sys, json
import os.path
try:
    # python 3
    from urllib.request import urlopen as urlopen
    from urllib.parse import quote_plus as quote_plus
except:
    # python 2
    from urllib import quote_plus as quote_plus
    from urllib2 import urlopen as urlopen

## modified from https://github.com/mapbox/geocoding-example/blob/master/python/mapbox_geocode.py
## in order to save results to file and 
def geocode(mapbox_access_token, queries):
    """
    Submit a list of geocoding queries to Mapbox's geocoder. Save results to JSON file.
    Args:
        queries (str): file of line separated queries
        mapbox_access_token (str): valid Mapbox access token with geocoding permissions
    """
    queries = queries.readlines()
    for i, query in enumerate(queries):
        batch = int(i / 100)
        batch_filename = 'geocoding/geocode_responses/temp_dataset_results/mapbox-places-result'+`batch`+'.json';
        resp = urlopen('https://api.tiles.mapbox.com/geocoding/v5/mapbox.places/{query}.json?access_token={token}'.format(query=quote_plus(query), token=mapbox_access_token))

        result = json.loads(resp.read().decode('utf-8'))
        if os.path.isfile(batch_filename) == False:
            with open(batch_filename, 'w') as f:
                json.dump([],f)

        with open(batch_filename,'r') as f:
            list_of_results = json.load(f)

        list_of_results.append(result.copy())

        with open(batch_filename,'w') as f:
            json.dump(list_of_results, f)
        print('query', i, 'saved', query)


if __name__ == '__main__':
    token = os.environ.get('MapboxAccessToken', False)
    if not token:
        print('environment variable MapboxAccessToken must be set')
        sys.exit(1)

    # geocode
    result = geocode(token, sys.argv[1])

    # print result
    print(json.dumps(result, indent=2))