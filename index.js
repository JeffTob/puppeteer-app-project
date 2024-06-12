const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

//Expect a JSON body
app.use(bodyParser.json({
    limit: '50mb'                   //Request size - 50MB
}));

//Handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' == req.method) {
        res.status(200).send();
    } else {
        next();
    }
});

app.get('/test', async (req, res) => {
   
    res.send(`Puppeteer app is running.`);
});

app.get('/title', async (req, res) => {
    const browser = await puppeteer.launch({ 
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true, 
        args: [ '--disable-setuid-sandbox',
                '--no-sandbox',
                '--single-process',
                '--no-zygote',
              ] 
    });
    const page = await browser.newPage();
    await page.goto('https://google.com');
    const pageTitle = await page.title();
    await browser.close();
    res.send(`Page title is: ${pageTitle}`);
});

app.post('/generate-pdf', async (req, res) => {

    let { url } = req.body;

    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }

    try{
   
    const browser = await puppeteer.launch({ 
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true, 
        args: [ '--disable-setuid-sandbox',
                '--no-sandbox',
                '--single-process',
                '--no-zygote',
              ] 
    });

    const page = await browser.newPage();
    url = url + '&key=6867adbc';
    await page.goto(url, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ 
           // margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
           margin: { top: '60px', right: '50px',  bottom: '60px',  left: '50px' },
            printBackground: true, 
            format: 'Legal',
            displayHeaderFooter: true,
            headerTemplate: `
            
            <div style="font-size: 10px; 
            color: black; display: 
            flex; justify-content: space-between; 
            align-items: baseline; 
            border-bottom: 1px solid black; 
            padding: 0px; 
            width: 100%;
            margin-left: 50px; 
            margin-right: 50px;">
             <span><b>Uniform Residential Appraisal Report</b></span>
             <span style="margin-left: auto;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            </div>
            `,
            footerTemplate: `
            <div style="font-size: 10px; 
            color: black; display: 
            flex; justify-content: space-between; 
            align-items: baseline; 
            border-top: 1px solid black; 
            padding: 0px ; 
            width: 100%;
            margin-left: 50px; 
            margin-right: 50px;">
                    <div>
                        Appraisal Version #4<br>
                        Fannie Mae | Freddie Mac<br>
                        December 2023
                    </div>
                    <div style="text-align: right;">
                        Appraiser Reference ID: <br>
                        Client Reference ID: <br>
                        AMC Reference ID: 
                    </div>
                </div>
            `
        });

        await browser.close();

        res.contentType('application/pdf');
        res.send(pdf);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to generate PDF' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
