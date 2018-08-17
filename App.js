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
  return { x: Math.abs(x1 - x2), y: Math.abs(y1 - y2) };
};

const getScale = (distanceBefore, distanceAfter, squareSize) =>
  1 + (distanceAfter - distanceBefore) / squareSize;

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
          const scaleX = getScale(
            this.distance.x,
            distance.x,
            SQUARE_SIZE * this.state.scaleOffset.x._value
          );

          const scaleY = getScale(
            this.distance.y,
            distance.y,
            SQUARE_SIZE * this.state.scaleOffset.y._value
          );

          return Animated.event([
            {
              scaleX: this.state.scale.x,
              scaleY: this.state.scale.y
            }
          ])({
            scaleX,
            scaleY
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
        this.state.scaleOffset.setValue({
          x: this.state.scaleOffset.x._value * this.state.scale.x._value,
          y: this.state.scaleOffset.y._value * this.state.scale.y._value
        });
        this.state.scale.setValue({ x: 1, y: 1 });
        if (this.isSquareInTarget(nativeEvent)) {
          Alert.alert("Bravo !");
          this.state.translate.setValue({ x: 0, y: 0 });
        }
      }
    });

    this.state = {
      translate: new Animated.ValueXY(),
      scale: new Animated.ValueXY({ x: 1, y: 1 }),
      scaleOffset: new Animated.ValueXY({ x: 1, y: 1 })
    };

    target = null;
    distance = null;
  }

  onTargetLayout = ({ nativeEvent: { layout } }) => (this.target = layout);

  isSquareInTarget = ({ pageX, pageY, locationX, locationY }) => {
    const squareTopLeftCorner = {
      x:
        pageX -
        locationX * this.state.scaleOffset.x._value * this.state.scale.x._value,
      y:
        pageY -
        locationY * this.state.scaleOffset.y._value * this.state.scale.y._value
    };

    const distanceX = squareTopLeftCorner.x - this.target.x;
    const distanceY = squareTopLeftCorner.y - this.target.y;
    const maxDistanceX =
      TARGET_SIZE - SQUARE_SIZE * this.state.scaleOffset.x._value;
    const maxDistanceY =
      TARGET_SIZE - SQUARE_SIZE * this.state.scaleOffset.y._value;

    return (
      distanceX > 0 &&
      distanceX < maxDistanceX &&
      distanceY > 0 &&
      distanceY < maxDistanceY
    );
  };

  render() {
    const { translate, scale, scaleOffset } = this.state;
    const [scaleX, scaleY] = [
      Animated.multiply(scale.x, scaleOffset.x),
      Animated.multiply(scale.y, scaleOffset.y)
    ];
    const [translateX, translateY] = [translate.x, translate.y];
    const squareStyle = {
      transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }]
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
