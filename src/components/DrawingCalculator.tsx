import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Button, Text, ActivityIndicator, PanResponderGestureState } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import GoogleMLKitTextRecognition from '@react-native-ml-kit/text-recognition';
import { recognizeGesture, applyGesture } from '../utils/gestureRecognition';
import { postProcessOCR } from '../utils/mathOperation';
import { calculateExpression } from '../services/geminiAI';

interface HistoryItem {
  expression: string;
  result: string;
}

const DrawingCalculator: React.FC = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [calculatedResult, setCalculatedResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const currentPath = useRef<string[]>([]);
  const gestureStart = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const viewShotRef = useRef<ViewShot>(null);

  const recognizeDigitOrOperator = async (imageUri: string): Promise<string> => {
    const result = await GoogleMLKitTextRecognition.recognize(imageUri);
    let recognized = result.text.trim();
    if (/^[0-9]$/.test(recognized)) {
      return recognized; // It's a digit
    } else if (/^[+\-*/]$/.test(recognized)) {
      return recognized; // It's an operator
    }
    return ''; // Not recognized as a single digit or operator
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentPath.current = [`M${locationX},${locationY}`];
      gestureStart.current = { x: locationX, y: locationY, time: Date.now() };
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      currentPath.current.push(`L${locationX},${locationY}`);
      setPaths([...paths, currentPath.current.join(' ')]);
    },
    onPanResponderRelease: async (evt, gestureState: PanResponderGestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      const endTime = Date.now();
      const duration = endTime - gestureStart.current.time;
      const gesture = recognizeGesture(gestureStart.current, { x: locationX, y: locationY }, duration);
      
      if (gesture === 'digit' || gesture === 'operator') {
        const imageUri = await captureCanvas();
        if (imageUri) {
          const recognized = await recognizeDigitOrOperator(imageUri);
          if (recognized) {
            setRecognizedText(prev => prev + recognized);
          }
        }
      } else if (gesture) {
        setRecognizedText(prev => applyGesture(gesture, prev));
      } else {
        setPaths([...paths, currentPath.current.join(' ')]);
      }
      currentPath.current = [];
    },
  });

  const captureCanvas = async (): Promise<string | null> => {
    try {
      const uri = await viewShotRef.current?.capture();
      return uri || null;
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  };

  const recognizeText = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const imageUri = await captureCanvas();
      if (imageUri) {
        const result = await GoogleMLKitTextRecognition.recognize(imageUri);
        const processedText = postProcessOCR(result.text);
        setRecognizedText(prev => prev + processedText);
      }
    } catch (error) {
      console.error('Error recognizing text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculate = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await calculateExpression(recognizedText);
      setCalculatedResult(result);
      setHistory([...history, { expression: recognizedText, result }]);
    } catch (error) {
      console.error('Error calculating with Gemini AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCanvas = (): void => {
    setPaths([]);
    setRecognizedText('');
    setCalculatedResult('');
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} style={styles.canvasContainer}>
        <View {...panResponder.panHandlers}>
          <Svg height="100%" width="100%">
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path}
                stroke="black"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </Svg>
        </View>
      </ViewShot>
      <View style={styles.controlsContainer}>
        <Button title="Recognize" onPress={recognizeText} disabled={isLoading} />
        <Button title="Calculate" onPress={calculate} disabled={isLoading || !recognizedText} />
        <Button title="Clear" onPress={clearCanvas} disabled={isLoading} />
        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        <Text style={styles.resultText}>Expression: {recognizedText}</Text>
        <Text style={styles.resultText}>Result: {calculatedResult}</Text>
      </View>
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>History:</Text>
        {history.map((item, index) => (
          <Text key={index} style={styles.historyItem}>
            {item.expression} = {item.result}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 3,
    backgroundColor: 'white',
  },
  controlsContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-around',
  },
  resultText: {
    fontSize: 16,
    marginTop: 10,
  },
  historyContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyItem: {
    fontSize: 14,
    marginBottom: 3,
  },
});

export default DrawingCalculator;