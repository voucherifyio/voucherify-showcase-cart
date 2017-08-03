// server.js
// where your node app starts

// init project
require('dotenv').config();
const express = require('express');
const voucherifyClient = require('voucherify');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const campaigns = require('./campaigns');

const debug = false;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
  store: new SQLiteStore({dir: ".data"}),
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // month
}));

app.get("/", (request, response) => {
  if (request.session.views) {
    console.log("[Re-visit] %s - %s", request.session.id, request.session.views);
    request.session.views++;
  } else {
    request.session.views = 1;
    console.log("[New-visit] %s", request.session.id);
  }
  response.sendFile(__dirname + '/views/index.html');
});
console.log(process.env.APPLICATION_ID, process.env.CLIENT_SECRET_KEY)
const voucherify = voucherifyClient({
    applicationId: process.env.APPLICATION_ID,
    clientSecretKey: process.env.CLIENT_SECRET_KEY
});
// publishes coupons for the user from campaigns
app.get("/init", (request, response) => {
  const customerId = request.session.id;
  console.log("[Creating customer] customer: %s", customerId);
  voucherify.customers.create({ source_id: customerId })
  .then(customer => {
    console.log("[Creating customer][Success] customer: %s", customerId);
    console.log("[Publishing coupons] customer: %s", customerId);
    return Promise.all(publishForCustomer(customerId));
  })
  .then(coupons => {
    console.log("[Publishing coupons][Success] customer: %s, coupons: %j", customerId, coupons);
    debug && console.log("[Publishing coupons][Response] %j", coupons);
    response.status(200).json(coupons.map(coupon => coupon.voucher));
  })
  .catch(error => console.error("[Publishing coupons][Error] customer: %s, error: %j", customerId, error));
});


function publishForCustomer(id) {
  const params = {
    customer: {
      source_id: id
    }
  };

  return campaigns.map(campaign => campaign.name).map(campaign => voucherify.distributions.publish(Object.assign(params, { campaign })));
}

app.get("/redemptions", (request, response) => {
  if (!request.session.id) return response.sendStatus(404);
  console.log("[Getting redemptions] customer: %s", request.session.id);
  voucherify.customers.get(request.session.id)
    .then(customer => {
      return voucherify.redemptions.list({ customer: customer.id })
    })
    .then(redemptionsList => {
      console.log("[Getting redemptions][Success] customer: %s", request.session.id);
      debug && console.log("[Getting Redemptions][Response] %j", redemptionsList);
      response.status(200).json(redemptionsList.redemptions);
    })
    .catch(error => {
      console.error("[Getting redemptions][Error] customer: %s, error: %j", request.session.id, error);
      response.sendStatus(404);
    });
});

const productsForThisDemo = require('./products')
// get voucherify products
app.get('/products', (request, response) => {
  console.log("[Getting products] customer: %s", request.session.id)
  voucherify.products.list()
    .then(response => {
      const idsForThisDemo = productsForThisDemo.map(p => p.id)
      return response.products.filter(product => idsForThisDemo.includes(product.source_id))
    })
    .then(products => {
      console.log("[Getting products][Success] customer: %s", request.session.id)
      debug && console.log("[Getting products][Response] %s", products)

      response.status(200).json(products.map(product => ({
        prod_id: product.id,
        name: product.name,
        displayName: product.metadata.displayName,
        price: product.metadata.price
      })))
    })
    .catch(error => {
      console.error("[Getting Products][Error] error: %j", error);
      response.sendStatus(404);
    });
})

// update customer address
app.post("/customer", (request, response) => {
  console.log("[Updating customer] customer: %s", request.session.id);
  debug && console.log("[Updating customer] address: %j", request.body)
  voucherify.customers.update({
    id: request.session.id,
    address: request.body.address,
    metadata: {from: 'voucherify-showcase'}
  }).then(result => {
    console.log("[Updating customer][Success] customer: %s", request.session.id, result);
    debug && console.log("[Updating customer][Response] %s", result)
    response.sendStatus(200);
  }).catch(error => {
    console.error("[Updating customer][Error] customer: %s, error: %j", request.session.id, error);
    response.sendStatus(404);
  });
});

app.post("/redeem", (request, response) => {
  console.log("[Redeeming voucher] customer: %s", request.session.id); 
  debug && console.log("[Redeeming voucher] cart: %j", request.body)
  const body = request.body;
  voucherify.redemptions.redeem(body.code, {
    customer: {
      source_id: request.session.id,
      address: body.customer.address,
      metadata: {from: 'voucherify-showcase'}
    },
    order: {
      amount: body.amount,
      items: body.items
    }, 
    metadata: {
      channel : "showcase"
    }
  })
  .then(result => {
    console.log("[Redeeming voucher][Success] customer: %s", request.session.id);
    debug && console.log("[Redeeming voucher][Response] %j", result);
    response.status(200).json({
      valid: true,
      result: result
    });
  })
  .catch(error => {
    console.error("[Redeeming voucher][Error] customer: %s, error: %j", request.session.id, error);
    response.status(200).json({
      valid: false,
      result: error
    });
  });
});

// handles enable/disable button
app.post("/enable", (request, response) => {
  const code = request.body.code;
  console.log("[Enabling voucher] customer: %s, code: %s", request.session.id, code);
  voucherify.vouchers.enable(code)
    .then(result => {
    console.log("[Enabling voucher][Success] customer: %s, code: %s", request.session.id, code);
    response.sendStatus(200);
  })
    .catch(error => {
      console.log("[Enabling vouhcer][Error] customer: %s, error: %j", request.session.id, error);
      response.sendStatus(404);
  });
});

app.post("/disable", (request, response) => {
  const code = request.body.code;
  console.log("[Disabling voucher] customer: %s, code: %s", request.session.id, code);
  voucherify.vouchers.disable(code)
    .then(result => {
    console.log("[Disabling voucher][Success] customer: %s, code: %s", request.session.id, code);
    response.sendStatus(200);
  })
    .catch(error => {
     console.log("[Disabling voucher][Error] customer: %s, error: %j", request.session.id, error);
    response.sendStatus(404);
  });
});


const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
