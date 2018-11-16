![react-rewards logo](react-rewards.png?raw=true "react-rewards")

[![npm version](https://badge.fury.io/js/react-rewards.svg)](https://badge.fury.io/js/react-rewards) [![forthebadge](http://forthebadge.com/badges/makes-people-smile.svg)](http://forthebadge.com)

## Usage

Install from npm by typing ```npm install react-rewards``` or ```yarn add react-rewards``` while in your package.json directory.

This package lets you easily add microinteractions to your app and reward users with the rain of confettis or flying emoji in seconds. In order to make it rain, you need to wrap your button of choice with the **\<Reward\>** component, fire the **rewardMe()** method from the refs and voilà. You can also "punish" the user by calling the **punishMe()** method and showing him that something went wrong. 

<p align="center">
<img alt='react-rewards demo' src="react-rewards.gif"/>
</p>

```js
import Reward from 'react-rewards';

// in render
<Reward
  ref={(ref) => { this.reward = ref }}
  type='emoji'
>
  <button onClick={this.fetchSomeData} />
</Reward>

// in fetchSomeData:
// to reward a user with confetti/emoji rain:
this.reward.rewardMe();
// to "punish" user :
this.reward.punishMe();
```

### Props & config

Basic props:

| name            | type   | description                                            | required   |default      |
|-----------------|--------|--------------------------------------------------------|------------|-------------|
| ref             | func   | function that creates a ref of the reward component    | yes        |             |
| type            | string | 'confetti' or 'emoji'                                  | no         |'confetti'   |
| config          | object | a configuration object described below                 | no         |see below    |

Config object: 

| name            | type   | description                                            | default (confett / emoji) |
|-----------------|--------|--------------------------------------------------------|---------------------------|
| lifetime        | number | time of life of each particle in ms                    | 200 / 200                 |
| angle           | number | initial direction of particles in degrees              | 90 / 90                   |
| decay           | number | how much the velocity decreases with each frame        | 0.91 / 0.91               |
| spread          | number | spread of particles in degrees                         | 45 / 100                  |
| startVelocity   | number | initial velocity of particles                          | 35 / 20                   |
| elementCount    | number | particles quantity                                     | 40 / 15                   |
| elementSize     | number | particle size in px                                    | 8 / 20                    |
| zIndex          | number | z-index of particles                                   | 10 / 10                   |
| springAnimation | bool   | whether the button should be animated                  | true                      |
| colors          | array  | An array of colors used when generating confettis      |                           |
| emoji           | array  | An array of emoji used when generating emoji particles |                           |



This package was based on React-Pose and react-dom-confetti.
