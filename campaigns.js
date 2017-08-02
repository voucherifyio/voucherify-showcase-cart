module.exports = [
  {name:"regular-percentage", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"percent_off": 10, "type": "PERCENT"}}},
  {name:"regular-amount", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"amount_off": 1000, "type": "AMOUNT"}}},
  {name:"cart-more-50", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"percent_off": 5, "type": "PERCENT"}}},
  {name:"cart-includes-2solaris", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"amount_off": 500, "type": "AMOUNT"}}},
  {name:"redemption-limit", type: "AUTO_UPDATE", voucher: {redemption: {quantity: 3}, type: "DISCOUNT_VOUCHER", discount: {"percent_off": 50, "type": "PERCENT"}}},
  {name:"expiry-date", type: "AUTO_UPDATE", expiration_date: new Date(2017, 3, 1), voucher: {redemption: {quantity: 1}, type: "DISCOUNT_VOUCHER", discount: {"amount_off": 2500, "type": "AMOUNT"}}},
  {name:"start-date", type: "AUTO_UPDATE", start_date: new Date(2018, 10, 30), voucher: {redemption: {quantity: 1}, type: "DISCOUNT_VOUCHER", discount: {"amount_off": 2500, "type": "AMOUNT"}}},
  {name:"gift-card", type: "AUTO_UPDATE", voucher: {type: "GIFT_VOUCHER", gift: {amount: 10000}}},
  {name:"upsell", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"percent_off": 20, "type": "PERCENT"}}},
  {name:"mix", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"percent_off": 10, "type": "PERCENT"}, code_config: {prefix: "mix-" }}},
  {name:"enable", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"amount_off": 500, "type": "AMOUNT"}}},
  {name:"country", type: "AUTO_UPDATE", voucher: {type: "DISCOUNT_VOUCHER", discount: {"percent_off": 30, "type": "PERCENT"}}}
]
