LINK = ''

import urllib.request
from pathlib import Path

FOLDER = Path('HRCounterAssets')

if not FOLDER.exists():
    FOLDER.mkdir()

def download(turl):
    ver = turl.split('/')[-1]
    url = urllib.request.urlopen(turl)
    print(ver)
    with (FOLDER / ver).open('wb') as f:
        f.write(url.read())
    print(turl, "has been downloaded")
    
download('https://github.com/qe201020335/HRCounter/releases/download/v2.1.3-hotfix2/HRCounter-2.1.3-bs1.25.1-f915d79.zip')