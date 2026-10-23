"""Set sharing URLs after choosing the actual public deployment address."""
import argparse
import html
import re
from pathlib import Path
from urllib.parse import urlparse,urljoin

parser=argparse.ArgumentParser()
parser.add_argument('--base-url',required=True,help='Public project directory URL, including any subdirectory')
args=parser.parse_args()
url=args.base_url.rstrip('/')+'/'
parts=urlparse(url)
if parts.scheme not in ('http','https') or not parts.netloc or parts.query or parts.fragment or parts.username or parts.password:
    parser.error('Use a public http(s) directory URL without credentials, query or fragment.')
root=Path(__file__).resolve().parents[1]
for name in ['index.html','experience.html','technology.html','resources.html']:
    p=root/name
    s=p.read_text(encoding='utf-8')
    page=html.escape(urljoin(url,name),quote=True)
    image=html.escape(urljoin(url,'images/og-image.jpg'),quote=True)
    s=re.sub(r'<meta property="og:image" content="[^"]*">',f'<meta property="og:image" content="{image}">',s)
    s=re.sub(r'<meta property="og:url"[^>]*>|<link rel="canonical"[^>]*>','',s)
    s=s.replace('</head>',f'<meta property="og:url" content="{page}"><link rel="canonical" href="{page}"></head>')
    p.write_text(s,encoding='utf-8')
print('Configured sharing metadata. This does not deploy the site.')
