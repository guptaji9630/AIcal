import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import CalculatorScreen from '../src/screens/CalculatorScreen';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <CalculatorScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default App;