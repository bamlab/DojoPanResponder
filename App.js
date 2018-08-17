/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { StyleSheet, View, PanResponder, Animated, Alert } from "react-native";

const SQUARE_SIZE = 200;
const TARGET_SIZE = 250;
export default class App extends Component<*> {
  constructor(props) {
    super(props);
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: ({ nativeEvent }, gestureState) => {
        this.state.translate.setOffset({
          x: this.state.translate.x._value,
          y: this.state.translate.y._value
        });
        this.state.translate.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: ({ nativeEvent }, gestureState) => {
        Animated.event([
          {
            dx: this.state.translate.x,
            dy: this.state.translate.y
          }
        ])(gestureState);
      },

      onPanResponderRelease: ({ nativeEvent }, gestureState) => {
        this.state.translate.flattenOffset();
        if (this.isSquareInTarget(nativeEvent)) {
          Alert.alert("Bravo !");
          this.state.translate.setValue({ x: 0, y: 0 });
        }
      }
    });

    this.state = {
      translate: new Animated.ValueXY()
    };

    target = null;
  }

  onTargetLayout = ({ nativeEvent: { layout } }) => (this.target = layout);

  isSquareInTarget = ({ pageX, pageY, locationX, locationY }) => {
    const squareTopLeftCorner = {
      x: pageX - locationX,
      y: pageY - locationY
    };

    const distanceX = squareTopLeftCorner.x - this.target.x;
    const distanceY = squareTopLeftCorner.y - this.target.y;
    const maxDistance = TARGET_SIZE - SQUARE_SIZE;

    return (
      distanceX > 0 &&
      distanceX < maxDistance &&
      distanceY > 0 &&
      distanceY < maxDistance
    );
  };

  render() {
    const { translate } = this.state;
    const [translateX, translateY] = [translate.x, translate.y];
    const squareStyle = {
      transform: [{ translateX }, { translateY }]
    };

    return (
      <View style={styles.container}>
        <Animated.View
          {...this._panResponder.panHandlers}
          style={[styles.square, squareStyle]}
        />
        <View style={styles.target} onLayout={this.onTargetLayout} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  square: {
    backgroundColor: "red",
    height: SQUARE_SIZE,
    width: SQUARE_SIZE,
    zIndex: 100
  },
  target: {
    height: TARGET_SIZE,
    width: TARGET_SIZE,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "blue"
  }
});
