# Welcome to the Voucherify Showcase

---

This example shows how you can make Voucherify API work with a simple cart checkout example. You can see for yourself that a simple integration with voucherify API gives you easy access to a multitude of validation strategies that can be managed and modified from voucherify dashboard without or with very little impact on code.

You can browse the code (and quickly spin up your own rendition of this example) [here](https://glitch.com/edit/#!/hysterical-shade) and see a working live example at [https://hysterical-shade.glitch.me/](https://hysterical-shade.glitch.me/).

In the example you will find usages of a wide range of voucherify endpoints and functionalities. The `server.js` uses `redemptions`, `vouchers`, `products` and `customers` namespaces of voucherify client. This is more convenient than hitting the API endpoints directly, the client does all the groundwork of constructing REST requests for you.

## Useful links

- This example code [online](https://glitch.com/edit/#!/hysterical-shade)
- This example [online](https://hysterical-shade.glitch.me/)

- Read more about [Voucherify](https://voucherify.io) 
- Voucherify [API docs](https://docs.voucherify.io)
- Learn more about [glitch](https://glitch.com/about/)

# How to use this repository

---

## Setup

[Sign up](http://app.voucherify.io/#/signup?plan=standard) to get your auth keys. The authorization keys should be set up in a .env file in the root directory, as follows:

```
# Application ID from your voucherify Project Settings
APPLICATION_ID=''
# Application Secret Key from your voucherify Project Settings
CLIENT_SECRET_KEY=''
```

After this initial setup you should run `node ./setup.js` to feed your voucherify account with data necessary for this example to work.
This will:
- Create 12 campaigns with different settings
- Add 4 products
- Setup a customer segment for customers from Germany (you can read more about customer segments [here](https://docs.voucherify.io/docs/customer-segments))
- Setup validation rules for 5 different campaigns which will be used to validate voucher redemptions (read more about validation rules [here](https://docs.voucherify.io/docs/validation-rules))

AND DONE! You are ready to run `npm start` or open the live glitch and play around.

## Done playing with the example?

When you are done with the example and want a clean voucherify experience, just run `node ./cleanup.js`. This will remove the vast majority of the data we put there. With some exceptions:
- customers tracked in this example won't be removed (if you wish to do it yourself, just filter by metadata `{from: 'voucherify-showcase'}` - the example adds this to every customer)
- the created segment will be removed based on `./.data/segments.json` file, so if you misplace or remove it, segments will stay on your voucherify account

After this operation you might need to clean your browser local storage if you wish to use the example again.
