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

const getDistance = changedTouches => {
  const [x1, y1] = [changedTouches[0].pageX, changedTouches[0].pageY];
  const [x2, y2] = [changedTouches[1].pageX, changedTouches[1].pageY];
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};

const getScale = (distanceBefore, distanceAfter) =>
  1 + (distanceAfter - distanceBefore) / SQUARE_SIZE;

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
        if (nativeEvent.changedTouches.length === 2) {
          this.distance = getDistance(nativeEvent.changedTouches);
        }
      },

      onPanResponderMove: ({ nativeEvent }, gestureState) => {
        if (nativeEvent.changedTouches.length === 2) {
          const distance = getDistance(nativeEvent.changedTouches);
          const scale = getScale(this.distance, distance);

          return Animated.event([
            {
              scale: this.state.scale
            }
          ])({
            scale
          });
        }

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
      translate: new Animated.ValueXY(),
      scale: new Animated.Value(1)
    };

    target = null;
    distance = null;
  }

  onTargetLayout = ({ nativeEvent: { layout } }) => (this.target = layout);

  isSquareInTarget = ({ pageX, pageY, locationX, locationY }) => {
    const currentScale = this.state.scale._value;

    const squareTopLeftCorner = {
      x: pageX - locationX * currentScale,
      y: pageY - locationY * currentScale
    };

    const distanceX = squareTopLeftCorner.x - this.target.x;
    const distanceY = squareTopLeftCorner.y - this.target.y;
    const maxDistance = TARGET_SIZE - SQUARE_SIZE * currentScale;

    return (
      distanceX > 0 &&
      distanceX < maxDistance &&
      distanceY > 0 &&
      distanceY < maxDistance
    );
  };

  render() {
    const { translate, scale } = this.state;
    const [translateX, translateY] = [translate.x, translate.y];
    const squareStyle = {
      transform: [{ translateX }, { translateY }, { scale }]
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
