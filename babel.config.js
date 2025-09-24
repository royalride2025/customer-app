module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-proposal-optional-chaining', // Optional chaining (?.)
    [
      '@babel/plugin-proposal-optional-chaining-assign',
      {
        version: '2023-07'  // Add this version option
      }
    ],
    'react-native-reanimated/plugin'
  ]
};
