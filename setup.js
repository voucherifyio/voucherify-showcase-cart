require('dotenv').config()
const request = require('request-promise-native')
const voucherify = require('voucherify')({
    applicationId: process.env.APPLICATION_ID,
    clientSecretKey: process.env.CLIENT_SECRET_KEY
})
const campaigns = require('./campaigns')
const fs = require('fs')

const dataDir = './.data'
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
}

const setupCampaigns = () => {
  const campaignPromises = campaigns.map(campaign => {
    const thisCampaign = voucherify.campaigns.create(campaign)

    thisCampaign.then(
      () => console.log(`Campaign ${campaign.name} has been succesfully set up`),
      problem => console.log(`There was a problem setting up ${campaign.name}`, JSON.stringify(problem, null, 2))
    )

    return thisCampaign
  })

  return Promise.all(campaignPromises).then(resp => console.log('ALL CAMPAIGNS SETUP') || resp)
}

const products = require('./products')

const setupProducts = () => {
  const productCreationPromises = products.map(product => {
    const thisProduct = voucherify.products.create({
      name: product.name,
      source_id: product.id,
      metadata: {
        displayName: product.displayName,
        price: product.price
      }
    })

    thisProduct.then(
        prod => {
          console.log(`Product ${product.name} has been succesfully created`)
          const needsId = products.find(p => p.id === prod.source_id)
          needsId.voucherifyId = prod.id
        },
        problem => console.log(`There was a problem creating product ${product.name}`, JSON.stringify(problem, null, 2))
    )

    return thisProduct
  })

  return Promise.all(productCreationPromises).then(resp => console.log('ALL PRODUCTS SETUP') || resp)
}

const segments = [
  {
    type: 'auto-update',
    name: 'Germany',
    filter: {
      'address.country': {
        'conditions': {
          '$is': ['Germany']
        }
      }
    }
  }
]

const setupCustomerSegments = () => {
  const promises = segments.map(segment => {
    const thisPromise = request({
      uri: `https://api.voucherify.io/v1/segments`,
      method: 'POST',
      body: segment,
      headers:{
        'Content-Type': 'application/json',
        'X-App-Id': process.env.APPLICATION_ID,
        'X-App-Token': process.env.CLIENT_SECRET_KEY
      },
      json: true
    })

    thisPromise.then(
      resp => {
        console.log(`Customer segment ${segment.name} has been setup`)

        const needsId = segments.find(s => s.name === segment.name)
        needsId.voucherifyId = resp.id

        return resp
      },
      problem => console.log(`PROBLEM SETTING SEGMENT ${segment.name}`, JSON.stringify(problem, null, 2))
    )

    return thisPromise
  })

  return Promise.all(promises).then(resp => console.log('ALL SEGMENTS SETUP') || resp).then(r => fs.writeFile('./.data/segments.json', JSON.stringify(r.map(sr => sr.id), null, 2), () => {}) || r)
}

// hard dependencies on specific campaigns, products and segment
const setupValidationRules = () => {
  const rules = [ 
    {
      campaign_name: 'cart-more-50',
      orders: {
        total_amount: {
          '$more_than':[5000]
        }
      }
    },
    {
      campaign_name: 'cart-includes-2solaris',
      junction: 'AND',
      orders: {
        products_count: {
          '$is': [2]
        }
      },
      products: {
        conditions: {
          '$is': [{id: products.find(p => p.name === 'solaris').voucherifyId, discount_applicable: false}]
        }
      }
    },
    {
      campaign_name: 'upsell',
      products: {
        junction: 'AND',
        conditions: {
          '$is': [
            {id: products.find(p => p.name === 'solaris').voucherifyId, discount_applicable: false},
            {id: products.find(p => p.name === 'astigmatic').voucherifyId, discount_applicable: false},
            {id: products.find(p => p.name === 'emperor').voucherifyId, discount_applicable: false},
          ]
        }
      }
    },
    {
      campaign_name: 'mix',
      junction: 'AND',
      orders: {
        total_amount: {
          '$more_than': [3000]
        }
      },
      products: {
        conditions: {
          '$is_not': [{
            id: products.find(p => p.name === 'symphony').voucherifyId,
            discount_applicable: false
          }]
        }
      }
    },
    {
      campaign_name: 'country',
      segments: {
        conditions: {
          '$is': [segments.find(s => s.name === 'Germany').voucherifyId]
        }
      }
    }
  ]

  const ruleCreationPromises = rules.map(rule => {
    const thisPromise = request({
      uri: `https://api.voucherify.io/v1/validation-rules`,
      method: 'POST',
      body: rule,
      headers:{
        'Content-Type': 'application/json',
        'X-App-Id': process.env.APPLICATION_ID,
        'X-App-Token': process.env.CLIENT_SECRET_KEY
      },
      json: true
    })

    thisPromise.then(
      resp => console.log(`Validation rules for ${rule.campaign_name} have been setup`),
      problem => console.log(JSON.stringify(problem, null, 2))
    )

    return thisPromise
  })

  return Promise.all(ruleCreationPromises).then(resp => console.log('ALL VALIDATION RULES SETUP') || resp)
}

// setupCustomerSegments()
setupCampaigns().then(setupProducts).then(setupCustomerSegments).then(setupValidationRules)
