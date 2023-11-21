const ReactDOM = require('react-dom/client')

/* ==== any code before this line will be removed, don't edit this line. ==== */

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode);

let L = LANG_RES['en_US']


function renderHRCounterLinks(){
    const links = []
    const counters = window.init_cfg.hrcounter
    for(let i=0;i<counters.length;i++){
        links.push(<li className='list-group-item' key={counters[i]}>
            <a className='btn btn-link' href={'/LAN-' + counters[i]}>{counters[i]}</a>
        </li>)
    }
    return <ul className="list-group">
            {links}
        </ul>
}

function renderRoot(){
    let lang = window.location.href.split('?')[1] || 'en_US'
    
    L = LANG_RES[lang] || LANG_RES['en_US']

    return <div className="container">
        <h2 style={{marginTop:"32px"}}>{L.HRLINK_TITLE}</h2>
        <p>{L.HRLINK_HINT}</p>
        {renderHRCounterLinks()}
        <p>{L.HRLINK_COPYRIGHT}</p>
        <textarea style={{width:"100%", height:"300px"}} value={`MIT License

Copyright (c) 2021 qe201020335

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
        `}>
        </textarea>
    </div>
}

root.render(renderRoot())
