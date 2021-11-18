// Call API
// import { apiKey } from '../data/clientAuth.json';
const apiKey = null;
const apiPrefix = '/api/v1/';

export async function callApi (apiPage, postData=null, isForm=true, reqType='') {
    // Convert form data
    if (postData && isForm) { postData = form2obj(postData.current); }

    // Call API
    const res = await fetch(apiPrefix + apiPage, request(postData, reqType));
    
    // Pass back result
    const resBody = await getBody(res);
    if (res.status >= 400 && res.status < 500) {
        console.error('Client error.',resBody)
        throw new Error('Problem communicating with server ('+(res.statusText||res.status)+').');
    }
    else if (res.status >= 500 && res.status < 600) {
        console.error('Database server error.',resBody)
        throw new Error('Could not reach server ('+(res.statusText||res.status)+').');
    }
    else if (res.status < 200 || res.status >= 300) throw new Error(resBody.message || resBody);
    return resBody;
}

// Basic useEffect
export default function apiDataObj(apiPage, postData=null, isForm=true, reqType='') {
    return callApi(apiPage, postData, isForm, reqType)
        .then(data => {
            const err = data.err || data.error || (!data || !Object.keys(data).length ? 'Fetch returned empty' : null);
            if (err) data.err = err;
            return data
        }).catch(err => ({
            err: err.message || err || 'Error fetching data',
        }));
}


// Setup content-type based off of 'typeof data'
const contentTypes = {
    string: 'text/plain',
    object: 'application/json'
};

// Construct request
const request = (data, reqType) => ({
    method: reqType || (data ? 'POST' : 'GET'),
    headers: {
        'Content-Type': data ? contentTypes[typeof data] : undefined,
        'X-API-KEY': apiKey
    },
    body: data && typeof data === 'object' ? JSON.stringify(data) : data || undefined
});

// Extract body from response
const getBody = res => 
    res.headers.get("content-type") && res.headers.get("content-type").indexOf(contentTypes.object)+1 ?
    res.json() : res.text();

// Convert form to object
function form2obj(form) {
    let obj = {};
    (new FormData(form)).forEach((value, key) => obj[key] = value);
    return obj;
}
