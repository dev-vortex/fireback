<p align="center">
    <a href="https://travis-ci.com/github/dev-vortex/fireback"><img src="https://badgen.net/travis/dev-vortex/fireback?icon=travis&label=build"/></a>
    <a href="https://www.npmjs.com/package/@dev-vortex/fireback"><img src="https://badgen.net/npm/v/@dev-vortex/fireback?icon=npm&label"/></a>
    <a href="https://www.npmjs.com/package/@dev-vortex/fireback"><img src="https://badgen.net/npm/license/@dev-vortex/fireback?icon=npm"/></a> 
    <a href="https://www.npmjs.com/package/@dev-vortex/fireback"><img src="https://badgen.net/npm/types/@dev-vortex/fireback?icon=typescript"/></a> 
</p>

<p align="center">
    <a href="https://codeclimate.com/github/dev-vortex/fireback/maintainability"><img src="https://api.codeclimate.com/v1/badges/5419722b298d8f094d55/maintainability"/></a>
    <a href="https://codeclimate.com/github/dev-vortex/fireback/test_coverage"><img src="https://api.codeclimate.com/v1/badges/5419722b298d8f094d55/test_coverage"/></a>
</p>

<p align="center">
    <a href="http://commitizen.github.io/cz-cli/"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg"/></a>
    <a href="https://www.conventionalcommits.org/"><img src="https://img.shields.io/badge/conventional-commits-pink"/></a>
</p>

# Firebase Backend Helper
This package aims to assist the firebase function export. and allows a flexible mechanism to use different options for https service functions (API)

## Installation
```
yarn add @dev-vortex/fireback
```

or

```
npm install @dev-vortex/fireback
```

## Configuration
The app needs an initializatiion moment. This can be achieved in isolation through the exported method `initApp` or directly by using the exported method `exportFunctions`.

> **Note -** This process is a requirement from Firebase you can see it here: https://firebase.google.com/docs/reference/node/firebase#initializeapp

### Init App in isolation
`initApp` will accept as paremeter the configuration objec and will return the admin firebase application or a boolean value. If an error occurr it will throw an error.

### Directly expose functions
`exportFunctions` will provide all prepared functions and it will try to initialize the app with the proviided configuuratiion object.

## Usage
There are to relevant moments where we need to use the provided API. These moments are the entry point (output/export of fuunctiions) and every type we need to create a function.

To allow a clear and simple way to organise and define functions and function groups, the service will use the file structure, together with file naming convention.

### File structure
By default the system will look for and into a folder named `api` that must exist right next to the `index` entripoint.

**Structure example**
```text
.
|
+ - functions
    |
    + - index.ts
    + - api
        |
        + - group_name_1
        .   |
        .   + - group-name|1.1
        .       |
        .       + - function_a_name.func.ts
        .       + - function-b-name.func.ts
        .
        + - group.name.2
        .   |
        .   + - function.c.name.func.ts
        .   + - function_with-name.d|version.func.ts
            ...
```

The service will implement the following rules:
 - **ANY** folder will be seen as a **function group**
 - **ANY** file will be seen as a **function**
 - **Group** and **Function** names will be normalized into `camelCase`
 - **Group** and **Function** names with dot (`.`) or pipe (`|`) characters, will be converted to underscore (`_`)
 
Given the srtucture above, we will end with the following functions:
 - `groupName1-groupName_1_1-functionAName`
 - `groupName1-groupName_1_1-functionBName`
 - `groupName2-function_c_name`
 - `groupName2-functionWithName_d_version`

### Entry / Export moment
In your function project we will need to export all the developed functions so firebase can expose them to your app(s).

Here we will make use of the `exportFunctions` method. This will be responsible to export all the functions that were registered by your project.

```typescript
import { initApp } from '@dev-vortex/fireback'
import { firebaseConfigObject } from './firebaseConfig' // your configuration

initApp(firebaseConfigObject)

```
or
```typescript
import { exportFunctions } from '@dev-vortex/fireback'

exports = module.exports = exportFunctions({
    ...
    firebaseServiceConfig: firebaseConfigObject,
})

```

> **Info** - If needed, it is possible to change functions location as well as adding a top group to the function by specifying it in the parameter option object

#### Export options
`base: string` - If provided, this will be used to set the working foolder. Otherwise, the service will assume the same location as the file that is calling the method (defaults to `__dirname`).

`folder: string` - If provided (relative path to the api file structure), the service will use it to fetch the function definition files. (default: `./api`)
    
`extensions: string[]` - Function definition file extension list. (default: [`.func.ts`, `.func.js`]). Thisi will be used by the service to assume just the files that comply with the specified extensions

`options` - Options object to define function export settings
  - `functionGroupPath: string` - Main group name to add to the function (default: '' [empty])

`firebaseServiceConfig` - Configuration to initialize firebase app same as in `initApp`. (see [Configuration](#configuration) note)


### Function definition
When defining a function we will need to pick what type of function and depending on that decision we may also need to provide a service to it.

At this point any of the functioon creation methods will register the function to be exported at the Entry/Export moment.

#### Callable Function
This is the most close function to Firebase API and it will create a function that can be used to any type of function that firebase may provide. It is responsible to localize the function in a specific location from any that is available by [firebase locations](https://firebase.google.com/docs/functions/locations)

```typescript
import { callableFunction } from '@dev-vortex/fireback'

export default callableFunction({
    functionRegion: 'europe-west1',
})

```

#### Cron Function
This kind of function allows us to setup a function (piece of code) that will run at a specific location on a specific time (within a specific [timezone](https://en.wikipedia.org/wiki/Tz_database)).

```typescript
import { cronFunction } from '@dev-vortex/fireback'

export default cronFunction(
    '5 11 * * *', 
    (context) => {
        ...
    },
    { 
        functionRegion: 'europe-west1',
        functionTimeZone: 'Europe/Stockholm', 
    }
)

```

#### HTTPS Function
This type of function will allow us to expose HTTPS services like REST APIs. Here you can use any service that respects the (request, response) service signature

```typescript
import { httpsFunction } from '@dev-vortex/fireback'
// 1. Import your https service (eg: Express, Fastify, Koa, Hapi, TypeGraphQL, Moleculer)

// 2. Prepare all the necessary endpoints/routes, security and logic withing the httpsService

export default httpsFunction(
    httpService,
    { functionRegion: 'europe-west1' }
)

```
##### 