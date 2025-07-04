module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    '@babel/plugin-proposal-optional-chaining', // Optional chaining (?.)
    [
      '@babel/plugin-proposal-optional-chaining-assign',
      {
        version: '2023-07'  // Add this version option
      }
    ]
  ]
};
