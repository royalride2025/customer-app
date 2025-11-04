import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBadge = ({ count, size = 20, color = 'red', textColor = '#fff' }) => {
  if (!count || count <= 0) return null;

  return (
    <View
      style={[
        styles.badge,
        {
          minWidth: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: size * 0.6 }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MessageBadge;
