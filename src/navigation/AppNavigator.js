import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import WeightCertListing from '../screens/WeightCert/WeightCertListing';
import WeightCertDetails from '../screens/WeightCert/WeightCertDetails';
import PlanListing from '../screens/Plan/PlanListing';
import PlanDetails from '../screens/Plan/PlanDetails';
import PlanDocument from '../screens/Plan/PlanDocument';
import CMHListing from '../screens/CMH/CMHListing';
import CMHDetails from '../screens/CMH/CMHDetails';
import ChassisItemDetail from '../screens/CMH/ChassisItemDetail';
import SODetail from '../screens/CMH/SODetail';
import QuotDetail from '../screens/CMH/QuotDetail';
import FileDetailScreen from '../screens/CMH/FileDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' },
            cardOverlayEnabled: true,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 0.5, 0.9, 1],
                  outputRange: [0, 0.25, 0.7, 1],
                }),
              },
              overlayStyle: {
                opacity: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                  extrapolate: 'clamp',
                }),
              },
            }),
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={Login}
          />
          <Stack.Screen 
            name="Register" 
            component={Register}
          />
          <Stack.Screen 
            name="Home" 
            component={Home}
          />
          <Stack.Screen 
            name="WeightCertListing" 
            component={WeightCertListing}
          />
          <Stack.Screen 
            name="WeightCertDetails" 
            component={WeightCertDetails}
          />
          <Stack.Screen 
            name="PlanListing" 
            component={PlanListing}
          />
          <Stack.Screen 
            name="PlanDetails" 
            component={PlanDetails}
          />
          <Stack.Screen 
            name="PlanDocument" 
            component={PlanDocument}
          />
          <Stack.Screen 
            name="CMHListing" 
            component={CMHListing}
          />
          <Stack.Screen 
            name="CMHDetails" 
            component={CMHDetails}
          />
          <Stack.Screen 
            name="ChassisItemDetail" 
            component={ChassisItemDetail}
          />
          <Stack.Screen 
            name="SODetail" 
            component={SODetail}
          />
          <Stack.Screen 
            name="QuotDetail" 
            component={QuotDetail}
          />
          <Stack.Screen 
            name="FileDetailScreen" 
            component={FileDetailScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default AppNavigator; 