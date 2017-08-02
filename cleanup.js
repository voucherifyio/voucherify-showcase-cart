require('dotenv').config()
const request = require('request-promise-native')
const voucherify = require('voucherify')({
    applicationId: process.env.APPLICATION_ID,
    clientSecretKey: process.env.CLIENT_SECRET_KEY
})
const campaigns = require('./campaigns')
const fs = require('fs')

const removeCampaigns = () => {
  const promises = campaigns.map(campaign => request({
    method: 'DELETE',
    json: true,
    headers:{
      'Content-Type': 'application/json',
      'X-App-Id': process.env.APPLICATION_ID,
      'X-App-Token': process.env.CLIENT_SECRET_KEY
    },
    uri: `https://api.voucherify.io/v1/campaigns/${campaign.name}?force=true&delete_campaign_validation_rules=true&delete_voucher_validation_rules=true`
  }).then(() => {}, problem => console.log('problem', campaign.name, JSON.stringify(problem, null, 2))))

  return Promise.all(promises).then(() => console.log('campaigns removed (with validation rules)'))
}

const removeSegments = () => (new Promise((resolve, reject) => {
  fs.readFile('./.data/segments.json', 'utf8', (err, data) => {
    if (err) {
      reject(err)
      return
    }

    const segments = JSON.parse(data)
    resolve(Promise.all(segments.map(segment => request({
      method: 'DELETE',
      json: true,
      headers:{
        'Content-Type': 'application/json',
        'X-App-Id': process.env.APPLICATION_ID,
        'X-App-Token': process.env.CLIENT_SECRET_KEY
      },
      uri: `https://api.voucherify.io/v1/segments/${segment}`
    }))).then(() => new Promise((resolve, reject) => {
      fs.unlink('./.data/segments.json', (err) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })))
  })
})).then(r => console.log('segments removed') || r)

const removeCustomerSessions = () => (new Promise((resolve, reject) => {
  fs.unlink('./.data/sessions.db', (err) => {
    if (err) {
      reject(err)
      return
    }

    resolve()
  })
})).then(r => console.log('customer sessions db file removed') || r)

const productIdsForThisDemo = require('./products').map(product => product.id)
const removeProducts = () => voucherify.products.list().then(response => {
    const products = response.products
    
    return Promise.all(products.filter(product => productIdsForThisDemo.includes(product.source_id)).map(product => request({
      method: 'DELETE',
      json: true,
      headers:{
        'Content-Type': 'application/json',
        'X-App-Id': process.env.APPLICATION_ID,
        'X-App-Token': process.env.CLIENT_SECRET_KEY
      },
      uri: `https://api.voucherify.io/v1/products/${product.id}?force=true`
    })))
  }).then(() => console.log('products removed'))
 || resp

removeCampaigns().then(removeProducts).then(removeCustomerSessions).then(removeSegments)
