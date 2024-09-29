import React from 'react';
import { View, StyleSheet } from 'react-native';
import DrawingCalculator from '../components/DrawingCalculator';

const CalculatorScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <DrawingCalculator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default CalculatorScreen;