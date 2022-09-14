import axios from 'axios';
import express from 'express';

const router = express.Router();



//get all data using currency code
const getData = async () => {
  return new Promise(async (resolve, reject) => {
    axios
      .get('https://open.er-api.com/v6/latest/INR')
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

//get all data from wazirx api
const getBitcoinData = async () => {

  return new Promise((resolve, reject) => {

    const replacerFunc = () => {
      const visited = new WeakSet();
      return (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (visited.has(value)) {
            return;
          }
          visited.add(value);
        }
        return value;
      };
    };

    axios
      .get('https://api.wazirx.com/sapi/v1/tickers/24hr')
      .then((response) => {
        resolve(JSON.stringify(response, replacerFunc()));
      })
      .catch((err) => {
         reject(err);
      });
  });
};



//api for getting rates with respect to the INR 
router.get('/currencyRate', async function (req, res) {
  try {
    var rates = await getData();
  } catch (err) {
    res.status(500).json({ error: err });
  }

  let cCode = req.query.currencyCode;
  let rate = rates.data.rates[cCode] || false;

  if (rate) {
    res.status(200).json({ rate,currencyCode: cCode});
  } else {
    res.status(400).json({ message: 'Invalid currency code' });
  }
});



//api for bitcoin data based on the provided currency 
router.get('/getData', async (req, res) => {
  let cCode = req.query.currencyCode;
  try {
    let response = await axios.get(
      `http://localhost:3000/api/currencyRate/?currencyCode=${cCode}`
    );
    var rate= response.data.rate
    var currencyCode=response.data.currencyCode
    console.log(response.data.rate);
  } catch (err) {
    res.json(err);
  }

  let btc;
  await getBitcoinData()
    .then((response) => {
      const obj = JSON.parse(response);
      let data = obj.data;

      for (let i = 0; i < data.length; i++) {
        if (data[i].baseAsset == 'btc') {
          btc = data[i];
          break;
        }
      }
      btc.openPrice *=rate
      btc.lowPrice *= rate
      btc.highPrice *= rate
      btc.lastPrice *= rate
      btc.bidPrice *= rate
      btc.askPrice *= rate
      btc.quoteAsset=currencyCode
      
     res.json({btc})
    })
    .catch((err) => {
       res.json({ errhfhgf: err });
    });

 });

export default router;
