const token = 'YOUR_TOKEN_HERE';
const domain = 'YOUR_DOMAIN';
const endpoint = 'https://njal.la/api/1/';
import express from 'express';
import fetch from 'node-fetch';
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Endpoint to check server status
app.get('/api/serverstatus', async (req, res) => {
    try {
        const forwardsData = await fetchListForwards();

        // Check if the response contains 'result'
        if ('result' in forwardsData) {
            res.json({ status: 'OK' });
        } else {
            res.status(503).json({ status: 'Error'});
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

async function fetchListForwards() {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': 'Njalla ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "method": "list-forwards",
            "params": { "domain": domain },
            "jsonrpc": "2.0"
        })
    });

    const data = await response.json();
    return data;
}


app.post('/api/add-forward', async (req, res) => {
    try {
        const { from, to } = req.body;
        const fullFrom = `${from}@${domain}`;
		if (fullFrom.includes('*')) {
            return res.status(403).json({ status: 'No Wildcard Alloweed'});
        }

        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Njalla ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "method": "add-forward",
                "params": {"domain" : domain,
                            "from" : fullFrom,
							"to" : to },
                "jsonrpc": "2.0"
            })
        });

        const data = await apiResponse.json();
		if(data.result){
			res.json({ status: 'OK'});
		}else{
			throw Error;
		}
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.post('/api/remove-forward', async (req, res) => {
    try {
        const { from, to } = req.body;
        const fullFrom = `${from}@${domain}`;
		
        const forwardsData = await fetchListForwards();
        // Check if the forward exists
        const forwardExists = forwardsData.result.forwards.some(f => (f.from === fullFrom && f.to === to));
        if (!forwardExists) {
            return res.status(404).json({ status: 'Forward Not Found'});
        }

        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Njalla ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "method": "remove-forward",
                "params": {"domain" : domain,
                            "from" : fullFrom,
							"to" : to },
                "jsonrpc": "2.0"
            })
        });

        const data = await apiResponse.json();
		if(data.result){
			res.json({ status: 'OK'});
		}else{
			throw Error;
		}
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
