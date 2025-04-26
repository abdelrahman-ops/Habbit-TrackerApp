import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressCircleProps {
  progress: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ProgressCircle({
  progress,
  size = 150,
  color = '#4CAF50',
  backgroundColor = '#e0e0e0',
}: ProgressCircleProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[
        styles.background,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor,
        }
      ]}>
        <View style={[
          styles.progress,
          { 
            width: size - 20, 
            height: size - 20, 
            borderRadius: (size - 20) / 2,
            backgroundColor: color,
            opacity: progress / 100,
          }
        ]} />
      </View>
      <Text style={[styles.text, { fontSize: size / 4 }]}>
        {progress}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  background: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    position: 'absolute',
  },
  text: {
    position: 'absolute',
    color: 'white',
    fontWeight: 'bold',
  },
});