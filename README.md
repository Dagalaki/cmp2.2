[![Build Status](https://travis-ci.org/appnexus/cmp.svg?branch=master)](https://travis-ci.org/appnexus/cmp)

# GEDI DIGITAL CMP


This is the GEDI DIGITAL CMP.
This CMP is a fork of the AppNexus CMP, modified and adapted to satisfy specific needs and to pass the IAB validation.

You can find original repo here:
https://github.com/appnexus/cmp

This modified version has been certified by IAB according to TCF 1.1 and passes all the checks, automatic and manual ones, required by the TCF Validator.

This CMP contains some graphic personalizations. 

Feel free to modify for your own use.


Reference and docs can be found here:
http://acdn.origin.appnexus.net/cmp/docs/#/

#### The Only Difference from original reference is the availability of 4 more ui events and 1 more consent related event
	
```sh
// new events
__cmp("addEventListener", "isModalShown", listenerCmpEvents);
__cmp("addEventListener", "isBannerShown", listenerCmpEvents);
__cmp("addEventListener", "isModalHidden", listenerCmpEvents);
__cmp("addEventListener", "isBannerHidden", listenerCmpEvents);
__cmp("addEventListener", "onConsentChanged", listenerCmpEvents); // *
// * onConsentChanged event is available only for complete bundle integrations


// existing events
__cmp("addEventListener", "onSubmit", listenerCmpEvents);
__cmp("addEventListener", "isLoaded", listenerCmpEvents);
__cmp("addEventListener", "cmpReady", listenerCmpEvents);
```

### Installation

```sh
git clone https://github.com/giegi/cmp.git
cd cmp
yarn install
```

## Build for Production

```sh
yarn build
```

This produces a production build of the `cmp` script and the docs application:
+ `./build/cmp.bundle.js` - CMP script to include on your site
+ `./build/docs/` - Application hosting the documentation

## Documentation

Instructions to install the CMP as well as API docs and examples are available in the `docs`
application included with the repo.

```sh
yarn start
```

The documentation can be viewed at:
`http://localhost:5000/docs/`

## Development
You can start a development server that will monitor changes to all CMP and docs files with:
```sh
yarn dev
```

Development server can be accessed at:
`http://localhost:8080/`

## Testing

```sh
yarn test
```
